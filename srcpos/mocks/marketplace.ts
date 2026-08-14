export interface Vendor {
  id: string;
  name: string;
  category: string;
  products: number;
  sales: number;
  commission: number;
  status: 'Active' | 'Pending' | 'Suspended';
  initials: string;
  image: string;
  rating: number;
  joined: string;
}

export interface MarketOrder {
  id: string;
  orderNo: string;
  customer: string;
  vendor: string;
  items: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
  date: string;
}

export interface MarketListing {
  id: string;
  name: string;
  vendor: string;
  category: string;
  price: number;
  stock: number;
  status: 'Live' | 'Draft' | 'Flagged';
  image: string;
}

export const marketplaceVendors: Vendor[] = [
  { id: 'v-001', name: 'Akamba Crafts', category: 'Handicrafts', products: 42, sales: 186000, commission: 18600, status: 'Active', initials: 'AC', rating: 4.8, joined: 'Jan 2024', image: 'https://readdy.ai/api/search-image?query=Warm%20African%20handicraft%20market%20stall%20filled%20with%20handwoven%20baskets%20carved%20wooden%20bowls%20and%20colorful%20beaded%20jewelry%20arranged%20neatly%20on%20wooden%20shelves%20with%20soft%20natural%20window%20lighting%20and%20earthy%20terracotta%20tones%20editorial%20product%20photography%20with%20clean%20composition&width=600&height=340&seq=marketplace-shop-akamba&orientation=landscape' },
  { id: 'v-002', name: 'Mzuri Fashion', category: 'Clothing', products: 118, sales: 412000, commission: 41200, status: 'Active', initials: 'MF', rating: 4.6, joined: 'Mar 2024', image: 'https://readdy.ai/api/search-image?query=Vibrant%20modern%20African%20fashion%20boutique%20interior%20with%20colorful%20ankara%20and%20kitenge%20dresses%20hanging%20on%20neat%20clothing%20racks%20bright%20airy%20space%20soft%20daylight%20stylish%20minimal%20decor%20warm%20and%20inviting%20atmosphere%20editorial%20photography&width=600&height=340&seq=marketplace-shop-mzuri&orientation=landscape' },
  { id: 'v-003', name: 'Soko Fresh', category: 'Groceries', products: 76, sales: 268000, commission: 26800, status: 'Active', initials: 'SF', rating: 4.7, joined: 'Feb 2024', image: 'https://readdy.ai/api/search-image?query=Fresh%20produce%20market%20display%20with%20colorful%20ripe%20fruits%20and%20green%20vegetables%20arranged%20in%20rustic%20wooden%20crates%20bright%20natural%20lighting%20clean%20modern%20grocery%20store%20background%20vibrant%20healthy%20colors%20editorial%20food%20photography&width=600&height=340&seq=marketplace-shop-soko&orientation=landscape' },
  { id: 'v-004', name: 'TechHub KE', category: 'Electronics', products: 34, sales: 154000, commission: 15400, status: 'Active', initials: 'TK', rating: 4.5, joined: 'Apr 2024', image: 'https://readdy.ai/api/search-image?query=Modern%20electronics%20retail%20store%20display%20with%20smartphones%20laptops%20and%20audio%20gadgets%20arranged%20on%20clean%20white%20tables%20sleek%20minimal%20interior%20with%20soft%20studio%20lighting%20cool%20neutral%20tones%20professional%20product%20photography&width=600&height=340&seq=marketplace-shop-techhub&orientation=landscape' },
  { id: 'v-005', name: 'Mama Shiko Deli', category: 'Food', products: 22, sales: 92000, commission: 9200, status: 'Pending', initials: 'MD', rating: 4.9, joined: 'Jul 2024', image: 'https://readdy.ai/api/search-image?query=Cozy%20African%20deli%20and%20bakery%20counter%20with%20fresh%20golden%20pastries%20samosas%20and%20coffee%20cups%20on%20warm%20wooden%20display%20soft%20inviting%20lighting%20homely%20atmosphere%20rich%20warm%20tones%20editorial%20food%20photography&width=600&height=340&seq=marketplace-shop-deli&orientation=landscape' },
  { id: 'v-006', name: 'Zawadi Home', category: 'Home Decor', products: 8, sales: 0, commission: 0, status: 'Suspended', initials: 'ZH', rating: 4.4, joined: 'May 2024', image: 'https://readdy.ai/api/search-image?query=Elegant%20modern%20home%20decor%20store%20with%20woven%20wall%20art%20decorative%20cushions%20and%20ceramic%20vases%20on%20warm%20shelves%20soft%20neutral%20color%20palette%20natural%20textures%20bright%20airy%20interior%20editorial%20interior%20photography&width=600&height=340&seq=marketplace-shop-zawadi&orientation=landscape' },
];

