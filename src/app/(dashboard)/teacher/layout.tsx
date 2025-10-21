"use client";

import { RouteGuard } from "@/components/common/route-guard";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["teacher", "admin"]}>{children}</RouteGuard>
  );
}
