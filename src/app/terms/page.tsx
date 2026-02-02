import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/register-referral"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Referral Program
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Referral Program Terms & Conditions
          </h1>

          <div className="prose prose-sm text-gray-600 space-y-4">
            <p className="text-sm text-gray-500">
              Last updated: February 2026
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              1. Program Overview
            </h2>
            <p>
              The MyEdSpace Referral Program allows existing customers to refer
              friends and family to MyEdSpace. When a referred friend becomes a
              paying customer and remains active for 30 days, the referrer
              receives a $150 Amazon gift card reward.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              2. Eligibility
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Referrers must be existing MyEdSpace customers in good standing.
              </li>
              <li>
                Referred friends must be new to MyEdSpace (no previous account or
                purchase history).
              </li>
              <li>
                The referral must use the unique referral link provided to the
                referrer.
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              3. Reward Conditions
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The referred friend must complete a purchase through MyEdSpace.
              </li>
              <li>
                The referred friend must remain an active customer for 30
                consecutive days after their purchase date.
              </li>
              <li>
                If the referred friend requests a refund within the 30-day
                period, the referral reward will be disqualified.
              </li>
              <li>
                Rewards are processed within 7 business days after the 30-day
                qualification period.
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              4. Reward Details
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Each successful referral earns a $150 Amazon gift card.
              </li>
              <li>
                Gift cards will be sent to the email address associated with the
                referrer&apos;s MyEdSpace account.
              </li>
              <li>
                There is no limit to the number of successful referrals a
                customer can make.
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              5. Prohibited Activities
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Self-referrals (referring yourself or accounts you control) are
                not allowed.
              </li>
              <li>
                Creating multiple accounts to abuse the referral program is
                prohibited.
              </li>
              <li>
                Sharing referral links on coupon or deal websites without prior
                approval is not permitted.
              </li>
              <li>
                Any fraudulent activity will result in disqualification and
                potential account termination.
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              6. Program Changes
            </h2>
            <p>
              MyEdSpace reserves the right to modify, suspend, or terminate the
              referral program at any time. Changes to these terms will be
              communicated to participants via email.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              7. Disputes
            </h2>
            <p>
              All referral disputes will be reviewed on a case-by-case basis.
              MyEdSpace&apos;s decision on all referral matters is final.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              8. Contact
            </h2>
            <p>
              For questions about the referral program, please contact our
              support team at{' '}
              <a
                href="mailto:support@myedspace.com"
                className="text-primary hover:underline"
              >
                support@myedspace.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
