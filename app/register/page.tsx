"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth/client";
import { UserPlus, Loader2, AlertCircle, MailCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Somalia");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Sign up the user via Neon Auth
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      });

      if (error) {
        const errMsg = error.message || "";
        // Better Auth returns this when email verification is required
        if (
          errMsg.toLowerCase().includes("email not verified") ||
          errMsg.toLowerCase().includes("verification") ||
          errMsg.toLowerCase().includes("verify your email")
        ) {
          setVerificationSent(true);
          setLoading(false);
          return;
        }
        setErrorMessage(errMsg || "Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      // Wait a short duration to ensure session cookie is registered by the browser
      await new Promise((resolve) => setTimeout(resolve, 600));

      // 2. Attempt to create the contestant profile in the database.
      // If the session is not yet active (email verification pending), a 401 is expected.
      const profileRes = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, country }),
      });

      if (profileRes.status === 401) {
        // Session not active yet — email verification is required before sign-in.
        // Show the verification screen; middleware will create the profile on first portal access.
        setVerificationSent(true);
        setLoading(false);
        return;
      }

      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        console.error("Failed to create profile database entry:", profileRes.status, errorText);
        // Non-blocking: still redirect so the middleware fallback can pick it up
      }

      // Redirect to portal dashboard
      router.push("/portal");
    } catch (err) {
      console.error("Registration page error:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      if (
        rawMsg.toLowerCase().includes("email not verified") ||
        rawMsg.toLowerCase().includes("verification")
      ) {
        setVerificationSent(true);
        setLoading(false);
        return;
      }
      setErrorMessage(rawMsg || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Email verification pending screen ────────────────────────────────────
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
          <Link href="/">
            <div className="relative w-48 h-12 mb-6 cursor-pointer">
              <Image
                src="/logo.png"
                alt="Miss Somali Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </Link>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#FFFFFF] py-10 px-4 border border-[#E8E8E8] shadow-lg rounded-xl sm:px-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#E8C97A]/20 rounded-full p-4">
                <MailCheck className="h-10 w-10 text-[#071E4A]" />
              </div>
            </div>
            <h3 className="text-xl font-extrabold text-[#071E4A] mb-2">Check your inbox</h3>
            <p className="text-sm text-[#071E4A]/70 mb-6">
              A verification link has been sent to{" "}
              <span className="font-semibold text-[#071E4A]">{email}</span>.
              <br />
              Please verify your email address before signing in.
            </p>
            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B]"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/">
          <div className="relative w-48 h-12 mb-6 cursor-pointer">
            <Image
              src="/logo.png"
              alt="Miss Somali Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-[#071E4A] tracking-tight">
          Contestant Registration
        </h2>
        <p className="mt-2 text-center text-sm text-[#071E4A]/70">
          Create your account to start your application
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-8 px-4 border border-[#E8E8E8] shadow-lg rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleRegister}>
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-red-800">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-[#0B2D6B] sm:text-sm text-[#071E4A]"
                  placeholder="Insert your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-[#0B2D6B] sm:text-sm text-[#071E4A]"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-[#0B2D6B] sm:text-sm text-[#071E4A]"
                  placeholder="+252..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="country" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                Country of Residence
              </label>
              <div className="mt-1">
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-[#0B2D6B] sm:text-sm text-[#071E4A]"
                  placeholder="e.g. Somalia"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-[#0B2D6B] sm:text-sm text-[#071E4A]"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <UserPlus className="h-5 w-5 mr-2" />
                )}
                Register & Start Application
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E8E8]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-[#071E4A]/60">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-[#0B2D6B]/20 rounded-full shadow-sm text-sm font-semibold text-[#0B2D6B] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B]"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
