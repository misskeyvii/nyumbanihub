import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="pt-16">
        <div className="bg-emerald-700 px-4 py-12 text-center">
          <h1 className="text-white font-bold text-3xl">Terms of Use</h1>
          <p className="text-emerald-100 text-sm mt-2">Last updated: January 2026</p>
        </div>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Nyumbani Hub, you agree to be bound by these Terms of Use, our Privacy Policy, and all applicable laws. If you do not agree, do not use the platform.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">2. Account Registration</h2>
            <p>You must be 18+ to create an account. Provide accurate information. You are responsible for maintaining confidentiality of your account and password.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">3. Listings and Content</h2>
            <p>You may post verified listings only after physical verification. Listings must be accurate, not misleading. You grant Nyumbani Hub a license to display your content. We may remove violating content.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">4. Prohibited Conduct</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Posting fraudulent, illegal, or scam listings</li>
              <li>Harassment, spam, or abusive behavior</li>
              <li>Unauthorized use of others' content or trademarks</li>
              <li>Attempting to bypass verification or payment systems</li>
            </ul>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">5. Payments and Transactions</h2>
            <p>Nyumbani Hub facilitates listings but is not party to transactions. Payments are direct between users. We are not liable for disputes or failed deals.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">6. Termination</h2>
            <p>We may suspend or terminate accounts for violations. Upon termination, your listings are removed and access revoked.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">7. Limitation of Liability</h2>
            <p>Nyumbani Hub provided "AS IS". We disclaim warranties. Liability limited to fees paid. Not liable for user content or transactions.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">8. Governing Law</h2>
            <p>These terms governed by Kenyan law. Disputes resolved in Nairobi courts.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">9. Contact Us</h2>
            <p>Questions? Email <span className="text-emerald-600">support@Nyumbani Hub.co.ke</span>.</p>
          </section>
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Link to="/privacy" className="text-emerald-600 text-sm hover:underline">Privacy Policy</Link>
            <Link to="/anti-scam" className="text-emerald-600 text-sm hover:underline">Anti-Scam Policy</Link>
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
