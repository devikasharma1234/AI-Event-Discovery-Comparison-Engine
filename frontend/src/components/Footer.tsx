import Link from "next/link";

export default function Footer({ onSaved }: { onSaved?: () => void }) {
  return <footer className="site-footer">
    <div className="shell footer-inner">
      <Link className="wordmark" href="/" aria-label="PlanBee home"><span className="brand-icon"><i className="bee-mark" aria-hidden="true" /></span>Plan<span>Bee</span></Link>
      <p>Discover events and check ticket options.</p>
      <nav aria-label="Footer navigation">
        <Link href="/discover">Discover</Link>
        {onSaved && <button onClick={onSaved}>Saved events</button>}
        <Link href="/profile">Profile</Link>
      </nav>
    </div>
  </footer>;
}
