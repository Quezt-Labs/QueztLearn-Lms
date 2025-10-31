"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDuration, formatDate } from "@/lib/utils/date";

interface VideoCardProps {
  id: string;
  title: string;
  subject: string;
  thumbnail: string;
  duration: number;
  watchedDuration: number;
  lastWatchedAt: Date;
  batchName: string;
  index?: number;
}

export function VideoCard({
  id,
  title,
  subject,
  thumbnail,
  duration,
  watchedDuration,
  lastWatchedAt,
  batchName,
  index = 0,
}: VideoCardProps) {
  const progressPercentage = (watchedDuration / duration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link href={`/student/videos/${id}`}>
        <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/50 cursor-pointer">
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={thumbnail}
              alt={title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/30 to-black/70" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-16 w-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play
                  className="h-8 w-8 text-accent-foreground ml-1"
                  fill="currentColor"
                />
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className="bg-black/60 text-white border-0"
              >
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(duration)}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                {subject}
              </Badge>
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">{batchName}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatDuration(watchedDuration)} /{" "}
                    {formatDuration(duration)}
                  </span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(lastWatchedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
