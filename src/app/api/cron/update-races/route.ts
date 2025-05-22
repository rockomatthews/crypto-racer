import { NextResponse } from "next/server";
import { raceResultsService } from "@/services/raceResultsService";

// This endpoint is intended to be called by a cron job to update race results
export async function GET() {
  try {
    // Verify cron secret (basic protection)
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await raceResultsService.updateRaceStatuses();
    
    return NextResponse.json({ success: true, message: "Race statuses updated" });
  } catch (error) {
    console.error("Error updating race statuses:", error);
    return NextResponse.json(
      { error: "Failed to update race statuses" },
      { status: 500 }
    );
  }
} 