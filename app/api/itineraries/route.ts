import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const continent = searchParams.get("continent");
  const published = searchParams.get("published");

  const itineraries = await prisma.itinerary.findMany({
    where: {
      ...(published !== "all" && { published: true }),
      ...(category && { category: { slug: category } }),
      ...(location && { location: { slug: location } }),
      ...(continent && { location: { continent } }),
    },
    include: { location: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(itineraries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const slug = slugify(body.title);

  const itinerary = await prisma.itinerary.create({
    data: {
      title: body.title,
      slug,
      summary: body.summary,
      highlights: JSON.stringify(body.highlights || []),
      includes: JSON.stringify(body.includes || []),
      excludes: JSON.stringify(body.excludes || []),
      price: parseFloat(body.price),
      duration: parseInt(body.duration),
      locationId: body.locationId,
      categoryId: body.categoryId,
      images: JSON.stringify(body.images || []),
      published: body.published ?? false,
    },
    include: { location: true, category: true },
  });

  await prisma.location.update({
    where: { id: body.locationId },
    data: { hasItinerary: true },
  });

  return NextResponse.json(itinerary);
}
