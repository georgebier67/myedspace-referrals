'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PixelLoader } from '@/components/PixelLoader';
import Link from 'next/link';

interface Referrer {
  name: string;
  email: string;
}

function ReferralForm() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const [invalidCode, setInvalidCode] = useState(false);

  // Validate referral code on mount
  useEffect(() => {
    const validateCode = async () => {
      if (!referralCode) {
        setInvalidCode(true);
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/validate-code?code=${referralCode}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setReferrer(data.referrer);
        } else {
          setInvalidCode(true);
        }
      } catch {
        setInvalidCode(true);
      } finally {
        setIsValidating(false);
      }
    };

    validateCode();
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Minimum loading time for visual effect
    const minLoadTime = new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const [response] = await Promise.all([
        fetch('/api/refer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referralCode,
            name,
            email,
            phone,
          }),
        }),
        minLoadTime,
      ]);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to booking page with UTMs
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full">
          <PixelLoader message="Loading referral details..." />
        </div>
      </div>
    );
  }

  if (invalidCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#ff3333]/10 border-3 border-[#ff3333] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#ff3333]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-black text-[#101626] mb-2 uppercase">
            Invalid Referral Link
          </h1>
          <p className="text-[#101626] mb-6">
            This referral link is invalid or has expired. Please ask your friend
            to send you a new link.
          </p>
          <a
            href="https://myedspace.com"
            className="btn-primary inline-block"
          >
            Visit MyEdSpace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-block bg-[#a3e1f0] text-[#101626] px-4 py-2 text-sm font-bold uppercase mb-4 border-3 border-[#101626]">
            Referred by {referrer?.name}
          </div>
          <h1 className="text-2xl font-black text-[#101626] mb-2 uppercase">
            Welcome to MyEdSpace!
          </h1>
          <p className="text-[#101626]">
            Complete your details to get started with your free trial.
          </p>
        </div>

        {isLoading ? (
          <div className="py-12">
            <PixelLoader message="Creating your account..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-[#101626] mb-1 uppercase"
              >
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-pixel w-full"
                placeholder="Jane Smith"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[#101626] mb-1 uppercase"
              >
                Your Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-pixel w-full"
                placeholder="jane@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-bold text-[#101626] mb-1 uppercase"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-pixel w-full"
                placeholder="+1 (555) 123-4567"
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
              Continue to Learn with Eddie
            </button>

            <p className="text-xs text-center text-[#101626]">
              By signing up, you agree to our{' '}
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

export default function ReferPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card p-8 max-w-md w-full">
            <PixelLoader message="Loading..." />
          </div>
        </div>
      }
    >
      <ReferralForm />
    </Suspense>
  );
}
