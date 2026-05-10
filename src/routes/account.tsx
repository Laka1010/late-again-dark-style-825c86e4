import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "Account — Late Againg" },
      { name: "description", content: "Sign in or create your Late Againg account." },
    ],
  }),
});

const emailSchema = z.string().trim().email("Invalid email").max(255);
const passwordSchema = z.string().min(6, "At least 6 characters").max(72);
const nameSchema = z.string().trim().min(1, "Required").max(60);
const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+\d\s()-]{5,30}$/, "Invalid phone")
  .optional()
  .or(z.literal(""));

function AccountPage() {
  const { user, loading } = useAuth();
  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-32 pb-20">
        {loading ? (
          <p className="w-full text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Loading…
          </p>
        ) : user ? (
          <SignedIn />
        ) : (
          <AuthForms />
        )}
      </main>
    </div>
  );
}

function SignedIn() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else {
      toast.success("Signed out");
      navigate({ to: "/" });
    }
  };

  return (
    <div className="w-full">
      <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Account</p>
      <h1 className="font-display mt-4 text-4xl font-light tracking-tight text-foreground">
        Welcome back.
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">{user?.email}</p>
      <button
        onClick={onLogout}
        className="btn-ghost mt-10"
      >
        Sign out
      </button>
    </div>
  );
}

function AuthForms() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // If user becomes authenticated mid-session, redirect home.
  const { user } = useAuth();
  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const e1 = emailSchema.safeParse(email);
      const p1 = passwordSchema.safeParse(password);
      if (!e1.success) throw new Error(e1.error.issues[0].message);
      if (!p1.success) throw new Error(p1.error.issues[0].message);

      if (mode === "signup") {
        const n1 = nameSchema.safeParse(name);
        if (!n1.success) throw new Error(n1.error.issues[0].message);
        const ph1 = phoneSchema.safeParse(phone);
        if (!ph1.success) throw new Error(ph1.error.issues[0].message);
        const { error } = await supabase.auth.signUp({
          email: e1.data,
          password: p1.data,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: n1.data, phone: ph1.data ?? "" },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: e1.data,
          password: p1.data,
        });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full">
      <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        {mode === "login" ? "01 — Sign in" : "01 — Create account"}
      </p>
      <h1 className="font-display mt-4 text-4xl font-light tracking-tight text-foreground">
        {mode === "login" ? (
          <>Enter the <span className="italic text-silver">universe</span>.</>
        ) : (
          <>Become a <span className="italic text-silver">member</span>.</>
        )}
      </h1>

      <form onSubmit={onSubmit} className="mt-12 space-y-6">
        {mode === "signup" && (
          <>
            <Field label="Name">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-border px-0 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
              />
            </Field>
            <Field label="Phone (optional)">
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-b border-border px-0 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
              />
            </Field>
          </>
        )}
        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-border px-0 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-border px-0 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </Field>

        <button type="submit" disabled={busy} className="btn-ghost mt-4 w-full disabled:opacity-50">
          {busy ? "…" : mode === "login" ? "Sign in →" : "Create account →"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-10 text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
      >
        {mode === "login" ? "No account? Create one →" : "Already a member? Sign in →"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}