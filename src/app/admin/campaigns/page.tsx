'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PixelLoader } from '@/components/PixelLoader';

interface CampaignStats {
  referrers: number;
  referrals: number;
  qualified: number;
  rewarded: number;
}

interface Campaign {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  reward_amount: string;
  reward_type: string;
  created_at: string;
  stats: CampaignStats;
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CampaignsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    slug: '',
    reward_amount: '$150',
    reward_type: 'Amazon Gift Card',
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns();
    }
  }, [isAuthenticated, fetchCampaigns]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        setNewCampaign({
          name: '',
          slug: '',
          reward_amount: '$150',
          reward_type: 'Amazon Gift Card',
        });
        // Navigate to edit page for the new campaign
        router.push(`/admin/campaigns/${data.campaign.id}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create campaign');
      }
    } catch {
      alert('Failed to create campaign');
    } finally {
      setCreateLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelLoader message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => { setIsAuthenticated(true); fetchCampaigns(); }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelLoader message="Loading campaigns..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#101626] uppercase">
              Campaigns
            </h1>
            <p className="text-[#101626]">
              Manage referral campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/referrals')}
              className="btn-secondary"
            >
              View Referrals
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Campaign
            </button>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="card p-6 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#101626] transition-all"
              onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-black text-[#101626] text-lg">{campaign.name}</h2>
                  <p className="text-sm text-[#101626]/60 font-mono">/{campaign.slug}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-bold uppercase border-2 border-[#101626] ${
                    campaign.active
                      ? 'bg-[#b1db00] text-[#101626]'
                      : 'bg-gray-200 text-[#101626]'
                  }`}
                >
                  {campaign.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-[#101626]">
                  <span className="font-bold">{campaign.reward_amount}</span> {campaign.reward_type}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[#a3e1f0]/30 p-2 border-2 border-[#101626]">
                  <p className="text-xs text-[#101626]/60 uppercase font-bold">Referrers</p>
                  <p className="text-lg font-black text-[#101626]">{campaign.stats.referrers}</p>
                </div>
                <div className="bg-[#a3e1f0]/30 p-2 border-2 border-[#101626]">
                  <p className="text-xs text-[#101626]/60 uppercase font-bold">Referrals</p>
                  <p className="text-lg font-black text-[#101626]">{campaign.stats.referrals}</p>
                </div>
                <div className="bg-[#b1db00]/30 p-2 border-2 border-[#101626]">
                  <p className="text-xs text-[#101626]/60 uppercase font-bold">Qualified</p>
                  <p className="text-lg font-black text-[#101626]">{campaign.stats.qualified}</p>
                </div>
                <div className="bg-[#3533ff]/20 p-2 border-2 border-[#101626]">
                  <p className="text-xs text-[#101626]/60 uppercase font-bold">Rewarded</p>
                  <p className="text-lg font-black text-[#101626]">{campaign.stats.rewarded}</p>
                </div>
              </div>

              <p className="text-xs text-[#101626]/60">
                Created {formatDate(campaign.created_at)}
              </p>
            </div>
          ))}

          {campaigns.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-[#101626] font-bold mb-4">No campaigns yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Your First Campaign
              </button>
            </div>
          )}
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card p-6 max-w-md w-full">
              <h2 className="text-xl font-black text-[#101626] mb-4 uppercase">
                Create Campaign
              </h2>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#101626] mb-1 uppercase">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => {
                      setNewCampaign({
                        ...newCampaign,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    className="input-pixel w-full"
                    placeholder="Summer Promo 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#101626] mb-1 uppercase">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#101626]/60 text-sm">/</span>
                    <input
                      type="text"
                      value={newCampaign.slug}
                      onChange={(e) => setNewCampaign({ ...newCampaign, slug: generateSlug(e.target.value) })}
                      className="input-pixel w-full"
                      placeholder="summer-promo-2024"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#101626] mb-1 uppercase">
                      Reward Amount
                    </label>
                    <input
                      type="text"
                      value={newCampaign.reward_amount}
                      onChange={(e) => setNewCampaign({ ...newCampaign, reward_amount: e.target.value })}
                      className="input-pixel w-full"
                      placeholder="$150"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#101626] mb-1 uppercase">
                      Reward Type
                    </label>
                    <input
                      type="text"
                      value={newCampaign.reward_type}
                      onChange={(e) => setNewCampaign({ ...newCampaign, reward_type: e.target.value })}
                      className="input-pixel w-full"
                      placeholder="Amazon Gift Card"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={createLoading}
                  >
                    {createLoading ? 'Creating...' : 'Create & Edit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
