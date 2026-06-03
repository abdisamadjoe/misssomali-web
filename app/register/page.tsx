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
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

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
      const { error } = await authClient.emailOtp.verifyEmail({
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

  const countries = [
    "Somalia",
    "Canada",
    "United States",
    "United Kingdom",
    "Kenya",
    "Sweden",
    "Norway",
    "Turkey",
    "United Arab Emirates",
    "Australia",
    "Finland",
    "Denmark",
    "Netherlands",
    "Germany",
    "Other"
  ];

  // ── Email verification pending screen ────────────────────────────────────
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E8C97A]/10 blur-3xl rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0D3A8A]/35 blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 mx-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-10 px-6 sm:px-10 shadow-2xl rounded-2xl border border-gray-100 flex flex-col">
            <div className="flex flex-col items-center mb-8">
              <Link href="/">
                <div className="relative w-48 h-12 mb-4 cursor-pointer">
                  <Image
                    src="/logo.png"
                    alt="Miss Somali Logo"
                    fill
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </div>
              </Link>
              <h2 className="text-center text-2xl font-extrabold text-[#071E4A] tracking-tight">
                Verify Your Email
              </h2>
              <p className="mt-1 text-center text-sm text-[#071E4A]/70">
                We sent a verification link or code to <span className="font-semibold text-[#071E4A]">{email}</span>
              </p>
            </div>

            {verificationError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
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
                    className="appearance-none block w-full px-4 py-3 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] text-center tracking-widest font-mono text-xl text-[#071E4A]"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={verifyingCode}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#071E4A] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B] disabled:opacity-50 cursor-pointer"
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
                className="w-full flex justify-center items-center py-3 px-4 border border-[#0B2D6B]/20 rounded-full shadow-sm text-sm font-semibold text-[#0B2D6B] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B] disabled:opacity-50 cursor-pointer"
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
    <div className="min-h-screen bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background spotlights/glows */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E8C97A]/10 blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0D3A8A]/35 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 mx-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 shadow-2xl rounded-2xl border border-gray-100 flex flex-col">
          {/* Logo & Header block */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/">
              <div className="relative w-48 h-12 mb-4 cursor-pointer">
                <Image
                  src="/logo.png"
                  alt="Miss Somali Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </Link>
            <h2 className="text-center text-2xl font-extrabold text-[#071E4A] tracking-tight">
              Create account
            </h2>
            <p className="mt-1 text-center text-sm text-[#071E4A]/70">
              Join the Miss Somali platform to get started
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
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
                  className="appearance-none block w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] sm:text-sm text-[#071E4A]"
                  placeholder="Enter your full name"
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
                  className="appearance-none block w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] sm:text-sm text-[#071E4A]"
                  placeholder="you@example.com"
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] sm:text-sm text-[#071E4A]"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label htmlFor="country" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                Country
              </label>
              <div className="mt-1">
                <select
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] sm:text-sm text-[#071E4A] bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10 cursor-pointer"
                >
                  <option value="" disabled>Select your country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
                  className="appearance-none block w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] sm:text-sm text-[#071E4A]"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] sm:text-sm text-[#071E4A]"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-[#071E4A]/60 leading-normal">
              By creating an account, you agree to the terms of use and privacy policy.
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#071E4A] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <UserPlus className="h-5 w-5 mr-2" />
                )}
                Create account
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E8E8E8] text-center text-sm text-[#071E4A]/70 font-normal">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="font-bold text-[#0B2D6B] hover:text-[#0B2D6B]/80 hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
