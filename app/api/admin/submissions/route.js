import { NextResponse } from "next/server";
import { Submission, initializeDatabase } from "@/lib/sequelize";
import { Op } from "sequelize";

// Initialize database on first request
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export async function GET(request) {
  try {
    await initDB();

    // In a real application, you would verify admin authentication here
    // For workshop purposes, we'll skip authentication

    // Parse query parameters
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const status = url.searchParams.get("status") || "";
    const jenis = url.searchParams.get("jenis") || "";
    const sortBy = (url.searchParams.get("sortBy") || "createdAt").toLowerCase();
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Build filters
    const where = {};
    if (q) {
      where[Op.or] = [
        { nama: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (jenis) {
      where.jenis_layanan = jenis;
    }

    // Determine sort column
    let orderColumn = "created_at"; // default
    if (sortBy === "status") {
      orderColumn = "status";
    } else if (sortBy === "createdat" || sortBy === "created_at") {
      orderColumn = "created_at";
    }

    const submissions = await Submission.findAll({
      where,
      order: [[orderColumn, sortOrder]],
      attributes: [
        "id",
        "tracking_code",
        "nama",
        "email",
        "jenis_layanan",
        "status",
        "created_at",
        "updated_at",
      ],
      raw: false,
      logging: false,
    });

    console.log(
      `[${new Date().toISOString()}] Found ${submissions.length} submissions`
    );
    if (submissions.length > 0) {
      console.log(
        `[${new Date().toISOString()}] Latest submission: ${
          submissions[0].tracking_code
        } (${submissions[0].status})`
      );
    }

    // Vercel-specific no-cache headers
    const response = NextResponse.json(submissions);

    // Ultra-aggressive cache control
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, private, max-age=0, s-maxage=0, stale-while-revalidate=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Clear-Site-Data", '"cache"');

    // Vercel-specific headers
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("CDN-Cache-Control", "no-cache");
    response.headers.set("Vercel-CDN-Cache-Control", "no-cache");
    response.headers.set("X-Vercel-Cache", "MISS");

    // Force fresh response dengan dynamic values dan query params
    response.headers.set("Last-Modified", new Date().toUTCString());
    response.headers.set("X-Query", q);
    response.headers.set("X-Sort-By", orderColumn);
    response.headers.set("X-Sort-Order", sortOrder);

    return response;
  } catch (error) {
    console.error("Error fetching submissions:", error);

    const errorResponse = NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );

    // Same headers for errors
    errorResponse.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, private"
    );
    errorResponse.headers.set("Pragma", "no-cache");
    errorResponse.headers.set("Expires", "0");
    errorResponse.headers.set("Surrogate-Control", "no-store");
    errorResponse.headers.set("CDN-Cache-Control", "no-cache");

    return errorResponse;
  }
}
