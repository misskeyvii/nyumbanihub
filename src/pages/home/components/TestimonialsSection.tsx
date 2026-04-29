import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('id, name, account_type, subcategory, message, avatar_url')
        .order('created_at', { ascending: false })
        .limit(12);
      setTestimonials(data || []);
    };
    fetch();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-14 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-3">
            Real Providers, Real Words
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What Our Providers Say</h2>
          <p className="text-gray-500 text-sm mt-2">Testimonials from verified service and entertainment providers on Nyumbani Hub.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-3">
              <i className="ri-double-quotes-l text-emerald-400 text-2xl"></i>
              <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.message}"</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-700 font-bold text-sm">{t.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{t.subcategory || t.account_type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
