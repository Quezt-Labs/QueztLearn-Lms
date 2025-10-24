"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, User } from "lucide-react";
import { useInviteUser } from "@/hooks/api";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";

interface InviteUserDialogProps {
  children: React.ReactNode;
}

export function InviteUserDialog({ children }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const inviteUserMutation = useInviteUser();

  // Form validation
  const {
    updateField,
    validateFieldOnBlur,
    validateAllFields,
    getFieldValue,
    getFieldError,
    isFormValid,
    isFieldValidating,
    resetForm,
  } = useEnhancedFormValidation({
    email: "",
    username: "",
  });

  // Loading state management
  const { isLoading, error, setError, setSuccess, executeWithLoading } =
    useLoadingState({
      autoReset: true,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAllFields()) {
      setError("Please fix the form errors before submitting");
      return;
    }

    try {
      await executeWithLoading(async () => {
        const result = (await inviteUserMutation.mutateAsync({
          email: getFieldValue("email"),
          username: getFieldValue("username"),
        })) as {
          success: boolean;
          data?: { id: string; email: string; username: string };
        };

        if (result.success) {
          // Reset form and close dialog
          resetForm();
          setOpen(false);

          // Show success message
          setSuccess(true);
        } else {
          setError("Failed to invite user");
        }
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      resetForm();
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invite User</span>
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a new user to join your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMessage error={error} />

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={getFieldValue("email")}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => validateFieldOnBlur("email")}
                className="pl-10"
                required
              />
              {isFieldValidating("email") && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
            {getFieldError("email") && (
              <p className="text-sm text-destructive">
                {getFieldError("email")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={getFieldValue("username")}
                onChange={(e) => updateField("username", e.target.value)}
                onBlur={() => validateFieldOnBlur("username")}
                className="pl-10"
                required
              />
              {isFieldValidating("username") && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
            {getFieldError("username") && (
              <p className="text-sm text-destructive">
                {getFieldError("username")}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !isFormValid || inviteUserMutation.isPending || isLoading
              }
            >
              {isLoading || inviteUserMutation.isPending
                ? "Sending Invitation..."
                : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
