import { useState, type FormEvent } from "react";
import { categories, cities } from "../lib/presentation";
import type { Profile } from "../lib/workspace";
import type { SearchFilters } from "../types/event";

export function ProfileForm({ profile, onSave, onPersonalize }: { profile: Profile; onSave: (profile: Profile) => void; onPersonalize: () => void }) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ ...draft, name: draft.name.trim() });
    setSaved(true);
  }

  return <form className="settings-form" onSubmit={submit} onChange={() => setSaved(false)}>
    <p className="muted">Your profile, saved events, and searches are stored in this browser.</p>
    <label>Display name<input maxLength={60} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Your name" /></label>
    <label>Preferred city<select value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })}>
      <option value="">Any city</option>{cities.map((city) => <option key={city}>{city}</option>)}
    </select></label>
    <fieldset><legend>Interests</legend><div className="interest-row">
      {categories.slice(1).map(({ value, label }) => <label key={value} className="interest">
        <input type="checkbox" checked={draft.interests.includes(value)} onChange={(event) => setDraft({
          ...draft, interests: event.target.checked ? [...draft.interests, value] : draft.interests.filter((item) => item !== value),
        })} /> {label}
      </label>)}
    </div></fieldset>
    <div className="dialog-actions">
      <button type="submit" className="primary-button">Save profile</button>
      <button type="button" className="outline-button" onClick={onPersonalize} disabled={!profile.city && !profile.interests.length}>Use saved preferences</button>
      {saved && <span role="status">Profile saved</span>}
    </div>
  </form>;
}

export function FilterForm({ initial, onApply, onClear }: { initial?: SearchFilters; onApply: (filters: SearchFilters) => void; onClear: () => void }) {
  const [start, setStart] = useState(initial?.date ?? "");
  const [people, setPeople] = useState(initial?.people ?? 1);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "") || undefined;
    const number = (name: string) => value(name) === undefined ? undefined : Number(value(name));
    onApply({
      city: value("city"), category: value("category"), people: number("people") ?? 1,
      budget: number("budget"), age: number("age"), date: value("date"), endDate: value("endDate"),
      children: number("children"),
      preferences: initial?.preferences,
    });
  }

  const availableCities = initial?.city && !cities.includes(initial.city) ? [...cities, initial.city] : cities;

  return <form className="settings-form" onSubmit={submit}>
    <div className="form-grid">
      <label>City<select name="city" defaultValue={initial?.city ?? ""}>
        <option value="">Any city</option>{availableCities.map((city) => <option key={city}>{city}</option>)}
      </select></label>
      <label>Event category<select name="category" defaultValue={initial?.category ?? ""}>
        {categories.map(({ value, label }) => <option key={label} value={value}>{label}</option>)}
      </select></label>
      <label>Group size<input type="number" name="people" min={1} max={50} required value={people || ""} onChange={(event) => setPeople(Number(event.target.value))} /></label>
      <label>Children in the group<input type="number" name="children" min={0} max={people} defaultValue={initial?.children} placeholder="Optional" /></label>
      <label>Total group budget (₹)<input name="budget" type="number" min={0} max={10000000} step=".01" placeholder="Any budget" defaultValue={initial?.budget} /></label>
      <label>Start date<input name="date" type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
      <label>End date<input name="endDate" type="date" disabled={!start} min={start || undefined} defaultValue={initial?.endDate} /></label>
      <label>Youngest attendee’s age<input name="age" type="number" min={0} max={120} placeholder="Any age" defaultValue={initial?.age} /></label>
    </div>
    <div className="dialog-actions">
      <button type="submit" className="primary-button">Apply filters</button>
      <button type="button" className="outline-button" onClick={onClear}>Clear all</button>
    </div>
  </form>;
}
