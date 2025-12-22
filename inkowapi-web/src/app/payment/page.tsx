'use client'
import { motion } from 'framer-motion'
import { CreditCard, Copy, Info } from 'lucide-react'

export default function PaymentPage() {
  return (
    <div className="w-full min-h-screen p-6 md:p-12 space-y-8 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-black uppercase tracking-wide py-1 bg-clip-text text-transparent"
          style={{
            backgroundImage: 'var(--ink-gradient-emerald)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            display: 'inline-block',
            fontFamily: 'var(--font-montserrat)',
          }}
        >
          Payment Method
        </h1>
        <p className="text-[var(--text-muted)] font-medium text-sm">
          Complete your registration to activate financial protocols.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl glass-panel p-6 md:p-8 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(31,191,143,0.05)] rounded-full blur-[80px]" />

        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--green-primary)] animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--green-primary)] uppercase">
                  Registration Fee
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
                Rp 150.000
              </h2>
            </div>
            <div className="w-14 h-14 rounded-xl bg-[var(--ink-bg-fog)] backdrop-blur-md flex items-center justify-center border border-[var(--glass-border)]">
              <CreditCard className="text-[var(--text-secondary)]" size={24} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase gap-2">
              <span>Virtual Account Number (Bank Mandiri)</span>
              <span className="text-[var(--accent-cyan)]">Expires in 23:59:59</span>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white/40 rounded-xl p-4 md:p-5 flex items-center justify-center border border-[var(--glass-border)] overflow-hidden">
                <code className="text-lg md:text-xl font-mono font-bold tracking-widest text-[var(--text-primary)] truncate">
                  8801 0821 3456 7890
                </code>
              </div>
              <button className="w-14 rounded-xl bg-[var(--ink-bg-fog)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.1)] transition-colors group/btn shrink-0">
                <Copy size={18} className="group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-[var(--ink-bg-fog)] p-5 rounded-xl flex gap-4 items-start border border-[var(--glass-border)]">
            <div className="w-6 h-6 rounded-full bg-[rgba(0,194,255,0.1)] flex items-center justify-center shrink-0 mt-0.5">
              <Info size={12} className="text-[var(--accent-cyan)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-xs mb-1 uppercase tracking-wide">
                Automatic Verification
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Please complete payment within 24 hours. Once confirmed, your{' '}
                <span className="font-bold text-[var(--green-primary)]">Future_Vault</span> access
                will be automatically provisioned.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
        {['ATM Transfer', 'Mobile Banking', 'Internet Banking'].map((method) => (
          <button
            key={method}
            className="flex-1 py-3.5 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--green-primary)] hover:text-[var(--green-primary)] hover:bg-[rgba(31,191,143,0.05)] text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            {method}
          </button>
        ))}
      </div>
    </div>
  )
}
