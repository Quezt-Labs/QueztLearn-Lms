"use client";

import { RouteGuard } from "@/components/common/route-guard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["student", "admin", "teacher"]}>
      {children}
    </RouteGuard>
  );
}
