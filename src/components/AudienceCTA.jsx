const AudienceCTA = () => {
  return (
    <section className="py-24 md:py-32 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6">
            <h2 className="font-headline font-bold text-4xl leading-tight text-on-background">Built for Shopify Merchants.<br />Scalable for Enterprise Brands.</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Whether you're a solo e-commerce founder looking for hands-off content growth or an enterprise marketing team needing deep sentiment analytics, Beacon adapts to your scale.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-surface-container-high rounded-2xl overflow-hidden aspect-video border border-outline-variant/20">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVgu4r2MJPkd5dMtfqGrp0OYOA3-Gh-eciRhegrjhITfAfWt_Yybt5fZcNYQMrV-hxWz7RLwVdNkA1cZUqA9rQ5oxFQu-7SrMokXT8ESkM_Dxrg3BS_UoZ5fL7B4pfCvyog8OL8WgKKfi43dxioZiTB80EFqYV1-6i0BWVvq9uVy6tUXAFXrNzgWoIk3S1HtJ2CLiLJWJkYul3SAfK0eR9Ee75wbIVa7zrSziBqHLRM8ib9pih5MFHGUnoMTfC4s-HAcPDqgWFI74" alt="diverse team of marketing professionals" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-surface-container-high to-surface-container-low p-12 md:p-20 rounded-2xl border border-outline-variant/20 text-center space-y-10 ai-glow">
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-4xl md:text-5xl text-on-background">Ready to dominate AI search?</h2>
            <p className="text-on-surface-variant">Join 500+ brands tracking their visibility in the generative age.</p>
          </div>
          <div className="flex justify-center">
            <button className="px-12 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-extrabold text-lg rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all">
              [ Get Started for Free Today ]
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 text-on-background">
            <span className="material-symbols-outlined text-3xl">shopping_bag</span>
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="material-symbols-outlined text-3xl">verified</span>
            <span className="material-symbols-outlined text-3xl">cloud_sync</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudienceCTA;
