import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoltMark } from "@/components/BoltMark";

const NAV_ITEMS = [
  { label: "Overview",      href: "/dashboard",            icon: "◈" },
  { label: "API Keys",      href: "/dashboard/keys",       icon: "⌗" },
  { label: "Provider Keys", href: "/dashboard/providers",  icon: "⇄" },
  { label: "Analytics",     href: "/dashboard/analytics",  icon: "⌇" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="flex min-h-screen" style={{ background: "#0A0A0B" }}>
      {/* ── Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 border-r"
        style={{ borderColor: "#28282D", background: "#0A0A0B", position: "sticky", top: 0, height: "100vh" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "#28282D" }}>
          <Link href="/" className="flex items-center gap-2">
            <BoltMark size={18} color="#EDEAE1" />
            <span className="font-display" style={{ fontSize: "16px", fontWeight: 600 }}>
              <span style={{ color: "#E8A33D" }}>Volt</span>
              <span style={{ color: "#87868C" }}>Key</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV_ITEMS.map(({ label, href, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 font-mono text-muted hover:text-primary hover:bg-surface transition-colors duration-150"
              style={{ fontSize: "13px", borderRadius: "2px" }}
            >
              <span style={{ fontSize: "14px", opacity: 0.7 }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="p-4 border-t" style={{ borderColor: "#28282D" }}>
          <p
            className="font-mono text-muted truncate mb-3"
            style={{ fontSize: "11px", opacity: 0.6 }}
          >
            {user.email}
          </p>
          <form action="/auth/signout" method="post">
            <SignOutButton />
          </form>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

import { SignOutButton } from "@/components/SignOutButton";
