from rest_framework import views, permissions
from rest_framework.response import Response

class ExecutiveMetricsView(views.APIView):
    """
    Read-optimized rollup feeding Recharts analytics views in the portal.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'kpis': {
                'fill_rate': 96.4,
                'fill_rate_delta': '+2.8%',
                'avg_time_to_fill_hours': 2.8,
                'time_to_fill_delta': '-0.6h',
                'cancellation_rate': 1.2,
                'compliance_audit_score': 99.1,
                'total_spend_ytd': 842190.00,
                'budget_variance': '-4.2%',
            },
            'fill_rate_trends': [
                {'month': 'Apr', 'fill_rate': 91.2, 'target': 95.0, 'shifts': 410},
                {'month': 'May', 'fill_rate': 93.5, 'target': 95.0, 'shifts': 430},
                {'month': 'Jun', 'fill_rate': 94.8, 'target': 95.0, 'shifts': 480},
                {'month': 'Jul', 'fill_rate': 95.9, 'target': 95.0, 'shifts': 520},
                {'month': 'Aug', 'fill_rate': 96.8, 'target': 95.0, 'shifts': 540},
                {'month': 'Sep', 'fill_rate': 96.4, 'target': 95.0, 'shifts': 310},
            ],
            'department_spend': [
                {'department': 'Emergency (ED)', 'budget': 120000, 'actual': 108400, 'utilization': 90.3},
                {'department': 'Intensive Care (ICU)', 'budget': 150000, 'actual': 142100, 'utilization': 94.7},
                {'department': 'General Med-Surg', 'budget': 95000, 'actual': 76500, 'utilization': 80.5},
                {'department': 'Pediatric Ward', 'budget': 70000, 'actual': 52800, 'utilization': 75.4},
                {'department': 'Cardiology Care', 'budget': 85000, 'actual': 79200, 'utilization': 93.1},
            ],
            'invoice_aging': [
                {'bucket': '0-30 Days', 'amount': 184500, 'count': 28},
                {'bucket': '31-60 Days', 'amount': 32400, 'count': 5},
                {'bucket': '61-90 Days', 'amount': 11200, 'count': 2},
                {'bucket': '90+ Days Past Due', 'amount': 4100, 'count': 1},
            ]
        })
