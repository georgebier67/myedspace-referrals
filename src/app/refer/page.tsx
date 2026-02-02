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
  const [childGrade, setChildGrade] = useState('');
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
            childGrade,
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Referral Link
          </h1>
          <p className="text-gray-600 mb-6">
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
          <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
            Referred by {referrer?.name}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to MyEdSpace!
          </h1>
          <p className="text-gray-600">
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
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="block text-sm font-medium text-gray-700 mb-1"
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

            <div>
              <label
                htmlFor="childGrade"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Child&apos;s Grade
              </label>
              <select
                id="childGrade"
                value={childGrade}
                onChange={(e) => setChildGrade(e.target.value)}
                className="input-pixel w-full"
              >
                <option value="">Select grade...</option>
                <option value="K">Kindergarten</option>
                <option value="1">1st Grade</option>
                <option value="2">2nd Grade</option>
                <option value="3">3rd Grade</option>
                <option value="4">4th Grade</option>
                <option value="5">5th Grade</option>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
                <option value="9">9th Grade</option>
                <option value="10">10th Grade</option>
                <option value="11">11th Grade</option>
                <option value="12">12th Grade</option>
              </select>
            </div>

            {error && (
              <div className="pixel-shake bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              Continue to Book Your Class
            </button>

            <p className="text-xs text-center text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
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
