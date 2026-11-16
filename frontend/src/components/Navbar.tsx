"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, CircleUserRound, Compass, History, House, MapPin } from "lucide-react";
import { cities } from "../lib/presentation";

export default function Navbar({ city = "", onCity, onSaved, onHistory, savedCount = 0 }: {
  city?: string;
  onCity?: (city: string) => void;
  onSaved?: () => void;
  onHistory?: () => void;
  savedCount?: number;
}) {
  const router = useRouter();
  const options = city && !cities.includes(city) ? [...cities, city] : cities;

  return <header className="site-header">
    <nav className="shell navbar" aria-label="Main navigation">
      <Link className="wordmark" href="/" aria-label="PlanBee home"><span className="brand-icon"><i className="bee-mark" aria-hidden="true" /></span>Plan<span>Bee</span></Link>
      <div className="nav-links">
        <Link href="/" aria-label="Home"><House size={17} /><span>Home</span></Link>
        <Link href="/discover" aria-label="Discover"><Compass size={17} /><span>Discover</span></Link>
        {onSaved && <button type="button" onClick={onSaved} aria-label={`Saved events (${savedCount})`}><Bookmark size={17} /><span>Saved</span></button>}
        {onHistory && <button type="button" onClick={onHistory} aria-label="Search history"><History size={17} /><span>History</span></button>}
      </div>
      <div className="nav-actions">
        <label className="city-picker">
          <MapPin size={16} aria-hidden="true" />
          <select aria-label="Select event city" value={city} onChange={(event) => {
            const next = event.target.value;
            if (onCity) onCity(next);
            else router.push(next ? `/discover?city=${encodeURIComponent(next)}` : "/discover");
          }}>
            <option value="">All cities</option>
            {options.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <Link className="profile-button" href="/profile" aria-label="Open profile"><CircleUserRound size={19} /><span>Profile</span></Link>
      </div>
    </nav>
  </header>;
}
