export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export const MAJOR_AIRPORTS: Airport[] = [
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", country: "US", lat: 33.6407, lon: -84.4277 },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "US", lat: 33.9425, lon: -118.4081 },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "US", lat: 41.9742, lon: -87.9073 },
  { code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "US", lat: 32.8998, lon: -97.0403 },
  { code: "DEN", name: "Denver International", city: "Denver", country: "US", lat: 39.8561, lon: -104.6737 },
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "US", lat: 40.6413, lon: -73.7781 },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "US", lat: 37.6213, lon: -122.379 },
  { code: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "US", lat: 47.4502, lon: -122.3088 },
  { code: "LAS", name: "Harry Reid International", city: "Las Vegas", country: "US", lat: 36.0840, lon: -115.1537 },
  { code: "MCO", name: "Orlando International", city: "Orlando", country: "US", lat: 28.4312, lon: -81.3081 },
  { code: "MIA", name: "Miami International", city: "Miami", country: "US", lat: 25.7959, lon: -80.2870 },
  { code: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix", country: "US", lat: 33.4373, lon: -112.0078 },
  { code: "BOS", name: "Logan International", city: "Boston", country: "US", lat: 42.3656, lon: -71.0096 },
  { code: "MSP", name: "Minneapolis-Saint Paul International", city: "Minneapolis", country: "US", lat: 44.8848, lon: -93.2223 },
  { code: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit", country: "US", lat: 42.2162, lon: -83.3554 },
  { code: "LHR", name: "London Heathrow", city: "London", country: "UK", lat: 51.4700, lon: -0.4543 },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "FR", lat: 49.0097, lon: 2.5479 },
  { code: "NRT", name: "Narita International", city: "Tokyo", country: "JP", lat: 35.7720, lon: 140.3929 },
  { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "AU", lat: -33.9399, lon: 151.1753 },
  { code: "GRU", name: "São Paulo/Guarulhos International", city: "São Paulo", country: "BR", lat: -23.4356, lon: -46.4731 },
  { code: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "CA", lat: 43.6777, lon: -79.6248 },
  { code: "MEX", name: "Mexico City International", city: "Mexico City", country: "MX", lat: 19.4363, lon: -99.0721 },
  { code: "BCN", name: "Barcelona-El Prat", city: "Barcelona", country: "ES", lat: 41.2974, lon: 2.0833 },
  { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "NL", lat: 52.3086, lon: 4.7639 },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "AE", lat: 25.2532, lon: 55.3657 },
  { code: "SIN", name: "Singapore Changi", city: "Singapore", country: "SG", lat: 1.3644, lon: 103.9915 },
  { code: "ICN", name: "Incheon International", city: "Seoul", country: "KR", lat: 37.4602, lon: 126.4407 },
  { code: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "HK", lat: 22.3080, lon: 113.9185 },
];

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestAirports(lat: number, lon: number, count = 3): (Airport & { distance: number })[] {
  return MAJOR_AIRPORTS.map((a) => ({
    ...a,
    distance: Math.round(haversineDistance(lat, lon, a.lat, a.lon)),
  }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

export interface FlightOption {
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
}

const AIRLINES = ["Delta", "United", "American", "Southwest", "JetBlue", "Alaska", "Spirit", "Frontier"];

export function generateFlights(
  originCode: string,
  destCode: string,
  tripStartDate: string,
  includeRedEye: boolean
): FlightOption[] {
  const start = new Date(tripStartDate);
  const dayBefore = new Date(start);
  dayBefore.setDate(dayBefore.getDate() - 1);

  const dayBeforeStr = dayBefore.toISOString().split("T")[0];
  const startStr = start.toISOString().split("T")[0];

  const seed = originCode.charCodeAt(0) + destCode.charCodeAt(0);
  const flights: FlightOption[] = [];

  // Day-before flights
  for (let i = 0; i < 3; i++) {
    const hour = 7 + (i * 4) + (seed % 3);
    const price = 180 + (seed * 3 + i * 47) % 320;
    const duration = 90 + (seed + i * 30) % 240;
    const dh = Math.floor(duration / 60);
    const dm = duration % 60;
    const arrHour = (hour + dh) % 24;
    const arrMin = dm;
    flights.push({
      airline: AIRLINES[(seed + i) % AIRLINES.length],
      flightNumber: `${AIRLINES[(seed + i) % AIRLINES.length].substring(0, 2).toUpperCase()}${1000 + seed + i * 7}`,
      departure: `${hour.toString().padStart(2, "0")}:${(i * 15).toString().padStart(2, "0")}`,
      arrival: `${arrHour.toString().padStart(2, "0")}:${arrMin.toString().padStart(2, "0")}`,
      duration: `${dh}h ${dm}m`,
      price,
      stops: i === 1 ? 1 : 0,
      type: "day-before",
      departureDate: dayBeforeStr,
      arrivalDate: dayBeforeStr,
    });
  }

  // Red-eye / morning-of flights
  if (includeRedEye) {
    for (let i = 0; i < 2; i++) {
      const hour = 22 + i;
      const price = 130 + (seed * 2 + i * 35) % 200;
      const duration = 120 + (seed + i * 45) % 180;
      const dh = Math.floor(duration / 60);
      const dm = duration % 60;
      const arrHour = (hour + dh) % 24;
      flights.push({
        airline: AIRLINES[(seed + i + 3) % AIRLINES.length],
        flightNumber: `${AIRLINES[(seed + i + 3) % AIRLINES.length].substring(0, 2).toUpperCase()}${2000 + seed + i * 5}`,
        departure: `${hour.toString().padStart(2, "0")}:00`,
        arrival: `${arrHour.toString().padStart(2, "0")}:${dm.toString().padStart(2, "0")}`,
        duration: `${dh}h ${dm}m`,
        price,
        stops: 0,
        type: "red-eye",
        departureDate: dayBeforeStr,
        arrivalDate: startStr,
      });
    }
  }

  return flights.sort((a, b) => a.price - b.price);
}
