import Link from 'next/link';

const AuthErrorPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center dark:bg-gray-900">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold text-destructive">
          Authentication Error
        </h1>
        <p className="mt-4 text-muted-foreground">
          There was a problem authenticating your request. The link may have
          expired or already been used.
        </p>
        <p className="mt-2 text-muted-foreground">
          Please try signing in again.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorPage; 