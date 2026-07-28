import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Building2, Eye, EyeOff, ArrowRight } from "lucide-react";
import logoFull from "../assets/logo-full.png";
import AuthShowcase from "../components/layout/AuthShowcase";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <AuthShowcase
        eyebrow="Cresco Global · Trade Desk"
        heading="Bring your whole trade desk onto one platform."
        sub="Set up your team's workspace to manage enquiries, vendors and deals across every chemical you import, export and trade."
      />

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-sm mx-auto">
          <img src={logoFull} alt="Cresco Global" className="h-8 w-auto mb-8 lg:hidden" />

          <h1 className="font-headline text-2xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Get your team set up on the Cresco Global CRM.
          </p>

          <form className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Piyush Sharma"
                    className="w-full h-11 rounded-md border border-input bg-white pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Company
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cresco Global"
                    className="w-full h-11 rounded-md border border-input bg-white pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
                  />
                </div>
              </div>
            </div>

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
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
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

            <label className="flex items-start gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-input text-accent focus:ring-ring/30"
              />
              <span>
                I agree to the{" "}
                <span className="text-secondary font-medium">Terms of Service</span> and{" "}
                <span className="text-secondary font-medium">Privacy Policy</span>
              </span>
            </label>

            <button
              type="submit"
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-cta font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition shadow-card"
            >
              Create account <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-secondary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
