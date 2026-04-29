import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';

const customerSteps = [
  { step: 1, icon: 'ri-search-2-line', title: 'Browse Listings', desc: 'Search for verified homes, Airbnbs, services, or marketplace products by location, price, and category — completely free.' },
  { step: 2, icon: 'ri-shield-check-line', title: 'Check Verification', desc: 'Every listing shows a "Verified by Nyumbani Hub" or "Inspected" badge. You know exactly what\'s real and what\'s been checked.' },
  { step: 3, icon: 'ri-phone-line', title: 'Contact Owner Directly', desc: 'Click Call or WhatsApp to reach the owner directly. No platform fees, no middlemen — just a safe, direct connection.' },
  { step: 4, icon: 'ri-map-pin-2-line', title: 'Visit in Person', desc: 'Schedule a physical visit before making any payments. We always encourage real-life meetups to avoid scams.' },
];

const businessSteps = [
  { step: 1, icon: 'ri-file-text-line', title: 'Submit Application', desc: 'Fill out our listing form with your business or property details. Include photos, description, and contact info.' },
  { step: 2, icon: 'ri-user-follow-line', title: 'Nyumbani Hub Physical Verification', desc: 'Our agents will physically visit your property or business location to verify it matches your listing details.' },
  { step: 3, icon: 'ri-bank-card-line', title: 'Pay Listing Subscription', desc: 'Pay a small monthly fee to keep your listing active. Choose to be featured on the homepage for extra visibility.' },
  { step: 4, icon: 'ri-rocket-2-line', title: 'Go Live & Get Clients', desc: 'Your verified listing goes live to thousands of Kenyan users. Manage it from your business dashboard.' },
];

const faqs = [
  { q: 'Is Nyumbani Hub free for customers?', a: 'Yes! Customers can browse all listings, view details, and contact owners completely for free. No account needed.' },
  { q: 'How long does verification take?', a: 'Physical verification by our agents typically takes 2–5 business days depending on your location in Kenya.' },
  { q: 'What happens if my subscription expires?', a: 'Your listing is automatically hidden until you renew your subscription. No listings are deleted, just paused.' },
  { q: 'Can I list multiple properties?', a: 'Yes! Business accounts can list multiple properties or products. Each listing requires its own subscription.' },
  { q: 'Are there refunds if I\'m not verified?', a: 'You pay for the listing subscription only after successful verification. Payment is not required upfront for verification.' },
  { q: 'How do I report a scam listing?', a: 'Use the "Report" button on any listing page. Our team reviews reports within 24 hours and takes immediate action.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 px-4 md:px-6 py-16 text-center">
          <span className="inline-block text-xs font-semibold text-emerald-200 bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-4">Simple &amp; Transparent</span>
          <h1 className="text-white font-bold text-3xl md:text-5xl max-w-2xl mx-auto leading-tight">How Nyumbani Hub Works</h1>
          <p className="text-emerald-100 text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Whether you're looking for a home, a service, or a product — Nyumbani Hub makes it safe, simple, and scam-free in Kenya.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link to="/explore" className="bg-white text-emerald-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap">
              Start Browsing Free
            </Link>
            <Link to="/post-listing" className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
              List Your Business
            </Link>
          </div>
        </div>

        {/* For Customers */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full mb-3">For Customers</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Find What You Need — For Free</h2>
            <p className="text-gray-500 text-sm mt-2">No signup required. Just browse, verify, and connect.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {customerSteps.map((s) => (
              <div key={s.step} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-xl mb-4">
                  <i className={`${s.icon} text-emerald-600 text-xl`}></i>
                </div>
                <span className="absolute top-4 right-4 text-4xl font-black text-gray-100 leading-none">0{s.step}</span>
                <h3 className="font-bold text-gray-900 text-base mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mb-3">For Businesses &amp; Landlords</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">List, Get Verified &amp; Grow</h2>
              <p className="text-gray-500 text-sm mt-2">Only verified businesses and landlords can post listings on Nyumbani Hub.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {businessSteps.map((s) => (
                <div key={s.step} className="bg-white rounded-2xl p-5 border border-gray-100 relative">
                  <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-xl mb-4">
                    <i className={`${s.icon} text-amber-600 text-xl`}></i>
                  </div>
                  <span className="absolute top-4 right-4 text-4xl font-black text-gray-100 leading-none">0{s.step}</span>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 text-sm mt-2">No hidden fees. Cancel anytime. Listings pause (not delete) when expired.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'Home / Rental', price: 'KSh 500', unit: '/month', icon: 'ri-home-4-fill', color: 'bg-emerald-50 text-emerald-600' },
              { type: 'Shop / Business', price: 'KSh 800', unit: '/month', icon: 'ri-store-2-fill', color: 'bg-amber-50 text-amber-600' },
              { type: 'Service Provider', price: 'KSh 400', unit: '/month', icon: 'ri-customer-service-2-fill', color: 'bg-sky-50 text-sky-600' },
              { type: 'Featured Ad', price: 'KSh 1,200', unit: '/month', icon: 'ri-star-fill', color: 'bg-rose-50 text-rose-600', popular: true },
            ].map((plan) => (
              <div key={plan.type} className={`bg-white rounded-2xl p-5 border text-center relative ${plan.popular ? 'border-emerald-500' : 'border-gray-100'}`}>
                {plan.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">Most Popular</span>}
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl mx-auto mb-3 ${plan.color}`}>
                  <i className={`${plan.icon} text-xl`}></i>
                </div>
                <p className="text-gray-600 text-xs mb-1">{plan.type}</p>
                <p className="text-2xl font-black text-gray-900">{plan.price}</p>
                <p className="text-gray-400 text-xs">{plan.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="bg-white rounded-2xl border border-gray-100 group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                      <i className="ri-arrow-down-s-line text-lg"></i>
                    </span>
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-emerald-700 py-14 px-4 text-center">
          <h2 className="text-white font-bold text-2xl md:text-3xl mb-3">Ready to Get Started?</h2>
          <p className="text-emerald-100 text-sm mb-6 max-w-md mx-auto">Join thousands of Kenyans who trust Nyumbani Hub for safe, verified listings every day.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/explore" className="bg-white text-emerald-700 font-bold text-sm px-7 py-3 rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap">Browse Free Now</Link>
            <Link to="/post-listing" className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors whitespace-nowrap">Post a Listing</Link>
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
