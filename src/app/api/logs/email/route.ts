import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: {
        created: "desc",
      },
      take: 100, // Limit to last 100 entries
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch email logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}