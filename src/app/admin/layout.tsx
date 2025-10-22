"use client";

import { Layout } from "@/components/common/layout";
import { RouteGuard } from "@/components/common/route-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["admin"]}>
      <Layout>{children}</Layout>
    </RouteGuard>
  );
}
