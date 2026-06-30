import { writeFileSync } from 'node:fs';

const BASE_URL = 'https://nyumbanilink.com';
const today = new Date().toISOString().slice(0, 10);

const counties = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru',
  'Tharaka Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni',
  'Nyandarua', 'Nyeri', 'Kirinyaga', 'Muranga', 'Kiambu',
  'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu',
  'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',
  'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga',
  'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori',
  'Kisii', 'Nyamira', 'Nairobi',
];

const services = [
  'mama-fua',
  'movers',
  'caretaker',
  'plumbing',
  'electrician',
  'security',
  'landscaping',
  'painting',
  'gas-delivery',
  'water-dispenser',
];

const staticRoutes = [
  ['/', 'daily', '1.0'],
  ['/explore', 'daily', '0.95'],
  ['/categories', 'weekly', '0.85'],
  ['/explore?category=homes', 'daily', '0.9'],
  ['/explore?category=apartments', 'daily', '0.9'],
  ['/explore?category=airbnb', 'daily', '0.88'],
  ['/explore?category=hotels', 'daily', '0.85'],
  ['/explore?category=shops', 'daily', '0.85'],
  ['/marketplace', 'daily', '0.85'],
  ['/services', 'daily', '0.85'],
  ['/entertainment', 'daily', '0.8'],
  ['/how-it-works', 'monthly', '0.7'],
  ['/contact', 'monthly', '0.6'],
  ['/anti-scam', 'yearly', '0.5'],
  ['/privacy', 'yearly', '0.3'],
  ['/terms', 'yearly', '0.3'],
];

const slugify = (value) =>
  value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urls = [
  ...staticRoutes.map(([path, changefreq, priority]) => ({ path, changefreq, priority })),
  ...counties.map((county) => ({
    path: `/house-hunting/${slugify(county)}`,
    changefreq: 'daily',
    priority: county === 'Kisumu' || county === 'Nairobi' ? '0.94' : '0.86',
  })),
  ...services.flatMap((service) => [
    { path: `/services/${service}`, changefreq: 'weekly', priority: '0.78' },
    ...counties.map((county) => ({
      path: `/services/${service}/${slugify(county)}`,
      changefreq: 'weekly',
      priority: county === 'Kisumu' || county === 'Nairobi' ? '0.82' : '0.72',
    })),
  ]),
];

const body = urls.map(({ path, changefreq, priority }) => `  <url>
    <loc>${escapeXml(`${BASE_URL}${path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync('public/sitemap.xml', xml);
