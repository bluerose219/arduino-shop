import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 관리자가 업로드한 상품 이미지 (Supabase Storage)
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
