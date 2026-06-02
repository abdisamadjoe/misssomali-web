"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth/client";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/portal",
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password.");
      } else {
        router.push("/portal");
      }
    } catch (err) {
      console.error("Login page error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          Contestant Portal
        </h2>
        <p className="mt-2 text-center text-sm text-[#071E4A]/70">
          Official Applicant & Contestant Area
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-8 px-4 border border-[#E8E8E8] shadow-lg rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {errorParam === "noprofile" && (
              <div className="bg-amber-50 border-l-4 border-[#E8C97A] p-4 rounded-md">
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
                  className="appearance-none block w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-[#0B2D6B] sm:text-sm text-[#071E4A]"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">
                  Password
                </label>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg shadow-sm placeholder-[#071E4A]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-[#0B2D6B] sm:text-sm text-[#071E4A]"
                  placeholder="••••••••"
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
                  <LogIn className="h-5 w-5 mr-2" />
                )}
                Sign In to Portal
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E8E8]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-[#071E4A]/60">New Applicant?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center py-3 px-4 border border-[#0B2D6B]/20 rounded-full shadow-sm text-sm font-semibold text-[#0B2D6B] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D6B]"
              >
                Apply Now - Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
