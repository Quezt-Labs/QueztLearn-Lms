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
        const subdomainFromHost = hostname.split(".")[0];
        setDetectedSubdomain(subdomainFromHost);
      }
      // Handle localhost development with subdomain parameter
      else if (
        hostname.includes("localhost") ||
        hostname.includes("127.0.0.1")
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
  const { data: clientByDomain, isLoading: domainLoading } = useClientByDomain(
    domain || ""
  );
  const { data: clientBySubdomain, isLoading: subdomainLoading } =
    useClientBySubdomain(finalSubdomain || "");

  const client = clientByDomain || clientBySubdomain;
  const isLoading = domainLoading || subdomainLoading;
  const error = !isLoading && !client ? "Client not found" : null;

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
