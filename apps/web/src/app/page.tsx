import Image from "next/image";
import Link from "next/link";

/* ─── icon helpers (using Material Symbols via className) ─── */
function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}

function CheckCircle({ filled = true }: { filled?: boolean }) {
  return filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="11" stroke="#7b8aef" strokeWidth="2" />
      <path d="M8 12l2.5 2.5L16 9.5" stroke="#7b8aef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-30">
      <circle cx="12" cy="12" r="11" stroke="#666" strokeWidth="2" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BlueBullet() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
      <circle cx="10" cy="10" r="9" stroke="#7b8aef" strokeWidth="1.5" />
      <path d="M6 10l2.5 2.5L14 7.5" stroke="#7b8aef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="landing-page">
      {/* ─── NAVBAR ─── */}
      <nav className="landing-nav" id="main-nav">
        <Link href="/" className="landing-logo">Beacon</Link>
        <div className="landing-nav-actions">
          <Link href="/login" className="landing-nav-link">LOGIN</Link>
          <Link href="/login" className="landing-btn-signup" id="nav-signup">Sign Up</Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="landing-hero" id="hero">
        <div className="landing-badge">NOW IN PRIVATE BETA FOR ENTERPRISE</div>
        <h1 className="landing-hero-title">
          Own Your Brand&apos;s<br />Conversation in the{" "}
          <span className="landing-gradient-text">Age of AI</span>
        </h1>
        <p className="landing-hero-subtitle">
          Beacon is the first all-in-one platform that combines enterprise-grade AI
          visibility tracking with fully automated, context-aware content generation.
        </p>
        <p className="landing-hero-tagline">
          STOP GUESSING WHAT CHATGPT THINKS OF YOUR BRAND. START SHAPING IT.
        </p>
        <div className="landing-hero-ctas">
          <Link href="/login" className="landing-btn-primary" id="hero-cta-trial">
            Start Your Free Trial
          </Link>
          <Link href="/login" className="landing-btn-secondary" id="hero-cta-demo">
            Book a Demo
          </Link>
        </div>
      </section>

      {/* ─── DASHBOARD MOCKUP ─── */}
      <section className="landing-mockup-section" id="product-visual">
        <div className="landing-mockup-frame">
          <Image
            src="/dashboard-mockup.png"
            alt="Beacon AI analytics dashboard"
            width={960}
            height={540}
            className="landing-mockup-img"
            priority
          />
        </div>
      </section>

      {/* ─── PROBLEM STATEMENT ─── */}
      <section className="landing-problem" id="problem">
        <h2 className="landing-section-title-left">
          You&apos;re Flying Blind<br />in AI Search
        </h2>
        <p className="landing-problem-desc">
          Until now, optimizing for AI engines like ChatGPT, Gemini, and Perplexity
          required patching together multiple disjointed tools.
        </p>
        <div className="landing-pain-cards">
          <div className="landing-pain-card">
            <div className="landing-pain-icon landing-pain-icon-red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2.5 2.5l19 19M9.88 4.07A9.96 9.96 0 0112 4c5.52 0 10 4 10 8 0 1.18-.36 2.3-.98 3.3M6.53 6.8C4.32 8.37 3 10.6 3 12c0 4 4.48 8 10 8 1.77 0 3.44-.4 4.95-1.12" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div>
              <h3 className="landing-pain-title">Analytics platforms</h3>
              <p className="landing-pain-text">Tell you what AI is saying, but offer no native way to act on it.</p>
            </div>
          </div>
          <div className="landing-pain-card">
            <div className="landing-pain-icon landing-pain-icon-red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M9 15h6" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div>
              <h3 className="landing-pain-title">Content generators</h3>
              <p className="landing-pain-text">Write generic blogs without knowing your actual AI visibility gaps.</p>
            </div>
          </div>
          <div className="landing-pain-card">
            <div className="landing-pain-icon landing-pain-icon-red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 22v-7" stroke="#ef4444" strokeWidth="1.8"/></svg>
            </div>
            <div>
              <h3 className="landing-pain-title">Technical SEO apps</h3>
              <p className="landing-pain-text">Complicated to install and only focus on the code.</p>
            </div>
          </div>
        </div>

        {/* Decorative blind-spot widget */}
        <div className="landing-blindspot-widget">
          <div className="landing-blindspot-card">
            <div className="landing-blindspot-skeleton" />
            <div className="landing-blindspot-skeleton landing-blindspot-skeleton-md" />
            <div className="landing-blindspot-skeleton landing-blindspot-skeleton-lg" />
            <div className="landing-blindspot-center-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-20">
                <path d="M8 36l14-14M22 22l10-10M22 22l-6 14" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="30" cy="32" r="8" stroke="#555" strokeWidth="2"/>
                <path d="M35 37l5 5" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="landing-blindspot-alert">BLIND SPOT DETECTED</div>
          </div>
        </div>
      </section>

      {/* ─── BEACON ADVANTAGE ─── */}
      <section className="landing-advantage" id="advantage">
        <div className="landing-advantage-header">
          <h2 className="landing-section-title">The Beacon Advantage</h2>
          <p className="landing-advantage-tagline">
            SEE THE DATA. FIX THE GAP. AUTOMATE THE GROWTH.
          </p>
        </div>

        {/* Pillar 1 */}
        <div className="landing-pillar-card" id="pillar-1">
          <div className="landing-pillar-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 24V20M10 24V16M16 24V12M22 24V8M28 24V4" stroke="#7b8aef" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="landing-pillar-title">1. Enterprise-Grade AI Visibility Tracking</h3>
          <ul className="landing-pillar-list">
            <li><BlueBullet /><span>Comprehensive Monitoring</span></li>
            <li><BlueBullet /><span>Competitor Benchmarking</span></li>
            <li><BlueBullet /><span>Actionable Insights</span></li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="landing-pillar-card" id="pillar-2">
          <div className="landing-pillar-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 6l-2 4 2 4-2 4 2 4M10 8l2 4-2 4 2 4M22 8l-2 4 2 4-2 4" stroke="#7b8aef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="6" r="2" fill="#7b8aef"/>
              <circle cx="10" cy="8" r="1.5" fill="#7b8aef"/>
              <circle cx="22" cy="8" r="1.5" fill="#7b8aef"/>
            </svg>
          </div>
          <h3 className="landing-pillar-title">2. Set-and-Forget Content Automation</h3>
          <ul className="landing-pillar-list">
            <li><BlueBullet /><span>Context-Aware Generation</span></li>
            <li><BlueBullet /><span>Fully Automated Publishing</span></li>
            <li><BlueBullet /><span>Multi-Language Scale</span></li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="landing-pillar-card" id="pillar-3">
          <div className="landing-pillar-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#7b8aef" strokeWidth="2"/>
              <path d="M12 16l3 3 6-7" stroke="#7b8aef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="landing-pillar-title">3. Technical GEO Readiness</h3>
          <ul className="landing-pillar-list">
            <li><BlueBullet /><span>One-Click llms.txt Deployment</span></li>
            <li><BlueBullet /><span>Automated Schema/JSON-LD</span></li>
            <li><BlueBullet /><span>GEO Readiness Audits</span></li>
          </ul>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="landing-comparison" id="comparison">
        <h2 className="landing-section-title">
          Why Pay for Three Tools When You Can Use&nbsp;One?
        </h2>
        <div className="landing-table-wrapper">
          <table className="landing-table" id="feature-table">
            <thead>
              <tr>
                <th className="landing-table-feature-col">FEATURE CAPABILITY</th>
                <th className="landing-table-beacon-col">Beacon</th>
                <th>Analytics Trackers</th>
                <th>Content Generators</th>
                <th>Tech SEO Apps</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AI Sentiment &amp; Visibility Tracking</td>
                <td><CheckCircle filled /></td>
                <td><CheckCircle filled /></td>
                <td><CheckCircle filled={false} /></td>
                <td><CheckCircle filled={false} /></td>
              </tr>
              <tr>
                <td>Automated Content Engine</td>
                <td><CheckCircle filled /></td>
                <td><CheckCircle filled={false} /></td>
                <td><CheckCircle filled /></td>
                <td><CheckCircle filled={false} /></td>
              </tr>
              <tr>
                <td>GEO Optimization (llms.txt)</td>
                <td><CheckCircle filled /></td>
                <td><CheckCircle filled={false} /></td>
                <td><CheckCircle filled={false} /></td>
                <td><CheckCircle filled /></td>
              </tr>
              <tr>
                <td>Native Shopify Integration</td>
                <td><CheckCircle filled /></td>
                <td><CheckCircle filled={false} /></td>
                <td><CheckCircle filled /></td>
                <td><CheckCircle filled /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── TRUST / SCALE ─── */}
      <section className="landing-trust" id="trust">
        <h2 className="landing-section-title">
          Built for Shopify Merchants.<br />
          <span className="landing-gradient-text">Scalable for Enterprise Brands.</span>
        </h2>
        <p className="landing-trust-desc">
          Whether you&apos;re a solo e-commerce founder looking for hands-off content
          growth or an enterprise marketing team needing deep sentiment analytics,
          Beacon adapts to your scale.
        </p>
        <div className="landing-trust-image-frame">
          <Image
            src="/enterprise-team.png"
            alt="Enterprise team using Beacon analytics"
            width={960}
            height={540}
            className="landing-trust-img"
          />
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="landing-final-cta" id="final-cta">
        <div className="landing-final-cta-card">
          <h2 className="landing-final-cta-title">Ready to dominate AI search?</h2>
          <p className="landing-final-cta-desc">
            Join 500+ brands tracking their visibility in the generative age.
          </p>
          <Link href="/login" className="landing-btn-cta-large" id="footer-cta">
            [ Get Started for Free Today ]
          </Link>
          <div className="landing-final-cta-icons">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="3" stroke="#666" strokeWidth="1.5"/><circle cx="19" cy="17" r="3" stroke="#666" strokeWidth="1.5"/><circle cx="5" cy="17" r="3" stroke="#666" strokeWidth="1.5"/><path d="M12 8v4l5.2 3M12 12l-5.2 3" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="1.5"/><path d="M14.83 14.83a4 4 0 00-5.66-5.66" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 8v4l3 1.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer" id="footer">
        <p className="landing-footer-brand">Beacon</p>
        <div className="landing-footer-links">
          <a href="#">PRIVACY POLICY</a>
          <a href="#">TERMS OF SERVICE</a>
          <a href="#">SECURITY</a>
          <a href="#">STATUS</a>
          <a href="#">CONTACT SUPPORT</a>
        </div>
        <p className="landing-footer-copy">
          © 2024 Beacon Quantum Intelligence. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
