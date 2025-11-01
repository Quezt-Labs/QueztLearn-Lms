"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTestSeriesCardProps {
  id: string;
  title: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  badge: string;
  badgeColor: string;
}

export function MobileTestSeriesCard({
  id,
  title,
  image,
  originalPrice,
  discountedPrice,
  badge,
  badgeColor,
}: MobileTestSeriesCardProps) {
  const discountPercentage = Math.round(
    ((originalPrice - discountedPrice) / originalPrice) * 100
  );

  return (
    <Link
      href={`/student/test-series/${id}`}
      className="block active:scale-[0.98] transition-transform"
    >
      <div
        className={cn(
          "rounded-2xl overflow-hidden",
          "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
          "border border-border/30",
          "shadow-lg"
        )}
      >
        {/* Badge */}
        <div className="relative px-4 pt-4">
          <div
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full",
              "bg-white/90 dark:bg-white/10 backdrop-blur-sm",
              "text-xs font-semibold text-foreground",
              "shadow-sm"
            )}
          >
            {badge}
          </div>
        </div>

        {/* Image */}
        <div className="px-4 pt-3">
          <div className="relative h-48 rounded-xl overflow-hidden bg-white/50">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 pt-4 space-y-3">
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-foreground line-clamp-2 flex-1">
              {title}
            </h3>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
            <span className="text-lg font-bold text-primary">
              ₹{discountedPrice.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
              {discountPercentage}% OFF
            </span>
          </div>

          {/* Buy Button */}
          <button
            className={cn(
              "w-full py-3 rounded-xl",
              "bg-primary text-primary-foreground",
              "font-semibold text-sm",
              "hover:bg-primary/90 active:bg-primary/95",
              "transition-colors",
              "shadow-md"
            )}
            onClick={(e) => {
              e.preventDefault();
              // Handle purchase
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}

