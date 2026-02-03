import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/register-referral"
          className="inline-flex items-center gap-2 text-[#3533ff] font-bold uppercase hover:bg-[#a3e1f0] mb-8 no-underline"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={3}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Referral Program
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-black text-[#101626] mb-6 uppercase">
            Referral Program Terms & Conditions
          </h1>

          <div className="text-[#101626] space-y-4">
            <p className="text-sm text-[#101626]/60 font-bold">
              Last updated: February 2026
            </p>

            <h2 className="text-lg font-black text-[#101626] mt-6 uppercase">
              1. Program Overview
            </h2>
            <p>
              The MyEdSpace Referral Program allows existing customers to refer
              friends and family to MyEdSpace. When a referred friend becomes a
              paying customer and remains active for 30 days, the referrer
              receives a $150 Amazon gift card reward.
            </p>

            <h2 className="text-lg font-black text-[#101626] mt-6 uppercase">
              2. Eligibility
            </h2>
            <ul className="list-none space-y-2">
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Referrers must be existing MyEdSpace customers in good standing.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Referred friends must be new to MyEdSpace (no previous account or
                purchase history).
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                The referral must use the unique referral link provided to the
                referrer.
              </li>
            </ul>

            <h2 className="text-lg font-black text-[#101626] mt-6 uppercase">
              3. Reward Conditions
            </h2>
            <ul className="list-none space-y-2">
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                The referred friend must complete a purchase through MyEdSpace.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                The referred friend must remain an active customer for 30
                consecutive days after their purchase date.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                If the referred friend requests a refund within the 30-day
                period, the referral reward will be disqualified.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Rewards are processed within 7 business days after the 30-day
                qualification period.
              </li>
            </ul>

            <h2 className="text-lg font-black text-[#101626] mt-6 uppercase">
              4. Reward Details
            </h2>
            <ul className="list-none space-y-2">
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Each successful referral earns a $150 Amazon gift card.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Gift cards will be sent to the email address associated with the
                referrer&apos;s MyEdSpace account.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                There is no limit to the number of successful referrals a
                customer can make.
              </li>
            </ul>

            <h2 className="text-lg font-black text-[#101626] mt-6 uppercase">
              5. Prohibited Activities
            </h2>
            <ul className="list-none space-y-2">
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Self-referrals (referring yourself or accounts you control) are
                not allowed.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Creating multiple accounts to abuse the referral program is
                prohibited.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Sharing referral links on coupon or deal websites without prior
                approval is not permitted.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3533ff] font-bold">-</span>
                Any fraudulent activity will result in disqualification and
                potential account termination.
              </li>
            </ul>

            <h2 className="text-lg font-black text-[#101626] mt-6 uppercase">
              6. Program Changes
            </h2>
            <p>
              MyEdSpace reserves the right to modify, suspend, or terminate the
              referral program at any time. Changes to these terms will be
              communicated to participants via email.
            </p>

            <h2 className="text-lg font-black text-[#101626] mt-6 uppercase">
              7. Disputes
            </h2>
            <p>
              All referral disputes will be reviewed on a case-by-case basis.
              MyEdSpace&apos;s decision on all referral matters is final.
            </p>

            <h2 className="text-lg font-black text-[#101626] mt-6 uppercase">
              8. Contact
            </h2>
            <p>
              For questions about the referral program, please contact our
              support team at{' '}
              <a
                href="mailto:support@myedspace.com"
                className="text-[#3533ff] hover:bg-[#a3e1f0]"
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
