"use client";
import { motion } from "framer-motion";
import {
  Activity,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header className="flex justify-between items-center mb-8 hidden md:flex">
        <div>
          <h1
            className="text-3xl font-black uppercase tracking-wide py-1 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #34D399 0%, #047857 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              display: "inline-block",
              fontFamily: "var(--font-montserrat)",
            }}
          >
            Overview
          </h1>
          <p className="text-[var(--green-primary)] font-medium uppercase text-[10px] tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-primary)] animate-pulse" />
            Ringkasan Aktivitas
          </p>
        </div>
        <div className="flex gap-4"></div>
      </header>

      <div className="md:hidden mb-8">
        <h1
          className="text-3xl font-black uppercase tracking-wide py-1 bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(135deg, #1F8F4A, #27B36A)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            display: "inline-block",
            fontFamily: "var(--font-montserrat)",
          }}
        >
          Overview
        </h1>
        <p className="text-[var(--green-primary)] font-medium uppercase text-[10px] tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-primary)] animate-pulse" />
          System Status: Operational
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            title: "Total Revenue",
            value: "Rp 705.617.484",
            change: "+20.1%",
            icon: DollarSign,
          },
          {
            title: "Active Users",
            value: "2,350",
            change: "+15.2%",
            icon: Users,
          },
          {
            title: "Transactions",
            value: "12,234",
            change: "+12.5%",
            icon: CreditCard,
          },
          {
            title: "Growth Rate",
            value: "24.5%",
            change: "+4.3%",
            icon: TrendingUp,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="p-6 glass-panel card-hover-effect group cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-[var(--ink-bg-fog)] text-[var(--text-secondary)] group-hover:text-[var(--green-primary)] transition-colors">
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-[var(--green-primary)] bg-[rgba(31,191,143,0.1)] px-2.5 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
              <Activity className="text-[var(--green-primary)]" size={20} />
              Transaction Activity
            </h3>
            <select className="bg-[var(--ink-bg-fog)] border border-[var(--glass-border)] text-[var(--text-secondary)] text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-[var(--accent-cyan)] transition-colors">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-white/40 rounded-2xl border border-[var(--glass-border)] text-[var(--text-muted)] text-sm font-medium">
            Chart Visualization Area
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-8"
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-6">
            Recent Transfers
          </h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-[var(--ink-bg-fog)] transition-colors -mx-2"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--ink-bg-fog)] flex items-center justify-center text-[var(--text-primary)] font-bold text-xs group-hover:bg-[rgba(31,191,143,0.1)] group-hover:text-[var(--green-primary)] transition-colors">
                  JD
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    John Doe
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Outgoing Transfer
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  -Rp 19.500.000
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
