"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, UserPlus, CreditCard, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Register", icon: UserPlus, path: "/register" },
  { name: "Payment", icon: CreditCard, path: "/payment" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[var(--bg-panel)] border-r border-[var(--glass-border)] p-8 flex flex-col z-50">
      <div className="mb-12 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--green-primary)] to-[#0E3B2E] flex items-center justify-center shadow-lg shadow-[rgba(31,191,143,0.2)]">
          <span className="text-white font-bold text-lg">I</span>
        </div>
        <div>
          <p className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase">
            Welcome back,
          </p>
          <h1 className="text-sm font-bold tracking-tight text-white uppercase truncate max-w-[150px]">
            {session?.user?.name || "..."}
          </h1>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? "bg-[rgba(31,191,143,0.1)] text-[var(--green-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-[var(--green-primary)] rounded-r-full"
                  />
                )}

                <item.icon
                  size={20}
                  className={
                    isActive
                      ? "text-[var(--green-primary)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                  }
                />
                <span className="font-medium text-sm tracking-wide">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-[var(--glass-border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-muted)] hover:text-[#EF4444] transition-colors group rounded-xl hover:bg-[rgba(239,68,68,0.05)]"
        >
          <LogOut
            size={18}
            className="group-hover:text-[#EF4444] transition-colors"
          />
          <span className="font-medium text-sm">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
}
