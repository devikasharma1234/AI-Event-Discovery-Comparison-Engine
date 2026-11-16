import { CircleUserRound } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { auth, googleAuthConfigured, signIn, signOut } from "../../auth";
import ProfilePreferences from "./ProfilePreferences";

export default async function ProfilePage() {
  const user = googleAuthConfigured ? (await auth())?.user : undefined;

  return <>
    <Navbar />
    <main className="shell profile-page">
      <header className="page-intro"><CircleUserRound size={38} /><h1>{user?.name ? `${user.name}’s profile` : "My profile"}</h1>
        <p>{user?.email ?? "Manage your PlanBee preferences."}</p>
      </header>
      {!googleAuthConfigured && <p className="muted profile-auth-actions">Google sign-in is unavailable. You can still manage preferences on this browser.</p>}
      {googleAuthConfigured && !user ? (
        <section className="profile-panel">
          <h2>Sign in to PlanBee</h2>
          <form action={async () => {
            "use server";
            if (googleAuthConfigured) await signIn("google", { redirectTo: "/profile" });
          }}>
            <button className="primary-button" type="submit">Continue with Google</button>
          </form>
        </section>
      ) : <>
        {user && <form className="profile-auth-actions" action={async () => {
          "use server";
          await signOut({ redirectTo: "/profile" });
        }}>
          <button className="outline-button" type="submit">Sign out</button>
        </form>}
        <ProfilePreferences />
      </>}
    </main>
    <Footer />
  </>;
}
