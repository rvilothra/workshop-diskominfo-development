/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  swcMinify: true,

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    domains: [],
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      console.log("🔧 Configuring webpack for server-side...");

      // Configure externals for serverless environment
      config.externals = config.externals || [];

      // Exclude sequelize from bundling (it's too large)
      config.externals.push({
        sequelize: "commonjs sequelize",
      });

      // Ensure pg packages are properly bundled
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        buffer: false,
        events: false,
        querystring: false,
      };

      // Ensure pg is not externalized and gets bundled
      if (config.externals) {
        config.externals = config.externals.filter((external) => {
          if (typeof external === "object") {
            return !external.pg && !external["pg-hstore"];
          }
          return external !== "pg" && external !== "pg-hstore";
        });
      }

      console.log("✅ Webpack configured for pg inclusion");
    }

    // Add alias for path resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname),
    };

    return config;
  },

  experimental: {
    // Only exclude sequelize, include everything else
    serverComponentsExternalPackages: ["sequelize"],
  },

  // Ensure Tailwind CSS is processed correctly
  transpilePackages: ["tailwindcss"],

  // Disable static optimization for dynamic content
  trailingSlash: false,

  // Ensure proper handling of dynamic routes
  generateBuildId: async () => {
    return "build-" + Date.now();
  },
};

module.exports = nextConfig;
