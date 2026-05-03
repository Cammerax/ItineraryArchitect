import Link from "next/link";
import { AlertTriangle, Map, BookOpen, Plane, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-3">
              <span className="text-sage-300">The Itinerary</span>{" "}
              <span className="text-blush-300">Architect</span>
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Expertly curated travel itineraries designed to help you make the most of every destination.
              From iconic landmarks to hidden gems — we plan, you explore.
            </p>
            <div className="bg-sage-900/40 border border-sage-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-sage-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-sage-200">
                  <strong>Disclaimer:</strong> The Itinerary Architect is not a travel agency. We provide planning guides only.
                  No bookings, reservations, or travel arrangements are made on your behalf. All bookings must be made independently.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/explore" className="hover:text-sage-400 transition-colors flex items-center gap-1.5"><Map className="h-3.5 w-3.5" />Interactive Map</Link></li>
              <li><Link href="/itineraries" className="hover:text-sage-400 transition-colors flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />All Itineraries</Link></li>
              <li><Link href="/flights" className="hover:text-sage-400 transition-colors flex items-center gap-1.5"><Plane className="h-3.5 w-3.5" />Flight Finder</Link></li>
              <li><Link href="/request" className="hover:text-sage-400 transition-colors flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Custom Trip</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-sage-400 transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-sage-400 transition-colors">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-sage-400 transition-colors">My Itineraries</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-500">
          <p>&copy; {new Date().getFullYear()} The Itinerary Architect. All rights reserved.</p>
          <p>Not a travel agency. For planning purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
