const Advantage = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 text-center mb-20">
        <h2 className="font-headline font-bold text-4xl md:text-5xl tracking-tight text-on-background mb-6">
          The Beacon Advantage
        </h2>
        <p className="text-primary font-label uppercase tracking-widest text-sm">See the Data. Fix the Gap. Automate the Growth.</p>
      </div>
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 ai-glow">
          <div className="mb-8 text-primary">
            <span className="material-symbols-outlined text-4xl">monitoring</span>
          </div>
          <h3 className="font-headline font-bold text-xl mb-6 text-on-background leading-tight">1. Enterprise-Grade AI Visibility Tracking</h3>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              Comprehensive Monitoring
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              Competitor Benchmarking
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              Actionable Insights
            </li>
          </ul>
        </div>
        {/* Card 2 */}
        <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 ai-glow">
          <div className="mb-8 text-primary">
            <span className="material-symbols-outlined text-4xl">auto_awesome</span>
          </div>
          <h3 className="font-headline font-bold text-xl mb-6 text-on-background leading-tight">2. Set-and-Forget Content Automation</h3>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              Context-Aware Generation
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              Fully Automated Publishing
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              Multi-Language Scale
            </li>
          </ul>
        </div>
        {/* Card 3 */}
        <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 ai-glow">
          <div className="mb-8 text-primary">
            <span className="material-symbols-outlined text-4xl">speed</span>
          </div>
          <h3 className="font-headline font-bold text-xl mb-6 text-on-background leading-tight">3. Technical GEO Readiness</h3>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              One-Click llms.txt Deployment
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              Automated Schema/JSON-LD
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              GEO Readiness Audits
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Advantage;
