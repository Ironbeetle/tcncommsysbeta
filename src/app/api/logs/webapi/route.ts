import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.msgApiLog.findMany({
      select: {
        id: true,
        created: true,
        type: true,
        title: true, // Added this
        content: true, // This will be your message
        priority: true
      },
      orderBy: {
        created: "desc",
      },
      take: 100, // Limit to last 100 entries
    });

    return NextResponse.json(logs || []); // Ensure we always return an array
  } catch (error) {
    console.error("Failed to fetch Web API logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
