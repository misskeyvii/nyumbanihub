import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import i18n from '../../i18n/index';
import { useDarkMode } from '../../App';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; isAdmin: boolean; isServiceOnly: boolean } | null>(null);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const { dark, toggle: toggleDark } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'sw' : 'en';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setUser(null); return; }
      const at = localStorage.getItem('accountType') || '';
      setUser({ name: name || 'Account', isAdmin: role === 'admin', isServiceOnly: ['service', 'entertainment'].includes(at) });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); return; }
      const at = localStorage.getItem('accountType') || '';
      setUser({ name: localStorage.getItem('userName') || 'Account', isAdmin: localStorage.getItem('userRole') === 'admin', isServiceOnly: ['service', 'entertainment'].includes(at) });
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
                src="https://i.postimg.cc/qM8Nz01k/Untitled-design.png"
                alt="Nyumbani Hub"
                className={`h-11 w-auto transition-all ${logoFilter}`}
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
                    My Account
                  </Link>
                  <Link to="/chat" className={`text-sm font-medium hover:text-emerald-600 transition-colors whitespace-nowrap ${textColor}`}>
                    Messages
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`text-sm font-medium hover:text-rose-500 transition-colors whitespace-nowrap ${textColor}`}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className={`text-sm font-medium hover:text-emerald-600 transition-colors whitespace-nowrap ${textColor}`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className={`text-sm font-medium hover:text-emerald-600 transition-colors whitespace-nowrap ${textColor}`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {(!user || !user.isServiceOnly) && (
                <Link
                  to="/post-listing"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-add-line text-sm"></i>
                  </span>
                  Post Listing
                </Link>
              )}
              <button
                onClick={toggleDark}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                  isHome && !scrolled ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:border-emerald-400'
                }`}
              >
                <i className={dark ? 'ri-sun-line' : 'ri-moon-line'}></i>
              </button>
              <button
                onClick={toggleLang}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                  isHome && !scrolled ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:border-emerald-400'
                }`}
              >
                {lang === 'en' ? '🇰🇪 SW' : '🇬🇧 EN'}
              </button>
            </div>

            {/* Mobile: Search + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleDark}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                  isHome && !scrolled ? 'border-white/30 text-white' : 'border-gray-200 text-gray-600'
                }`}
              >
                <i className={`${dark ? 'ri-sun-line' : 'ri-moon-line'} text-base`}></i>
              </button>
              <button
                onClick={toggleLang}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                  isHome && !scrolled ? 'border-white/30 text-white' : 'border-gray-200 text-gray-600'
                }`}
              >
                {lang === 'en' ? 'SW' : 'EN'}
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
                    My Account
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center text-sm font-medium text-gray-700 border border-gray-200 py-2 rounded-lg hover:border-emerald-400 transition-colors whitespace-nowrap"
                  >
                    Messages
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-center text-sm font-medium text-rose-600 border border-rose-200 py-2 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center text-sm font-medium text-gray-700 border border-gray-200 py-2 rounded-lg hover:border-emerald-400 transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center text-sm font-medium text-gray-700 border border-gray-200 py-2 rounded-lg hover:border-emerald-400 transition-colors whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {(!user || !user.isServiceOnly) && (
                <Link
                  to="/post-listing"
                  className="block text-center bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  Post a Listing
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
