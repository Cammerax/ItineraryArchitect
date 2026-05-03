"use client";
import { useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { ChevronLeft, Globe2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const WORLD_GEO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const US_GEO = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface Location {
  id: string;
  name: string;
  slug: string;
  continent: string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  hasItinerary: boolean;
  mapCode?: string | null;
  parentId?: string | null;
  children?: Location[];
}

interface Props {
  locations: Location[];
  initialContinent?: string;
}

const CONTINENT_CENTERS: Record<string, { center: [number, number]; zoom: number; label: string }> = {
  "north-america": { center: [-100, 45], zoom: 2.5, label: "North America" },
  "south-america": { center: [-60, -15], zoom: 2.5, label: "South America" },
  "europe": { center: [15, 52], zoom: 4, label: "Europe" },
  "asia": { center: [90, 35], zoom: 2, label: "Asia" },
  "australia": { center: [134, -25], zoom: 3, label: "Australia & Oceania" },
};

const COUNTRY_ISO_MAP: Record<string, string> = {
  "840": "US", "124": "CA", "484": "MX", "076": "BR", "032": "AR", "152": "CL",
  "826": "GB", "250": "FR", "276": "DE", "380": "IT", "724": "ES", "528": "NL",
  "040": "AT", "756": "CH", "056": "BE", "620": "PT", "300": "GR", "348": "HU",
  "203": "CZ", "616": "PL", "578": "NO", "752": "SE", "208": "DK", "246": "FI",
  "643": "RU", "156": "CN", "392": "JP", "356": "IN", "410": "KR", "764": "TH",
  "702": "SG", "360": "ID", "608": "PH", "704": "VN", "458": "MY", "036": "AU",
  "554": "NZ",
};

const CONTINENT_COUNTRIES: Record<string, string[]> = {
  "north-america": ["840", "124", "484", "320", "188", "340", "222", "558", "591", "214", "332", "388", "192", "630", "052", "084", "659", "662", "670", "028", "044"],
  "south-america": ["076", "032", "152", "604", "170", "862", "600", "858", "328", "740", "218", "068"],
  "europe": ["826", "250", "276", "380", "724", "528", "040", "756", "056", "620", "300", "348", "203", "616", "578", "752", "208", "246", "643", "804", "100", "703", "705", "191", "070", "498", "642", "008", "807", "688", "020", "372", "352", "440", "428", "233", "112", "498"],
  "asia": ["156", "392", "356", "410", "764", "702", "360", "608", "704", "458", "050", "144", "524", "586", "004", "368", "364", "682", "784", "512", "400", "760", "422", "376", "792", "051", "031", "398", "860", "795", "762", "417", "496", "116", "418"],
  "australia": ["036", "554", "598", "242", "090", "548", "520", "516", "570", "585", "584"],
};

export default function InteractiveMap({ locations, initialContinent }: Props) {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(initialContinent || null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredGeo, setHoveredGeo] = useState<string | null>(null);
  const [showUSStates, setShowUSStates] = useState(false);

  const getLocationByMapCode = useCallback(
    (code: string) => locations.find((l) => l.mapCode === code),
    [locations]
  );

  const getCountriesInContinent = (continentKey: string) =>
    CONTINENT_COUNTRIES[continentKey] || [];

  const handleContinentClick = (continentKey: string) => {
    setSelectedContinent(continentKey);
    setSelectedCountry(null);
    setShowUSStates(false);
  };

  const handleCountryClick = (isoCode: string, countryName: string) => {
    if (isoCode === "US") {
      setShowUSStates(true);
      setSelectedCountry("US");
    } else {
      setSelectedCountry(isoCode);
    }
  };

  const handleStateClick = (stateName: string) => {
    const location = locations.find(
      (l) => l.state === stateName || l.name === stateName
    );
    if (location) {
      window.location.href = `/itineraries?location=${location.slug}`;
    }
  };

  const continentConfig = selectedContinent ? CONTINENT_CENTERS[selectedContinent] : null;

  const breadcrumb = [
    { label: "World", onClick: () => { setSelectedContinent(null); setSelectedCountry(null); setShowUSStates(false); } },
    ...(selectedContinent ? [{ label: CONTINENT_CENTERS[selectedContinent]?.label, onClick: () => { setSelectedCountry(null); setShowUSStates(false); } }] : []),
    ...(selectedCountry ? [{ label: selectedCountry === "US" ? "United States" : selectedCountry }] : []),
  ];

  const continentCountries = selectedContinent ? getCountriesInContinent(selectedContinent) : [];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-600">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronLeft className="h-3 w-3 rotate-180 text-stone-400" />}
            {b.onClick ? (
              <button onClick={b.onClick} className="hover:text-sage-700 font-medium transition-colors">
                {b.label}
              </button>
            ) : (
              <span className="text-stone-900 font-semibold">{b.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-stone-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded bg-sage-500" />
          <span>Itineraries available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded bg-stone-300" />
          <span>Not yet available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded bg-stone-100 border border-stone-300" />
          <span>Outside region</span>
        </div>
      </div>

      {/* Map */}
      {!selectedContinent ? (
        /* World map — continent selector */
        <div className="bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 p-6 gap-4">
            {Object.entries(CONTINENT_CENTERS).map(([key, { label }]) => {
              const count = locations.filter((l) => l.continent === key && l.hasItinerary).length;
              return (
                <button
                  key={key}
                  onClick={() => handleContinentClick(key)}
                  className="group bg-white rounded-xl border-2 border-stone-200 hover:border-sage-500 hover:shadow-lg p-5 text-center transition-all"
                >
                  <Globe2 className="h-10 w-10 text-sage-400 group-hover:text-sage-600 mx-auto mb-2 transition-colors" />
                  <p className="font-semibold text-stone-800 text-sm">{label}</p>
                  {count > 0 ? (
                    <Badge variant="success" className="mt-2 text-xs">{count} destination{count !== 1 ? "s" : ""}</Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-2 text-xs">Coming soon</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : showUSStates ? (
        /* US States map */
        <div className="bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
          <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
            <h3 className="font-semibold text-stone-800">United States — Select a State</h3>
            <Button variant="ghost" size="sm" onClick={() => { setShowUSStates(false); setSelectedCountry(null); }}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          </div>
          <div style={{ height: 500 }}>
            <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 900 }}>
              <Geographies geography={US_GEO}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateName = geo.properties.name;
                    const loc = locations.find((l) => l.state === stateName || l.name === stateName);
                    const hasIt = loc?.hasItinerary ?? false;
                    const isHovered = hoveredGeo === geo.rsmKey;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleStateClick(stateName)}
                        onMouseEnter={() => setHoveredGeo(geo.rsmKey)}
                        onMouseLeave={() => setHoveredGeo(null)}
                        style={{
                          default: {
                            fill: hasIt ? "#f59e0b" : "#d6d3d1",
                            stroke: "#fff",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: hasIt ? "#d97706" : "#a8a29e",
                            stroke: "#fff",
                            strokeWidth: 0.5,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
          {/* State grid fallback for accessibility */}
          <div className="p-4 border-t border-stone-200 bg-white">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-1">
              {locations
                .filter((l) => l.continent === "north-america" && l.country === "US" && l.state)
                .map((l) => (
                  <Link
                    key={l.id}
                    href={`/itineraries?location=${l.slug}`}
                    className={`text-xs text-center px-2 py-1.5 rounded font-medium transition-colors ${
                      l.hasItinerary
                        ? "bg-sage-100 text-sage-800 hover:bg-sage-200"
                        : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {l.state}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      ) : (
        /* Continent world map zoomed */
        <div className="bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
          <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
            <h3 className="font-semibold text-stone-800">
              {continentConfig?.label} — Select a Country
            </h3>
            <p className="text-xs text-stone-500">Click a country to explore available itineraries</p>
          </div>
          <div style={{ height: 500 }}>
            <ComposableMap
              projectionConfig={{
                center: continentConfig?.center,
                scale: 160 * (continentConfig?.zoom || 1),
              }}
            >
              <Geographies geography={WORLD_GEO}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const numId = geo.id as string;
                    const isoCode = COUNTRY_ISO_MAP[numId];
                    const isInContinent = continentCountries.includes(numId);
                    const loc = isoCode ? getLocationByMapCode(isoCode) : null;
                    const hasIt = loc?.hasItinerary ?? false;
                    const isHovered = hoveredGeo === geo.rsmKey;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          if (isInContinent && isoCode) {
                            handleCountryClick(isoCode, geo.properties.name);
                          }
                        }}
                        onMouseEnter={() => isInContinent && setHoveredGeo(geo.rsmKey)}
                        onMouseLeave={() => setHoveredGeo(null)}
                        style={{
                          default: {
                            fill: !isInContinent
                              ? "#e7e5e4"
                              : hasIt
                              ? "#f59e0b"
                              : "#d6d3d1",
                            stroke: "#fff",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: !isInContinent
                              ? "#e7e5e4"
                              : hasIt
                              ? "#d97706"
                              : "#a8a29e",
                            stroke: "#fff",
                            strokeWidth: 0.5,
                            outline: "none",
                            cursor: isInContinent ? "pointer" : "default",
                          },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          {/* Country list below map */}
          <div className="p-4 border-t border-stone-200 bg-white">
            <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
              Destinations in {continentConfig?.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {locations
                .filter((l) => l.continent === selectedContinent && !l.parentId)
                .map((l) => (
                  <Link
                    key={l.id}
                    href={l.hasItinerary ? `/itineraries?location=${l.slug}` : "#"}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                      l.hasItinerary
                        ? "border-sage-400 bg-sage-50 text-sage-800 hover:bg-sage-100"
                        : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                    }`}
                  >
                    {l.hasItinerary ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {l.name}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
