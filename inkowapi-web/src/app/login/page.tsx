"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import {
  ArrowLeftRight,
  ScanFace,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
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

    try {
      const { data, error } = await authClient.signUp.email({
        email: formatEmail(regEmail),
        password: regPassword,
        name: regName,
      });

      if (error) {
        console.error("Auth Error Code:", error.code);
        console.error("Auth Error Message:", error.message);
        console.error("Full Error Object:", JSON.stringify(error, null, 2));

        alert(error.message || "Credential Check Failed");
        return;
      }

      if (data) {
        setIsEmailSent(true);
        setLoginEmail(regEmail);
        setRegPassword("");
      }
    } catch (err) {
      console.error("Fatal Connection Error:", err);
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: formatEmail(loginEmail),
        password: loginPassword,
      });

      if (error) {
        console.error("Login Error:", error.code);

        if (error.code === "EMAIL_NOT_VERIFIED") {
          alert(
            "ACCESS DENIED: Your email has not been verified. Please check your inbox for the activation link."
          );
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
    }
  };

  const handleResendVerification = async () => {
    console.log("PROTOCOL_RE_DISPATCH_INITIATED");
    try {
      const { data, error } = await authClient.sendVerificationEmail({
        email: formatEmail(regEmail),
        callbackURL: "/dashboard",
      });

      if (error) {
        console.error("DEBUG_RESEND_FAIL:", error);
        alert(`System Error: ${error.code}`);
        return;
      }

      alert("RE-DISPATCHED: Check " + regEmail);
    } catch (err) {
      console.error("FATAL_SYSTEM_CRASH:", err);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-10 relative overflow-hidden bg-[#030405]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1FBF8F]/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00C2FF]/10 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="auth-stage"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)", y: -20 }}
          className="relative w-[1100px] h-[650px] flex overflow-hidden z-10 glass-panel-premium shadow-2xl"
        >
          <motion.div
            animate={{ x: isLoginView ? (BOX_WIDTH - PANEL_WIDTH) * -1 : 0 }}
            transition={syncSpring}
            className="absolute top-0 right-0 w-[450px] h-full z-20 flex flex-col items-center justify-center p-16 text-center border-l border-white/10 bg-[#0A0C10]/40 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div
              className={`absolute w-64 h-64 rounded-full blur-[80px] opacity-20 transition-colors duration-700 ${
                isLoginView ? "bg-[#1FBF8F]" : "bg-[#00C2FF]"
              }`}
            />
            <div className="relative z-10">
              <div className="mb-8 w-20 h-20 bg-[#030405] rounded-[28px] flex items-center justify-center mx-auto border border-white/10 shadow-lg">
                {isLoginView ? (
                  <Zap className="text-[#1FBF8F]" size={32} />
                ) : (
                  <ScanFace className="text-white" size={32} />
                )}
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-4">
                {isLoginView ? "Access" : "Register"}
              </h1>
              <p className="text-[#64748B] text-xs font-medium leading-relaxed max-w-[240px] mx-auto">
                {isLoginView
                  ? "Verified personnel identity check required."
                  : "Initialize your secure financial sequence."}
              </p>
            </div>
          </motion.div>

          <div className="relative flex-1 flex h-full">
            <div
              className="absolute left-0 top-0 w-[650px] h-full flex items-center justify-center p-20 transition-opacity duration-300"
              style={{
                opacity: isLoginView ? 0 : 1,
                pointerEvents: isLoginView ? "none" : "auto",
              }}
            >
              <motion.div className="w-full max-w-sm space-y-8">
                <h2 className="text-3xl font-black text-white italic tracking-tight">
                  Register Here
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="FULL NAME"
                    className="input-premium w-full text-xs font-bold tracking-widest"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="EMAIL / USERNAME"
                    className="input-premium w-full text-xs font-bold tracking-widest"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="CREATE PASSCODE"
                      className="input-premium w-full pr-12 text-xs font-bold tracking-widest"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1FBF8F]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {/* Dynamic Security Helper Text */}
                  <p
                    className={`text-[9px] font-bold uppercase tracking-tighter ml-1 mt-1 transition-colors ${
                      regPassword.length > 0 && regPassword.length < 6
                        ? "text-red-500"
                        : "text-white/20"
                    }`}
                  >
                    {regPassword.length > 0 && regPassword.length < 6
                      ? "Security Breach: Passcode too short"
                      : "Minimum 6 characters required for security protocol"}
                  </p>
                </div>
                <button
                  onClick={handleRegister}
                  className="btn-primary w-full flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                >
                  <Sparkles size={16} /> Establish Identity
                </button>
                <div className="text-center">
                  <button
                    onClick={() => setIsLoginView(true)}
                    className="text-[10px] text-white/40 hover:text-[#00C2FF] uppercase tracking-widest transition-colors font-bold"
                  >
                    Already have an account? Login Here
                  </button>
                </div>
              </motion.div>
            </div>
            <div
              className="absolute right-0 top-0 w-[650px] h-full flex items-center justify-center p-20 transition-opacity duration-300"
              style={{
                opacity: isLoginView ? 1 : 0,
                pointerEvents: isLoginView ? "auto" : "none",
              }}
            >
              <motion.div className="w-full max-w-sm space-y-8">
                <h2 className="text-3xl font-black text-white italic tracking-tight">
                  System_Login
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="ACCESS ID / USERNAME"
                    className="input-premium w-full text-xs font-bold tracking-widest"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="PASSCODE"
                    className="input-premium w-full text-xs font-bold tracking-widest"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleLogin}
                  className="btn-primary w-full flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                >
                  <Zap size={16} className="text-white" /> Verify Access
                </button>
                <div className="text-center">
                  <button
                    onClick={() => setIsLoginView(false)}
                    className="text-[10px] text-white/40 hover:text-[#1FBF8F] uppercase tracking-widest transition-colors font-bold"
                  >
                    Don't have an account? Register Here
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.button
            animate={{
              x: isLoginView ? -200 : 0,
              borderColor: isLoginView ? "#1FBF8F" : "#00C2FF",
            }}
            transition={syncSpring}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLoginView(!isLoginView)}
            className="absolute top-1/2 z-50 w-20 h-20 bg-[#030405] rounded-full flex items-center justify-center border-4 shadow-[0_0_30px_-5px_rgba(0,0,0,0.8)] cursor-pointer overflow-hidden"
            style={{ right: 410, marginTop: -40 }}
          >
            <motion.div
              animate={{
                backgroundColor: isLoginView ? "#1FBF8F" : "#00C2FF",
                opacity: 0.1,
              }}
              className="absolute inset-0 z-0"
            />
            <motion.div
              animate={{
                rotate: isLoginView ? 180 : 0,
                color: isLoginView ? "#1FBF8F" : "#00C2FF",
              }}
              transition={{ duration: 0.4 }}
              className="relative z-10"
            >
              <ArrowLeftRight size={28} strokeWidth={2.5} />
            </motion.div>
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
