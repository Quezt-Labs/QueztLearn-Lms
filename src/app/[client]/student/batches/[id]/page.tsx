"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Tag,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetExploreBatch } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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
            The batch you're looking for doesn't exist or has been removed.
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
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container max-w-7xl mx-auto px-4 py-8 sm:py-12">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-white hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Image & Quick Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl"
              >
                {batch.imageUrl ? (
                  <img
                    src={batch.imageUrl}
                    alt={batch.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm">
                    <GraduationCap className="h-24 w-24 sm:h-32 sm:w-32 text-white/50" />
                  </div>
                )}

                {/* Status Badge Overlay */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {isLive && (
                    <Badge className="bg-emerald-500 text-white border-0 shadow-lg">
                      <div className="h-2 w-2 rounded-full bg-white mr-2 animate-pulse" />
                      Live Now
                    </Badge>
                  )}
                  {isUpcoming && (
                    <Badge className="bg-blue-500 text-white border-0 shadow-lg">
                      <Clock className="h-3 w-3 mr-1" />
                      Upcoming
                    </Badge>
                  )}
                  {isEnded && (
                    <Badge className="bg-gray-500 text-white border-0 shadow-lg">
                      Ended
                    </Badge>
                  )}
                  {isHotDeal && (
                    <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Hot Deal
                    </Badge>
                  )}
                </div>

                {/* Discount Badge */}
                {batch.discountPercentage > 0 && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {batch.discountPercentage}% OFF
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Title & Meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30"
                  >
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Class {batch.class}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30"
                  >
                    {batch.exam}
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {batch.name}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm sm:text-base text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {startDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {endDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{batch.language}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Price Card (Desktop) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block"
            >
              <PriceCard
                finalPrice={finalPrice}
                totalPrice={batch.totalPrice}
                discountPercentage={batch.discountPercentage}
                savings={savings}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    About This Batch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {batch.description ? (
                    <div
                      className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: batch.description }}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      No description available for this batch.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        icon: Users,
                        title: "Expert Faculty",
                        description: "Learn from experienced teachers",
                      },
                      {
                        icon: BookOpen,
                        title: "Comprehensive Content",
                        description: "Complete syllabus coverage",
                      },
                      {
                        icon: TrendingUp,
                        title: "Progress Tracking",
                        description: "Monitor your performance",
                      },
                      {
                        icon: CheckCircle2,
                        title: "Practice Tests",
                        description: "Regular assessments & tests",
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="shrink-0 mt-0.5">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base">
                            {feature.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Price Card (Mobile) */}
              <div className="lg:hidden">
                <PriceCard
                  finalPrice={finalPrice}
                  totalPrice={batch.totalPrice}
                  discountPercentage={batch.discountPercentage}
                  savings={savings}
                />
              </div>

              {/* Batch Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Batch Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <InfoItem
                        icon={Calendar}
                        label="Start Date"
                        value={startDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      />
                      <InfoItem
                        icon={Calendar}
                        label="End Date"
                        value={endDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      />
                      <InfoItem
                        icon={Globe}
                        label="Language"
                        value={batch.language}
                      />
                      <InfoItem
                        icon={GraduationCap}
                        label="Class"
                        value={batch.class}
                      />
                      <InfoItem icon={Tag} label="Exam" value={batch.exam} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
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

// Price Card Component
function PriceCard({
  finalPrice,
  totalPrice,
  discountPercentage,
  savings,
}: {
  finalPrice: number;
  totalPrice: number;
  discountPercentage: number;
  savings: number;
}) {
  return (
    <Card className="shadow-xl border-2">
      <CardContent className="p-6 space-y-6">
        {/* Pricing */}
        <div className="space-y-3">
          {discountPercentage > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground line-through">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
              <Badge
                variant="secondary"
                className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
              >
                Save ₹{savings.toLocaleString("en-IN")}
              </Badge>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-primary">
              ₹{finalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" size="lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Enroll Now
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            Add to Cart
          </Button>
        </div>

        <Separator />

        {/* Quick Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Full access to all content</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Lifetime access</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Certificate of completion</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Info Item Component
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}

// Skeleton Loading Component
function BatchDetailSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
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
