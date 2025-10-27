"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
// Removed client-hooks import - using mock data for now
import { Client } from "@/lib/types/client";

interface ClientContextType {
  client: Client | null;
  isLoading: boolean;
  error: string | null;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
  children: ReactNode;
  domain?: string;
  subdomain?: string;
}

export function ClientProvider({
  children,
  domain,
  subdomain,
}: ClientProviderProps) {
  const [detectedSubdomain, setDetectedSubdomain] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Auto-detect subdomain from hostname if not provided
    if (!subdomain && typeof window !== "undefined") {
      const hostname = window.location.hostname;

      // Handle production subdomains (e.g., mit.queztlearn.com)
      if (hostname.endsWith(".queztlearn.com")) {
        const parts = hostname.split(".");
        if (parts.length > 2) {
          const subdomainFromHost = parts[0];
          setDetectedSubdomain(subdomainFromHost);
        }
      }
      // Handle localhost development with subdomain parameter
      else if (hostname === "localhost") {
        const urlParams = new URLSearchParams(window.location.search);
        const subdomainFromUrl = urlParams.get("subdomain");
        if (subdomainFromUrl) {
          setDetectedSubdomain(subdomainFromUrl);
        }
      }
    }
  }, [subdomain]);

  const finalSubdomain = subdomain || detectedSubdomain;

  // Mock client data for now
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchClient = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Mock client data
        const mockClient: Client = {
          id: "client-1",
          name: "Demo University",
          domain: finalSubdomain
            ? `${finalSubdomain}.queztlearn.com`
            : "demo.queztlearn.com",
          subdomain: finalSubdomain || "demo",
          basePath: "queztlearn",
          logo: "/images/Logo.png",
          primaryColor: "#3b82f6",
          secondaryColor: "#1e40af",
          theme: "light",
          isActive: true,
          settings: {
            allowSelfRegistration: true,
            maxUsers: 1000,
            features: ["courses", "assignments", "discussions"],
            customBranding: true,
            customDomain: false,
            analytics: true,
            apiAccess: true,
            theme: {
              primaryColor: "#3b82f6",
              secondaryColor: "#1e40af",
            },
          },
          createdAt: new Date().toISOString(),
        };

        setClient(mockClient);
      } catch {
        setError("Failed to load client data");
      } finally {
        setIsLoading(false);
      }
    };

    if (finalSubdomain || domain) {
      fetchClient();
    } else {
      setIsLoading(false);
      setError("No subdomain or domain provided");
    }
  }, [finalSubdomain, domain]);

  return (
    <ClientContext.Provider
      value={{ client: client || null, isLoading, error: error || null }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
}
