const Hero = () => {
  return (
    <section className="relative min-h-[921px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-tertiary/10 rounded-full blur-[150px]"></div>
      </div>
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/15 text-primary text-[10px] font-label uppercase tracking-[0.2em]">
          Now in Private Beta for Enterprise
        </div>
        <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-on-background leading-[1.05]">
          Own Your Brand's <br />Conversation in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Age of AI</span>
        </h1>
        <p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl font-light leading-relaxed">
          Beacon is the first all-in-one platform that combines enterprise-grade AI visibility tracking with fully automated, context-aware content generation.
        </p>
        <div className="pt-4 space-y-4">
          <p className="text-sm font-label text-outline uppercase tracking-widest">Stop guessing what ChatGPT thinks of your brand. Start shaping it.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-lg hover:scale-105 transition-all">
              Start Your Free Trial
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-surface-container-highest text-primary border border-primary/20 font-bold rounded-xl hover:bg-surface-bright transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </div>
      {/* Visual Anchor */}
      <div className="mt-20 w-full max-w-6xl mx-auto glass-panel rounded-t-2xl border-x border-t border-outline-variant/15 ai-glow aspect-video flex items-center justify-center p-4">
        <div className="w-full h-full bg-surface-container-lowest rounded-xl overflow-hidden relative group">
          <img className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3s]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBLmFGri_B2qkiutL6Y_49pPHrHS_oDWWqx98dtCtuy9mm4BuGs1qDBhfiNuM_gUCLxHQi0e__-S2Ja61N45s3Anj_fi58QNBJOk2zWTlBciCaOK5ouTTpn_Igv2FIyYkqAX-7um1Y80MpeEI4qGtQ5IWjPQP-Ax8aZoX9uxvR6jTgxFaxVebAKfRZ7AKZ4fiplNe_xgqdw6hlAsZ5F0PZydK2fyD80LS1EQ0NDPh8WKPU1dpa4Jk1RSLlPIEghyVCv023gdiYbe4" alt="futuristic dark mode software dashboard" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
