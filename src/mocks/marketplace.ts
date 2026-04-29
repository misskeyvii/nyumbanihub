export interface Product {
  id: string;
  name: string;
  shopName: string;
  shopLocation: string;
  county: string;
  price: string;
  originalPrice?: string;
  image: string;
  category: string;
  verifiedShop: boolean;
  inStock: boolean;
  description: string;
  rating: number;
  reviews: number;
  shopPhone: string;
}

export const marketplaceProducts: Product[] = [
  {
    id: 'p1',
    name: 'Samsung 55" 4K Smart TV',
    shopName: 'TechMart Nairobi',
    shopLocation: 'Luthuli Avenue, Nairobi CBD',
    county: 'Nairobi',
    price: 'KSh 58,999',
    originalPrice: 'KSh 72,000',
    image: 'https://readdy.ai/api/search-image?query=Samsung%2055%20inch%204K%20smart%20TV%20modern%20living%20room%20display%20clean%20white%20background%20electronics%20retail&width=400&height=400&seq=200&orientation=squarish',
    category: 'Electronics',
    verifiedShop: true,
    inStock: true,
    description: 'Samsung Crystal 4K UHD TV with built-in smart features, HDR10+ support, and AirSlim design.',
    rating: 4.7,
    reviews: 38,
    shopPhone: '+254700111222'
  },
  {
    id: 'p2',
    name: 'Traditional Maasai Beaded Necklace',
    shopName: 'Maasai Crafts Kenya',
    shopLocation: 'Maasai Market, Westlands',
    county: 'Nairobi',
    price: 'KSh 1,200',
    image: 'https://readdy.ai/api/search-image?query=Maasai%20beaded%20necklace%20Kenya%20traditional%20colorful%20handmade%20craft%20jewelry%20white%20background%20cultural%20African&width=400&height=400&seq=201&orientation=squarish',
    category: 'Fashion & Crafts',
    verifiedShop: true,
    inStock: true,
    description: 'Authentic hand-beaded Maasai necklace made by certified artisans. Fair trade and ethically sourced.',
    rating: 4.9,
    reviews: 124,
    shopPhone: '+254700222333'
  },
  {
    id: 'p3',
    name: 'Fresh Avocados - 1 Dozen',
    shopName: 'Mama Mboga Fresh Produce',
    shopLocation: 'Kangemi Market, Nairobi',
    county: 'Nairobi',
    price: 'KSh 300',
    image: 'https://readdy.ai/api/search-image?query=fresh%20green%20avocados%20Kenya%20farm%20organic%20dozen%20white%20background%20fruit%20basket%20market&width=400&height=400&seq=202&orientation=squarish',
    category: 'Fresh Produce',
    verifiedShop: true,
    inStock: true,
    description: 'Farm-fresh Hass avocados sourced directly from Muranga farmers. Creamy and ripe. Order by 6PM for next-day delivery.',
    rating: 4.8,
    reviews: 211,
    shopPhone: '+254700333444'
  },
  {
    id: 'p4',
    name: 'HP Laptop 15" i5 12th Gen',
    shopName: 'ComputerCity Kenya',
    shopLocation: 'University Way, Nairobi',
    county: 'Nairobi',
    price: 'KSh 72,000',
    originalPrice: 'KSh 85,000',
    image: 'https://readdy.ai/api/search-image?query=HP%20laptop%2015%20inch%20modern%20silver%20open%20lid%20white%20background%20tech%20computer%20electronics%20clean&width=400&height=400&seq=203&orientation=squarish',
    category: 'Electronics',
    verifiedShop: true,
    inStock: true,
    description: 'HP 15s Intel Core i5 12th Gen, 8GB RAM, 512GB SSD. Windows 11 pre-installed. Genuine warranty included.',
    rating: 4.6,
    reviews: 45,
    shopPhone: '+254700444555'
  },
  {
    id: 'p5',
    name: 'Kikoy Beach Towel Set',
    shopName: 'Coast Artisans Mombasa',
    shopLocation: 'Old Town, Mombasa',
    county: 'Mombasa',
    price: 'KSh 850',
    image: 'https://readdy.ai/api/search-image?query=Kikoy%20colorful%20beach%20towel%20Kenya%20coast%20traditional%20fabric%20Mombasa%20handwoven%20bright%20colors%20white%20background&width=400&height=400&seq=204&orientation=squarish',
    category: 'Fashion & Crafts',
    verifiedShop: true,
    inStock: true,
    description: 'Premium hand-woven Kikoy towel set. 100% cotton, quick-dry, lightweight. Available in multiple colors. Great for beach and travel.',
    rating: 4.8,
    reviews: 89,
    shopPhone: '+254700555666'
  },
  {
    id: 'p6',
    name: 'Kenya AA Premium Coffee - 500g',
    shopName: 'Highlands Coffee Roasters',
    shopLocation: 'Karen Crossroads, Nairobi',
    county: 'Nairobi',
    price: 'KSh 950',
    image: 'https://readdy.ai/api/search-image?query=Kenya%20AA%20premium%20coffee%20beans%20bag%20500g%20artisan%20roasted%20white%20background%20cafe%20product%20clean%20packaging&width=400&height=400&seq=205&orientation=squarish',
    category: 'Food & Drinks',
    verifiedShop: true,
    inStock: true,
    description: 'Single-origin Kenya AA coffee, medium-dark roast. Notes of blackcurrant, citrus, and full body. Freshly roasted weekly.',
    rating: 4.9,
    reviews: 178,
    shopPhone: '+254700666777'
  },
  {
    id: 'p7',
    name: 'Sofa Set - 7-Seater Modern',
    shopName: 'Furniture Palace Nairobi',
    shopLocation: 'Mombasa Road, Industrial Area',
    county: 'Nairobi',
    price: 'KSh 48,500',
    originalPrice: 'KSh 65,000',
    image: 'https://readdy.ai/api/search-image?query=modern%207%20seater%20sofa%20set%20Kenya%20furniture%20showroom%20gray%20fabric%20contemporary%20clean%20white%20background%20living%20room&width=400&height=400&seq=206&orientation=squarish',
    category: 'Furniture',
    verifiedShop: true,
    inStock: false,
    description: 'Premium 7-seater fabric sofa set. L-shaped, high-density foam cushions, kiondo throw pillows included. 1-year frame warranty.',
    rating: 4.5,
    reviews: 32,
    shopPhone: '+254700777888'
  },
  {
    id: 'p8',
    name: 'Organic Honey - 1kg Raw',
    shopName: 'Meru Highlands Honey Farm',
    shopLocation: 'Meru Town, Meru County',
    county: 'Meru',
    price: 'KSh 700',
    image: 'https://readdy.ai/api/search-image?query=organic%20raw%20honey%20jar%20Kenya%20Meru%20highlands%20golden%20amber%20natural%20beekeeping%20white%20background%20product&width=400&height=400&seq=207&orientation=squarish',
    category: 'Food & Drinks',
    verifiedShop: true,
    inStock: true,
    description: 'Pure raw honey from Mt. Kenya highland beehives. No additives, unprocessed, naturally sweet. Direct from certified beekeeper.',
    rating: 5.0,
    reviews: 256,
    shopPhone: '+254700888999'
  }
];
