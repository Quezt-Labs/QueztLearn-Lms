"use client";

import { RouteGuard } from "@/components/common/route-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={["admin"]}>{children}</RouteGuard>;
}
