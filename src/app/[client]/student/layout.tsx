"use client";

import { Layout } from "@/components/common/layout";
import { RouteGuard } from "@/components/common/route-guard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["student", "admin", "teacher"]}>
      <Layout>{children}</Layout>
    </RouteGuard>
  );
}
