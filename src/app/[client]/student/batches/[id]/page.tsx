"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, lazy, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetExploreBatch } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BatchDetailHeader } from "@/components/student/batch-detail-header";
import { MobileBatchHero } from "@/components/student/mobile-batch-hero";

// Lazy load tab content components
const BatchDescriptionTab = lazy(() =>
  import("@/components/student/batch-description-tab").then((mod) => ({
    default: mod.BatchDescriptionTab,
  }))
);

const BatchClassesTab = lazy(() =>
  import("@/components/student/batch-classes-tab").then((mod) => ({
    default: mod.BatchClassesTab,
  }))
);

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<"description" | "classes">(
    "description"
  );

  const { data, isLoading, error } = useGetExploreBatch(id);

  if (isLoading) {
    return <BatchDetailSkeleton />;
  }

  if (error || !data?.success || !data?.data) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-2xl font-bold">Batch Not Found</h2>
          <p className="text-muted-foreground">
            The batch you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const batch = data.data;
  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);
  const now = new Date();

  const isLive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isEnded = now > endDate;

  const finalPrice = Math.round(
    batch.totalPrice * (1 - batch.discountPercentage / 100)
  );
  const savings = batch.totalPrice - finalPrice;
  const isHotDeal = batch.discountPercentage >= 30;

  return (
    <div className="h-full">
      <div className="hidden lg:block sticky top-0 z-50">
        <BatchDetailHeader
          batch={batch}
          isLive={isLive}
          isUpcoming={isUpcoming}
          isEnded={isEnded}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => router.back()}
        />
      </div>

      <div className="lg:hidden">
        <MobileBatchHero
          batch={batch}
          isLive={isLive}
          isUpcoming={isUpcoming}
          isEnded={isEnded}
          isHotDeal={isHotDeal}
          onBack={() => router.back()}
        />
      </div>

      {/* Main Content */}
      <div className="p-2.5 lg:px-10 lg:py-8">
        <div className="container max-w-7xl mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {activeTab === "description" ? (
              <BatchDescriptionTab
                batch={batch}
                finalPrice={finalPrice}
                savings={savings}
                isHotDeal={isHotDeal}
              />
            ) : (
              <BatchClassesTab />
            )}
          </Suspense>
        </div>
      </div>

      {/* Sticky Bottom CTA (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-lg">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Total Price</div>
              <div className="font-bold text-lg sm:text-xl text-primary">
                ₹{finalPrice.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="shrink-0">
                View Details
              </Button>
              <Button size="sm" className="shrink-0">
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loading Component
function BatchDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="bg-linear-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <Skeleton className="h-10 w-32 mb-4 bg-white/20" />
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video rounded-2xl bg-white/20" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-48 bg-white/20" />
                <Skeleton className="h-10 w-full bg-white/20" />
                <Skeleton className="h-6 w-64 bg-white/20" />
              </div>
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-96 rounded-xl bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
