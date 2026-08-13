import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, LoaderCircle } from "lucide-react";
import logoFull from "../assets/logo-full.png";
import AuthShowcase from "../components/layout/AuthShowcase";
import { api } from "../lib/api";
import { useToast } from "../components/toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("token", result.token);
      localStorage.setItem("refreshToken", result.refreshToken);
      localStorage.setItem("activitySessionId", String(result.activitySessionId));
      localStorage.setItem("user", JSON.stringify(result.user));
      toast(`Welcome back, ${result.user.name}.`);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      if (error.status === 403 && error.verificationRequired) setVerificationEmail(email);
      toast(error.message, "error");
    } finally { setLoading(false); }
  }

  function storeSession(result) {
    localStorage.setItem("token", result.token);
    localStorage.setItem("refreshToken", result.refreshToken);
    localStorage.setItem("activitySessionId", String(result.activitySessionId));
    localStorage.setItem("user", JSON.stringify(result.user));
  }

  async function verifyEmail(event) {
    event.preventDefault();setLoading(true);
    try{const result=await api("/auth/verify-otp",{method:"POST",body:JSON.stringify({email:verificationEmail,otp})});storeSession(result);toast("Email verified successfully.");navigate(location.state?.from?.pathname||"/dashboard",{replace:true})}catch(error){toast(error.message,"error")}finally{setLoading(false)}
  }

  async function resendOtp(){setLoading(true);try{const result=await api("/auth/resend-verification",{method:"POST",body:JSON.stringify({email:verificationEmail})});toast(result.message)}catch(error){toast(error.message,"error")}finally{setLoading(false)}}

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

          {verificationEmail?<form onSubmit={verifyEmail} className="mt-8 space-y-4"><div className="rounded-lg border border-accent/30 bg-accent/5 p-4"><p className="font-medium">Verify your email</p><p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit OTP sent to {verificationEmail}.</p></div><label className="block"><span className="mb-1.5 block text-sm font-medium">Verification OTP</span><input autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} className="h-12 w-full rounded-md border bg-white text-center text-xl font-semibold tracking-[0.45em] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"/></label><button disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-white disabled:cursor-wait disabled:opacity-70">{loading?<><LoaderCircle className="h-5 w-5 animate-spin"/>Verifying…</>:"Verify & Sign in"}</button><div className="flex justify-between text-xs"><button type="button" onClick={resendOtp} disabled={loading} className="font-medium text-secondary">Resend OTP</button><button type="button" onClick={()=>{setVerificationEmail("");setOtp("")}} className="text-muted-foreground">Back to login</button></div></form>:<form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Work email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
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
              disabled={loading}
              className="group relative w-full h-11 overflow-hidden rounded-md bg-primary text-primary-foreground font-cta font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition shadow-card disabled:cursor-wait disabled:opacity-90"
            >
              {loading ? (
                <>
                  <span className="absolute inset-0 animate-pulse bg-white/5" />
                  <LoaderCircle className="relative h-5 w-5 animate-spin" />
                  <span className="relative">Signing in securely</span>
                  <span className="relative flex gap-1" aria-hidden="true">
                    <i className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                    <i className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                    <i className="h-1 w-1 animate-bounce rounded-full bg-current" />
                  </span>
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>}

          <p className="text-sm text-muted-foreground text-center mt-6">Contact your administrator to create an account.</p>
        </div>
      </div>
    </div>
  );
}
