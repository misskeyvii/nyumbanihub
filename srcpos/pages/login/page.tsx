import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '@/components/base/Modal';
import { signIn, homePathForUser } from '@/utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get('email') || '';
  const shouldRedirect = searchParams.get('redirect') === 'true';
  
  const [email, setEmail] = useState(emailFromParams || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);

  // Auto-focus password if email is prefilled from main app
  useEffect(() => {
    if (emailFromParams && shouldRedirect) {
      // If redirected from main app, show a message that they can use same credentials
      const timer = setTimeout(() => {
        const passwordInput = document.getElementById('password');
        if (passwordInput) passwordInput.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [emailFromParams, shouldRedirect]);

  const signInAs = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError('');
    try {
      const user = await signIn(loginEmail, loginPassword);
      navigate(homePathForUser(user));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Please check your details.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void signInAs(email, password);
  };

  return (
    <div className="flex min-h-screen bg-background-50">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src="https://readdy.ai/api/search-image?query=Abstract%20warm%20flowing%20gradient%20shapes%20in%20deep%20emerald%20green%20and%20warm%20amber%20orange%20with%20soft%20curved%20organic%20forms%2C%20modern%20minimal%20SaaS%20brand%20background%2C%20smooth%20textures%2C%20subtle%20light%20and%20shadow%2C%20clean%20elegant%20composition%2C%20no%20text&width=1200&height=1500&seq=nyumbani-login-hero&orientation=portrait"
          alt="Nyumbani Link POS"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/60 via-foreground-950/25 to-foreground-950/70" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-background-50 text-primary-600">
              <i className="ri-store-2-line text-xl" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold text-background-50">
                Nyumbani Link POS
              </p>
              <p className="text-xs text-background-50/80">Simple tools. Smarter business.</p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="font-heading text-4xl font-bold leading-tight text-background-50">
              Run your whole business from one simple screen.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-background-50/90">
              Shops, hotels, airbnbs, homes and marketplaces — each gets a tailored
              workspace for sales, bookings, rooms and more, in one simple screen.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: 'ri-hotel-bed-line', text: 'A dedicated workspace for every business type' },
                { icon: 'ri-flashlight-line', text: 'Fast checkout, bookings & room management' },
                { icon: 'ri-shield-check-line', text: 'Secure, isolated accounts for every subscriber' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background-50/15 text-background-50">
                    <i className={item.icon} />
                  </span>
                  <span className="text-sm text-background-50">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-background-50/70">
            © 2026 Nyumbani Link. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <i className="ri-store-2-line text-lg" />
              </span>
              <div>
                <p className="font-heading text-lg font-bold text-foreground-900">
                  Nyumbani Link POS
                </p>
              </div>
            </div>
            <h2 className="mt-6 font-heading text-2xl font-bold text-foreground-950 lg:mt-0">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-foreground-500">
              Use your Nyumbani Link account to access the POS system.
            </p>
            {shouldRedirect && emailFromParams && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <i className="ri-information-line mr-1"></i>
                  Use the same password from your Nyumbani Link account.
                </p>
              </div>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-error-warning-line text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Authentication failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-background-300 placeholder-foreground-500 text-foreground-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-background-300 placeholder-foreground-500 text-foreground-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} className="h-5 w-5 text-foreground-400" />
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <i className="ri-loader-4-line animate-spin mr-2" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-information-line text-blue-600"></i>
              <p className="text-sm font-bold text-blue-900">Need POS Access?</p>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Subscribe to POS access in your Nyumbani Link profile to use this system.
              You need an active POS subscription to log in.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-foreground-500">
            New to Nyumbani Link POS?{' '}
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              className="font-semibold text-primary-700 hover:text-primary-800"
            >
              Request access
            </button>
          </p>
        </div>
      </div>

      <Modal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Request POS access"
        subtitle="Get your Nyumbani Link POS account in a few simple steps."
        size="sm"
        footer={
          <button
            type="button"
            onClick={() => setRequestOpen(false)}
            className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 hover:bg-primary-600"
          >
            Close
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
              1
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground-900">
                Visit your Nyumbani Link profile
              </p>
              <p className="mt-1 text-xs text-foreground-600">
                Log into your Nyumbani Link account and go to your profile page.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
              2
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground-900">
                Subscribe to POS access
              </p>
              <p className="mt-1 text-xs text-foreground-600">
                Find the POS access card and click "Subscribe to POS" to add it to your account.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
              3
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground-900">
                Complete payment and access POS
              </p>
              <p className="mt-1 text-xs text-foreground-600">
                After successful payment, return here and sign in with your Nyumbani Link credentials.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}