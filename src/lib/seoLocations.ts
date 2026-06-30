export const kenyaCounties = [
  'Mombasa',
  'Kwale',
  'Kilifi',
  'Tana River',
  'Lamu',
  'Taita Taveta',
  'Garissa',
  'Wajir',
  'Mandera',
  'Marsabit',
  'Isiolo',
  'Meru',
  'Tharaka Nithi',
  'Embu',
  'Kitui',
  'Machakos',
  'Makueni',
  'Nyandarua',
  'Nyeri',
  'Kirinyaga',
  'Muranga',
  'Kiambu',
  'Turkana',
  'West Pokot',
  'Samburu',
  'Trans Nzoia',
  'Uasin Gishu',
  'Elgeyo Marakwet',
  'Nandi',
  'Baringo',
  'Laikipia',
  'Nakuru',
  'Narok',
  'Kajiado',
  'Kericho',
  'Bomet',
  'Kakamega',
  'Vihiga',
  'Bungoma',
  'Busia',
  'Siaya',
  'Kisumu',
  'Homa Bay',
  'Migori',
  'Kisii',
  'Nyamira',
  'Nairobi',
];

export const serviceSeoTypes = [
  { slug: 'mama-fua', label: 'Mama Fua', dbValue: 'Mama Fua' },
  { slug: 'movers', label: 'Movers', dbValue: 'Movers' },
  { slug: 'caretaker', label: 'Caretakers', dbValue: 'Caretakers' },
  { slug: 'plumbing', label: 'Plumbing', dbValue: 'Plumbing' },
  { slug: 'electrician', label: 'Electricians', dbValue: 'Electricians' },
  { slug: 'security', label: 'Security', dbValue: 'Security' },
  { slug: 'landscaping', label: 'Landscaping', dbValue: 'Landscaping' },
  { slug: 'painting', label: 'Painting', dbValue: 'Painting' },
  { slug: 'gas-delivery', label: 'Gas Delivery', dbValue: 'Gas Delivery' },
  { slug: 'water-dispenser', label: 'Dispenser Water', dbValue: 'Dispenser Water' },
];

export function slugifyLocation(value: string): string {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function countyFromSlug(slug?: string): string | null {
  if (!slug) return null;
  return kenyaCounties.find((county) => slugifyLocation(county) === slug.toLowerCase()) ?? null;
}
