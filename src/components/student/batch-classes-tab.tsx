"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function BatchClassesTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">Classes Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Class recordings and live sessions will be available here once the
            batch starts.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
