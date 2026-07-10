const partners = [
  {
    name: 'Tribe Dala',
    logo: 'https://i.postimg.cc/RhZznnS1/tribe-dala-loogo.png',
    url: 'https://www.tribedala.com',
  },
];

export default function PartnersSection() {
  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">In Partnership With</p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {partners.map(p => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              title={p.name}
              className="opacity-70 hover:opacity-100 transition-opacity duration-200"
            >
              <img src={p.logo} alt={p.name} className="h-14 w-auto object-contain" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
