import { useState } from 'react';
import { Link } from 'react-router-dom';

const FORM_URL = 'https://readdy.ai/api/form/d72jn7kjuufb4jdbl5fg';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const body = new URLSearchParams({ email });
      const res = await fetch(FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      {/* Newsletter */}
      <div className="bg-emerald-700 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-white font-bold text-xl">Get Verified Listings in Your Inbox</h3>
            <p className="text-emerald-100 text-sm mt-1">Be the first to know about new verified homes, Airbnbs, and deals in Kenya.</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 w-full md:w-auto"
            data-readdy-form
          >
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 md:w-64 px-4 py-2.5 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-emerald-200 focus:outline-none focus:border-white"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-white text-emerald-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              {status === 'loading' ? 'Sending...' : 'Subscribe'}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-emerald-200 text-sm mt-2 md:mt-0">Subscribed successfully!</p>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <img
                src="https://i.postimg.cc/qM8Nz01k/Untitled-design.png"
                alt="Nyumbani Hub"
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Kenya&apos;s most trusted platform for verified homes, stays, services, and marketplace products.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { icon: 'ri-facebook-fill', href: 'https://facebook.com/nyumbanihub' },
                { icon: 'ri-twitter-x-fill', href: 'https://twitter.com/nyumbanihub' },
                { icon: 'ri-instagram-line', href: 'https://instagram.com/nyumbanihub' },
                { icon: 'ri-tiktok-fill', href: 'https://tiktok.com/@nyumbanihub' },
              ].map(({ icon, href }) => (
                <a key={icon} href={href} target="_blank" rel="nofollow noreferrer" className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-500 rounded-full transition-colors cursor-pointer">
                  <i className={`${icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-3">
              <a href="#explore" className="hover:text-emerald-600 transition-colors">Explore</a>
            </h4>
            <ul className="space-y-2">
              {['Homes & Rentals', 'Airbnb Stays', 'Hotels', 'Services', 'Marketplace'].map((item) => (
                <li key={item}>
                  <a href="#" rel="nofollow" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Counties */}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-3">
              <a href="#counties" className="hover:text-emerald-600 transition-colors">Popular Counties</a>
            </h4>
            <ul className="space-y-2">
              {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi'].map((c) => (
                <li key={c}>
                  <a href="#" rel="nofollow" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">{c}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-3">
              <a href="#company" className="hover:text-emerald-600 transition-colors">Company</a>
            </h4>
            <ul className="space-y-2">
{['About Nyumbani Hub', 'How It Works', 'Anti-Scam Policy', 'List Your Property', 'Pricing', 'Contact Us'].map((item) => (
  <li key={item}>
    {item === 'Anti-Scam Policy' ? (
      <Link to="/anti-scam" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">{item}</Link>
    ) : item === 'How It Works' ? (
      <Link to="/how-it-works" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">{item}</Link>
    ) : item === 'Contact Us' ? (
      <Link to="/contact" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">{item}</Link>
    ) : (
      <a href="#" rel="nofollow" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">{item}</a>
    )}
  </li>
))}
            </ul>

          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-400 text-xs text-center sm:text-left">
            © 2026 Nyumbani Hub Kenya. All rights reserved. Trusted verified listings platform.
          </p>
          <div className="flex items-center gap-4">
<Link to="/privacy" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Privacy Policy</Link>
<Link to="/terms" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Terms of Use</Link>
<Link to="/anti-scam" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Anti-Scam</Link>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/254700000000?text=Hi Nyumbani Hub, I need help with your platform."
        target="_blank"
        rel="nofollow noreferrer"
        className="fixed bottom-24 md:bottom-8 left-4 w-12 h-12 flex items-center justify-center bg-[#25D366] hover:bg-[#20ba58] text-white rounded-full shadow-lg transition-all cursor-pointer z-40"
        title="Chat with us on WhatsApp"
      >
        <i className="ri-whatsapp-fill text-2xl"></i>
      </a>
    </footer>
  );
}

