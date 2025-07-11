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
          <div className="h-5 w-5 text-green-600">✅</div>
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
        <div className="h-5 w-5 text-amber-600 mt-0.5">⚠️</div>
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
                <div className="h-4 w-4 text-amber-600">🗄️</div>
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
