"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, MapPin, Tag, MessageSquare,
  ShoppingBag, Globe2, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/itineraries", label: "Itineraries", icon: BookOpen },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/requests", label: "Custom Requests", icon: MessageSquare },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-stone-900 text-white flex flex-col hidden md:flex">
      <div className="p-6 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Globe2 className="h-6 w-6 text-amber-400" />
          <div>
            <p className="font-bold text-sm">Itinerary Architect</p>
            <p className="text-xs text-stone-400">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-amber-600 text-white"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-800">
        <Link href="/" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
          ← Back to website
        </Link>
      </div>
    </aside>
  );
}
