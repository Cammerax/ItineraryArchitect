import FlightFinder from "@/components/FlightFinder";
import { Plane, AlertTriangle } from "lucide-react";

export default function FlightsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Plane className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Flight Finder</h1>
            <p className="text-stone-500 text-sm">Find flights from your nearest airport to your destination</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <strong>Important:</strong> Flight results shown are estimates for planning purposes only.
          The Itinerary Architect does not sell flights or make bookings. Always check directly with airlines
          or a booking platform (Google Flights, Kayak, etc.) for accurate pricing and availability.
          We are not a travel agency.
        </div>
      </div>

      <FlightFinder />
    </div>
  );
}
