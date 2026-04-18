import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@itineraryarchitect.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@itineraryarchitect.com",
      password: adminPassword,
      role: "admin",
    },
  });

  // Test user
  const userPassword = await bcrypt.hash("user123456", 12);
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: { name: "Test User", email: "test@example.com", password: userPassword, role: "user" },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "sightseeing" }, update: {}, create: { name: "Sightseeing & Landmarks", slug: "sightseeing", description: "Iconic landmarks, panoramic views, and must-see attractions" } }),
    prisma.category.upsert({ where: { slug: "museums" }, update: {}, create: { name: "Museums & Culture", slug: "museums", description: "World-class museums, galleries, and cultural experiences" } }),
    prisma.category.upsert({ where: { slug: "outdoors" }, update: {}, create: { name: "Outdoors & Hiking", slug: "outdoors", description: "Nature trails, parks, and outdoor adventures" } }),
    prisma.category.upsert({ where: { slug: "food" }, update: {}, create: { name: "Food & Dining", slug: "food", description: "Culinary tours, local cuisine, and foodie experiences" } }),
    prisma.category.upsert({ where: { slug: "adventure" }, update: {}, create: { name: "Adventure & Sports", slug: "adventure", description: "Thrilling activities and adrenaline experiences" } }),
    prisma.category.upsert({ where: { slug: "relaxation" }, update: {}, create: { name: "Relaxation & Wellness", slug: "relaxation", description: "Spas, beaches, and peaceful retreats" } }),
  ]);

  const [sightseeing, museums, outdoors, food, adventure, relaxation] = categories;

  // Locations
  const northAmerica = await prisma.location.upsert({ where: { slug: "north-america" }, update: {}, create: { name: "North America", slug: "north-america", continent: "north-america", mapCode: "NA" } });
  const usa = await prisma.location.upsert({ where: { slug: "united-states" }, update: {}, create: { name: "United States", slug: "united-states", continent: "north-america", country: "USA", mapCode: "US", parentId: northAmerica.id } });
  const nyc = await prisma.location.upsert({ where: { slug: "new-york-city" }, update: {}, create: { name: "New York City", slug: "new-york-city", continent: "north-america", country: "USA", state: "New York", city: "New York City", mapCode: "NY", parentId: usa.id } });
  const la = await prisma.location.upsert({ where: { slug: "los-angeles" }, update: {}, create: { name: "Los Angeles", slug: "los-angeles", continent: "north-america", country: "USA", state: "California", city: "Los Angeles", mapCode: "CA", parentId: usa.id } });
  const chicago = await prisma.location.upsert({ where: { slug: "chicago" }, update: {}, create: { name: "Chicago", slug: "chicago", continent: "north-america", country: "USA", state: "Illinois", city: "Chicago", mapCode: "IL", parentId: usa.id } });
  const yellowstone = await prisma.location.upsert({ where: { slug: "yellowstone" }, update: {}, create: { name: "Yellowstone & Grand Teton", slug: "yellowstone", continent: "north-america", country: "USA", state: "Wyoming", mapCode: "WY", parentId: usa.id } });

  const europe = await prisma.location.upsert({ where: { slug: "europe" }, update: {}, create: { name: "Europe", slug: "europe", continent: "europe" } });
  const paris = await prisma.location.upsert({ where: { slug: "paris" }, update: {}, create: { name: "Paris", slug: "paris", continent: "europe", country: "France", city: "Paris", mapCode: "FR", parentId: europe.id } });
  const rome = await prisma.location.upsert({ where: { slug: "rome" }, update: {}, create: { name: "Rome", slug: "rome", continent: "europe", country: "Italy", city: "Rome", mapCode: "IT", parentId: europe.id } });
  const barcelona = await prisma.location.upsert({ where: { slug: "barcelona" }, update: {}, create: { name: "Barcelona", slug: "barcelona", continent: "europe", country: "Spain", city: "Barcelona", mapCode: "ES", parentId: europe.id } });

  const asia = await prisma.location.upsert({ where: { slug: "asia" }, update: {}, create: { name: "Asia", slug: "asia", continent: "asia" } });
  const tokyo = await prisma.location.upsert({ where: { slug: "tokyo" }, update: {}, create: { name: "Tokyo", slug: "tokyo", continent: "asia", country: "Japan", city: "Tokyo", mapCode: "JP", parentId: asia.id } });
  const bali = await prisma.location.upsert({ where: { slug: "bali" }, update: {}, create: { name: "Bali", slug: "bali", continent: "asia", country: "Indonesia", city: "Bali", mapCode: "ID", parentId: asia.id } });

  const australia = await prisma.location.upsert({ where: { slug: "australia" }, update: {}, create: { name: "Australia", slug: "australia", continent: "australia" } });
  const sydney = await prisma.location.upsert({ where: { slug: "sydney" }, update: {}, create: { name: "Sydney", slug: "sydney", continent: "australia", country: "Australia", city: "Sydney", mapCode: "AU", parentId: australia.id } });

  const southAmerica = await prisma.location.upsert({ where: { slug: "south-america" }, update: {}, create: { name: "South America", slug: "south-america", continent: "south-america" } });
  const machu = await prisma.location.upsert({ where: { slug: "machu-picchu" }, update: {}, create: { name: "Machu Picchu & Cusco", slug: "machu-picchu", continent: "south-america", country: "Peru", mapCode: "PE", parentId: southAmerica.id } });

  // --- ITINERARIES ---

  // NYC Sightseeing
  const nycSight = await prisma.itinerary.upsert({
    where: { slug: "new-york-city-icons-and-landmarks" },
    update: {},
    create: {
      title: "New York City — Icons & Landmarks",
      slug: "new-york-city-icons-and-landmarks",
      summary: "Experience the very best of New York City's iconic skyline, legendary landmarks, and vibrant neighborhoods across 5 unforgettable days.",
      highlights: JSON.stringify(["Sunrise at the Brooklyn Bridge", "Top of the Rock views", "Central Park walking tour", "Times Square at night", "Statue of Liberty ferry"]),
      includes: JSON.stringify(["Day-by-day schedule with exact timing", "Insider tips for skipping lines", "Neighborhood walking routes", "Best photo spots", "Restaurant recommendations"]),
      excludes: JSON.stringify(["Flight bookings", "Hotel reservations", "Attraction tickets", "Meals"]),
      price: 49.99,
      duration: 5,
      locationId: nyc.id,
      categoryId: sightseeing.id,
      published: true,
    },
  });

  // NYC Days
  await prisma.day.deleteMany({ where: { itineraryId: nycSight.id } });
  const nycDay1 = await prisma.day.create({ data: { itineraryId: nycSight.id, dayNumber: 1, title: "Manhattan Icons", description: "Start your NYC adventure with the most iconic sights" } });
  await prisma.activity.createMany({ data: [
    { dayId: nycDay1.id, order: 0, startTime: "07:00", endTime: "09:00", title: "Brooklyn Bridge Sunrise Walk", description: "Walk across the iconic Brooklyn Bridge as the city wakes up. The views of Manhattan at sunrise are stunning.", location: "Brooklyn Bridge, Manhattan side", type: "attraction", tips: "Get there before 7am for fewer crowds. Bring a jacket — it gets windy on the bridge." },
    { dayId: nycDay1.id, order: 1, startTime: "09:30", endTime: "10:30", title: "Breakfast in DUMBO", description: "Head to the DUMBO neighborhood for a world-class breakfast with views of the Manhattan Bridge.", location: "DUMBO, Brooklyn", type: "restaurant", tips: "Try Almondine Bakery for amazing croissants" },
    { dayId: nycDay1.id, order: 2, startTime: "11:00", endTime: "13:00", title: "Statue of Liberty Ferry", description: "Take the Staten Island Ferry for free views of the Statue of Liberty, or book the Crown ticket in advance for a closer look.", location: "Whitehall Terminal, Lower Manhattan", type: "attraction", tips: "The Staten Island Ferry is completely free and gives great views!" },
    { dayId: nycDay1.id, order: 3, startTime: "13:30", endTime: "14:30", title: "Lunch at Chelsea Market", description: "World-class food hall inside a historic factory building.", location: "75 9th Ave, New York", type: "restaurant", tips: "The Lobster Place is a must-try" },
    { dayId: nycDay1.id, order: 4, startTime: "15:00", endTime: "17:30", title: "High Line Walk", description: "Stroll the elevated park built on a historic freight rail line above the streets of Manhattan's West Side.", location: "High Line, 14th St to 34th St", type: "outdoors", tips: "Free entry. Great street art and views along the way." },
    { dayId: nycDay1.id, order: 5, startTime: "19:00", endTime: "21:00", title: "Top of the Rock", description: "Visit the observation deck at 30 Rock for spectacular 360° views of the entire Manhattan skyline and Central Park.", location: "30 Rockefeller Plaza", type: "attraction", tips: "Book tickets online in advance. Sunset timing is best — arrive 30 mins before." },
  ]});

  const nycDay2 = await prisma.day.create({ data: { itineraryId: nycSight.id, dayNumber: 2, title: "Central Park & Museum Mile", description: "A day in the heart of Manhattan's cultural corridor" } });
  await prisma.activity.createMany({ data: [
    { dayId: nycDay2.id, order: 0, startTime: "08:00", endTime: "10:00", title: "Central Park Morning Walk", description: "Explore Bethesda Fountain, Strawberry Fields, and the Bow Bridge.", location: "Central Park, enter at 72nd St", type: "outdoors", tips: "Rent a bike for $15/hour to cover more ground" },
    { dayId: nycDay2.id, order: 1, startTime: "10:30", endTime: "13:30", title: "Metropolitan Museum of Art", description: "World's largest art museum — allow at least 3 hours for highlights.", location: "1000 5th Ave, New York", type: "attraction", tips: "NYC residents pay what they wish. Plan your route before you go!" },
    { dayId: nycDay2.id, order: 2, startTime: "14:00", endTime: "15:00", title: "Lunch at The Loeb Boathouse", description: "Iconic lakeside restaurant inside Central Park.", location: "Central Park, E 72nd St", type: "restaurant", tips: "Make reservations ahead — it fills up fast" },
    { dayId: nycDay2.id, order: 3, startTime: "15:30", endTime: "17:00", title: "Fifth Avenue Stroll", description: "Walk down the world's most famous shopping street, from 59th to 42nd Street.", location: "5th Ave, Midtown Manhattan", type: "attraction", tips: "St. Patrick's Cathedral is free to enter and absolutely stunning inside" },
    { dayId: nycDay2.id, order: 4, startTime: "19:00", endTime: "21:30", title: "Broadway Show", description: "Catch a world-class Broadway performance in the Theater District.", location: "Theater District, Times Square area", type: "attraction", tips: "Check TKTS booth in Times Square for same-day discounted tickets" },
  ]});

  // Update location hasItinerary
  await prisma.location.update({ where: { id: nyc.id }, data: { hasItinerary: true } });

  // NYC Museums
  const nycMuseums = await prisma.itinerary.upsert({
    where: { slug: "new-york-city-world-class-museums" },
    update: {},
    create: {
      title: "New York City — World-Class Museums",
      slug: "new-york-city-world-class-museums",
      summary: "Dive deep into New York's extraordinary museum scene — from the Met to MoMA, with the best art, history, and culture the world has to offer.",
      highlights: JSON.stringify(["Metropolitan Museum of Art", "MoMA permanent collection", "Natural History Museum", "The Frick Collection", "Whitney Museum of American Art"]),
      includes: JSON.stringify(["Museum visit schedule with timing", "What not to miss at each museum", "Insider routes to avoid crowds", "Café recommendations near each museum"]),
      excludes: JSON.stringify(["Museum admission tickets", "Flight bookings", "Accommodations"]),
      price: 44.99,
      duration: 4,
      locationId: nyc.id,
      categoryId: museums.id,
      published: true,
    },
  });

  // Paris Sightseeing
  const parisSight = await prisma.itinerary.upsert({
    where: { slug: "paris-city-of-light" },
    update: {},
    create: {
      title: "Paris — City of Light",
      slug: "paris-city-of-light",
      summary: "Fall in love with Paris on this 6-day journey through the world's most romantic city — from the Eiffel Tower to hidden Montmartre bistros.",
      highlights: JSON.stringify(["Eiffel Tower at sunset", "Louvre Museum highlights", "Montmartre neighborhood walk", "Seine River cruise", "Versailles day trip"]),
      includes: JSON.stringify(["Complete 6-day schedule", "Neighborhood walking routes", "Best café and restaurant recommendations", "Timing tips for major attractions"]),
      excludes: JSON.stringify(["Flights", "Hotel bookings", "Museum tickets", "Meals"]),
      price: 59.99,
      duration: 6,
      locationId: paris.id,
      categoryId: sightseeing.id,
      published: true,
    },
  });
  await prisma.location.update({ where: { id: paris.id }, data: { hasItinerary: true } });

  // Paris Day 1
  await prisma.day.deleteMany({ where: { itineraryId: parisSight.id } });
  const parisDay1 = await prisma.day.create({ data: { itineraryId: parisSight.id, dayNumber: 1, title: "Arrival & Eiffel Tower", description: "Get settled and experience the iconic Eiffel Tower" } });
  await prisma.activity.createMany({ data: [
    { dayId: parisDay1.id, order: 0, startTime: "10:00", endTime: "12:00", title: "Settle in & Walk the Champs-Élysées", description: "Start with a leisurely walk down the world's most famous boulevard from Arc de Triomphe to Place de la Concorde.", location: "Champs-Élysées, Paris", type: "outdoors", tips: "Grab a croissant from a boulangerie — avoid the tourist cafés on the main avenue" },
    { dayId: parisDay1.id, order: 1, startTime: "12:30", endTime: "13:30", title: "Lunch at Café de Flore", description: "Iconic Parisian café, a literary institution since 1887.", location: "172 Bd Saint-Germain, Paris", type: "restaurant", tips: "Order the croque-monsieur — it's iconic here" },
    { dayId: parisDay1.id, order: 2, startTime: "15:00", endTime: "18:00", title: "Eiffel Tower Visit", description: "Visit the iconic iron tower — choose between the second floor or the summit for different experiences.", location: "Champ de Mars, Paris", type: "attraction", tips: "Book tickets 2-3 months in advance. Last elevator is 45 mins before closing." },
    { dayId: parisDay1.id, order: 3, startTime: "19:30", endTime: "21:30", title: "Seine River Cruise", description: "A magical evening on the river with the Eiffel Tower sparkling every hour on the hour.", location: "Port de la Bourdonnais, Paris", type: "attraction", tips: "Book the 8pm cruise to see the tower sparkle at 9pm — absolutely magical" },
  ]});

  // Tokyo
  const tokyoFood = await prisma.itinerary.upsert({
    where: { slug: "tokyo-culinary-adventure" },
    update: {},
    create: {
      title: "Tokyo — Ultimate Culinary Adventure",
      slug: "tokyo-culinary-adventure",
      summary: "Explore Tokyo through its extraordinary food culture — from Michelin-starred ramen to bustling tsukiji markets, izakayas, and everything in between.",
      highlights: JSON.stringify(["Tsukiji Outer Market breakfast", "Ramen tour in Shinjuku", "Depachika underground food halls", "Yakitori alley in Yurakucho", "Sushi masterclass"]),
      includes: JSON.stringify(["7-day food-focused itinerary", "Restaurant name and booking tips", "Tokyo food etiquette guide", "Neighborhood food maps"]),
      excludes: JSON.stringify(["Restaurant reservations", "Flights", "Accommodation"]),
      price: 54.99,
      duration: 7,
      locationId: tokyo.id,
      categoryId: food.id,
      published: true,
    },
  });
  await prisma.location.update({ where: { id: tokyo.id }, data: { hasItinerary: true } });

  // Yellowstone Outdoors
  const yellowstoneHike = await prisma.itinerary.upsert({
    where: { slug: "yellowstone-grand-teton-adventure" },
    update: {},
    create: {
      title: "Yellowstone & Grand Teton — Ultimate Road Trip",
      slug: "yellowstone-grand-teton-adventure",
      summary: "Experience the raw power of nature across 8 days in America's most dramatic national parks — geysers, grizzlies, alpine lakes, and breathtaking peaks.",
      highlights: JSON.stringify(["Old Faithful geyser", "Grand Prismatic Spring", "Grand Teton summit views", "Wildlife safari (bison, elk, bear)", "Jenny Lake kayaking"]),
      includes: JSON.stringify(["8-day park itinerary", "Best hike recommendations by difficulty", "Wildlife spotting guide", "Campsite and lodge timing tips"]),
      excludes: JSON.stringify(["Park passes", "Accommodation", "Flights", "Equipment rental"]),
      price: 64.99,
      duration: 8,
      locationId: yellowstone.id,
      categoryId: outdoors.id,
      published: true,
    },
  });
  await prisma.location.update({ where: { id: yellowstone.id }, data: { hasItinerary: true } });

  // Bali Relaxation
  const baliRelax = await prisma.itinerary.upsert({
    where: { slug: "bali-wellness-retreat" },
    update: {},
    create: {
      title: "Bali — Wellness & Spiritual Retreat",
      slug: "bali-wellness-retreat",
      summary: "Immerse yourself in Bali's extraordinary spiritual and wellness culture over 10 days — sacred temples, rice terraces, yoga retreats, and healing ceremonies.",
      highlights: JSON.stringify(["Sunrise at Mount Batur", "Tirta Empul water temple ceremony", "Tegallalang rice terrace sunrise", "Traditional Balinese cooking class", "Ubud yoga and spa retreat"]),
      includes: JSON.stringify(["10-day wellness itinerary", "Temple visit etiquette guide", "Spa and retreat recommendations", "Cultural ceremony timing"]),
      excludes: JSON.stringify(["Accommodation", "Flights", "Temple offerings", "Spa bookings"]),
      price: 69.99,
      duration: 10,
      locationId: bali.id,
      categoryId: relaxation.id,
      published: true,
    },
  });
  await prisma.location.update({ where: { id: bali.id }, data: { hasItinerary: true } });

  // Rome
  const romeMuseums = await prisma.itinerary.upsert({
    where: { slug: "rome-eternal-city-art-history" },
    update: {},
    create: {
      title: "Rome — Eternal City Art & History",
      slug: "rome-eternal-city-art-history",
      summary: "Walk through 3,000 years of history in the Eternal City — Vatican Museums, Colosseum, and masterpieces around every corner.",
      highlights: JSON.stringify(["Vatican Museums & Sistine Chapel", "Colosseum & Roman Forum", "Borghese Gallery", "Pantheon at dawn", "Trastevere neighborhood"]),
      includes: JSON.stringify(["5-day art and history itinerary", "Queue-skipping tips", "Best time to visit each site", "Hidden gem recommendations"]),
      excludes: JSON.stringify(["Museum tickets", "Guided tours", "Flights", "Hotels"]),
      price: 54.99,
      duration: 5,
      locationId: rome.id,
      categoryId: museums.id,
      published: true,
    },
  });
  await prisma.location.update({ where: { id: rome.id }, data: { hasItinerary: true } });

  // Sydney
  const sydneyAdventure = await prisma.itinerary.upsert({
    where: { slug: "sydney-harbour-adventure" },
    update: {},
    create: {
      title: "Sydney — Harbour City Adventure",
      slug: "sydney-harbour-adventure",
      summary: "Explore Sydney's legendary harbour, world-famous beaches, and incredible coastal walks on this action-packed 6-day adventure.",
      highlights: JSON.stringify(["Bondi to Coogee coastal walk", "Sydney Harbour Bridge climb", "Opera House tour", "Manly Beach day trip", "Blue Mountains day trip"]),
      includes: JSON.stringify(["6-day adventure itinerary", "Coastal walk guide", "Beach timing tips", "Day trip planning"]),
      excludes: JSON.stringify(["Bridge climb tickets", "Flights", "Accommodation", "Tours"]),
      price: 59.99,
      duration: 6,
      locationId: sydney.id,
      categoryId: adventure.id,
      published: true,
    },
  });
  await prisma.location.update({ where: { id: sydney.id }, data: { hasItinerary: true } });

  // Machu Picchu
  const machuAdventure = await prisma.itinerary.upsert({
    where: { slug: "machu-picchu-inca-trail" },
    update: {},
    create: {
      title: "Machu Picchu & the Inca Trail",
      slug: "machu-picchu-inca-trail",
      summary: "Embark on the ultimate South American adventure — trekking the legendary Inca Trail to the lost city of Machu Picchu.",
      highlights: JSON.stringify(["Inca Trail 4-day trek", "Sunrise at the Sun Gate", "Machu Picchu full day exploration", "Cusco acclimatization", "Sacred Valley tour"]),
      includes: JSON.stringify(["8-day trekking itinerary", "Altitude sickness preparation guide", "Packing list for the trail", "Cusco neighborhood guide"]),
      excludes: JSON.stringify(["Inca Trail permits", "Guide fees", "Flights", "Accommodation"]),
      price: 74.99,
      duration: 8,
      locationId: machu.id,
      categoryId: adventure.id,
      published: true,
    },
  });
  await prisma.location.update({ where: { id: machu.id }, data: { hasItinerary: true } });

  // NYC Outdoors
  const nycOutdoors = await prisma.itinerary.upsert({
    where: { slug: "new-york-city-parks-and-outdoors" },
    update: {},
    create: {
      title: "New York City — Parks & Green Spaces",
      slug: "new-york-city-parks-and-outdoors",
      summary: "Discover New York's incredible green spaces — from Central Park to the Catskills — on this nature-focused urban adventure.",
      highlights: JSON.stringify(["Full Central Park circuit", "Inwood Hill Park ancient forest", "Prospect Park and Brooklyn Botanic Garden", "High Line greenway", "Palisades hike across the Hudson"]),
      includes: JSON.stringify(["4-day outdoor NYC itinerary", "Best running and cycling routes", "Hidden park gems guide"]),
      excludes: JSON.stringify(["Bike rentals", "Transportation", "Accommodation"]),
      price: 39.99,
      duration: 4,
      locationId: nyc.id,
      categoryId: outdoors.id,
      published: true,
    },
  });

  // Barcelona
  const barcelonaFood = await prisma.itinerary.upsert({
    where: { slug: "barcelona-food-and-architecture" },
    update: {},
    create: {
      title: "Barcelona — Gaudí, Food & Flamenco",
      slug: "barcelona-food-and-architecture",
      summary: "Barcelona is a city that seduces all the senses — discover Gaudí's masterpieces, world-class tapas, and the vibrant energy of Catalonia.",
      highlights: JSON.stringify(["Sagrada Família with skip-the-line entry", "La Boqueria market breakfast", "Park Güell sunrise", "El Born tapas crawl", "Gothic Quarter evening walk"]),
      includes: JSON.stringify(["5-day Barcelona itinerary", "Tapas bar recommendations with addresses", "Gaudí visit timing guide", "Neighborhood walking maps"]),
      excludes: JSON.stringify(["Attraction tickets", "Flights", "Accommodation", "Meals"]),
      price: 54.99,
      duration: 5,
      locationId: barcelona.id,
      categoryId: food.id,
      published: true,
    },
  });
  await prisma.location.update({ where: { id: barcelona.id }, data: { hasItinerary: true } });

  console.log("Seed complete!");
  console.log("Admin login: admin@itineraryarchitect.com / admin123456");
  console.log("Test user: test@example.com / user123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
