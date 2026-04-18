import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requests = await prisma.customRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const request = await prisma.customRequest.create({
    data: {
      name: body.name,
      email: body.email,
      destination: body.destination,
      startDate: body.startDate,
      endDate: body.endDate,
      travelers: parseInt(body.travelers),
      activities: JSON.stringify(body.activities || []),
      budget: body.budget,
      notes: body.notes,
    },
  });
  return NextResponse.json(request);
}
