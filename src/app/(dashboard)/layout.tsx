"use client";

import { Layout } from "@/components/common/layout";
import { RouteGuard } from "@/components/common/route-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["admin", "teacher", "student"]}>
      <Layout>{children}</Layout>
    </RouteGuard>
  );
}
