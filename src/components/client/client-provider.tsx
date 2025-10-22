"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useClientByDomain, useClientBySubdomain } from "@/hooks/client-hooks";
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

      // Handle production subdomains (e.g., mit.queztlearn.in)
      if (hostname.endsWith(".queztlearn.in")) {
        const parts = hostname.split(".");
        if (parts.length > 2) {
          const subdomainFromHost = parts[0];
          setDetectedSubdomain(subdomainFromHost);
        }
      }
      // Handle localhost development with subdomain parameter
      else if (
        hostname === "localhost" ||
        hostname.startsWith("localhost:") ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("127.0.0.1:")
      ) {
        const urlParams = new URLSearchParams(window.location.search);
        const subdomainFromUrl = urlParams.get("subdomain");
        if (subdomainFromUrl) {
          setDetectedSubdomain(subdomainFromUrl);
        }
      }
    }
  }, [subdomain]);

  const finalSubdomain = subdomain || detectedSubdomain;

  // Try domain first, then subdomain
  const {
    data: clientByDomain,
    isLoading: domainLoading,
    error: domainError,
  } = useClientByDomain(domain || "");
  const {
    data: clientBySubdomain,
    isLoading: subdomainLoading,
    error: subdomainError,
  } = useClientBySubdomain(finalSubdomain || "");

  const client = clientByDomain || clientBySubdomain;
  const isLoading = domainLoading || subdomainLoading;
  const error =
    domainError?.message ||
    subdomainError?.message ||
    (!isLoading && !client ? "Client not found" : null);

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
