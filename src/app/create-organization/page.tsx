"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Globe,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { useCreateOrganization } from "@/hooks";
import { useOnboardingStore } from "@/lib/store";
import { BrandingSidebar } from "@/components/onboarding/branding-sidebar";

export default function CreateOrganizationPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<
    boolean | null
  >(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);

  // Branding options
  const [branding, setBranding] = useState({
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    logo: null as File | null,
    customDomain: "",
  });

  const router = useRouter();

  const { setOrganizationData, organizationData } = useOnboardingStore();
  const createOrganizationMutation = useCreateOrganization();

  // Pre-fill form if data exists
  useEffect(() => {
    if (organizationData?.name) {
      setOrganizationName(organizationData.name);
    }
  }, [organizationData]);

  // Generate subdomain from organization name
  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Check subdomain availability
  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) return;

    setIsCheckingSubdomain(true);
    // Mock API call - in real app, this would check against existing subdomains
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock availability check
    const unavailableSubdomains = [
      "admin",
      "api",
      "www",
      "app",
      "test",
      "demo",
    ];
    const isAvailable = !unavailableSubdomains.includes(subdomain);

    setIsSubdomainAvailable(isAvailable);
    setIsCheckingSubdomain(false);
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setBranding((prev) => ({ ...prev, logo: file }));
    }
  };

  const validateOrganizationName = async (name: string) => {
    if (!name.trim()) {
      setValidationError("Organization name is required");
      return false;
    }

    if (name.length < 3) {
      setValidationError("Organization name must be at least 3 characters");
      return false;
    }

    if (name.length > 50) {
      setValidationError("Organization name must be less than 50 characters");
      return false;
    }

    // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
    const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNameRegex.test(name)) {
      setValidationError(
        "Organization name can only contain letters, numbers, spaces, hyphens, and underscores"
      );
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleNameChange = async (value: string) => {
    setOrganizationName(value);

    // Generate subdomain
    const generatedSubdomain = generateSubdomain(value);
    setSubdomain(generatedSubdomain);

    // Check subdomain availability
    if (generatedSubdomain.length >= 3) {
      checkSubdomainAvailability(generatedSubdomain);
    }

    if (value.length > 2) {
      setIsValidating(true);
      const isValid = await validateOrganizationName(value);
      setIsValidating(false);
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateOrganizationName(organizationName);
    if (!isValid) return;

    try {
      const result = (await createOrganizationMutation.mutateAsync({
        name: organizationName.trim(),
        subdomain,
        branding,
      })) as any;

      if (result.success && result.data) {
        // Save organization data to store
        setOrganizationData({
          id: result.data.id,
          name: result.data.name,
          domain: result.data.domain,
        });

        // Navigate to admin registration
        router.push("/register-admin");
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
    }
  };

  const isFormValid =
    organizationName.trim().length >= 3 &&
    !validationError &&
    !isValidating &&
    subdomain.length >= 3 &&
    isSubdomainAvailable === true;

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Branding */}
      <BrandingSidebar />
      {/* Right Side - Organization Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-lg max-h-screen overflow-hidden">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <span className="text-sm font-medium">Create Organization</span>
              </div>
              <span className="text-xs text-muted-foreground">Step 1 of 4</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full w-1/4 transition-all duration-300"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-1">Create Your Organization</h2>
            <p className="text-sm text-muted-foreground">
              Set up your platform with a unique organization name
            </p>
          </div>

          {/* Organization Form */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Organization Details</CardTitle>
              <CardDescription className="text-sm">
                Choose a name for your organization. This will be used to
                identify your platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <div className="relative">
                    <Input
                      id="organizationName"
                      type="text"
                      placeholder="e.g., MIT University, Tech Academy"
                      value={organizationName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={`pr-10 ${
                        validationError ? "border-destructive" : ""
                      }`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : organizationName.length >= 3 && !validationError ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : validationError ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : null}
                    </div>
                  </div>
                  {validationError && (
                    <p className="text-sm text-destructive">
                      {validationError}
                    </p>
                  )}
                  {organizationName.length >= 3 &&
                    !validationError &&
                    !isValidating && (
                      <p className="text-sm text-green-600">
                        Organization name is available
                      </p>
                    )}
                </div>

                {/* Subdomain Preview */}
                {subdomain && (
                  <div className="space-y-2">
                    <Label>Your Platform URL</Label>
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">
                        {subdomain}.queztlearn.in
                      </span>
                      <div className="ml-auto">
                        {isCheckingSubdomain ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : isSubdomainAvailable === true ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : isSubdomainAvailable === false ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : null}
                      </div>
                    </div>
                    {isSubdomainAvailable === false && (
                      <p className="text-sm text-destructive">
                        This subdomain is not available. Try a different
                        organization name.
                      </p>
                    )}
                    {isSubdomainAvailable === true && (
                      <p className="text-sm text-green-600">
                        Great! This subdomain is available.
                      </p>
                    )}
                  </div>
                )}

                {/* Branding Options - Ultra Compact */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-3 w-3" />
                    <Label className="text-xs font-medium">
                      Branding (Optional)
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="primaryColor" className="text-xs">
                        Primary
                      </Label>
                      <div className="flex items-center space-x-1">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding((prev) => ({
                              ...prev,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="w-6 h-6 p-0 border rounded"
                        />
                        <Input
                          type="text"
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding((prev) => ({
                              ...prev,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="flex-1 text-xs h-6"
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="secondaryColor" className="text-xs">
                        Secondary
                      </Label>
                      <div className="flex items-center space-x-1">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={branding.secondaryColor}
                          onChange={(e) =>
                            setBranding((prev) => ({
                              ...prev,
                              secondaryColor: e.target.value,
                            }))
                          }
                          className="w-6 h-6 p-0 border rounded"
                        />
                        <Input
                          type="text"
                          value={branding.secondaryColor}
                          onChange={(e) =>
                            setBranding((prev) => ({
                              ...prev,
                              secondaryColor: e.target.value,
                            }))
                          }
                          className="flex-1 text-xs h-6"
                          placeholder="#1e40af"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ultra Compact Branding Preview */}
                  <div className="bg-muted/50 p-2 rounded">
                    <div
                      className="p-2 rounded text-white text-xs"
                      style={{
                        background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                          <span className="text-xs font-bold">L</span>
                        </div>
                        <div>
                          <div className="font-semibold text-xs">
                            {organizationName || "Your Organization"}
                          </div>
                          <div className="text-xs opacity-90">Platform</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-9"
                  disabled={
                    !isFormValid || createOrganizationMutation.isPending
                  }
                >
                  {createOrganizationMutation.isPending
                    ? "Creating..."
                    : "Create Organization"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
