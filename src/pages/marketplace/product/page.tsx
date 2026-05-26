import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import MobileBottomNav from '../../../components/feature/MobileBottomNav';
import Footer from '../../../components/feature/Footer';
import { marketplaceProducts } from '../../../mocks/marketplace';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'location'>('description');

  const product = marketplaceProducts.find((p) => p.id === id);
  const related = marketplaceProducts.filter((p) => p.id !== id && p.category === product?.category).slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
          <i className="ri-shopping-bag-line text-gray-300 text-3xl"></i>
        </div>
        <p className="text-gray-500 mb-4">Product not found.</p>
        <Link to="/marketplace" className="text-emerald-600 font-semibold text-sm hover:underline">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const mapQuery = encodeURIComponent(`${product.shopLocation}, ${product.county}, Kenya`);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const whatsappNumber = product.shopPhone.replace(/\D/g, '').replace(/^0/, '254');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! I saw your product "${product.name}" on Nyumbani Hub and I'm interested.`)}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-[180px]">{product.name}</span>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-700 mb-6 cursor-pointer transition-colors"
          >
            <span className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full">
              <i className="ri-arrow-left-line text-xs"></i>
            </span>
            Back
          </button>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Left — Product Image */}
            <div className="relative">
              <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-white border border-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                    <span className="bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-full">Out of Stock</span>
                  </div>
                )}
              </div>
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.verifiedShop && (
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold py-1 px-2.5 rounded-full shadow-sm whitespace-nowrap">
                    <span className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-store-2-fill text-xs"></i></span>
                    Verified Shop
                  </span>
                )}
                {product.originalPrice && (
                  <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-xs font-bold py-1 px-2.5 rounded-full shadow-sm whitespace-nowrap">
                    SALE
                  </span>
                )}
              </div>
            </div>

            {/* Right — Product Info */}
            <div className="flex flex-col">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">{product.category}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="w-4 h-4 flex items-center justify-center">
                      <i className={`ri-star-${star <= Math.round(product.rating) ? 'fill' : 'line'} text-amber-400 text-sm`}></i>
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-emerald-700">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">{product.originalPrice}</span>
                )}
              </div>

              {/* Shop Info */}
              <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-lg">
                    <i className="ri-store-2-fill text-amber-600 text-base"></i>
                  </span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{product.shopName}</p>
                    <p className="text-xs text-amber-600 font-medium">Verified Physical Shop</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    <i className="ri-map-pin-2-fill text-emerald-500"></i>
                  </span>
                  <span>{product.shopLocation}, {product.county}</span>
                </div>
              </div>

              {/* Quantity + Actions */}
              {product.inStock && (
                <div className="mt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-600 font-medium">Qty:</span>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-gray-600"
                      >
                        <i className="ri-subtract-line text-sm"></i>
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-gray-800">{qty}</span>
                      <button
                        onClick={() => setQty((q) => q + 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-gray-600"
                      >
                        <i className="ri-add-line text-sm"></i>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span className="w-4 h-4 flex items-center justify-center"><i className="ri-whatsapp-line text-base"></i></span>
                      Order on WhatsApp
                    </a>
                    <a
                      href={`tel:${product.shopPhone}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-400 text-gray-700 font-semibold text-sm py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span className="w-4 h-4 flex items-center justify-center"><i className="ri-phone-line text-base"></i></span>
                      Call Shop
                    </a>
                  </div>
                </div>
              )}

              {!product.inStock && (
                <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-gray-500 text-sm font-medium">This item is currently out of stock.</p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-emerald-600 font-semibold text-sm hover:underline cursor-pointer"
                  >
                    <span className="w-4 h-4 flex items-center justify-center"><i className="ri-whatsapp-line"></i></span>
                    Notify me when available
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tabs — Description & Store Location */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-10">
            <div className="flex border-b border-gray-100">
              {(['description', 'location'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors cursor-pointer capitalize ${
                    activeTab === tab
                      ? 'text-emerald-700 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className={`${tab === 'description' ? 'ri-file-text-line' : 'ri-map-pin-2-line'} text-sm`}></i>
                  </span>
                  {tab === 'description' ? 'Product Description' : 'Store Location'}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="p-6 md:p-8">
                <h2 className="font-bold text-gray-900 text-lg mb-3">About This Product</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { icon: 'ri-shield-check-line', label: 'Verified Seller', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { icon: 'ri-map-pin-line', label: 'Physical Shop', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { icon: 'ri-walk-line', label: 'Visit In Person', color: 'text-rose-500', bg: 'bg-rose-50' },
                  ].map((f) => (
                    <div key={f.label} className={`flex items-center gap-3 ${f.bg} rounded-xl p-3`}>
                      <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">
                        <i className={`${f.icon} ${f.color} text-base`}></i>
                      </span>
                      <span className="text-xs font-semibold text-gray-700">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{product.shopName}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-map-pin-2-fill text-emerald-600 text-sm"></i>
                      </span>
                      <span className="text-sm text-gray-600">{product.shopLocation}, {product.county}, Kenya</span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span className="w-4 h-4 flex items-center justify-center"><i className="ri-navigation-line text-sm"></i></span>
                    Get Directions
                  </a>
                </div>

                {/* Google Maps Embed */}
                <div className="w-full h-72 md:h-96 rounded-xl overflow-hidden border border-gray-100">
                  <iframe
                    title={`${product.shopName} location`}
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                {/* Shop Contact Details */}
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${product.shopPhone}`}
                    className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    <span className="w-9 h-9 flex items-center justify-center bg-emerald-100 rounded-lg flex-shrink-0">
                      <i className="ri-phone-fill text-emerald-600 text-base"></i>
                    </span>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Phone</p>
                      <p className="text-sm font-bold text-gray-800">{product.shopPhone}</p>
                    </div>
                  </a>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    <span className="w-9 h-9 flex items-center justify-center bg-green-100 rounded-lg flex-shrink-0">
                      <i className="ri-whatsapp-fill text-green-600 text-base"></i>
                    </span>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">WhatsApp</p>
                      <p className="text-sm font-bold text-gray-800">Chat with Shop</p>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 text-xl">More from {product.category}</h2>
                <Link to="/marketplace" className="text-sm text-emerald-600 font-semibold hover:underline whitespace-nowrap">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to={`/marketplace/product/${p.id}`}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  >
                    <div className="w-full h-36 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 text-xs leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">{p.name}</p>
                      <p className="text-emerald-700 font-bold text-sm mt-1">{p.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
