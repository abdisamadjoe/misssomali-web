"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/client";

type AuthError = {
  message?: string;
};

function getAuthMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as AuthError).message;
    if (message) return message;
  }

  return fallback;
}

function getCallbackUrl() {
  return `${window.location.origin}/login`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function redirectIfSignedIn() {
      const session = await authClient.getSession();

      if (mounted) {
        if (session.data?.session) {
          setGoogleLoading(true);
          const roleResponse = await fetch("/api/auth/role", {
            cache: "no-store",
          });

          if (!mounted) return;

          if (roleResponse.ok) {
            const data = await roleResponse.json();
            if (data.role === "admin") {
              router.replace("/admin");
            } else {
              router.replace("/portal");
            }
          } else {
            router.replace("/portal");
          }
        }
      }
    }

    redirectIfSignedIn();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleEmailSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: fullName,
        email,
        password,
        callbackURL: getCallbackUrl(),
      });

      if (error) {
        setErrorMessage(getAuthMessage(error, "Unable to create your account."));
        setLoading(false);
        return;
      }

      const roleResponse = await fetch("/api/auth/role", {
        cache: "no-store",
      });

      if (roleResponse.ok) {
        const data = await roleResponse.json();
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/portal");
        }
      } else {
        router.push("/portal");
      }
    } catch (error) {
      setErrorMessage(getAuthMessage(error, "Unable to create your account."));
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    setErrorMessage("");

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: getCallbackUrl(),
        newUserCallbackURL: getCallbackUrl(),
        errorCallbackURL: `${window.location.origin}/register?error=google`,
      });

      if (error) {
        setErrorMessage(getAuthMessage(error, "Google sign-up failed."));
      }
    } catch (error) {
      setErrorMessage(getAuthMessage(error, "Google sign-up failed."));
    } finally {
      setGoogleLoading(false);
    }
  }


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] px-4 py-10 text-dark">
      {/* Background Spotlights & Grid */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-35 z-15" />
      </div>

      <section className="relative z-10 w-full max-w-[480px] rounded-[10px] border border-stroke bg-white p-7 shadow-1">
        <div className="mb-8 text-center">
          <h1 className="text-heading-6 font-bold text-dark">Create account</h1>
          <p className="mt-2 text-body-sm font-medium text-dark-5">
            Apply or Manage your application.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 flex gap-3 rounded-lg border border-red-light-4 bg-red-light-6 px-4 py-3 text-body-sm font-medium text-red">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="mb-5 h-12 w-full rounded-lg border-stroke bg-white text-dark hover:bg-gray-1"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignUp}
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

        <form onSubmit={handleEmailSignUp} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2.5 block text-body-sm font-medium text-dark"
            >
              Full name
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              className="h-12 rounded-lg border-stroke bg-gray-1 px-4 text-dark shadow-none focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>

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
            <label
              htmlFor="password"
              className="mb-2.5 block text-body-sm font-medium text-dark"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              className="h-12 rounded-lg border-stroke bg-gray-1 px-4 text-dark shadow-none focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2.5 block text-body-sm font-medium text-dark"
            >
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              className="h-12 rounded-lg border-stroke bg-gray-1 px-4 text-dark shadow-none focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-lg bg-primary text-white hover:bg-blue-dark"
            disabled={loading || googleLoading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm font-medium text-dark-5">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
