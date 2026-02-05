'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PixelLoader } from '@/components/PixelLoader';

interface Campaign {
  id: string;
  slug: string;
  name: string;
  reward_amount: string;
  reward_type: string;
  copy: {
    terms_content: string;
  };
}

export default function CampaignTermsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params.campaign as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await fetch(`/api/campaigns/${campaignSlug}`);
        if (response.ok) {
          const data = await response.json();
          setCampaign(data.campaign);
        } else {
          router.push('/');
        }
      } catch {
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaign();
  }, [campaignSlug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelLoader message="Loading..." />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a
            href={`/${campaignSlug}/register`}
            className="text-[#3533ff] font-bold hover:underline"
          >
            ← Back to {campaign.name}
          </a>
        </div>

        <div className="card p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-black text-[#101626] mb-6 uppercase">
            Terms & Conditions
          </h1>
          <h2 className="text-lg font-bold text-[#101626] mb-4">
            {campaign.name} Referral Program
          </h2>

          <div className="prose prose-sm max-w-none text-[#101626]">
            <div className="whitespace-pre-wrap">
              {campaign.copy.terms_content}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-[#101626]">
            <h3 className="font-bold text-[#101626] uppercase mb-4">Reward Details</h3>
            <ul className="space-y-2 text-[#101626]">
              <li>
                <strong>Reward:</strong> {campaign.reward_amount} {campaign.reward_type}
              </li>
              <li>
                <strong>Eligibility:</strong> Referrer receives reward when referred friend remains a paying customer for 30 days
              </li>
              <li>
                <strong>Limitations:</strong> Rewards are subject to verification and may be revoked if fraud is detected
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
