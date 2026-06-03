"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth/client";
import { LogIn, Loader2, AlertCircle, ShieldCheck, RefreshCw, MailCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // OTP Verification States
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/portal",
      });

      if (error) {
        const errMsg = error.message || "";
        const isUnverified = errMsg.toLowerCase().includes("not verified") || 
                            errMsg.toLowerCase().includes("verification") ||
                            errMsg.toLowerCase().includes("verify your email");
        
        if (isUnverified) {
          setShowOtpField(true);
          setErrorMessage("Your email address is not verified. Please verify using the code/link sent to you or request a new one below.");
        } else {
          setErrorMessage(errMsg || "Invalid email or password.");
        }
      } else {
        router.push("/portal");
      }
    } catch (err) {
      console.error("Login page error:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      const isUnverified = rawMsg.toLowerCase().includes("not verified") || 
                          rawMsg.toLowerCase().includes("verification") ||
                          rawMsg.toLowerCase().includes("verify your email");
      
      if (isUnverified) {
        setShowOtpField(true);
        setErrorMessage("Your email address is not verified. Please verify using the code/link sent to you or request a new one below.");
      } else {
        setErrorMessage(rawMsg || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setVerifyingOtp(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: otpCode.trim(),
      });

      if (error) {
        setErrorMessage(error.message || "Invalid verification code.");
        setVerifyingOtp(false);
        return;
      }

      setSuccessMessage("Email verified successfully! Redirecting you to the portal...");
      
      // Wait a short duration to ensure session cookie is registered by the browser
      await new Promise((resolve) => setTimeout(resolve, 800));

      router.push("/portal");
    } catch (err) {
      console.error("OTP verification error:", err);
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred during verification.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin + "/portal",
      });

      if (error) {
        setErrorMessage(error.message || "Failed to resend verification email.");
        return;
      }

      setSuccessMessage("Verification code/link resent! Check your inbox.");
    } catch (err) {
      console.error("Resend error:", err);
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred while resending.");
    } finally {
      setResendingEmail(false);
    }
  };

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
              Welcome back
            </h2>
            <p className="mt-1 text-center text-sm text-[#071E4A]/70">
              Sign in to continue to your account
            </p>
          </div>

          {errorParam === "noprofile" && (
            <div className="mb-6 bg-amber-50 border-l-4 border-[#E8C97A] p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-[#E8C97A]" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-semibold text-[#071E4A]">
                    Your account does not have a contestant profile setup. Please register again or contact support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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

          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <MailCheck className="h-5 w-5 text-green-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-semibold text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {showOtpField ? (
            /* OTP Verification Screen */
            <div>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otpCode" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                    Verification Code
                  </label>
                  <p className="text-xs text-[#071E4A]/60 mb-2">
                    Enter the 6-digit code sent to <span className="font-semibold text-[#071E4A]">{email}</span>:
                  </p>
                  <div className="mt-1">
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] text-center tracking-widest font-mono text-xl text-[#071E4A]"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B] disabled:opacity-50"
                  >
                    {verifyingOtp ? (
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
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="w-full flex justify-center items-center py-3 px-4 border border-[#0B2D6B]/20 rounded-full shadow-sm text-sm font-semibold text-[#0B2D6B] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B] disabled:opacity-50"
                >
                  {resendingEmail ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Resend Verification Email
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOtpField(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="w-full text-center text-sm font-bold text-[#071E4A] hover:text-[#0B2D6B] transition-colors py-2"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* Standard Login Form */
            <form className="space-y-5" onSubmit={handleLogin}>
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
                    className="appearance-none block w-full px-4 py-3 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] sm:text-sm text-[#071E4A]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                    Password
                  </label>
                </div>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8C97A] focus:border-[#E8C97A] sm:text-sm text-[#071E4A]"
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMessage("");
                      setErrorMessage("Password reset is managed by the administrator. Please contact info@misssomali.org.");
                    }}
                    className="text-xs font-bold text-[#0B2D6B] hover:text-[#0B2D6B]/80 hover:underline transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
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
                    <LogIn className="h-5 w-5 mr-2" />
                  )}
                  Sign in
                </button>
              </div>
            </form>
          )}

          {!showOtpField && (
            <div className="mt-8 pt-6 border-t border-[#E8E8E8] text-center text-sm text-[#071E4A]/70 font-normal">
              <span>New here? </span>
              <Link
                href="/register"
                className="font-bold text-[#0B2D6B] hover:text-[#0B2D6B]/80 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
