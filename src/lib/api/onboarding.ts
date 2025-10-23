import { ApiResponse } from "@/lib/types";

// Mock data for development
const mockOrganizations: any[] = [];
const mockAdmins: any[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const onboardingApi = {
  // Create organization
  async createOrganization(data: {
    name: string;
    subdomain?: string;
    branding?: {
      primaryColor: string;
      secondaryColor: string;
      logo: File | null;
      customDomain: string;
    };
  }): Promise<
    ApiResponse<{
      id: string;
      name: string;
      domain: string;
      subdomain: string;
      branding: any;
    }>
  > {
    await delay(1000);

    // Check if organization name already exists
    const existingOrg = mockOrganizations.find(
      (org) => org.name.toLowerCase() === data.name.toLowerCase()
    );

    if (existingOrg) {
      return {
        data: null as never,
        success: false,
        error: "Organization name already exists",
      };
    }

    // Use provided subdomain or generate from organization name
    const subdomain =
      data.subdomain ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const newOrganization = {
      id: `org-${Date.now()}`,
      name: data.name,
      domain: `${subdomain}.queztlearn.in`,
      subdomain: subdomain,
      branding: data.branding || {
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af",
        logo: null,
        customDomain: "",
      },
    };

    mockOrganizations.push(newOrganization);

    return {
      data: newOrganization,
      success: true,
      message: "Organization created successfully",
    };
  },

  // Check organization name availability
  async checkOrganizationName(
    name: string
  ): Promise<ApiResponse<{ available: boolean }>> {
    await delay(500);

    const existingOrg = mockOrganizations.find(
      (org) => org.name.toLowerCase() === name.toLowerCase()
    );

    return {
      data: { available: !existingOrg },
      success: true,
    };
  },

  // Register admin
  async registerAdmin(data: {
    email: string;
    username: string;
    organizationId: string;
  }): Promise<
    ApiResponse<{
      id: string;
      email: string;
      username: string;
      organizationId: string;
    }>
  > {
    await delay(1000);

    // Check if email already exists
    const existingAdmin = mockAdmins.find(
      (admin) => admin.email === data.email
    );
    if (existingAdmin) {
      return {
        data: null as never,
        success: false,
        error: "Email already registered",
      };
    }

    // Check if username already exists
    const existingUsername = mockAdmins.find(
      (admin) => admin.username === data.username
    );
    if (existingUsername) {
      return {
        data: null as never,
        success: false,
        error: "Username already taken",
      };
    }

    const newAdmin = {
      id: `admin-${Date.now()}`,
      email: data.email,
      username: data.username,
      organizationId: data.organizationId,
    };

    mockAdmins.push(newAdmin);

    return {
      data: newAdmin,
      success: true,
      message:
        "Admin registered successfully. Please check your email for verification.",
    };
  },

  // Check email availability
  async checkEmailAvailability(
    email: string
  ): Promise<ApiResponse<{ available: boolean }>> {
    await delay(500);

    const existingAdmin = mockAdmins.find((admin) => admin.email === email);
    return {
      data: { available: !existingAdmin },
      success: true,
    };
  },

  // Verify email
  async verifyEmail(data: {
    token: string;
  }): Promise<ApiResponse<{ verified: boolean }>> {
    await delay(1000);

    // Mock token validation
    if (
      data.token === "123456" ||
      data.token === "valid-token" ||
      data.token.length > 10
    ) {
      return {
        data: { verified: true },
        success: true,
        message: "Email verified successfully",
      };
    }

    return {
      data: { verified: false },
      success: false,
      error: "Invalid or expired verification token",
    };
  },

  // Set password
  async setPassword(data: {
    password: string;
    confirmPassword: string;
    token: string;
  }): Promise<
    ApiResponse<{
      success: boolean;
      user: {
        id: string;
        email: string;
        username: string;
        role: string;
      };
      token: string;
    }>
  > {
    await delay(1000);

    // Validate password
    if (data.password !== data.confirmPassword) {
      return {
        data: null as never,
        success: false,
        error: "Passwords do not match",
      };
    }

    if (data.password.length < 8) {
      return {
        data: null as never,
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    // Mock token validation
    if (data.token !== "valid-token" && data.token.length <= 10) {
      return {
        data: null as never,
        success: false,
        error: "Invalid or expired token",
      };
    }

    // Mock successful password setup
    const user = {
      id: "user-123",
      email: "admin@example.com",
      username: "admin",
      role: "admin",
    };

    return {
      data: {
        success: true,
        user,
        token: "jwt-token-123",
      },
      success: true,
      message: "Password set successfully. You can now access your dashboard.",
    };
  },
};
