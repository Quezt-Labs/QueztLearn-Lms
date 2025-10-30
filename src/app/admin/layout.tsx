"use client";

import { Layout } from "@/components/common/layout";
import { RouteGuard } from "@/components/common/route-guard";
import { ROLES } from "@/lib/constants";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={[ROLES.ADMIN]}>
      <Layout>{children}</Layout>
    </RouteGuard>
  );
}
