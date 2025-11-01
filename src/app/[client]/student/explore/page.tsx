"use client";

import { MobileExplorePage } from "@/components/student/mobile/mobile-explore-page";

export default function ExplorePage() {
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <MobileExplorePage />
      </div>

      {/* Desktop View - TODO: Create desktop version */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <h1 className="text-2xl font-bold mb-6">Explore</h1>
          <p className="text-muted-foreground">Desktop view coming soon...</p>
        </div>
      </div>
    </>
  );
}

