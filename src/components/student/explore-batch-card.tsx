"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, Globe, GraduationCap, Sparkles } from "lucide-react";
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

interface ExploreBatchCardProps {
  id: string;
  name: string;
  description?: string | null;
  class: "11" | "12" | "12+" | "Grad";
  exam: string;
  imageUrl?: string;
  startDate: Date | string;
  endDate: Date | string;
  language: string;
  totalPrice: number;
  discountPercentage: number;
  index?: number;
}

export function ExploreBatchCard({
  id,
  name,
  class: className,
  exam,
  imageUrl,
  startDate,
  endDate,
  language,
  totalPrice,
  discountPercentage,
  index = 0,
}: ExploreBatchCardProps) {
  const params = useParams();
  const clientSlug = params.client as string;

  const finalPrice = Math.round(totalPrice * (1 - discountPercentage / 100));
  const savings = totalPrice - finalPrice;

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  };

  const getBatchStatus = () => {
    const now = new Date();
    const start =
      typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    if (now < start) return { label: "Upcoming", color: "bg-blue-500" };
    if (now > end) return { label: "Ended", color: "bg-gray-500" };
    return { label: "Live", color: "bg-emerald-500" };
  };

  const status = getBatchStatus();
  const isNewBatch = discountPercentage >= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="p-0 group h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 gap-0">
        {/* Image Section */}
        <div className="relative h-44 sm:h-48 overflow-hidden bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <GraduationCap className="h-16 w-16 sm:h-20 sm:w-20 text-primary/30" />
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  "text-white border-0 shadow-lg backdrop-blur-sm",
                  status.color
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                {status.label}
              </Badge>
              {isNewBatch && (
                <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Hot Deal
                </Badge>
              )}
            </div>
          </div>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 right-3">
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                {discountPercentage}% OFF
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 flex flex-col p-4 space-y-4">
          {/* Title & Exam Info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 flex-wrap">
              <Badge variant="secondary" className="shrink-0">
                {exam}
              </Badge>
              <Badge variant="outline" className="shrink-0">
                Class {className}
              </Badge>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-bold text-base sm:text-lg leading-tight truncate group-hover:text-primary transition-colors cursor-default">
                    {name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0 text-primary/60" />
              <span className="truncate">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0 text-primary/60" />
              <span className="truncate">{language}</span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="pt-3 mt-auto border-t space-y-3">
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

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10 sm:h-11 font-semibold text-sm sm:text-base"
                asChild
              >
                <Link href={`/student/batches/${id}`}>View Details</Link>
              </Button>
              <Button
                className="flex-1 h-10 sm:h-11 font-semibold text-sm sm:text-base"
                asChild
              >
                <Link href={`/student/batches/${id}`}>Buy Now</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
