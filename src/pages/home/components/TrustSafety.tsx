import { useEffect, useState } from 'react';

export default function TrustSafety() {
  const [stats, setStats] = useState({ listings: 0, users: 0 });

  useEffect(() => {
    import('../../../lib/supabase').then(({ supabase }) => {
      Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'live'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('role', 'user'),
      ]).then(([{ count: listings }, { count: users }]) => {
        setStats({ listings: listings || 0, users: users || 0 });
      });
    });
  }, []);
  const features = [
    {
      icon: 'ri-shield-check-fill',
      color: 'bg-emerald-100 text-emerald-600',
      title: 'Physical Verification',
      desc: 'Every landlord, business owner, and service provider is physically visited and verified by our Nyumbani Hub agents before being approved.',
    },
    {
      icon: 'ri-eye-fill',
      color: 'bg-emerald-100 text-emerald-600',
      title: 'Property Inspection',
      desc: 'We inspect every property listed on Nyumbani Hub to ensure images and descriptions match reality. No misleading photos.',
    },
    {
      icon: 'ri-map-pin-2-fill',
      color: 'bg-amber-100 text-amber-600',
      title: 'Real Location Traceability',
      desc: 'Every shop and service provider on Nyumbani Hub has a verified physical address. You can always trace the seller in real life.',
    },
    {
      icon: 'ri-user-follow-fill',
      color: 'bg-sky-100 text-sky-600',
      title: 'Approved Sellers Only',
      desc: 'Only registered businesses, landlords, and service providers can list. Anonymous or unverified sellers are never allowed.',
    },
    {
      icon: 'ri-bank-card-2-fill',
      color: 'bg-violet-100 text-violet-600',
      title: 'No In-App Payments',
      desc: 'Customers are directly connected to owners via call or WhatsApp. We encourage safe, transparent physical meetups.',
    },
    {
      icon: 'ri-alarm-warning-fill',
      color: 'bg-rose-100 text-rose-600',
      title: 'Anti-Scam Policy',
      desc: 'Zero-tolerance for scams. All listings expire if subscription is not renewed. Suspicious listings are immediately removed.',
    },
  ];

  return (
    <section className="py-16 px-4 md:px-6 bg-white" id="trust">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-3">
            Why Choose Nyumbani Hub?
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Built on Trust. Powered by Verification.
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
            Nyumbani Hub was built to eliminate property and service scams in Kenya. Every feature is designed to protect you.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-emerald-100 transition-all group"
            >
              <div className={`w-11 h-11 flex items-center justify-center rounded-xl mb-4 ${f.color}`}>
                <i className={`${f.icon} text-xl`}></i>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Anti-Scam Banner */}
        <div className="mt-10 bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-2xl flex-shrink-0">
            <i className="ri-spy-line text-white text-3xl"></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-white font-bold text-xl mb-1">Spotted a Scam? Report It.</h3>
            <p className="text-emerald-100 text-sm leading-relaxed">
              If you encounter any suspicious listing on Nyumbani Hub, report it immediately. Our team reviews and acts within 24 hours. Together, we keep Kenya safe.
            </p>
          </div>
          <button className="bg-white text-emerald-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0">
            Report a Scam
          </button>
        </div>

        {/* Stats Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: `${stats.listings.toLocaleString()}+`, label: 'Verified Listings', icon: 'ri-list-check-3' },
            { val: '98%', label: 'Scam-Free Rate', icon: 'ri-shield-check-line' },
            { val: '47', label: 'Kenyan Counties', icon: 'ri-map-2-line' },
            { val: `${stats.users.toLocaleString()}+`, label: 'Verified Users', icon: 'ri-user-smile-line' },
          ].map((s) => (
            <div key={s.label} className="text-center bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                <i className={`${s.icon} text-emerald-600 text-xl`}></i>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.val}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
