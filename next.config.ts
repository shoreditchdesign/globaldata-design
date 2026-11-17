import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * No dev badge over the prototypes. The screens are reviewed as screenshots
   * and captured into Figma, and a floating Next.js indicator lands in the
   * corner of every one of them.
   */
  devIndicators: false,
  /*
   * The root opens the prototype carried forward, Sprint 4 Idea 1c, and the
   * sprint index moves to /archive. Every earlier idea keeps its own address,
   * since those links are out in decks and test scripts. Temporary rather than
   * permanent, so browsers do not cache it and the root can be pointed
   * elsewhere later.
   */
  async redirects() {
    return [{ source: "/", destination: "/sprint-4/idea-1c/start", permanent: false }];
  },
};

export default nextConfig;
