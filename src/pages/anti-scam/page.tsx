import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';

export default function AntiScamPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="pt-16">
        <div className="bg-emerald-700 px-4 py-12 text-center">
          <h1 className="text-white font-bold text-3xl">Anti-Scam Policy</h1>
          <p className="text-emerald-100 text-sm mt-2">Your safety is our priority. Last updated: January 2026</p>
        </div>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">1. Our Verification Process</h2>
            <p>Every listing on Nyumbani Hub undergoes physical verification. We visit the property/business location, verify documents, and meet the owner before approval. No listing appears without verification badge.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">2. Scam Indicators We Block</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Listings without photos of actual property</li>
              <li>Prices too good to be true</li>
              <li>Pressure to pay outside platform</li>
              <li>Requests for advance deposits to strangers</li>
              <li>Properties that don't exist upon verification</li>
            </ul>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">3. How to Report a Scam</h2>
            <p>Email <span className="text-emerald-600">report@Nyumbani Hub.co.ke</span> with listing ID, screenshots, and details. Suspicious listings are immediately removed pending investigation.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">4. Our Guarantees</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>100% verified listings only</li>
              <li>24-hour response to scam reports</li>
              <li>Scammers permanently banned</li>
              <li>Physical verification before listing live</li>
            </ul>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">5. User Responsibilities</h2>
            <p>Always meet in person for large payments. Verify documents. Use M-Pesa till numbers only from verified listings. Report suspicious behavior immediately.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">6. Contact Support</h2>
            <p>For safety concerns: <span className="text-emerald-600">support@Nyumbani Hub.co.ke</span> or call +254-XXX-XXX-XXX.</p>
          </section>
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Link to="/privacy" className="text-emerald-600 text-sm hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-emerald-600 text-sm hover:underline">Terms of Use</Link>
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
