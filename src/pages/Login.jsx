import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import logoFull from "../assets/logo-full.png";
import AuthShowcase from "../components/layout/AuthShowcase";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <AuthShowcase
        eyebrow="Cresco Global · Trade Desk"
        heading="Every enquiry, vendor and shipment — one system of record."
        sub="Built for the way Cresco Global actually trades: enquiries in, quotes out, deals tracked from first contact to final delivery."
      />

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-sm mx-auto">
          <img src={logoFull} alt="Cresco Global" className="h-8 w-auto mb-10 lg:hidden" />

          <h1 className="font-headline text-2xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sign in to your CRM to pick up where you left off.
          </p>

          <form className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Work email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@crescoglobal.co.in"
                  className="w-full h-11 rounded-md border border-input bg-white pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground/80">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-secondary font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-md border border-input bg-white pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-accent focus:ring-ring/30"
              />
              Keep me signed in
            </label>

            <button
              type="submit"
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-cta font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition shadow-card"
            >
              Sign in <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            New to Cresco Global CRM?{" "}
            <Link to="/signup" className="text-secondary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
