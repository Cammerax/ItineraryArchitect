"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Map, BookOpen, Plane, MessageSquare, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/explore", label: "Explore", icon: Map },
    { href: "/itineraries", label: "Itineraries", icon: BookOpen },
    { href: "/flights", label: "Flight Finder", icon: Plane },
    { href: "/request", label: "Custom Trip", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-sage-700">The Itinerary</span>{" "}
              <span className="text-blush-500">Architect</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-stone-600 hover:text-sage-700 hover:bg-sage-50 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                {(session.user as any).role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                    My Trips
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link href="/register"><Button size="sm" className="bg-blush-500 hover:bg-blush-600 text-white">Get Started</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-stone-600 hover:text-sage-700 hover:bg-sage-50"
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-stone-100 flex flex-col gap-1">
            {session ? (
              <>
                {(session.user as any).role === "admin" && (
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="h-4 w-4" />Admin Portal
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <User className="h-4 w-4" />My Trips
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { signOut(); setOpen(false); }}>
                  <LogOut className="h-4 w-4" />Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}><Button variant="ghost" size="sm" className="w-full">Sign In</Button></Link>
                <Link href="/register" onClick={() => setOpen(false)}><Button size="sm" className="w-full bg-blush-500 hover:bg-blush-600 text-white">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
