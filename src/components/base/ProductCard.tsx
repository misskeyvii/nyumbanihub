import { Link } from 'react-router-dom';
import type { Product } from '../../mocks/marketplace';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/marketplace/product/${product.id}`} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer group block">
      <div className="relative overflow-hidden w-full h-40 sm:h-44">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          {product.verifiedShop && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-semibold py-0.5 px-1.5 rounded-full whitespace-nowrap">
              <span className="w-3 h-3 flex items-center justify-center">
                <i className="ri-store-2-fill text-[10px]"></i>
              </span>
              Verified Shop
            </span>
          )}
        </div>
        {product.originalPrice && (
          <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold py-0.5 px-1.5 rounded-full">
            SALE
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {product.name}
        </p>
        <div className="flex items-center gap-1 mt-1 text-gray-500">
          <span className="w-3.5 h-3.5 flex items-center justify-center">
            <i className="ri-store-line text-xs text-amber-600"></i>
          </span>
          <span className="text-xs font-medium text-amber-700 truncate">{product.shopName}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5 text-gray-400">
          <span className="w-3.5 h-3.5 flex items-center justify-center">
            <i className="ri-map-pin-line text-xs"></i>
          </span>
          <span className="text-xs truncate">{product.shopLocation}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-emerald-700 font-bold text-sm">{product.price}</span>
            {product.originalPrice && (
              <span className="text-gray-400 text-xs line-through ml-1">{product.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-star-fill text-amber-400 text-xs"></i>
            </span>
            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
