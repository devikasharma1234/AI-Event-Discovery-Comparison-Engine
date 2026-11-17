import { ArrowRight, LogOut, UserRound } from "lucide-react";
import { AuthError } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { auth, googleAuthConfigured, signIn, signOut } from "../../auth";
import ProfilePreferences from "./ProfilePreferences";

export default async function ProfilePage({ searchParams }: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const user = googleAuthConfigured ? (await auth())?.user : undefined;
  const { error } = await searchParams;
  const signedOut = googleAuthConfigured && !user;
  const initials = user?.name?.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();

  return <div className="account-theme">
    <Navbar />
    <main className="shell profile-page">
      {signedOut ? (
        <section className="account-entry" aria-labelledby="account-title">
          <div className="account-entry-form">
            <span className="brand-icon account-brand" aria-hidden="true"><i className="bee-mark" /></span>
            <h1 id="account-title">Sign in to PlanBee</h1>
            <p>Use your Google account to sign in or get started.</p>
            {error && <p className="account-alert" role="alert">
              {error === "AccessDenied" ? "Google denied access for this account. Try another Google account."
                : "Google sign-in could not be completed. Please try again."}
            </p>}
            <form action={async () => {
              "use server";
              if (!googleAuthConfigured) return;
              try {
                await signIn("google", { redirectTo: "/profile" });
              } catch (error) {
                if (error instanceof AuthError) redirect("/profile?error=SignIn");
                throw error;
              }
            }}>
              <button className="primary-button account-google-button" type="submit">
                Continue with Google <ArrowRight size={17} />
              </button>
            </form>
            <Link href="/discover" className="account-guest-link">Browse events as a guest</Link>
          </div>
        </section>
      ) : <>
        <header className="account-header">
          <span className="account-avatar" aria-hidden="true">{initials || <UserRound size={27} />}</span>
          <div className="account-identity">
            <h1>{user?.name ? `${user.name}’s profile` : "My profile"}</h1>
            <p>{user?.email ?? "Manage your PlanBee preferences."}</p>
          </div>
          {user && <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/profile" });
          }}>
            <button className="account-signout" type="submit"><LogOut size={16} /> Sign out</button>
          </form>}
        </header>
        {!googleAuthConfigured && <p className="muted profile-auth-actions">Google sign-in is unavailable. You can still manage preferences on this browser.</p>}
        <ProfilePreferences />
      </>}
    </main>
    <Footer />
  </div>;
}
