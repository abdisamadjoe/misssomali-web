"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function finishOAuthFlow() {
      const callbackError = new URLSearchParams(window.location.search).get("error");

      if (callbackError) {
        setErrorMessage("Google sign-in could not be completed. Please try again.");
        return;
      }

      for (let attempt = 0; attempt < 12; attempt += 1) {
        const session = await authClient.getSession();

        if (!mounted) return;

        if (session.data?.session) {
          const roleResponse = await fetch("/api/auth/role", {
            cache: "no-store",
          });

          if (!mounted) return;

          if (roleResponse.ok) {
            router.replace("/portal");
            return;
          }

          setErrorMessage("Your session was created, but your profile could not be loaded yet. Please try again.");
          return;
        }

        await wait(350);
      }

      if (!mounted) return;

      setErrorMessage("We could not find an active Neon Auth session after Google sign-in. Please try again.");
    }

    finishOAuthFlow();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] px-4 text-dark">
      {/* Background Spotlights & Grid */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-35 z-15" />
      </div>

      <section className="relative z-10 w-full max-w-[420px] rounded-[10px] border border-stroke bg-white p-7 text-center shadow-1">
        {errorMessage ? (
          <>
            <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-red-light-6 text-red">
              <AlertCircle className="size-6" />
            </div>
            <h1 className="text-heading-6 font-bold text-dark">
              Sign-in needs another try
            </h1>
            <p className="mt-2 text-body-sm font-medium text-dark-5">
              {errorMessage}
            </p>
            <Button asChild className="mt-6 h-11 rounded-lg bg-primary text-white">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-gray-1">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
            <h1 className="text-heading-6 font-bold text-dark">Signing you in</h1>
            <p className="mt-2 text-body-sm font-medium text-dark-5">
              Neon Auth is finishing your secure sign-in.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
