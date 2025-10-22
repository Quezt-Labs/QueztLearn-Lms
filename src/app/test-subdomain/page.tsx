"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TestSubdomainPage() {
  const [subdomain, setSubdomain] = useState("mit");
  const [role, setRole] = useState("student");

  const testSubdomain = () => {
    // For local testing, use query params; for production, construct subdomain URL
    const isLocalhost = window.location.hostname === "localhost";
    const url = isLocalhost
      ? new URL(window.location.origin)
      : new URL(`https://${subdomain}.queztlearn.in`);

    if (isLocalhost) {
      url.searchParams.set("subdomain", subdomain);
    }
    url.searchParams.set("role", role);
    window.open(url.toString(), "_blank");
  };

  const testMainDomain = () => {
    const isLocalhost = window.location.hostname === "localhost";
    const baseUrl = isLocalhost
      ? "http://localhost:3000"
      : "https://queztlearn.com";
    window.open(`${baseUrl}/login`, "_blank");
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Subdomain Routing Test</CardTitle>
          <CardDescription>
            Test the subdomain routing functionality for your LMS system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="e.g., mit, stanford, harvard"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Test Subdomain (Student/Org Site)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will simulate accessing: {subdomain}.queztlearn.in
              </p>
              <Button onClick={testSubdomain} className="w-full">
                Test {subdomain}.queztlearn.in as {role}
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Test Main Domain (Admin/Teacher Login)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will simulate accessing: queztlearn.com/login
              </p>
              <Button
                onClick={testMainDomain}
                variant="outline"
                className="w-full"
              >
                Test queztlearn.com/login
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How to test in production:</h4>
            <ul className="text-sm space-y-1">
              <li>
                • <strong>mit.queztlearn.in</strong> → Student site
              </li>
              <li>
                • <strong>queztlearn.com/admin/dashboard</strong> → Admin
                dashboard
              </li>
              <li>
                • <strong>queztlearn.com/teacher/dashboard</strong> → Teacher
                dashboard
              </li>
              <li>
                • <strong>queztlearn.com</strong> → Redirects to /login
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Role-based Access:</h4>
            <ul className="text-sm space-y-1">
              <li>
                • <strong>Admin:</strong> queztlearn.com/admin/* - Full access
              </li>
              <li>
                • <strong>Teacher:</strong> queztlearn.com/teacher/* - Teacher
                interface
              </li>
              <li>
                • <strong>Student:</strong> mit.queztlearn.in/student/* -
                Student interface
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
