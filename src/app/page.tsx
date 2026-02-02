import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-lg w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            MyEdSpace Referral Program
          </h1>
          <p className="text-gray-600">
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
            className="text-sm text-gray-500 hover:text-primary transition-colors block"
          >
            View Terms & Conditions
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="grid gap-4 text-left">
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-mono font-bold">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">Register</p>
                <p className="text-sm text-gray-600">
                  Sign up with your MyEdSpace email to get your unique referral
                  link.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-mono font-bold">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">Share</p>
                <p className="text-sm text-gray-600">
                  Send your link to friends who would love MyEdSpace.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-mono font-bold">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">Earn</p>
                <p className="text-sm text-gray-600">
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
