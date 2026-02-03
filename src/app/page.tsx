import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-lg w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#101626] mb-4 uppercase tracking-tight">
            MyEdSpace Referral Program
          </h1>
          <p className="text-[#101626]">
            Refer friends and earn $150 Amazon gift cards for each successful
            referral!
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/register-referral"
            className="btn-primary block w-full text-center"
          >
            Get Your Referral Link
          </Link>

          <Link
            href="/terms"
            className="text-sm text-[#101626] block no-underline hover:bg-[#a3e1f0]"
          >
            View Terms & Conditions
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t-3 border-[#101626]">
          <h3 className="font-bold text-[#101626] mb-4 uppercase">How It Works</h3>
          <div className="grid gap-4 text-left">
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#3533ff] text-white flex items-center justify-center font-mono font-black text-lg border-3 border-[#101626]">
                1
              </span>
              <div>
                <p className="font-bold text-[#101626] uppercase">Register</p>
                <p className="text-sm text-[#101626]">
                  Sign up with your MyEdSpace email to get your unique referral
                  link.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#3533ff] text-white flex items-center justify-center font-mono font-black text-lg border-3 border-[#101626]">
                2
              </span>
              <div>
                <p className="font-bold text-[#101626] uppercase">Share</p>
                <p className="text-sm text-[#101626]">
                  Send your link to friends who would love MyEdSpace.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#3533ff] text-white flex items-center justify-center font-mono font-black text-lg border-3 border-[#101626]">
                3
              </span>
              <div>
                <p className="font-bold text-[#101626] uppercase">Earn</p>
                <p className="text-sm text-[#101626]">
                  Get a $150 Amazon gift card when they stay for 30 days!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
