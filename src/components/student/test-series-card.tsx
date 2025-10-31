"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TestSeriesCardProps {
  id: string;
  title: string;
  exam: string;
  imageUrl?: string;
  totalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  totalTests: number;
  attemptedTests: number;
  averageScore: number;
  validUntil: Date;
  index?: number;
}

export function TestSeriesCard({
  id,
  title,
  exam,
  imageUrl,
  totalTests,
  attemptedTests,
  averageScore,
  validUntil,
  index = 0,
}: TestSeriesCardProps) {
  const completionPercentage = (attemptedTests / totalTests) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/50 h-full flex flex-col">
        <div className="relative h-40 overflow-hidden bg-linear-to-br from-orange-100 to-orange-50 dark:from-orange-950 dark:to-orange-900">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="h-16 w-16 text-orange-400" />
            </div>
          )}
          <Badge className="absolute top-3 right-3 bg-black/60 text-white border-0">
            {exam}
          </Badge>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col space-y-3">
          <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y">
            <div>
              <p className="text-xs text-muted-foreground">Tests</p>
              <p className="font-semibold text-sm">
                {attemptedTests}/{totalTests}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="font-semibold text-sm text-green-600">
                {averageScore}%
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-1.5" />
          </div>

          {/* Valid Until */}
          <p className="text-xs text-muted-foreground">
            Valid until{" "}
            {validUntil.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <Button className="w-full mt-auto" variant="outline" asChild>
            <Link href={`/student/test-series/${id}`}>
              Take Test
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
