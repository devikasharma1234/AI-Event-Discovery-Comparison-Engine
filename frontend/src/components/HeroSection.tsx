import { ArrowDown, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="home-hero-frame">
      <section className="hero home-hero" aria-labelledby="home-title">
        <div className="hero-art" aria-hidden="true" />
        <div className="hero-inner">
          <p className="eyebrow hero-label"><Sparkles size={14} /> AI EVENT DISCOVERY</p>
          <h1 id="home-title">From What&apos;s the Plan?<br /><em>to Let&apos;s Go!</em></h1>
          <p>Find concerts, movies, comedy, and more. Tell PlanBee your city, dates, and budget to get event recommendations.</p>
          <a href="#event-query" className="hero-link">Ask PlanBee <ArrowDown size={16} /></a>
        </div>
      </section>
    </div>
  );
}
