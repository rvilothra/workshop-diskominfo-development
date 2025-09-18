/**
 * Vercel-specific database configuration
 * This handles PostgreSQL connection issues in Vercel's serverless environment
 */

const { Sequelize } = require("sequelize");

// Lazy load pg package to avoid bundling issues
let pg = null;
let pgHstore = null;

const loadPgPackages = () => {
  if (pg && pgHstore) return { pg, pgHstore };

  try {
    // Try to load pg package
    pg = require("pg");
    console.log("✅ pg package loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load pg package:", error.message);

    // Try alternative loading methods for Vercel
    try {
      // In Vercel, packages might be in a different location
      const path = require("path");
      const possiblePaths = [
        path.join(process.cwd(), "node_modules", "pg"),
        path.join(process.cwd(), ".next", "server", "node_modules", "pg"),
        path.join(
          process.cwd(),
          ".vercel",
          "output",
          "functions",
          "node_modules",
          "pg"
        ),
        "/var/task/node_modules/pg", // Vercel runtime path
      ];

      for (const pgPath of possiblePaths) {
        try {
          pg = require(pgPath);
          console.log(`✅ pg package loaded from: ${pgPath}`);
          break;
        } catch (pathError) {
          console.log(`❌ Failed to load from: ${pgPath}`);
        }
      }

      if (!pg) {
        throw new Error("Could not load pg package from any location");
      }
    } catch (loadError) {
      console.error("❌ All pg loading attempts failed:", loadError.message);
      throw new Error(
        "PostgreSQL driver (pg) is required but not available in Vercel environment"
      );
    }
  }

  try {
    // Try to load pg-hstore package
    pgHstore = require("pg-hstore");
    console.log("✅ pg-hstore package loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load pg-hstore package:", error.message);
    console.warn("⚠️ pg-hstore not available, some features may not work");
  }

  return { pg, pgHstore };
};

// Create Sequelize instance optimized for Vercel
const createVercelSequelize = (databaseUrl) => {
  try {
    // Ensure pg packages are loaded
    const { pg: loadedPg } = loadPgPackages();

    if (!loadedPg) {
      throw new Error("PostgreSQL driver not available");
    }

    // Check if DATABASE_URL contains 'render.com' to determine if it's Render
    const isRenderDatabase = databaseUrl && databaseUrl.includes("render.com");

    const sequelize = new Sequelize(databaseUrl, {
      dialect: "postgres",
      dialectOptions: isRenderDatabase
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
      logging: false, // Disable logging in production
      pool: {
        max: 1, // Limit connections in serverless
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      retry: {
        max: 3,
        timeout: 10000,
      },
      // Vercel-specific optimizations
      benchmark: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    });

    console.log("✅ Vercel Sequelize instance created successfully");
    return sequelize;
  } catch (error) {
    console.error(
      "❌ Failed to create Vercel Sequelize instance:",
      error.message
    );
    throw error;
  }
};

module.exports = {
  createVercelSequelize,
  loadPgPackages,
  isPgAvailable: () => {
    try {
      loadPgPackages();
      return pg !== null;
    } catch {
      return false;
    }
  },
};
