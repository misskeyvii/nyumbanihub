import { useState } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceProducts } from '../../../mocks/marketplace';
import ProductCard from '../../../components/base/ProductCard';

const productCategories = ['All', 'Electronics', 'Fashion & Crafts', 'Fresh Produce', 'Food & Drinks', 'Furniture'];

export default function MarketplaceSection() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? marketplaceProducts
    : marketplaceProducts.filter((p) => p.category === activeCategory);

  return (
    <section className="py-14 px-4 md:px-6 bg-gray-50" id="marketplace">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold py-0.5 px-2 rounded-full whitespace-nowrap">
                <span className="w-3 h-3 flex items-center justify-center"><i className="ri-store-2-fill text-xs"></i></span>
                Verified Shops Only
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Marketplace</h2>
            <p className="text-gray-500 text-sm mt-1">All products from verified, traceable physical shops in Kenya.</p>
          </div>
          <Link
            to="/marketplace"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
          >
            Browse All Products
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line text-sm"></i>
            </span>
          </Link>
        </div>

        {/* Trust Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 border border-amber-100 rounded-2xl p-4 mb-6 flex flex-wrap gap-4">
          {[
            { icon: 'ri-map-pin-2-fill', color: 'text-emerald-600', text: 'Every shop has a real, verifiable physical address' },
            { icon: 'ri-shield-check-fill', color: 'text-emerald-600', text: 'No anonymous sellers — all businesses are registered' },
            { icon: 'ri-walk-line', color: 'text-amber-600', text: 'You can visit the shop in person to inspect goods' },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-2 flex-1 min-w-[180px]">
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className={`${item.icon} text-sm ${item.color}`}></i>
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-white rounded-2xl border border-amber-100 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-full mx-auto mb-3">
            <i className="ri-store-2-line text-amber-600 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Are You a Shop Owner?</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            List your products on Mabidha and reach thousands of verified customers. Your shop will be physically inspected before approval.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Link
              to="/post-listing"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              List Your Shop
            </Link>
            <Link
              to="/how-it-works"
              className="bg-white border border-gray-200 hover:border-emerald-300 text-gray-700 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
