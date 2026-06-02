"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth/client";
import { UserPlus, Loader2, AlertCircle, MailCheck, ShieldCheck, RefreshCw } from "lucide-react";

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

  // Email verification verification states
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccessMessage, setVerificationSuccessMessage] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

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

      // Check if the session is active before calling the profile creation endpoint.
      // If no active session, it means email verification is required.
      const sessionResult = await authClient.getSession();
      if (!sessionResult.data?.session) {
        setVerificationSent(true);
        setLoading(false);
        return;
      }

      // 2. Attempt to create the contestant profile in the database.
      const profileRes = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, country }),
      });

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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;
    setVerifyingCode(true);
    setVerificationError("");
    setVerificationSuccessMessage("");

    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: verificationCode.trim(),
      });

      if (error) {
        setVerificationError(error.message || "Invalid verification code.");
        setVerifyingCode(false);
        return;
      }

      setVerificationSuccessMessage("Email verified successfully! Creating profile...");

      // Wait a short duration to ensure session cookie is registered by the browser
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Attempt to create the user profile database entry
      const profileRes = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, country }),
      });

      if (!profileRes.ok) {
        console.error("Failed to create profile database entry after verification:", profileRes.status);
      }

      // Redirect to portal dashboard
      router.push("/portal");
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationError(err instanceof Error ? err.message : "An unexpected error occurred during verification.");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setVerificationError("");
    setVerificationSuccessMessage("");

    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin + "/portal",
      });

      if (error) {
        setVerificationError(error.message || "Failed to resend verification email.");
        return;
      }

      setVerificationSuccessMessage("Verification code/link resent! Check your inbox.");
    } catch (err) {
      console.error("Resend error:", err);
      setVerificationError(err instanceof Error ? err.message : "An unexpected error occurred while resending.");
    } finally {
      setResendingEmail(false);
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
          <h2 className="text-center text-3xl font-extrabold text-[#071E4A] tracking-tight">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-[#071E4A]/70">
            We sent a verification link or code to <span className="font-semibold text-[#071E4A]">{email}</span>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#FFFFFF] py-8 px-4 border border-[#E8E8E8] shadow-lg rounded-xl sm:px-10">
            
            {verificationError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-red-800">{verificationError}</p>
                  </div>
                </div>
              </div>
            )}

            {verificationSuccessMessage && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <MailCheck className="h-5 w-5 text-green-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-green-800">{verificationSuccessMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                  Verification Code
                </label>
                <p className="text-xs text-[#071E4A]/60 mb-2">
                  If you received a 6-digit verification code, enter it below:
                </p>
                <div className="mt-1">
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-[#0B2D6B] text-center tracking-widest font-mono text-xl text-[#071E4A]"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={verifyingCode}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B] disabled:opacity-50"
                >
                  {verifyingCode ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 mr-2" />
                  )}
                  Verify Account
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-[#E8E8E8] pt-6 flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="w-full flex justify-center items-center py-3 px-4 border border-[#0B2D6B]/20 rounded-full shadow-sm text-sm font-semibold text-[#0B2D6B] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B] disabled:opacity-50"
              >
                {resendingEmail ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Resend Code / Link
              </button>

              <Link
                href="/login"
                className="w-full text-center text-sm font-bold text-[#071E4A] hover:text-[#0B2D6B] transition-colors py-2"
              >
                Go to Sign In
              </Link>
            </div>
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
