'use client';

import { useState, useEffect, useCallback } from 'react';
import { PixelLoader, PixelSpinner } from '@/components/PixelLoader';

interface Referral {
  id: string;
  referrer_email: string;
  referrer_name: string;
  referred_email: string;
  referred_name: string;
  referred_phone: string;
  referred_child_grade: string;
  signup_date: string;
  purchase_date: string | null;
  reward_eligible_date: string | null;
  status: string;
  reward_issued_date: string | null;
  notes: string;
}

interface Referrer {
  referral_code: string;
  referral_link: string;
  email: string;
  name: string;
  total_referrals: number;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  purchased: number;
  qualified: number;
  rewarded: number;
  disqualified: number;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        onLogin();
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full">
        <h1 className="text-2xl font-black text-[#101626] mb-6 text-center uppercase">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-[#101626] mb-1 uppercase"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-pixel w-full"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="pixel-shake bg-[#ff3333]/10 border-3 border-[#ff3333] p-3">
              <p className="text-sm text-[#ff3333] font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-sm text-[#101626] font-bold uppercase">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-300 text-[#101626] border-[#101626]',
    purchased: 'bg-[#a3e1f0] text-[#101626] border-[#101626]',
    qualified: 'bg-[#b1db00] text-[#101626] border-[#101626]',
    rewarded: 'bg-[#3533ff] text-white border-[#101626]',
    disqualified: 'bg-[#ff3333] text-white border-[#101626]',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-bold uppercase border-2 ${colors[status] || 'bg-gray-100 text-[#101626] border-[#101626]'}`}
    >
      {status}
    </span>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntilEligible(eligibleDate: string | null): string {
  if (!eligibleDate) return '-';
  const days = Math.ceil(
    (new Date(eligibleDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return 'Eligible now';
  if (days === 0) return 'Today';
  return `${days} days`;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedReferrer, setSelectedReferrer] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/referrals');
      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals);
        setReferrers(data.referrers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleAction = async (referralId: string, action: string, notes?: string) => {
    setActionLoading(referralId);
    try {
      const response = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralId, action, notes }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelLoader message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => { setIsAuthenticated(true); fetchData(); }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelLoader message="Loading dashboard..." />
      </div>
    );
  }

  // Filter referrals
  let filteredReferrals = referrals;

  if (filter !== 'all') {
    filteredReferrals = filteredReferrals.filter((r) => r.status === filter);
  }

  if (selectedReferrer) {
    filteredReferrals = filteredReferrals.filter(
      (r) => r.referrer_email === selectedReferrer
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredReferrals = filteredReferrals.filter(
      (r) =>
        r.referrer_name.toLowerCase().includes(searchLower) ||
        r.referrer_email.toLowerCase().includes(searchLower) ||
        r.referred_name.toLowerCase().includes(searchLower) ||
        r.referred_email.toLowerCase().includes(searchLower)
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#101626] uppercase">
              Referral Dashboard
            </h1>
            <p className="text-[#101626]">
              Manage and track all referrals
            </p>
          </div>
          <button
            onClick={fetchData}
            className="btn-secondary flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total" value={stats.total} color="text-gray-900" />
            <StatCard
              label="Pending"
              value={stats.pending}
              color="text-yellow-600"
            />
            <StatCard
              label="Purchased"
              value={stats.purchased}
              color="text-blue-600"
            />
            <StatCard
              label="Qualified"
              value={stats.qualified}
              color="text-green-600"
            />
            <StatCard
              label="Rewarded"
              value={stats.rewarded}
              color="text-purple-600"
            />
            <StatCard
              label="Disqualified"
              value={stats.disqualified}
              color="text-red-600"
            />
          </div>
        )}

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="input-pixel w-full"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-pixel"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="purchased">Purchased</option>
              <option value="qualified">Qualified</option>
              <option value="rewarded">Rewarded</option>
              <option value="disqualified">Disqualified</option>
            </select>
            <select
              value={selectedReferrer || ''}
              onChange={(e) => setSelectedReferrer(e.target.value || null)}
              className="input-pixel"
            >
              <option value="">All Referrers</option>
              {referrers.map((r) => (
                <option key={r.email} value={r.email}>
                  {r.name} ({r.total_referrals})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#101626] border-b-3 border-[#101626]">
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    Referrer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    Friend
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    Signup Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    Eligible In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#101626]">
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[#101626] font-bold"
                    >
                      No referrals found
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-[#a3e1f0]/20">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-[#101626]">
                            {referral.referrer_name}
                          </p>
                          <p className="text-sm text-[#101626]">
                            {referral.referrer_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-[#101626]">
                            {referral.referred_name}
                          </p>
                          <p className="text-sm text-[#101626]">
                            {referral.referred_email}
                          </p>
                          {referral.referred_phone && (
                            <p className="text-sm text-[#101626]/60">
                              {referral.referred_phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={referral.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-[#101626]">
                        {formatDate(referral.signup_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#101626]">
                        {referral.status === 'purchased'
                          ? daysUntilEligible(referral.reward_eligible_date)
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {actionLoading === referral.id ? (
                            <PixelSpinner size={20} />
                          ) : (
                            <>
                              {referral.status === 'pending' && (
                                <button
                                  onClick={() =>
                                    handleAction(referral.id, 'mark_purchased')
                                  }
                                  className="text-xs px-2 py-1 bg-[#a3e1f0] text-[#101626] border-2 border-[#101626] font-bold uppercase hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#101626]"
                                >
                                  Mark Purchased
                                </button>
                              )}
                              {referral.status === 'purchased' && (
                                <button
                                  onClick={() =>
                                    handleAction(referral.id, 'mark_qualified')
                                  }
                                  className="text-xs px-2 py-1 bg-[#b1db00] text-[#101626] border-2 border-[#101626] font-bold uppercase hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#101626]"
                                >
                                  Mark Qualified
                                </button>
                              )}
                              {referral.status === 'qualified' && (
                                <button
                                  onClick={() =>
                                    handleAction(referral.id, 'mark_rewarded')
                                  }
                                  className="text-xs px-2 py-1 bg-[#3533ff] text-white border-2 border-[#101626] font-bold uppercase hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#101626]"
                                >
                                  Mark Rewarded
                                </button>
                              )}
                              {['pending', 'purchased'].includes(referral.status) && (
                                <button
                                  onClick={() => {
                                    const notes = prompt('Reason for disqualification:');
                                    if (notes !== null) {
                                      handleAction(referral.id, 'disqualify', notes);
                                    }
                                  }}
                                  className="text-xs px-2 py-1 bg-[#ff3333] text-white border-2 border-[#101626] font-bold uppercase hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#101626]"
                                >
                                  Disqualify
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referrers Section */}
        <div className="mt-8">
          <h2 className="text-xl font-black text-[#101626] mb-4 uppercase">
            Registered Referrers
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {referrers.map((referrer) => (
              <div key={referrer.email} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-[#101626]">{referrer.name}</p>
                    <p className="text-sm text-[#101626]">{referrer.email}</p>
                  </div>
                  <span className="bg-[#3533ff] text-white px-2 py-1 text-sm font-bold border-2 border-[#101626]">
                    {referrer.total_referrals}
                  </span>
                </div>
                <p className="text-xs text-[#101626]/60 font-mono truncate">
                  {referrer.referral_code}
                </p>
                <p className="text-xs text-[#101626]/60 mt-1">
                  Joined {formatDate(referrer.created_at)}
                </p>
                <button
                  onClick={() => {
                    setSelectedReferrer(referrer.email);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-2 text-sm text-[#3533ff] font-bold uppercase hover:bg-[#a3e1f0]"
                >
                  View referrals
                </button>
              </div>
            ))}
            {referrers.length === 0 && (
              <p className="text-[#101626] col-span-full text-center py-8 font-bold">
                No referrers registered yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
