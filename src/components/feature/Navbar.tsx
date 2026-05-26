import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; isAdmin: boolean } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setUser(null); return; }
      setUser({ name: name || 'Account', isAdmin: role === 'admin' });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); return; }
      setUser({ name: localStorage.getItem('userName') || 'Account', isAdmin: localStorage.getItem('userRole') === 'admin' });
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBg = isHome
    ? scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100' : 'bg-transparent'
    : 'bg-white border-b border-gray-100';

  const textColor = isHome && !scrolled ? 'text-white' : 'text-gray-700';
  const logoFilter = isHome && !scrolled ? 'brightness-0 invert' : '';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="https://public.readdy.ai/ai/img_res/735ac14e-6136-4ce5-8bb3-d1d2e33b0f68.png"
                alt="Mabidha"
                className={`h-8 w-auto transition-all ${logoFilter}`}
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className={`text-sm font-medium hover:text-emerald-600 transition-colors ${textColor}`}>
                Home
              </Link>
              <Link to="/explore" className={`text-sm font-medium hover:text-emerald-600 transition-colors ${textColor}`}>
                Explore
              </Link>
              <Link to="/marketplace" className={`text-sm font-medium hover:text-emerald-600 transition-colors ${textColor}`}>
                Marketplace
              </Link>
              <Link to="/services" className={`text-sm font-medium hover:text-emerald-600 transition-colors ${textColor}`}>
                Services
              </Link>
              <Link to="/how-it-works" className={`text-sm font-medium hover:text-emerald-600 transition-colors ${textColor}`}>
                How It Works
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {user.isAdmin && (
                    <Link to="/kelly" className={`text-sm font-medium hover:text-emerald-600 transition-colors whitespace-nowrap ${textColor}`}>
                      Admin
                    </Link>
                  )}
                  <Link to="/profile" className={`text-sm font-medium hover:text-emerald-600 transition-colors whitespace-nowrap ${textColor}`}>
                    My Listings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`text-sm font-medium hover:text-rose-500 transition-colors whitespace-nowrap ${textColor}`}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/signin"
                  className={`text-sm font-medium hover:text-emerald-600 transition-colors whitespace-nowrap ${textColor}`}
                >
                  Sign In
                </Link>
              )}
              <Link
                to="/post-listing"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line text-sm"></i>
                </span>
                Post Listing
              </Link>
            </div>

            {/* Mobile: Search + Hamburger */}
            <div className="flex md:hidden items-center gap-3">
              <button className={`w-8 h-8 flex items-center justify-center ${textColor}`}>
                <i className="ri-search-line text-lg"></i>
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`w-8 h-8 flex items-center justify-center ${textColor}`}
              >
                <i className={`text-xl ${menuOpen ? 'ri-close-line' : 'ri-menu-3-line'}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {['Home', 'Explore', 'Marketplace', 'Services', 'Entertainment', 'How It Works'].map((item) => (
              <Link
                key={item}
                to={`/${item === 'Home' ? '' : item.toLowerCase().replace(' ', '-')}`}
                className="block text-sm font-medium text-gray-700 hover:text-emerald-600 py-2 border-b border-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <>
                  {user.isAdmin && (
                    <Link
                      to="/kelly"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center text-sm font-medium text-emerald-700 border border-emerald-200 py-2 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center text-sm font-medium text-gray-700 border border-gray-200 py-2 rounded-lg hover:border-emerald-400 transition-colors whitespace-nowrap"
                  >
                    My Listings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-center text-sm font-medium text-rose-600 border border-rose-200 py-2 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center text-sm font-medium text-gray-700 border border-gray-200 py-2 rounded-lg hover:border-emerald-400 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}
              <Link
                to="/post-listing"
                className="block text-center bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                Post a Listing
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
