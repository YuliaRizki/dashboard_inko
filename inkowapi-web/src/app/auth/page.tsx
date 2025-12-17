"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

export default function LivelierAuth() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <div className="relative w-[950px] h-[580px] glass-panel-premium overflow-hidden flex">
        <motion.div
          animate={{ x: isLogin ? 550 : 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 22 }}
          className="absolute top-0 left-0 w-[400px] h-full z-20 flex flex-col items-center justify-center p-12 text-center border-x border-[#E3ECE8]/50 overflow-hidden"
        >
          <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${isLogin ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
          
          <motion.h2 
            animate={{ color: isLogin ? "#0E3B2E" : "#1FBF8F" }}
            className="text-6xl font-black italic tracking-tighter mb-4 relative z-10"
          >
            {isLogin ? "ACCESS" : "PROTOCOL"}
          </motion.h2>
          <div className="w-16 h-1.5 bg-gradient-to-r from-[#1FBF8F] to-[#00C2FF] mb-8 rounded-full relative z-10 shadow-sm" />
          <p className="text-[#64748B] text-xs font-bold leading-relaxed max-w-[220px] relative z-10 tracking-wide uppercase">
            {isLogin ? "Personnel identity verification" : "Initialize your digital footprint"}
          </p>
        </motion.div>

        <div className="relative w-full h-full z-10">
          <div className={`absolute top-0 left-[400px] w-[550px] h-full flex items-center justify-center p-16 transition-all duration-700 ${isLogin ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'}`}>
            <div className="w-full max-w-sm space-y-10">
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-[#0E3B2E] tracking-tight italic">Register</h3>
                <div className="h-1 w-12 bg-[#1FBF8F] rounded-full" />
              </div>
              <div className="space-y-6">
                <div className="group">
                  <p className="text-[10px] font-bold text-[#1FBF8F] mb-2 tracking-widest uppercase">Identity Name</p>
                  <input type="text" placeholder="BUDI SANTOSO" className="w-full bg-[#F8FAFB] border border-[#E3ECE8] rounded-xl px-4 py-4 focus:border-[#1FBF8F] focus:ring-4 focus:ring-[#1FBF8F]/5 transition-all outline-none font-bold text-[#0E3B2E]" />
                </div>
                <div className="group">
                  <p className="text-[10px] font-bold text-[#64748B] group-focus-within:text-[#00C2FF] mb-2 tracking-widest uppercase transition-colors">Digital Comms</p>
                  <input type="email" placeholder="BUDI@INKOWAPI.COM" className="w-full bg-[#F8FAFB] border border-[#E3ECE8] rounded-xl px-4 py-4 focus:border-[#00C2FF] focus:ring-4 focus:ring-[#00C2FF]/5 transition-all outline-none font-bold text-[#0E3B2E]" />
                </div>
              </div>
              <button className="w-full py-5 btn-vibrant rounded-2xl italic">Establish_Identity</button>
            </div>
          </div>
        </div>

        <motion.button
          animate={{ x: isLogin ? 550 : 400 }}
          transition={{ type: "spring", stiffness: 100, damping: 22 }}
          onClick={() => setIsLogin(!isLogin)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#1FBF8F] shadow-xl border border-[#E3ECE8] cursor-pointer hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowLeftRight size={24} strokeWidth={3} className="text-emerald-500" />
        </motion.button>
      </div>
    </div>
  );
}