export const marketOrders: MarketOrder[] = [
  { id: 'mo-001', orderNo: 'NL-M-1042', customer: 'Grace W.', vendor: 'Mzuri Fashion', items: 2, total: 3200, status: 'Delivered', date: '2026-08-13' },
  { id: 'mo-002', orderNo: 'NL-M-1041', customer: 'Brian K.', vendor: 'TechHub KE', items: 1, total: 18500, status: 'Shipped', date: '2026-08-13' },
  { id: 'mo-003', orderNo: 'NL-M-1040', customer: 'Amina H.', vendor: 'Akamba Crafts', items: 3, total: 4600, status: 'Paid', date: '2026-08-12' },
  { id: 'mo-004', orderNo: 'NL-M-1039', customer: 'Kevin M.', vendor: 'Soko Fresh', items: 6, total: 2100, status: 'Delivered', date: '2026-08-12' },
  { id: 'mo-005', orderNo: 'NL-M-1038', customer: 'Faith C.', vendor: 'Mzuri Fashion', items: 1, total: 1500, status: 'Pending', date: '2026-08-11' },
  { id: 'mo-006', orderNo: 'NL-M-1037', customer: 'Daniel O.', vendor: 'Akamba Crafts', items: 2, total: 3800, status: 'Delivered', date: '2026-08-11' },
];

export const marketListings: MarketListing[] = [
  { id: 'ml-001', name: 'Hand-carved Wooden Bowl', vendor: 'Akamba Crafts', category: 'Handicrafts', price: 1800, stock: 24, status: 'Live', image: 'https://readdy.ai/api/search-image?query=Hand%20carved%20African%20wooden%20bowl%20with%20intricate%20grain%20texture%20on%20a%20clean%20neutral%20beige%20studio%20background%20artisan%20craftsmanship%20soft%20natural%20lighting%20simple%20minimal%20composition%20professional%20product%20photography&width=600&height=600&seq=marketplace-product-bowl&orientation=squarish' },
  { id: 'ml-002', name: 'Ankara Maxi Dress', vendor: 'Mzuri Fashion', category: 'Clothing', price: 3500, stock: 12, status: 'Live', image: 'https://readdy.ai/api/search-image?query=Colorful%20ankara%20maxi%20dress%20with%20bold%20African%20wax%20print%20pattern%20displayed%20on%20a%20simple%20mannequin%20clean%20light%20studio%20background%20vibrant%20red%20and%20orange%20tones%20soft%20shadows%20professional%20fashion%20product%20photography&width=600&height=600&seq=marketplace-product-ankara&orientation=squarish' },
  { id: 'ml-003', name: 'Fresh Avocado (4 pack)', vendor: 'Soko Fresh', category: 'Groceries', price: 450, stock: 60, status: 'Live', image: 'https://readdy.ai/api/search-image?query=Four%20fresh%20ripe%20green%20avocados%20arranged%20neatly%20on%20a%20clean%20neutral%20background%20natural%20organic%20texture%20bright%20soft%20lighting%20simple%20minimal%20composition%20professional%20food%20product%20photography&width=600&height=600&seq=marketplace-product-avocado&orientation=squarish' },
  { id: 'ml-004', name: 'Wireless Earbuds', vendor: 'TechHub KE', category: 'Electronics', price: 2500, stock: 9, status: 'Live', image: 'https://readdy.ai/api/search-image?query=White%20wireless%20earbuds%20with%20compact%20charging%20case%20on%20a%20clean%20light%20gray%20background%20minimalist%20modern%20design%20soft%20studio%20lighting%20sleek%20product%20photography%20with%20subtle%20shadows&width=600&height=600&seq=marketplace-product-earbuds&orientation=squarish' },
  { id: 'ml-005', name: 'Maasai Beaded Necklace', vendor: 'Akamba Crafts', category: 'Handicrafts', price: 1200, stock: 3, status: 'Flagged', image: 'https://readdy.ai/api/search-image?query=Colorful%20Maasai%20beaded%20necklace%20with%20intricate%20multicolored%20beadwork%20laid%20flat%20on%20a%20clean%20neutral%20background%20rich%20red%20blue%20and%20green%20tones%20detailed%20craftsmanship%20soft%20lighting%20professional%20product%20photography&width=600&height=600&seq=marketplace-product-necklace&orientation=squarish' },
  { id: 'ml-006', name: 'Handmade Leather Sandals', vendor: 'Mzuri Fashion', category: 'Clothing', price: 2800, stock: 0, status: 'Draft', image: 'https://readdy.ai/api/search-image?query=Handmade%20brown%20leather%20sandals%20with%20woven%20straps%20on%20a%20clean%20neutral%20background%20artisan%20craftsmanship%20natural%20leather%20texture%20warm%20soft%20lighting%20simple%20minimal%20composition%20professional%20product%20photography&width=600&height=600&seq=marketplace-product-sandals&orientation=squarish' },
];

export const marketCategories = [
  'All',
  'Handicrafts',
  'Clothing',
  'Groceries',
  'Electronics',
  'Food',
  'Home Decor',
];