'use client';

interface StatusBannerProps {
  hasClerk?: boolean;
  hasConvex?: boolean;
  className?: string;
}

export default function StatusBanner({ hasClerk = false, hasConvex = false, className = '' }: StatusBannerProps) {
  const missingServices: string[] = [];
  if (!hasClerk) missingServices.push('Authentication (Clerk)');
  if (!hasConvex) missingServices.push('Database (Convex)');

  if (missingServices.length === 0) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 mb-6 ${className}`}>
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">All Services Configured</h3>
            <p className="text-sm text-green-700">Your application is fully set up with authentication and database.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">Configuration Required</h3>
          <p className="text-sm text-amber-700 mb-3">
            The following services need to be configured to unlock full functionality:
          </p>
          <div className="space-y-2">
            {!hasClerk && (
              <div className="flex items-center gap-2 text-sm">
                <div className="h-4 w-4 text-amber-600">🔐</div>
                <span className="text-amber-800">Authentication (Clerk) - User sign-in/sign-up</span>
              </div>
            )}
            {!hasConvex && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
                <span className="text-amber-800">Database (Convex) - Real-time data storage</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {!hasClerk && (
              <a
                href="https://clerk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
              >
                Set up Clerk
              </a>
            )}
            {!hasConvex && (
              <a
                href="https://convex.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
              >
                Set up Convex
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
