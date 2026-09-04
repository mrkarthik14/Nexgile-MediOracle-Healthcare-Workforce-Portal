from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import MatchScore
from .serializers import MatchScoreSerializer
from .engine import RuleBasedMatchingEngine
from .forecast import MovingAverageForecastService
from shifts.models import Shift, Offer
from professionals.models import ProfessionalProfile
from core.models import AuditEvent

class MatchCandidatesView(views.APIView):
    """
    Computes and ranks all eligible candidates for a given shift,
    returning detailed factor breakdowns and rest-period indicators.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, shift_id):
        shift = get_object_or_404(Shift, id=shift_id)
        candidates = ProfessionalProfile.objects.filter(is_active=True)
        engine = RuleBasedMatchingEngine()

        ranked = []
        for cand in candidates:
            score, factors, explanation, is_rest_warning = engine.calculate_score(cand, shift)

            # Store or retrieve MatchScore
            match_record, _ = MatchScore.objects.update_or_create(
                professional=cand,
                shift=shift,
                defaults={
                    'total_score': score,
                    'factor_breakdown': factors,
                    'explanation': explanation,
                    'is_rest_period_warning': is_rest_warning,
                }
            )
            serializer = MatchScoreSerializer(match_record)
            ranked.append(serializer.data)

        ranked.sort(key=lambda x: x['total_score'], reverse=True)
        return Response(ranked)

class OverrideMatchView(views.APIView):
    """
    Facility-side override endpoint requiring a mandatory reason field.
    Updates the MatchScore record and registers an AuditEvent.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        match_record = get_object_or_404(MatchScore, id=match_id)
        reason = request.data.get('reason')
        if not reason or len(reason.strip()) < 5:
            return Response({'error': 'A comprehensive override reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        match_record.overridden_by = request.user
        match_record.override_reason = reason
        match_record.save()

        AuditEvent.objects.create(
            actor=request.user,
            action="match_score_overridden",
            target_type="MatchScore",
            target_id=str(match_record.id),
            metadata={'reason': reason, 'shift_id': match_record.shift_id, 'professional_id': match_record.professional_id}
        )

        return Response(MatchScoreSerializer(match_record).data)

class BroadcastOfferView(views.APIView):
    """
    Broadcasts offers to top N candidates with first-accept-wins semantics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, shift_id):
        shift = get_object_or_404(Shift, id=shift_id)
        candidate_ids = request.data.get('candidate_ids', [])
        expiry_hours = int(request.data.get('expiry_hours', 4))

        expires_at = timezone.now() + timedelta(hours=expiry_hours)
        created_offers = []

        for cand_id in candidate_ids:
            cand = ProfessionalProfile.objects.get(id=cand_id)
            offer, created = Offer.objects.get_or_create(
                shift=shift,
                professional=cand,
                defaults={'expires_at': expires_at, 'status': 'pending'}
            )
            created_offers.append(offer)

        shift.status = 'offered'
        shift.save()

        AuditEvent.objects.create(
            actor=request.user,
            action="offers_broadcasted",
            target_type="Shift",
            target_id=str(shift.id),
            metadata={'candidate_count': len(created_offers), 'expires_at': expires_at.isoformat()}
        )

        return Response({'message': f'Broadcasted offers to {len(created_offers)} candidates', 'shift_id': shift.id})

class DemandForecastView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, department_id):
        forecast_service = MovingAverageForecastService()
        data = forecast_service.forecast_demand(department_id=department_id)
        return Response(data)
