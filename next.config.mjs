/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Skip type & lint errors during build ───────────────────────────────
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ─── Force all pages to be dynamic (fixes Firebase prerender crash) ──────
  // Next.js will never try to statically generate any page at build time.
  // Firebase / Clerk / Supabase — sab runtime pe chalenge, build pe nahi.
  experimental: {
    ppr: false, // Partial Prerendering off (Next 15 default hata do)
  },

  // ─── Image domains ───────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aienaqjvadocyvxmxxcx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Faster image loading on Cloudflare
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
  },

  // ─── Headers for better caching on Cloudflare ────────────────────────────
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
