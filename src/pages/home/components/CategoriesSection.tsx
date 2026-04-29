import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../../mocks/categories';
import { supabase } from '../../../lib/supabase';

export default function CategoriesSection() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const typeMap: Record<string, string[]> = {
      homes: ['home'],
      apartments: ['apartment'],
      airbnb: ['airbnb'],
      hotels: ['hotel'],
      shops: ['shop'],
      services: ['service'],
      marketplace: ['marketplace'],
    };

    supabase.from('listings').select('listing_type').eq('status', 'live')
      .then(({ data }) => {
        if (!data) return;
        const result: Record<string, number> = {};
        for (const [catId, types] of Object.entries(typeMap)) {
          result[catId] = data.filter(l => types.includes(l.listing_type)).length;
        }
        setCounts(result);
      });
  }, []);

  return (
    <section className="py-14 px-4 md:px-6 bg-gray-50" id="categories">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-3">
            Browse by Category
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What Are You Looking For?</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            From homes to handcrafted products — every listing on Nyumbani Hub is verified and trusted.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              to={`/explore?category=${cat.id}`}
              key={cat.id}
              className="group bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="relative overflow-hidden rounded-xl w-full h-24 mb-3">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full mb-2 ${cat.color}`}>
                <i className={`${cat.icon} text-base`}></i>
              </div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{cat.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">{cat.description}</p>
              <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {(counts[cat.id] ?? 0).toLocaleString()} listings
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Quick Search:</span>
          {['Bedsitter', '1 Bedroom', '2 Bedroom', 'Penthouse', 'Studio', 'Beach Villa', 'Cleaner', 'Mover', 'Caretaker'].map((tag) => (
            <button key={tag} className="text-xs bg-white border border-gray-200 hover:border-emerald-400 hover:text-emerald-600 text-gray-500 px-3 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
