import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/feature/Navbar";
import MobileBottomNav from "../components/feature/MobileBottomNav";
import Footer from "../components/feature/Footer";

export default function NotFound() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16 px-4 md:px-6">
        <div className="relative flex min-h-[70vh] flex-col items-center justify-center text-center">
          <h1 className="absolute bottom-8 text-9xl md:text-[12rem] font-black text-gray-100 select-none pointer-events-none">
            404
          </h1>
          <div className="relative z-10 max-w-md">
            <div className="w-16 h-16 flex items-center justify-center bg-emerald-50 rounded-2xl mx-auto mb-5">
              <i className="ri-map-pin-2-line text-emerald-600 text-2xl"></i>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Page not found</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">We could not find that page</h1>
            <p className="mt-2 text-sm text-gray-500">
              The link may be broken, moved, or no longer available on Nyumbani Link.
            </p>
            <p className="mt-3 text-xs text-gray-400 font-mono break-all">{location.pathname}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
                <i className="ri-home-4-line"></i>
                Go Home
              </Link>
              <Link to="/explore" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 text-gray-700 text-sm font-semibold px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
                <i className="ri-search-line"></i>
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
