"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import {
  ScanFace,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Color schemes for mode distinction
  // Color schemes for mode distinction - Refactored to use CSS Variables
  const loginColors = {
    accent: "var(--ink-login-accent)",
    accentLight: "var(--ink-accent-light-login)",
    glow: "var(--ink-login-glow)",
    gradient: "var(--ink-gradient-login)",
    bgTint: "var(--ink-bg-tint-login)",
    borderLow: "var(--ink-login-accent-15)",
    borderHigh: "var(--ink-login-accent-20)",
  };

  const registerColors = {
    accent: "var(--ink-register-accent)",
    accentLight: "var(--ink-accent-light-register)",
    glow: "var(--ink-register-glow)",
    gradient: "var(--ink-gradient-register)",
    bgTint: "var(--ink-bg-tint-register)",
    borderLow: "var(--ink-register-accent-15)",
    borderHigh: "var(--ink-register-accent-20)",
  };

  const activeColors = isLoginView ? loginColors : registerColors;

  const syncSpring: Transition = {
    type: "spring",
    stiffness: 100,
    damping: 18,
  };
  const PANEL_WIDTH = 450;
  const BOX_WIDTH = 1100;

  const formatEmail = (input: string) => {
    const trimmed = input.trim();
    return trimmed.includes("@") ? trimmed : `${trimmed}@inkowapi.com`;
  };

  const handleRegister = async () => {
    if (regPassword.length < 6) {
      alert("SECURITY BREACH: Passcode must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const finalEmail = formatEmail(regEmail);
    console.log("IDENTITY PROTOCOL: Initiating registration for:", finalEmail);

    try {
      const { data, error } = await authClient.signUp.email({
        email: finalEmail,
        password: regPassword,
        name: regName,
      });

      if (error) {
        if (error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
          console.warn("Identity Protocol: User already exists:", finalEmail);
          alert(
            `IDENTITY PROTOCOL: User '${finalEmail}' already exists. Please Log In.`
          );
        } else {
          console.error("Auth Error Code:", error.code);
          alert(error.message || "Credential Check Failed");
        }
        return;
      }

      if (data) {
        setIsEmailSent(true);
        setLoginEmail(regEmail);
        setRegPassword("");
        setIsLoginView(true);
      }
    } catch (err) {
      console.error("Fatal Connection Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: formatEmail(loginEmail),
        password: loginPassword,
      });

      if (error) {
        console.error("Login Error:", error.code);
        if (error.code === "EMAIL_NOT_VERIFIED") {
          alert("ACCESS DENIED: Your email has not been verified.");
          return;
        }
        alert(error.message || "Access Denied");
        return;
      }

      if (data) {
        router.push("/register");
      }
    } catch (err) {
      console.error("Login connection error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { data, error } = await authClient.sendVerificationEmail({
        email: formatEmail(regEmail),
        callbackURL: "/dashboard",
      });
      if (error) {
        alert(`System Error: ${error.code}`);
        return;
      }
      alert("RE-DISPATCHED: Check " + regEmail);
    } catch (err) {
      console.error("FATAL_SYSTEM_CRASH:", err);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-10 relative overflow-hidden">
      {/* 🌤️ RICH LIGHT ATMOSPHERIC BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic gradient orbs - shift color based on mode */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: isLoginView ? 1.1 : 0.9,
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[150px]"
          style={{
            background: isLoginView
              ? "radial-gradient(circle, rgba(127, 255, 199, 0.35) 0%, rgba(31, 143, 74, 0.15) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(8, 145, 178, 0.12) 50%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            x: [0, -35, 0],
            y: [0, 40, 0],
            scale: isLoginView ? 0.9 : 1.1,
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[130px]"
          style={{
            background: isLoginView
              ? "radial-gradient(circle, rgba(8, 145, 178, 0.2) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(127, 255, 199, 0.3) 0%, rgba(31, 143, 74, 0.12) 50%, transparent 70%)",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(31, 143, 74, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(31, 143, 74, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            maskImage:
              "radial-gradient(ellipse 70% 50% at 50% 50%, black 20%, transparent 70%)",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="auth-stage"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[1100px] h-[650px] flex overflow-hidden z-10 glass-panel-premium"
        >
          {/* 🎨 SLIDING ACCENT PANEL (Color distinction) */}
          <motion.div
            animate={{ x: isLoginView ? (BOX_WIDTH - PANEL_WIDTH) * -1 : 0 }}
            transition={syncSpring}
            className="absolute top-0 right-0 w-[450px] h-full z-20 flex flex-col items-center justify-center p-16 text-center overflow-hidden"
            style={{
              background: isLoginView
                ? "linear-gradient(160deg, rgba(31, 143, 74, 0.08) 0%, rgba(127, 255, 199, 0.05) 50%, rgba(255, 255, 255, 0.95) 100%)"
                : "linear-gradient(160deg, rgba(8, 145, 178, 0.08) 0%, rgba(34, 211, 238, 0.05) 50%, rgba(255, 255, 255, 0.95) 100%)",
              borderLeft: `1px solid ${
                isLoginView
                  ? "rgba(31, 143, 74, 0.15)"
                  : "rgba(8, 145, 178, 0.15)"
              }`,
            }}
          >
            {/* Animated glow */}
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-72 h-72 rounded-full blur-[100px]"
              style={{
                background: isLoginView
                  ? "rgba(127, 255, 199, 0.3)"
                  : "rgba(34, 211, 238, 0.25)",
              }}
            />

            <div className="relative z-10">
              {/* Icon with glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 30px ${activeColors.glow}`,
                    `0 0 50px ${activeColors.glow}`,
                    `0 0 30px ${activeColors.glow}`,
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-8 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto backdrop-blur-xl"
                style={{
                  backgroundImage: `linear-gradient(145deg, ${activeColors.glow}, rgba(255, 255, 255, 0.8))`,
                  border: `2px solid ${activeColors.borderHigh}`,
                }}
              >
                {isLoginView ? (
                  <ShieldCheck
                    style={{ color: loginColors.accent }}
                    size={42}
                    strokeWidth={1.5}
                  />
                ) : (
                  <UserPlus
                    style={{ color: registerColors.accent }}
                    size={42}
                    strokeWidth={1.5}
                  />
                )}
              </motion.div>

              <h1
                className="text-5xl font-black tracking-tighter uppercase mb-4 py-2 pr-4 bg-clip-text text-transparent"
                style={{
                  backgroundImage: activeColors.gradient,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  display: "inline-block",
                  fontFamily: "var(--font-montserrat)",
                }}
              >
                {isLoginView ? "Login" : "Register"}
              </h1>
              <p className="text-[#3D5A50] text-sm font-medium leading-relaxed max-w-[260px] mx-auto">
                {isLoginView
                  ? "Login ke ekosistem digital Inkowapi. Diperlukan verifikasi identitas resmi."
                  : "Dengan mendaftar, Anda menyetujui Kebijakan Privasi kami"}
              </p>
            </div>
          </motion.div>

          {/* 📝 FORM AREA */}
          <div className="relative flex-1 flex h-full bg-white/30">
            {/* REGISTER FORM */}
            <div
              className="absolute left-0 top-0 w-[650px] h-full flex items-center justify-center p-20 transition-opacity duration-300"
              style={{
                opacity: isLoginView ? 0 : 1,
                pointerEvents: isLoginView ? "none" : "auto",
              }}
            >
              <motion.div className="w-full max-w-sm space-y-8">
                <div>
                  <h2
                    className="text-3xl font-black tracking-tight mb-2 py-1 pr-2 bg-clip-text text-transparent"
                    style={{
                      backgroundImage: registerColors.gradient,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      display: "inline-block",
                      fontFamily: "var(--font-montserrat)",
                    }}
                  >
                    Create an Account
                  </h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="input-premium w-full text-xs font-bold tracking-widest"
                    style={{ borderColor: registerColors.borderLow }}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Email"
                    className="input-premium w-full text-xs font-bold tracking-widest"
                    style={{ borderColor: registerColors.borderLow }}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="input-premium w-full pr-12 text-xs font-bold tracking-widest"
                      style={{ borderColor: registerColors.borderLow }}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "#7A9990" }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-tighter ml-1 mt-1 transition-colors ${
                      regPassword.length > 0 && regPassword.length < 6
                        ? "text-red-500"
                        : "text-[#7A9990]"
                    }`}
                  >
                    {regPassword.length > 0 && regPassword.length < 6
                      ? "Security Breach: Passcode too short"
                      : "Minimum 6 characters required"}
                  </p>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] text-white flex items-center justify-center gap-3 transition-all ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  style={{
                    background: registerColors.gradient,
                    boxShadow: `0 0 30px ${registerColors.glow}, 0 15px 30px -10px rgba(8, 145, 178, 0.3)`,
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {isLoading ? "Processing..." : "Register"}
                </button>
                <div className="text-center">
                  <button
                    onClick={() => setIsLoginView(true)}
                    className="text-[10px] uppercase tracking-widest transition-colors font-bold"
                    style={{ color: "#7A9990" }}
                  >
                    Already have an account?{" "}
                    <span style={{ color: loginColors.accent }}>
                      Login Here
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* LOGIN FORM */}
            <div
              className="absolute right-0 top-0 w-[650px] h-full flex items-center justify-center p-20 transition-opacity duration-300"
              style={{
                opacity: isLoginView ? 1 : 0,
                pointerEvents: isLoginView ? "auto" : "none",
              }}
            >
              <motion.div className="w-full max-w-sm space-y-8">
                <div>
                  <h2
                    className="text-3xl font-black tracking-tight mb-2 py-1 pr-2 bg-clip-text text-transparent"
                    style={{
                      backgroundImage: loginColors.gradient,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      display: "inline-block",
                      fontFamily: "var(--font-montserrat)",
                    }}
                  >
                    Welcome Back
                  </h2>
                  <p className="text-[#7A9990] text-xs uppercase tracking-widest">
                    Enter Email and Password to Continue
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Email"
                    className="input-premium w-full text-xs font-bold tracking-widest"
                    style={{ borderColor: loginColors.borderLow }}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="input-premium w-full text-xs font-bold tracking-widest"
                    style={{ borderColor: loginColors.borderLow }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`btn-primary w-full flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Zap size={16} />
                  )}
                  {isLoading ? "Verifying..." : "Login"}
                </button>
                <div className="text-center">
                  <button
                    onClick={() => setIsLoginView(false)}
                    className="text-[10px] uppercase tracking-widest transition-colors font-bold"
                    style={{ color: "#7A9990" }}
                  >
                    Don't have an account?{" "}
                    <span style={{ color: registerColors.accent }}>
                      Register Here
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* 🔄 FUTURISTIC MODE SWITCHER */}
          <motion.button
            animate={{
              x: isLoginView ? -200 : 0,
              rotateY: isLoginView ? 0 : 180,
            }}
            transition={{
              ...syncSpring,
              rotateY: { duration: 0.6, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLoginView(!isLoginView)}
            className="absolute top-1/2 z-50 w-20 h-20 flex items-center justify-center cursor-pointer overflow-hidden rounded-full"
            style={{
              right: 410,
              marginTop: -40,
              background: activeColors.gradient,
              boxShadow: `0 0 40px ${activeColors.glow}, 0 15px 35px -5px rgba(0, 0, 0, 0.2)`,
              border: "3px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <div>
              <Image
                src="/images/switcher-icon.png"
                alt="Switch Mode"
                width={80}
                height={80}
                className="drop-shadow-lg"
              />
            </div>
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
