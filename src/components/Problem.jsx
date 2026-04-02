const Problem = () => {
  return (
    <section className="py-24 md:py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="font-headline font-bold text-4xl md:text-5xl tracking-tight text-on-background">
            You're Flying Blind <br />in AI Search
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Until now, optimizing for AI engines like ChatGPT, Gemini, and Perplexity required patching together multiple disjointed tools.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="mt-1 p-2 bg-surface-container-high rounded-lg text-error">
                <span className="material-symbols-outlined">visibility_off</span>
              </div>
              <div>
                <h4 className="font-bold text-on-background mb-1">Analytics platforms</h4>
                <p className="text-on-surface-variant text-sm">Tell you what AI is saying, but offer no native way to act on it.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1 p-2 bg-surface-container-high rounded-lg text-error">
                <span className="material-symbols-outlined">edit_document</span>
              </div>
              <div>
                <h4 className="font-bold text-on-background mb-1">Content generators</h4>
                <p className="text-on-surface-variant text-sm">Write generic blogs without knowing your actual AI visibility gaps.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1 p-2 bg-surface-container-high rounded-lg text-error">
                <span className="material-symbols-outlined">code_off</span>
              </div>
              <div>
                <h4 className="font-bold text-on-background mb-1">Technical SEO apps</h4>
                <p className="text-on-surface-variant text-sm">Complicated to install and only focus on the code.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-surface-container-highest to-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-outline-variant/20 rounded-full"></div>
                <div className="h-4 w-1/2 bg-outline-variant/20 rounded-full"></div>
                <div className="h-4 w-2/3 bg-outline-variant/20 rounded-full"></div>
              </div>
              <div className="relative py-12 flex justify-center">
                <span className="material-symbols-outlined text-8xl text-outline-variant/30 animate-pulse">query_stats</span>
              </div>
              <div className="flex justify-end">
                <div className="px-4 py-2 bg-error/10 border border-error/20 text-error rounded-lg text-xs font-label">BLIND SPOT DETECTED</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
