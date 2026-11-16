"use client";

import { useRouter } from "next/navigation";

import { ProfileForm } from "../../components/SettingsForms";
import { updateWorkspace, useWorkspace } from "../../lib/workspace";

export default function ProfilePreferences() {
  const { profile, saved, history } = useWorkspace();
  const router = useRouter();
  return (
      <div className="profile-layout">
        <section className="profile-panel"><h2>Preferences</h2>
          <ProfileForm profile={profile} onSave={(next) => updateWorkspace((current) => ({ ...current, profile: next }))}
            onPersonalize={() => router.push(profile.city ? `/discover?personalized=1&city=${encodeURIComponent(profile.city)}` : "/discover?personalized=1")} />
        </section>
        <aside className="profile-panel"><h2>Your activity</h2>
          <p><strong>{saved.length}</strong> saved {saved.length === 1 ? "event" : "events"}</p>
          <p><strong>{history.length}</strong> recent {history.length === 1 ? "search" : "searches"}</p>
        </aside>
      </div>
  );
}
