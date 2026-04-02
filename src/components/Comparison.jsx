const Comparison = () => {
  return (
    <section className="py-24 md:py-32 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline font-bold text-4xl tracking-tight text-on-background">
            Why Pay for Three Tools When You Can Use One?
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="py-6 px-4 font-label uppercase tracking-widest text-outline text-xs">Feature Capability</th>
                <th className="py-6 px-4 font-bold text-primary text-center">Beacon</th>
                <th className="py-6 px-4 text-on-surface-variant/50 text-center text-sm">Analytics Trackers</th>
                <th className="py-6 px-4 text-on-surface-variant/50 text-center text-sm">Content Generators</th>
                <th className="py-6 px-4 text-on-surface-variant/50 text-center text-sm">Tech SEO Apps</th>
              </tr>
            </thead>
            <tbody className="text-on-background">
              <tr className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                <td className="py-6 px-4">AI Sentiment & Visibility Tracking</td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-primary">check_circle</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant">check_circle</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant/20">cancel</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant/20">cancel</span></td>
              </tr>
              <tr className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                <td className="py-6 px-4">Automated Content Engine</td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-primary">check_circle</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant/20">cancel</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant">check_circle</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant/20">cancel</span></td>
              </tr>
              <tr className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                <td className="py-6 px-4">GEO Optimization (llms.txt)</td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-primary">check_circle</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant/20">cancel</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant/20">cancel</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant">check_circle</span></td>
              </tr>
              <tr className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                <td className="py-6 px-4">Native Shopify Integration</td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-primary">check_circle</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant/20">cancel</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant">check_circle</span></td>
                <td className="py-6 px-4 text-center"><span className="material-symbols-outlined text-outline-variant">check_circle</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
