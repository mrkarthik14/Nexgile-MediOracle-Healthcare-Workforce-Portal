import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  FileText, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  UserCheck, 
  Building2, 
  Filter, 
  Search, 
  ThumbsUp, 
  Eye, 
  Check, 
  X, 
  Send, 
  Sparkles,
  TrendingUp,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { QualityReview, ClinicalReference, AuditLog } from '../types';
import { INITIAL_QUALITY_REVIEWS, INITIAL_CLINICAL_REFERENCES } from '../data/mockData';

interface QualityManagementViewProps {
  onAddAuditLog?: (log: Partial<AuditLog>) => void;
}

export const QualityManagementView: React.FC<QualityManagementViewProps> = ({
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'moderation' | 'references' | 'benchmarks'>('reviews');
  const [reviews, setReviews] = useState<QualityReview[]>(INITIAL_QUALITY_REVIEWS);
  const [references, setReferences] = useState<ClinicalReference[]>(INITIAL_CLINICAL_REFERENCES);

  // Filter & Search
  const [reviewDirectionFilter, setReviewDirectionFilter] = useState<'all' | 'facility_to_clinician' | 'clinician_to_facility'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Reference Request Modal
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [newRefCandidate, setNewRefCandidate] = useState('Nurse Sarah Chen, RN');
  const [newRefereeName, setNewRefereeName] = useState('');
  const [newRefereeHospital, setNewRefereeHospital] = useState('St. Jude Hospital');
  const [newRefereeTitle, setNewRefereeTitle] = useState('ICU Clinical Preceptor');
  const [newRefereeEmail, setNewRefereeEmail] = useState('');
  const [newRefereePhone, setNewRefereePhone] = useState('');
  const [newRefRelationship, setNewRefRelationship] = useState<'Clinical Preceptor' | 'Charge Nurse' | 'Ward Sister' | 'Clinical Director'>('Clinical Preceptor');
  const [notification, setNotification] = useState<string | null>(null);

  // Moderation action
  const handleModerateReview = (reviewId: string, action: 'approve' | 'redact' | 'dismiss') => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          moderationStatus: action === 'approve' ? 'approved' : action === 'redact' ? 'redacted' : 'pending',
          sentiment: action === 'dismiss' ? 'neutral' : r.sentiment,
        };
      }
      return r;
    }));

    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'REV-MOD',
        title: 'Narrative Clinical Feedback Moderated',
        actor: 'Clinical Quality Director',
        actorRole: 'Quality & Governance',
        details: `Review #${reviewId} actioned: ${action.toUpperCase()}. Toxicity & HIPAA redaction rules evaluated.`,
        severity: action === 'redact' ? 'warning' : 'info',
        targetType: 'QualityReview',
        targetId: reviewId,
      });
    }

    setNotification(`Review #${reviewId} successfully marked as ${action.toUpperCase()}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Submit Reference Request
  const handleCreateReferenceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefereeName.trim()) return;

    const newRef: ClinicalReference = {
      id: `ref-${Date.now()}`,
      candidateId: `cand-${Date.now()}`,
      candidateName: newRefCandidate,
      refereeName: newRefereeName,
      refereeTitle: newRefereeTitle,
      refereeHospital: newRefereeHospital,
      relationship: newRefRelationship,
      status: 'pending_response',
      contactMethod: newRefereeEmail ? 'email' : 'phone',
      clinicalCompetenceRating: 0,
      recommendation: 'recommend',
      comments: `Verification dispatch sent to ${newRefereeEmail || newRefereePhone}. Secure token token-verif-${Date.now().toString().slice(-4)} generated.`,
    };

    setReferences(prev => [newRef, ...prev]);

    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'REF-REQ',
        title: 'Clinical Peer Reference Dispatched',
        actor: 'Credentialing Specialist',
        actorRole: 'Compliance Officer',
        details: `Dispatched peer clinical reference request to ${newRefereeName} (${newRefereeTitle} at ${newRefereeHospital}) for ${newRefCandidate}.`,
        severity: 'info',
        targetType: 'ClinicalReference',
        targetId: newRef.id,
      });
    }

    setNotification(`Reference verification successfully dispatched to ${newRefereeName}.`);
    setIsReferenceModalOpen(false);
    setNewRefereeName('');
    setNewRefereeEmail('');
    setNewRefereePhone('');
    setTimeout(() => setNotification(null), 4500);
  };

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    const matchesDirection = reviewDirectionFilter === 'all' || r.direction === reviewDirectionFilter;
    const matchesSearch = searchTerm === '' || 
      r.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.feedbackText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDirection && matchesSearch;
  });

  const flaggedReviews = reviews.filter(r => r.moderationStatus === 'flagged');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Clinical Quality & Governance Hub
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              360° Peer Feedback • Reference Verification
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Workforce Quality Management, Ratings & Benchmarks
          </h2>
          <p className="text-xs text-slate-500">
            Bidirectional post-shift evaluations, HIPAA-compliant narrative moderation, and verified clinical references.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>360° Post-Shift Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 relative ${
              activeTab === 'moderation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Moderation Queue</span>
            {flaggedReviews.length > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                {flaggedReviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'references'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Clinical References</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'benchmarks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Facility Benchmarks</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tab 1: 360° Post-Shift Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mean Clinician Rating</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">4.92</span>
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Top 5% Health Trust Tier</span>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ward Safety Climate Score</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-2xl font-black text-blue-600">4.84</span>
                <span className="text-xs text-slate-500 font-semibold">/ 5.0</span>
              </div>
              <span className="text-[10px] text-slate-500">Based on nurse feedback</span>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Break Relief Compliance</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">96.8%</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Statutory 30m WTD breaks</span>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reviews Completed (MTD)</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">384</span>
              </div>
              <span className="text-[10px] text-slate-500">94.2% submission rate</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search reviews or ward notes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={reviewDirectionFilter}
                onChange={e => setReviewDirectionFilter(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-semibold"
              >
                <option value="all">All Feedback Directions</option>
                <option value="facility_to_clinician">Hospital Ward ➔ Clinician</option>
                <option value="clinician_to_facility">Clinician ➔ Hospital Ward</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredReviews.length} bidirectional review entries
            </span>
          </div>

          {/* Review Feed Cards */}
          <div className="space-y-3">
            {filteredReviews.map(r => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      r.direction === 'facility_to_clinician'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-purple-50 text-purple-800 border-purple-200'
                    }`}>
                      {r.direction === 'facility_to_clinician' ? 'Ward ➔ Clinician' : 'Clinician ➔ Ward'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {r.reviewerName} ({r.reviewerRole})
                    </span>
                    <span className="text-slate-400 text-xs">evaluated</span>
                    <span className="text-xs font-bold text-blue-700">
                      {r.targetName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span className="text-xs font-bold text-amber-900">{r.rating.toFixed(1)} / 5.0</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{r.submittedAt}</span>
                  </div>
                </div>

                {/* Categories Radar Pill Bar */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {r.categories.clinicalCompetence && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Clinical Competence: <strong className="text-slate-900">{r.categories.clinicalCompetence}/5</strong>
                    </span>
                  )}
                  {r.categories.safetyAdherence && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Safety Protocol: <strong className="text-slate-900">{r.categories.safetyAdherence}/5</strong>
                    </span>
                  )}
                  {r.categories.punctuality && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Punctuality: <strong className="text-slate-900">{r.categories.punctuality}/5</strong>
                    </span>
                  )}
                  {r.categories.safetyClimate && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Ward Safety Climate: <strong className="text-slate-900">{r.categories.safetyClimate}/5</strong>
                    </span>
                  )}
                  {r.categories.breakRelief && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Break Relief Support: <strong className="text-slate-900">{r.categories.breakRelief}/5</strong>
                    </span>
                  )}
                  {r.categories.equipmentAccess && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      PPE & Equipment: <strong className="text-slate-900">{r.categories.equipmentAccess}/5</strong>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  "{r.feedbackText}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Shift ID: {r.shiftNumber} • Cryptographically Authenticated Feedback</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Status: {r.moderationStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Narrative Feedback Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              AI-Powered Narrative Sentiment & Safety Moderation Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated NLP flags potential HIPAA disclosures, non-clinical grievances, or abusive remarks for human review before publishing.
            </p>
          </div>

          <div className="space-y-3">
            {reviews.map(r => (
              <div
                key={r.id}
                className={`bg-white border rounded-xl p-4 shadow-xs space-y-3 ${
                  r.moderationStatus === 'flagged' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      r.moderationStatus === 'flagged' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : r.moderationStatus === 'redacted'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {r.moderationStatus.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {r.reviewerName} ➔ {r.targetName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleModerateReview(r.id, 'approve')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleModerateReview(r.id, 'redact')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Redact</span>
                    </button>
                    <button
                      onClick={() => handleModerateReview(r.id, 'dismiss')}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {r.moderationStatus === 'redacted' ? '[PORTION REDACTED PER CLINICAL GOVERNANCE POLICY] ' + r.feedbackText.slice(0, 40) + '...' : r.feedbackText}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Sentiment Analysis: <strong>{r.sentiment.toUpperCase()}</strong></span>
                  <span>Submitted: {r.submittedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Clinical References & Preceptors */}
      {activeTab === 'references' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Verified Clinical Preceptor & Peer References
              </h3>
              <p className="text-xs text-slate-500">
                Direct primary source verification from Ward Sisters, Clinical Preceptors, and Medical Directors.
              </p>
            </div>

            <button
              onClick={() => setIsReferenceModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Request Peer Reference</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {references.map(ref => (
              <div
                key={ref.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Candidate</span>
                    <h4 className="text-sm font-bold text-slate-900">{ref.candidateName}</h4>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    ref.status === 'verified'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {ref.status === 'verified' ? '✓ Verified' : '⏳ Pending Response'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Referee:</span>
                    <strong className="text-slate-900">{ref.refereeName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Title & Hospital:</span>
                    <span className="text-slate-700">{ref.refereeTitle} • {ref.refereeHospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Relationship:</span>
                    <span className="text-blue-700 font-bold">{ref.relationship}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Channel:</span>
                    <span className="text-slate-600 uppercase font-mono">{ref.contactMethod}</span>
                  </div>
                  {ref.verifiedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verified Timestamp:</span>
                      <span className="text-emerald-700 font-mono font-semibold">{ref.verifiedAt}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 italic">
                  "{ref.comments}"
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Clinical Recommendation:</span>
                  <span className="text-emerald-700 font-bold uppercase">
                    {ref.recommendation.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Facility Benchmarks & Safety Accreditations */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hospital Quality & Clinical Safety Benchmark Accreditations
              </h3>
              <p className="text-xs text-slate-500">
                National healthcare trust benchmarks, retention indices, and safety metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Clinical Incident Rate</span>
                <p className="text-2xl font-black text-emerald-600">0.01%</p>
                <p className="text-[11px] text-slate-500">Zero sentinel events reported across 840 rostered shifts</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Clinician Net Promoter Score (NPS)</span>
                <p className="text-2xl font-black text-blue-600">+78</p>
                <p className="text-[11px] text-slate-500">World-class satisfaction rating among bank and agency nurses</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ward Staff Retention Index</span>
                <p className="text-2xl font-black text-slate-900">94.8%</p>
                <p className="text-[11px] text-slate-500">Clinicians requesting repeat shifts at St. Jude Hospital</p>
              </div>
            </div>

            {/* Badges & Recognition */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Recognitions & Badges
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl flex items-start space-x-3">
                  <Award className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-indigo-950">Platinum Clinical Safety Partner</h5>
                    <p className="text-[11px] text-indigo-900 mt-0.5">
                      Awarded for maintaining 100% compliance on pre-shift credential checks and statutory 11-hour rest periods.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-950">Magnet Recognition Staffing Excellence</h5>
                    <p className="text-[11px] text-emerald-900 mt-0.5">
                      Achieved exemplary nurse-to-patient acuity ratios and 96.8% break relief coverage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Peer Reference Request Modal */}
      {isReferenceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Dispatch Clinical Reference Verification</h3>
              </div>
              <button
                onClick={() => setIsReferenceModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReferenceRequest} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinician / Candidate</label>
                <select
                  value={newRefCandidate}
                  onChange={e => setNewRefCandidate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800"
                >
                  <option value="Nurse Sarah Chen, RN">Nurse Sarah Chen, RN (Critical Care)</option>
                  <option value="Nurse Marcus Vance, RN">Nurse Marcus Vance, RN (Emergency)</option>
                  <option value="Nurse Elena Rostova, RN">Nurse Elena Rostova, RN (Pediatrics)</option>
                  <option value="Nurse Liam O'Connor, HCA">Nurse Liam O'Connor, HCA (Support)</option>
                  <option value="Nurse Aisling Murphy, RN">Nurse Aisling Murphy, RN (Surgical)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Referee Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Fiona Campbell"
                    value={newRefereeName}
                    onChange={e => setNewRefereeName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Referee Role / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="ICU Sister / Matron"
                    value={newRefereeTitle}
                    onChange={e => setNewRefereeTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital / Trust</label>
                  <input
                    type="text"
                    required
                    value={newRefereeHospital}
                    onChange={e => setNewRefereeHospital(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newRefRelationship}
                    onChange={e => setNewRefRelationship(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white"
                  >
                    <option value="Clinical Preceptor">Clinical Preceptor</option>
                    <option value="Charge Nurse">Charge Nurse</option>
                    <option value="Ward Sister">Ward Sister</option>
                    <option value="Clinical Director">Clinical Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Referee Email</label>
                  <input
                    type="email"
                    placeholder="referee@nhs.net"
                    value={newRefereeEmail}
                    onChange={e => setNewRefereeEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Referee Phone</label>
                  <input
                    type="tel"
                    placeholder="+44 20 7946 0991"
                    value={newRefereePhone}
                    onChange={e => setNewRefereePhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] leading-relaxed">
                An authenticated, single-use verification token will be dispatched to the referee. Upon digital signature, their clinical competence scoring will integrate directly into the candidate profile.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReferenceModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reference Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
