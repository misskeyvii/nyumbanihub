const testimonials = [
  {
    name: 'Amina Odhiambo',
    county: 'Nairobi',
    role: 'Tenant',
    text: 'I found my apartment in Westlands within 2 days using Mabidha. The verified badge meant I didn\'t have to worry about fake listings. The landlord was exactly as described!',
    avatar: 'https://readdy.ai/api/search-image?query=young%20Kenyan%20woman%20professional%20smiling%20headshot%20portrait%20light%20background%20natural%20confident&width=80&height=80&seq=400&orientation=squarish',
    rating: 5,
  },
  {
    name: 'Brian Mutua',
    county: 'Mombasa',
    role: 'Business Owner',
    text: 'Since listing my electronics shop on Mabidha, my foot traffic has doubled. Customers come in already trusting me because of the Verified Shop badge. Great investment!',
    avatar: 'https://readdy.ai/api/search-image?query=young%20Kenyan%20man%20business%20owner%20smiling%20headshot%20professional%20portrait%20clean%20background&width=80&height=80&seq=401&orientation=squarish',
    rating: 5,
  },
  {
    name: 'Fatuma Hassan',
    county: 'Kisumu',
    role: 'Airbnb Host',
    text: 'Mabidha verified my Diani property and my bookings have been non-stop. Guests feel safe coming because they see the Inspected by Mabidha badge. Highly recommended!',
    avatar: 'https://readdy.ai/api/search-image?query=Kenyan%20woman%20hotel%20host%20smiling%20headshot%20coastal%20professional%20natural%20portrait&width=80&height=80&seq=402&orientation=squarish',
    rating: 5,
  },
];

export default function EntertainmentSection() {
  return (
    <section className="py-16 px-4 md:px-6 bg-gray-50" id="testimonials">
      <div className="max-w-7xl mx-auto">
        {/* Testimonials */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-3">
            Real Stories
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What Kenyans Are Saying</h2>
          <p className="text-gray-500 text-sm mt-2">Thousands of Kenyans trust Mabidha every day for homes, services, and marketplace products.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-5 border border-gray-100">
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="w-3.5 h-3.5 flex items-center justify-center">
                    <i className="ri-star-fill text-amber-400 text-xs"></i>
                  </span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role} &bull; {t.county}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://readdy.ai/api/search-image?query=Kenya%20landscape%20pattern%20abstract%20aerial%20colorful%20tiles%20urban%20modern%20artistic%20beautiful%20texture&width=1200&height=500&seq=500&orientation=landscape"
              alt=""
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-4">
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-rocket-2-line text-emerald-400 text-sm"></i>
                </span>
                <span className="text-emerald-300 text-xs font-medium">Join 12,000+ Kenyans</span>
              </div>
              <h2 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-3">
                Ready to List Your Property<br />or Business on Mabidha?
              </h2>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                Get verified, reach thousands of potential customers, and grow your business — the safe, trusted way. One subscription gets you everything.
              </p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap cursor-pointer">
                  Start Listing Today
                </button>
                <button className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap cursor-pointer">
                  View Pricing Plans
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-3">
              {[
                { icon: 'ri-home-4-fill', label: 'Property Listing', price: 'KSh 500/mo' },
                { icon: 'ri-store-2-fill', label: 'Shop Listing', price: 'KSh 800/mo' },
                { icon: 'ri-star-fill', label: 'Featured Ad', price: 'KSh 1,200/mo' },
                { icon: 'ri-customer-service-2-fill', label: 'Service Listing', price: 'KSh 400/mo' },
              ].map((plan) => (
                <div key={plan.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 rounded-lg mx-auto mb-2">
                    <i className={`${plan.icon} text-emerald-400 text-base`}></i>
                  </div>
                  <p className="text-white text-xs font-medium">{plan.label}</p>
                  <p className="text-emerald-400 text-xs font-bold mt-0.5">{plan.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* App Download */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-4">Mabidha app coming soon to iOS &amp; Android</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
              <span className="w-5 h-5 flex items-center justify-center">
                <i className="ri-apple-fill text-base"></i>
              </span>
              App Store
            </button>
            <button className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
              <span className="w-5 h-5 flex items-center justify-center">
                <i className="ri-google-play-fill text-base"></i>
              </span>
              Google Play
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
