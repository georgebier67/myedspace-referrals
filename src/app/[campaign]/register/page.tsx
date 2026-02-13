'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Confetti } from '@/components/Confetti';
import { PixelLoader } from '@/components/PixelLoader';

interface Campaign {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  reward_amount: string;
  reward_type: string;
  copy: {
    referrer_page_title: string;
    referrer_page_subtitle: string;
    referrer_form_heading: string;
    referrer_success_title: string;
    referrer_success_message: string;
    reward_description: string;
  };
}

interface Referrer {
  referral_code: string;
  referral_link: string;
  email: string;
  name: string;
}

export default function CampaignRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params.campaign as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
        setIsLoadingCampaign(false);
      }
    }
    fetchCampaign();
  }, [campaignSlug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, campaignId: campaign?.id, campaignSlug }),
      });

      const data = await response.json();

      if (response.ok) {
        setReferrer(data.referrer);
        setShowConfetti(true);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (referrer?.referral_link) {
      try {
        await navigator.clipboard.writeText(referrer.referral_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = referrer.referral_link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (isLoadingCampaign) {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {showConfetti && <Confetti />}

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#101626] mb-4 uppercase leading-tight">
            {campaign.copy.referrer_page_title}
          </h1>
          <p className="text-[#101626] text-lg">
            {campaign.copy.referrer_page_subtitle}
          </p>
        </div>

        {!referrer ? (
          <>
            {/* Reward Info */}
            <div className="card p-4 mb-6 text-center">
              <p className="text-[#101626] font-bold">
                {campaign.copy.reward_description}
              </p>
            </div>

            {/* Registration Form */}
            <div className="card p-6">
              <h2 className="text-xl font-black text-[#101626] mb-4 uppercase text-center">
                {campaign.copy.referrer_form_heading}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold text-[#101626] mb-1 uppercase"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-pixel w-full"
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-[#101626] mb-1 uppercase"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-pixel w-full"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-[#ff3333]/10 border-3 border-[#ff3333] p-3">
                    <p className="text-sm text-[#ff3333] font-bold">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Get My Referral Link'}
                </button>
              </form>

              <p className="text-xs text-[#101626]/60 mt-4 text-center">
                By registering, you agree to the{' '}
                <a href={`/${campaignSlug}/terms`} className="text-[#3533ff] hover:underline">
                  Terms & Conditions
                </a>
              </p>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="card p-6 text-center">
            <div className="mb-4">
              <span className="text-5xl">🎉</span>
            </div>
            <h2 className="text-2xl font-black text-[#101626] mb-2 uppercase">
              {campaign.copy.referrer_success_title}
            </h2>
            <p className="text-[#101626] mb-6">
              {campaign.copy.referrer_success_message}
            </p>

            <div className="bg-[#101626] p-4 mb-4">
              <p className="text-xs text-[#a3e1f0] mb-2 uppercase font-bold">
                Your Unique Referral Link
              </p>
              <p className="text-white font-mono text-sm break-all">
                {referrer.referral_link}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="btn-primary w-full"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>

            {/* How It Works Section */}
            <div className="mt-6 pt-6 border-t-3 border-[#101626] text-left">
              <h3 className="font-bold text-[#101626] uppercase mb-4 text-center">
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#3533ff] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span className="text-[#101626]">Share your link with friends</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#3533ff] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span className="text-[#101626]">They sign up through your link</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#3533ff] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span className="text-[#101626]">
                    After 30 days, you get a <span className="bg-[#c8fb00] px-1 font-bold">{campaign.reward_amount}</span> {campaign.reward_type}!
                  </span>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mt-6 pt-6 border-t-3 border-[#101626]">
              <p className="text-sm text-[#101626] mb-4 text-center">
                Share via:
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href={`https://wa.me/?text=Check%20this%20out!%20${encodeURIComponent(referrer.referral_link)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=Check%20this%20out!&body=${encodeURIComponent(referrer.referral_link)}`}
                  className="btn-secondary text-sm"
                >
                  Email
                </a>
              </div>
            </div>

            {/* Terms Link */}
            <p className="text-xs text-[#101626]/60 mt-4 text-center">
              <a href={`/${campaignSlug}/terms`} className="text-[#3533ff] hover:underline">
                View Terms & Conditions
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
