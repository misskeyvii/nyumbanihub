import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="pt-16">
        <div className="bg-emerald-700 px-4 py-12 text-center">
          <h1 className="text-white font-bold text-3xl">Privacy Policy</h1>
          <p className="text-emerald-100 text-sm mt-2">Last updated: January 2026</p>
        </div>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">1. Information We Collect</h2>
            <p>When you register on Nyumbani Hub, we collect your name, email address, phone number, and location (county/area). If you post a listing, we also collect listing details including photos, description, and contact information. We do not collect payment card details — all payments are handled directly between users.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and manage your Nyumbani Hub account</li>
              <li>To display your listings to potential customers across Kenya</li>
              <li>To verify your identity and business location through our physical verification process</li>
              <li>To send you important updates about your account or listings</li>
              <li>To improve our platform and user experience</li>
              <li>To prevent fraud, scams, and misuse of the platform</li>
            </ul>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">3. Information Sharing</h2>
            <p>We do not sell your personal information to third parties. Your contact details (phone number) are displayed on your listings so that potential customers can reach you directly. We may share information with law enforcement if required by Kenyan law or to investigate fraud.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored securely using Supabase infrastructure with industry-standard encryption. We use secure HTTPS connections for all data transmission. While we take all reasonable precautions, no system is 100% secure and we encourage you to use a strong password.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">5. Cookies</h2>
            <p>Nyumbani Hub uses minimal cookies to keep you logged in and remember your preferences. We do not use tracking cookies for advertising purposes.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time from your profile page. To permanently delete your account and all associated data, contact us at <span className="text-emerald-600">support@Nyumbani Hub.co.ke</span>.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">7. Children's Privacy</h2>
            <p>Nyumbani Hub is not intended for users under the age of 18. We do not knowingly collect information from minors.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email. Continued use of Nyumbani Hub after changes constitutes acceptance of the updated policy.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-3">9. Contact Us</h2>
            <p>For any privacy-related questions, contact us at <span className="text-emerald-600">support@Nyumbani Hub.co.ke</span>.</p>
          </section>
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Link to="/terms" className="text-emerald-600 text-sm hover:underline">Terms of Use</Link>
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
