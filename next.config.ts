import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * No dev badge over the prototypes. The screens are reviewed as screenshots
   * and captured into Figma, and a floating Next.js indicator lands in the
   * corner of every one of them.
   */
  devIndicators: false,
};

export default nextConfig;
