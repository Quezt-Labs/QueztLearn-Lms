"use client";

import { Layout } from "@/components/common/layout";
import { RouteGuard } from "@/components/common/route-guard";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["teacher", "admin"]}>
      <Layout>{children}</Layout>
    </RouteGuard>
  );
}
