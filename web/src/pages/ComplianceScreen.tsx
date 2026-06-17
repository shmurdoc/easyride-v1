import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import client from '@/api/client';
import dayjs from 'dayjs';

interface KYCItem {
  id: string;
  user_id: string;
  user_name: string;
  status: string;
  id_number: string;
  id_type: string;
  submitted_at: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  assignee: { id: string; name: string } | null;
  reported_by: string;
  created_at: string;
}

interface RetentionInfo {
  retention_days: number;
  total_records: number;
  expiring_records: number;
  last_cleanup: string | null;
}

type Tab = 'kyc' | 'incidents' | 'retention';

export default function ComplianceScreen() {
  const [tab, setTab] = useState<Tab>('kyc');
  const [kycList, setKycList] = useState<KYCItem[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [retention, setRetention] = useState<RetentionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  const loadKYC = useCallback(async () => {
    try {
      const { data } = await client.get('/admin/compliance/kyc/pending');
      setKycList(Array.isArray(data) ? data : data.data || []);
    } catch {}
  }, []);

  const loadIncidents = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (incidentStatusFilter) params.status = incidentStatusFilter;
      const { data } = await client.get('/admin/compliance/incidents', { params });
      setIncidents(Array.isArray(data) ? data : data.data || []);
    } catch {}
  }, [incidentStatusFilter]);

  const loadRetention = useCallback(async () => {
    try {
      const { data } = await client.get('/admin/compliance/data-retention');
      setRetention(data);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    const loaders: Record<Tab, () => Promise<void>> = { kyc: loadKYC, incidents: loadIncidents, retention: loadRetention };
    loaders[tab]().finally(() => setLoading(false));
  }, [tab, loadKYC, loadIncidents, loadRetention]);

  const approveKYC = async (id: string) => {
    try { await client.post(`/admin/compliance/kyc/${id}/approve`); loadKYC(); } catch {}
  };

  const rejectKYC = async (id: string) => {
    try { await client.post(`/admin/compliance/kyc/${id}/reject`); loadKYC(); } catch {}
  };

  const assignIncident = async (id: string) => {
    if (!assigneeId.trim()) return;
    try {
      await client.post(`/admin/compliance/incidents/${id}/assign`, { assignee_id: assigneeId });
      setShowAssignForm(false);
      setAssigneeId('');
      setSelectedIncident(null);
      loadIncidents();
    } catch {}
  };

  const resolveIncident = async (id: string) => {
    if (!resolutionNote.trim()) return;
    try {
      await client.post(`/admin/compliance/incidents/${id}/resolve`, { resolution: resolutionNote });
      setResolutionNote('');
      setSelectedIncident(null);
      loadIncidents();
    } catch {}
  };

  const closeIncident = async (id: string) => {
    try {
      await client.post(`/admin/compliance/incidents/${id}/close`);
      setSelectedIncident(null);
      loadIncidents();
    } catch {}
  };

  const runCleanup = async () => {
    if (!confirm('Run data retention cleanup?')) return;
    try {
      await client.post('/admin/compliance/data-retention/cleanup');
      loadRetention();
    } catch {}
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'kyc', label: 'KYC Pending' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'retention', label: 'Data Retention' },
  ];

  const kycColumns = [
    { key: 'user_name', label: 'User' },
    { key: 'id_type', label: 'ID Type', render: (k: KYCItem) => <span className="capitalize">{k.id_type}</span> },
    { key: 'id_number', label: 'ID Number' },
    { key: 'submitted_at', label: 'Submitted', render: (k: KYCItem) => dayjs(k.submitted_at).format('MMM D, YYYY') },
    { key: 'status', label: 'Status', render: (k: KYCItem) => <StatusBadge status={k.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (k: KYCItem) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); approveKYC(k.id); }} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">Approve</button>
          <button onClick={(e) => { e.stopPropagation(); rejectKYC(k.id); }} className="text-red-600 hover:text-red-700 text-xs font-medium">Reject</button>
        </div>
      ),
    },
  ];

  const incidentColumns = [
    { key: 'title', label: 'Incident' },
    { key: 'severity', label: 'Severity', render: (i: Incident) => <StatusBadge status={i.severity} /> },
    {
      key: 'status',
      label: 'Status',
      render: (i: Incident) => <StatusBadge status={i.status} />,
    },
    { key: 'assignee', label: 'Assignee', render: (i: Incident) => i.assignee?.name || '—' },
    { key: 'created_at', label: 'Created', render: (i: Incident) => dayjs(i.created_at).format('MMM D, YYYY') },
  ];

  return (
    <div>
      <PageHeader title="Compliance" subtitle="KYC verification, incident management, and data retention" />

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              tab === t.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'kyc' && (
        <DataTable columns={kycColumns} data={kycList} loading={loading} emptyMessage="No pending KYC verifications" />
      )}

      {tab === 'incidents' && (
        <div>
          <div className="flex gap-4 mb-6">
            <select className="input max-w-[200px]" value={incidentStatusFilter} onChange={(e) => setIncidentStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <DataTable columns={incidentColumns} data={incidents} loading={loading} emptyMessage="No incidents found" onRowClick={(i) => setSelectedIncident(i)} />
        </div>
      )}

      {tab === 'retention' && (
        <div className="card max-w-lg">
          {loading ? (
            <div className="animate-pulse h-32" />
          ) : retention ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Retention Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Retention Period</p>
                  <p className="text-sm font-medium">{retention.retention_days} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Records</p>
                  <p className="text-sm font-medium">{retention.total_records}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expiring Records</p>
                  <p className="text-sm font-medium">{retention.expiring_records}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Cleanup</p>
                  <p className="text-sm">{retention.last_cleanup ? dayjs(retention.last_cleanup).format('MMM D, YYYY') : 'Never'}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <button onClick={runCleanup} className="btn-primary">Run Cleanup</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Failed to load retention data</p>
          )}
        </div>
      )}

      <Modal isOpen={!!selectedIncident} onClose={() => setSelectedIncident(null)} title={selectedIncident?.title || 'Incident'} size="md">
        {selectedIncident && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Severity</p>
                <StatusBadge status={selectedIncident.severity} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <StatusBadge status={selectedIncident.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Assignee</p>
                <p className="text-sm">{selectedIncident.assignee?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reported By</p>
                <p className="text-sm">{selectedIncident.reported_by}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Description</p>
              <p className="text-sm mt-1">{selectedIncident.description}</p>
            </div>
            <div className="border-t pt-4 flex flex-wrap gap-3">
              {selectedIncident.status !== 'assigned' && selectedIncident.status !== 'resolved' && selectedIncident.status !== 'closed' && (
                <button onClick={() => setShowAssignForm(true)} className="btn-primary">Assign</button>
              )}
              {selectedIncident.status !== 'resolved' && selectedIncident.status !== 'closed' && (
                <button onClick={() => setResolutionNote('')} className="btn-success">
                  <span onClick={() => { const r = prompt('Resolution note:'); if (r) { setResolutionNote(r); resolveIncident(selectedIncident.id); } }}>Resolve</span>
                </button>
              )}
              {selectedIncident.status !== 'closed' && (
                <button onClick={() => closeIncident(selectedIncident.id)} className="btn-secondary">Close</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAssignForm} onClose={() => setShowAssignForm(false)} title="Assign Incident">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee ID</label>
            <input className="input" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} placeholder="User ID" />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={() => selectedIncident && assignIncident(selectedIncident.id)} className="btn-primary">Assign</button>
            <button onClick={() => setShowAssignForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
