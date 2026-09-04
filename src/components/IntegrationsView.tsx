import React, { useState } from 'react';
import { 
  Network, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Smartphone, 
  MapPin, 
  Server, 
  Send, 
  FileCode, 
  Activity, 
  Check, 
  Sliders, 
  Radio, 
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  Clock
} from 'lucide-react';
import { IntegrationService, AuditLog } from '../types';
import { INITIAL_INTEGRATIONS } from '../data/mockData';

interface IntegrationsViewProps {
  onAddAuditLog?: (log: Partial<AuditLog>) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  onAddAuditLog,
}) => {
  const [integrations, setIntegrations] = useState<IntegrationService[]>(INITIAL_INTEGRATIONS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'payroll' | 'banking' | 'telephony' | 'geocoding'>('all');
  const [activeTestingId, setActiveTestingId] = useState<string | null>(null);
  const [payloadModalService, setPayloadModalService] = useState<IntegrationService | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Trigger test integration
  const handleTestIntegration = (service: IntegrationService) => {
    setActiveTestingId(service.id);

    setTimeout(() => {
      setActiveTestingId(null);
      const newEvent = {
        id: 'ev-' + Date.now().toString().slice(-4),
        event: service.category === 'payroll' 
          ? 'Live Webhook Sync: 24 Timesheets Transmitted' 
          : service.category === 'banking'
          ? 'Instant Card Push Verification: Idempotency Verified'
          : service.category === 'telephony'
          ? 'Twilio SMS Ping: Delivered in 1.4s'
          : 'Google Geocoding Matrix: Haversine & BLE Validated (42m radius)',
        status: '200 OK' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latencyMs: Math.floor(35 + Math.random() * 45),
      };

      setIntegrations(prev => prev.map(s => {
        if (s.id === service.id) {
          return {
            ...s,
            lastSync: 'Just now',
            recentEvents: [newEvent, ...s.recentEvents.slice(0, 3)],
          };
        }
        return s;
      }));

      if (onAddAuditLog) {
        onAddAuditLog({
          code: 'INT-TEST',
          title: `Integration Health Test Passed: ${service.name}`,
          actor: 'Integration Middleware Agent',
          actorRole: 'Operations / DevSecOps',
          details: `Executed active probe against ${service.provider}. Latency: ${newEvent.latencyMs}ms. Status: 200 OK.`,
          severity: 'success',
          targetType: 'IntegrationService',
          targetId: service.id,
        });
      }

      setNotification(`Active test completed for ${service.name} (Latency: ${newEvent.latencyMs}ms • 200 OK)`);
      setTimeout(() => setNotification(null), 4500);
    }, 800);
  };

  const filteredServices = integrations.filter(s => 
    selectedCategory === 'all' || s.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Enterprise Ecosystem Connectors
            </span>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
              REST APIs • Webhooks • Payment Rails
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            External Integrations & Middleware Infrastructure
          </h2>
          <p className="text-xs text-slate-500">
            Bidirectional connectivity across enterprise ERPs, instantaneous debit card payouts, Twilio SMS networks, and Google Maps geofencing.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Connectors
          </button>
          <button
            onClick={() => setSelectedCategory('payroll')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              selectedCategory === 'payroll'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Payroll & ERP</span>
          </button>
          <button
            onClick={() => setSelectedCategory('banking')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              selectedCategory === 'banking'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Instant Payouts</span>
          </button>
          <button
            onClick={() => setSelectedCategory('telephony')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              selectedCategory === 'telephony'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Telephony & SMS</span>
          </button>
          <button
            onClick={() => setSelectedCategory('geocoding')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              selectedCategory === 'geocoding'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps & Geofencing</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Integration Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-lg ${
                  service.category === 'payroll' 
                    ? 'bg-blue-50 text-blue-600' 
                    : service.category === 'banking'
                    ? 'bg-emerald-50 text-emerald-600'
                    : service.category === 'telephony'
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {service.category === 'payroll' && <Server className="w-5 h-5" />}
                  {service.category === 'banking' && <Zap className="w-5 h-5" />}
                  {service.category === 'telephony' && <Smartphone className="w-5 h-5" />}
                  {service.category === 'geocoding' && <MapPin className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{service.name}</h3>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                      ● {service.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{service.provider}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setPayloadModalService(service)}
                  title="View JSON Payload Schema"
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <FileCode className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTestIntegration(service)}
                  disabled={activeTestingId === service.id}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${activeTestingId === service.id ? 'animate-spin' : ''}`} />
                  <span>{activeTestingId === service.id ? 'Probing...' : 'Test Probe'}</span>
                </button>
              </div>
            </div>

            {/* Endpoint & Last Sync */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1">
              <span className="font-mono text-slate-600 truncate max-w-sm">
                Endpoint: {service.endpoint}
              </span>
              <span className="text-slate-500 flex-shrink-0">
                Last Sync: <strong className="text-slate-700">{service.lastSync}</strong>
              </span>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(service.telemetryMetrics).map(([key, val]) => (
                <div key={key} className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">{key}</span>
                  <span className="font-bold text-slate-900 font-mono mt-0.5 block">{val}</span>
                </div>
              ))}
            </div>

            {/* Recent Live Events */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Live Webhook & Request Telemetry
              </span>

              <div className="space-y-1">
                {service.recentEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded border border-slate-150"
                  >
                    <div className="flex items-center space-x-2 truncate max-w-xs">
                      <span className="font-mono text-emerald-700 font-bold">{ev.status}</span>
                      <span className="text-slate-700 truncate">{ev.event}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400 font-mono text-[10px] flex-shrink-0">
                      <span>{ev.latencyMs}ms</span>
                      <span>{ev.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payload Modal */}
      {payloadModalService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Payload Schema: {payloadModalService.name}</h3>
              </div>
              <button
                onClick={() => setPayloadModalService(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Live request payload template formatted according to the <strong>{payloadModalService.provider}</strong> API contract.
              </p>

              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-72">
{JSON.stringify({
  integration: payloadModalService.id,
  provider: payloadModalService.provider,
  auth_scheme: "Bearer BearerToken_Encrypted_OAuth2",
  timestamp: new Date().toISOString(),
  idempotency_key: `IDEMP-${payloadModalService.id}-99281`,
  telemetry: payloadModalService.telemetryMetrics,
  sample_transaction: {
    hospital_id: "fac-stjude",
    facility_name: "St. Jude Hospital",
    ward: "Emergency ER-1",
    clinician_id: "prof-01",
    gross_disbursement: 727.67,
    status: "settled_instant"
  }
}, null, 2)}
              </pre>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPayloadModalService(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
