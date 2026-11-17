"use client";

import { Bookmark, History, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "../../components/SettingsForms";
import { updateWorkspace, useWorkspace } from "../../lib/workspace";

export default function ProfilePreferences() {
  const { profile, saved, history } = useWorkspace();
  const router = useRouter();

  return <div className="profile-layout">
    <section className="profile-panel account-preferences">
      <h2><SlidersHorizontal size={19} /> Preferences</h2>
      <ProfileForm profile={profile} onSave={(next) => updateWorkspace((current) => ({ ...current, profile: next }))}
        onPersonalize={() => router.push(profile.city ? `/discover?personalized=1&city=${encodeURIComponent(profile.city)}` : "/discover?personalized=1")} />
    </section>
    <aside className="profile-panel account-activity">
      <h2>Your activity</h2>
      <dl>
        <div><dt><Bookmark size={17} /> Saved events</dt><dd>{saved.length}</dd></div>
        <div><dt><History size={17} /> Recent searches</dt><dd>{history.length}</dd></div>
      </dl>
    </aside>
  </div>;
}
