import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import HeroSection from './components/HeroSection';
import QuickAccessStrip from './components/QuickAccessStrip';
import TrendingSection from './components/TrendingSection';
import CategoriesSection from './components/CategoriesSection';
import FeaturedListings from './components/FeaturedListings';
import MarketplaceSection from './components/MarketplaceSection';
import TrustSafety from './components/TrustSafety';
import EntertainmentSection from './components/EntertainmentSection';
import TestimonialsSection from './components/TestimonialsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <QuickAccessStrip />
        <TrendingSection />
        <CategoriesSection />
        <FeaturedListings />
        <MarketplaceSection />
        <TrustSafety />
        <TestimonialsSection />
        <EntertainmentSection />
      </main>
      <Footer />
      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
