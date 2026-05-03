"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Loader2, MapPin, Clock, DollarSign, Moon, Sun, CalendarDays } from "lucide-react";
import { MAJOR_AIRPORTS } from "@/lib/airports";
import { formatPrice } from "@/lib/utils";

interface FlightResult {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  stops: number;
  type: "day-before" | "red-eye" | "morning-of";
  departureDate: string;
  arrivalDate: string;
  originAirport: { code: string; name: string; city: string; distance: number };
}

interface Results {
  nearestAirports: { code: string; name: string; city: string; distance: number }[];
  destAirport: { code: string; name: string; city: string };
  flights: FlightResult[];
}

const DEST_AIRPORTS = MAJOR_AIRPORTS.filter((a) =>
  ["JFK", "LAX", "ORD", "DFW", "LHR", "CDG", "NRT", "SYD", "GRU", "YYZ", "MEX", "BCN", "AMS", "DXB", "SIN", "ICN", "HKG"].includes(a.code)
);

export default function FlightFinder() {
  const [city, setCity] = useState("");
  const [destCode, setDestCode] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [includeRedEye, setIncludeRedEye] = useState(true);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [activeType, setActiveType] = useState<"all" | "day-before" | "red-eye">("all");

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setCity(data.address?.city || data.address?.town || data.address?.county || "Your location");
        } catch {
          setCity("Your location");
        }
        setGeoLoading(false);
      },
      () => {
        setError("Unable to detect location. Please enter your city manually.");
        setGeoLoading(false);
      }
    );
  };

  const geocodeCity = async (cityName: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
    );
    const data = await res.json();
    if (data.length === 0) throw new Error("City not found");
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  };

  const handleSearch = async () => {
    if (!city || !destCode || !tripDate) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);

    try {
      let c = coords;
      if (!c) {
        c = await geocodeCity(city);
        setCoords(c);
      }

      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originLat: c.lat,
          originLon: c.lon,
          destCode,
          tripStartDate: tripDate,
          includeRedEye,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFlights = results?.flights.filter((f) =>
    activeType === "all" ? true : f.type === activeType
  ) ?? [];

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="city">Your Location</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setCoords(null); }}
                  placeholder="Enter your city"
                />
                <Button variant="outline" size="icon" onClick={detectLocation} disabled={geoLoading} title="Detect location">
                  {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label>Destination Airport</Label>
              <Select value={destCode} onValueChange={setDestCode}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {DEST_AIRPORTS.map((a) => (
                    <SelectItem key={a.code} value={a.code}>
                      {a.city} ({a.code}) — {a.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tripDate">Trip Start Date</Label>
              <Input id="tripDate" type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="mt-1" />
            </div>

            <div className="flex flex-col justify-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plane className="h-4 w-4" />}
                {loading ? "Searching..." : "Find Flights"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIncludeRedEye(!includeRedEye)}
                className={`w-8 h-4 rounded-full transition-colors ${includeRedEye ? "bg-sage-500" : "bg-stone-300"} relative`}
              >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${includeRedEye ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-stone-600">Include red-eye / morning-of flights</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-stone-900">
                Flights to {results.destAirport.city} ({results.destAirport.code})
              </h2>
              <p className="text-sm text-stone-500">
                Showing options from your nearest airports · Estimates only — verify with airlines
              </p>
            </div>
            <div className="flex gap-2">
              {(["all", "day-before", "red-eye"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    activeType === type ? "bg-sage-600 text-white border-sage-600" : "text-stone-600 border-stone-300 hover:border-sage-400"
                  }`}
                >
                  {type === "all" ? "All Options" : type === "day-before" ? "Day Before" : "Red-Eye"}
                </button>
              ))}
            </div>
          </div>

          {/* Nearest airports info */}
          <div className="grid sm:grid-cols-3 gap-3">
            {results.nearestAirports.map((ap) => (
              <div key={ap.code} className="bg-white rounded-lg border border-stone-200 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-sage-700">{ap.code}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{ap.city}</p>
                  <p className="text-xs text-stone-400">{ap.distance} mi away</p>
                </div>
              </div>
            ))}
          </div>

          {/* Flight cards */}
          <div className="space-y-3">
            {filteredFlights.map((flight, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-20">
                        <p className="text-lg font-bold text-stone-900">{flight.departure}</p>
                        <p className="text-xs text-stone-500">{flight.departureDate}</p>
                        <p className="text-xs font-medium text-sage-700">{flight.originAirport.code}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-stone-400">{flight.duration}</p>
                        <div className="flex items-center gap-1 my-1">
                          <div className="w-6 h-px bg-stone-300" />
                          <Plane className="h-3 w-3 text-sage-500" />
                          <div className="w-6 h-px bg-stone-300" />
                        </div>
                        <p className="text-xs text-stone-400">{flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}</p>
                      </div>
                      <div className="text-center w-20">
                        <p className="text-lg font-bold text-stone-900">{flight.arrival}</p>
                        <p className="text-xs text-stone-500">{flight.arrivalDate}</p>
                        <p className="text-xs font-medium text-sage-700">{results.destAirport.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-center">
                        <p className="text-sm text-stone-500">{flight.airline}</p>
                        <p className="text-xs text-stone-400">{flight.flightNumber}</p>
                      </div>
                      <Badge
                        variant={flight.type === "day-before" ? "outline" : "default"}
                        className={flight.type === "red-eye" ? "bg-slate-700 text-white" : ""}
                      >
                        {flight.type === "day-before" ? (
                          <><Sun className="h-3 w-3 mr-1" />Day Before</>
                        ) : (
                          <><Moon className="h-3 w-3 mr-1" />Red-Eye</>
                        )}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xl font-bold text-sage-700">{formatPrice(flight.price)}</p>
                        <p className="text-xs text-stone-400">est. per person</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-500 text-center">
            These are estimated prices for planning purposes only. The Itinerary Architect does not sell or book flights.
            Check Google Flights, Kayak, or airlines directly for real pricing.
          </div>
        </div>
      )}
    </div>
  );
}
