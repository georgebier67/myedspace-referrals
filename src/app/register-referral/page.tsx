'use client';

import { useState } from 'react';
import { PixelLoader, SuccessAnimation } from '@/components/PixelLoader';
import Link from 'next/link';

interface Referrer {
  referral_code: string;
  referral_link: string;
  email: string;
  name: string;
  total_referrals: number;
}

export default function RegisterReferral() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Minimum loading time for visual effect
    const minLoadTime = new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const [response] = await Promise.all([
        fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        }),
        minLoadTime,
      ]);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setReferrer(data.referrer);
      setIsExisting(data.isExisting);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (referrer) {
      await navigator.clipboard.writeText(referrer.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (referrer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <SuccessAnimation />
          <h1 className="text-2xl font-black text-[#101626] mt-6 mb-2 uppercase">
            {isExisting ? 'Welcome Back!' : 'You\'re All Set!'}
          </h1>
          <p className="text-[#101626] mb-6">
            {isExisting
              ? 'Here\'s your existing referral link.'
              : 'Share your referral link with friends and earn rewards!'}
          </p>

          <div className="bg-[#a3e1f0] p-4 mb-4 border-3 border-[#101626]">
            <p className="text-sm text-[#101626] mb-2 font-bold uppercase">Your Referral Link</p>
            <p className="font-mono text-sm text-[#3533ff] break-all font-bold">
              {referrer.referral_link}
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="btn-primary w-full relative"
          >
            {copied ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </span>
            )}
          </button>

          <div className="mt-6 pt-6 border-t-3 border-[#101626]">
            <h3 className="font-bold text-[#101626] mb-3 uppercase">How It Works</h3>
            <div className="text-left space-y-3 text-sm text-[#101626]">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#3533ff] text-white flex items-center justify-center font-mono text-xs font-bold border-2 border-[#101626]">1</span>
                <span>Share your link with friends</span>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#3533ff] text-white flex items-center justify-center font-mono text-xs font-bold border-2 border-[#101626]">2</span>
                <span>They sign up through your link</span>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#3533ff] text-white flex items-center justify-center font-mono text-xs font-bold border-2 border-[#101626]">3</span>
                <span>After 30 days, you get a $150 Amazon voucher!</span>
              </div>
            </div>
          </div>

          <Link
            href="/terms"
            className="block mt-4 text-sm text-[#101626] hover:bg-[#a3e1f0]"
          >
            View Terms & Conditions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#101626] mb-2 uppercase">
            MyEdSpace Referral Program
          </h1>
          <p className="text-[#101626]">
            Get your unique referral link and earn $150 for every friend who joins!
          </p>
        </div>

        {isLoading ? (
          <div className="py-12">
            <PixelLoader message="Creating your referral link..." />
          </div>
        ) : (
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
              <p className="text-xs text-[#101626] mt-1">
                Use the email associated with your MyEdSpace account
              </p>
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
              Get My Referral Link
            </button>

            <p className="text-xs text-center text-[#101626]">
              By registering, you agree to our{' '}
              <Link href="/terms" className="text-[#3533ff] hover:bg-[#a3e1f0]">
                Terms & Conditions
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
