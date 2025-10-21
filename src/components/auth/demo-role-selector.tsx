"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DemoRoleSelectorProps {
  selectedRole: "admin" | "teacher" | "student";
  onRoleSelect: (role: "admin" | "teacher" | "student") => void;
}

export function DemoRoleSelector({
  selectedRole,
  onRoleSelect,
}: DemoRoleSelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Quick Demo Access</Label>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={selectedRole === "admin" ? "default" : "outline"}
          size="sm"
          onClick={() => onRoleSelect("admin")}
          className="text-xs"
        >
          Admin
        </Button>
        <Button
          variant={selectedRole === "teacher" ? "default" : "outline"}
          size="sm"
          onClick={() => onRoleSelect("teacher")}
          className="text-xs"
        >
          Teacher
        </Button>
        <Button
          variant={selectedRole === "student" ? "default" : "outline"}
          size="sm"
          onClick={() => onRoleSelect("student")}
          className="text-xs"
        >
          Student
        </Button>
      </div>
    </div>
  );
}
