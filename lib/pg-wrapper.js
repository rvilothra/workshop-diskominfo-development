/**
 * Custom PostgreSQL wrapper for Vercel deployment
 * This handles the pg package loading issues in serverless environments
 */

let pg = null;
let pgHstore = null;

try {
  // Try to load pg package
  pg = require("pg");
  console.log("✅ pg package loaded successfully");
} catch (error) {
  console.error("❌ Failed to load pg package:", error.message);

  // Try alternative loading methods
  try {
    // Try to load from node_modules directly
    const path = require("path");
    const pgPath = path.join(process.cwd(), "node_modules", "pg");
    pg = require(pgPath);
    console.log("✅ pg package loaded from direct path");
  } catch (directError) {
    console.error(
      "❌ Failed to load pg from direct path:",
      directError.message
    );

    // Try to load from .next/server
    try {
      const nextPath = path.join(
        process.cwd(),
        ".next",
        "server",
        "node_modules",
        "pg"
      );
      pg = require(nextPath);
      console.log("✅ pg package loaded from .next/server");
    } catch (nextError) {
      console.error(
        "❌ Failed to load pg from .next/server:",
        nextError.message
      );
      throw new Error(
        "PostgreSQL driver (pg) could not be loaded. This is required for database connections."
      );
    }
  }
}

try {
  // Try to load pg-hstore package
  pgHstore = require("pg-hstore");
  console.log("✅ pg-hstore package loaded successfully");
} catch (error) {
  console.error("❌ Failed to load pg-hstore package:", error.message);

  // Try alternative loading methods
  try {
    const path = require("path");
    const pgHstorePath = path.join(process.cwd(), "node_modules", "pg-hstore");
    pgHstore = require(pgHstorePath);
    console.log("✅ pg-hstore package loaded from direct path");
  } catch (directError) {
    console.error(
      "❌ Failed to load pg-hstore from direct path:",
      directError.message
    );

    try {
      const nextPath = path.join(
        process.cwd(),
        ".next",
        "server",
        "node_modules",
        "pg-hstore"
      );
      pgHstore = require(nextPath);
      console.log("✅ pg-hstore package loaded from .next/server");
    } catch (nextError) {
      console.error(
        "❌ Failed to load pg-hstore from .next/server:",
        nextError.message
      );
      console.warn("⚠️ pg-hstore not available, some features may not work");
    }
  }
}

// Export the loaded packages
module.exports = {
  pg,
  pgHstore,
  // Check if packages are available
  isAvailable: () => pg !== null,
  isHstoreAvailable: () => pgHstore !== null,
};
