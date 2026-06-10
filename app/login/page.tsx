"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/client";

type AuthError = {
  message?: string;
};

type OptionalPasswordResetClient = typeof authClient & {
  forgetPassword?: (data: {
    email: string;
    redirectTo?: string;
  }) => Promise<{ error?: AuthError | null }>;
};

function getAuthMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as AuthError).message;
    if (message) return message;
  }

  return fallback;
}

function getCallbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginContent />
    </Suspense>
  );
}

function AuthLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] px-4 text-dark">
      {/* Background Spotlights & Grid */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-35 z-15" />
      </div>
      <Loader2 className="relative z-10 size-8 animate-spin text-[#E8C97A]" />
    </main>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    searchParams.get("error") ? "Please sign in to continue." : "",
  );

  useEffect(() => {
    let mounted = true;

    async function redirectIfSignedIn() {
      const session = await authClient.getSession();

      if (mounted && session.data?.session) {
        router.replace("/portal");
      }
    }

    redirectIfSignedIn();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: getCallbackUrl(),
      });

      if (error) {
        setErrorMessage(getAuthMessage(error, "Invalid email or password."));
        return;
      }

      router.push("/auth/callback");
    } catch (error) {
      setErrorMessage(getAuthMessage(error, "Unable to sign in right now."));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setErrorMessage("");
    setNotice("");

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: getCallbackUrl(),
        newUserCallbackURL: getCallbackUrl(),
        errorCallbackURL: `${window.location.origin}/login?error=google`,
      });

      if (error) {
        setErrorMessage(getAuthMessage(error, "Google sign-in failed."));
      }
    } catch (error) {
      setErrorMessage(getAuthMessage(error, "Google sign-in failed."));
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    setErrorMessage("");
    setNotice("");

    if (!email) {
      setErrorMessage("Enter your email address first, then request a reset link.");
      return;
    }

    const resetClient = authClient as OptionalPasswordResetClient;

    if (!resetClient.forgetPassword) {
      setNotice("Password reset is handled by Neon Auth. Use the reset flow configured for this project.");
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await resetClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setErrorMessage(getAuthMessage(error, "Unable to send reset link."));
        return;
      }

      setNotice("If an account exists for that email, Neon Auth will send a reset link.");
    } catch (error) {
      setErrorMessage(getAuthMessage(error, "Unable to send reset link."));
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] px-4 py-10 text-dark">
      {/* Background Spotlights & Grid */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-35 z-15" />
      </div>

      <section className="relative z-10 w-full max-w-[450px] rounded-[10px] border border-stroke bg-white p-7 shadow-1">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-6 inline-flex items-center justify-center rounded-lg border border-stroke bg-gray-1 px-4 py-2 text-sm font-bold text-dark"
          >
            Miss Somali Platform
          </Link>

          <h1 className="text-heading-6 font-bold text-dark">Sign in</h1>
          <p className="mt-2 text-body-sm font-medium text-dark-5">
            Access your dashboard workspace.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 flex gap-3 rounded-lg border border-red-light-4 bg-red-light-6 px-4 py-3 text-body-sm font-medium text-red">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-lg border border-stroke bg-gray-1 px-4 py-3 text-body-sm font-medium text-dark-5">
            {notice}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="mb-5 h-12 w-full rounded-lg border-stroke bg-white text-dark hover:bg-gray-1"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
        >
          {googleLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg"
              alt=""
              className="size-5"
            />
          )}
          Continue with Google
        </Button>

        <div className="mb-5 flex items-center gap-4">
          <Separator className="flex-1 bg-stroke" />
          <span className="text-body-xs font-medium uppercase text-dark-5">
            or
          </span>
          <Separator className="flex-1 bg-stroke" />
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2.5 block text-body-sm font-medium text-dark"
            >
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-lg border-stroke bg-gray-1 px-4 text-dark shadow-none focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>

          <div>
            <div className="mb-2.5 flex items-center justify-between gap-4">
              <label
                htmlFor="password"
                className="block text-body-sm font-medium text-dark"
              >
                Password
              </label>
              <button
                type="button"
                className="text-body-sm font-medium text-primary hover:underline"
                disabled={resetLoading}
                onClick={handleForgotPassword}
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-12 rounded-lg border-stroke bg-gray-1 px-4 text-dark shadow-none focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-lg bg-primary text-white hover:bg-blue-dark"
            disabled={loading || googleLoading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm font-medium text-dark-5">
          New to the platform?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
