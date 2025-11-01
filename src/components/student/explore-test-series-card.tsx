"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, FileText, Sparkles, Award, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ExploreTestSeriesCardProps {
  id: string;
  exam: string;
  title: string;
  description?: string | null;
  slug: string;
  imageUrl?: string;
  totalPrice: number;
  discountPercentage?: number;
  isFree?: boolean;
  durationDays?: number;
  index?: number;
}

export function ExploreTestSeriesCard({
  id,
  exam,
  title,
  imageUrl,
  totalPrice,
  discountPercentage = 0,
  isFree = false,
  durationDays,
  index = 0,
}: ExploreTestSeriesCardProps) {
  const finalPrice = isFree
    ? 0
    : Math.round(totalPrice * (1 - discountPercentage / 100));
  const savings = totalPrice - finalPrice;
  const isHotDeal = discountPercentage >= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="p-0 group h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 gap-0">
        {/* Image Section */}
        <div className="relative h-44 sm:h-48 overflow-hidden bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="h-16 w-16 sm:h-20 sm:w-20 text-primary/30" />
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {isFree ? (
                <Badge className="bg-emerald-500 text-white border-0 shadow-lg">
                  <Award className="h-3 w-3 mr-1" />
                  Free
                </Badge>
              ) : (
                <Badge className="bg-blue-500 text-white border-0 shadow-lg backdrop-blur-sm">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Test Series
                </Badge>
              )}
              {isHotDeal && !isFree && (
                <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Hot Deal
                </Badge>
              )}
            </div>
          </div>

          {/* Discount Badge */}
          {!isFree && discountPercentage > 0 && (
            <div className="absolute top-3 right-3">
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                {discountPercentage}% OFF
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className=" flex-1 flex flex-col p-4 space-y-4">
          {/* Title & Exam Info */}
          <div className="space-y-2">
            <Badge variant="secondary" className="shrink-0">
              {exam}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-bold text-base sm:text-lg leading-tight truncate group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Duration Info */}
          {durationDays && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0 text-primary/60" />
              <span>Valid for {durationDays} days</span>
            </div>
          )}

          {/* Pricing Section */}
          <div className="pt-3 mt-auto border-t space-y-3">
            {isFree ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                  Free
                </span>
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                >
                  ₹0
                </Badge>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {discountPercentage > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground line-through">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                    >
                      Save ₹{savings.toLocaleString("en-IN")}
                    </Badge>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    ₹{finalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10 sm:h-11 font-semibold text-sm sm:text-base"
                asChild
              >
                <Link href={`/student/test-series/${id}`}>View Details</Link>
              </Button>
              <Button
                className="flex-1 h-10 sm:h-11 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle purchase/enrollment - will be connected to payment flow
                  console.log(
                    isFree
                      ? "Enroll clicked"
                      : "Buy now clicked for test series:",
                    id
                  );
                }}
              >
                {isFree ? "Enroll Free" : "Buy Now"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
