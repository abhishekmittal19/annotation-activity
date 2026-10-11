"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react";
import { authApi } from "@/lib/api/auth";

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setOtpSent(true);
      setSuccess("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setIsLoading(true);
      await authApi.verifyOtp(email.trim().toLowerCase(), otp);
      setSuccess("Email verified successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <UserPlus className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-semibold">Create your Aurora account</h1>

          <p className="mt-2 text-sm text-slate-400">
            {otpSent
              ? "Verify your email to finish creating your account."
              : "Create an account to access the annotation platform."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!otpSent ? (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Enter your name"
                      autoComplete="name"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-slate-300">
                    Verification code sent to:
                  </p>
                  <p className="mb-4 break-all text-sm text-indigo-400">
                    {email}
                  </p>

                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Email verification OTP
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Enter 6-digit OTP"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  disabled={isLoading || otp.length !== 6}
                  onClick={handleVerifyOtp}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <p className="text-xs text-slate-500">
                  The OTP expires in 10 minutes. Check your spam folder if you
                  cannot find the email.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
                {success}
              </div>
            )}
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
