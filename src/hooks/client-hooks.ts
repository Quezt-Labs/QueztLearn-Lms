import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client-api";

// Hook to get client by domain
export const useClientByDomain = (domain: string) => {
  return useQuery({
    queryKey: ["client", "domain", domain],
    queryFn: () => clientApi.getClientByDomain(domain),
    enabled: !!domain,
    select: (data) => (data.success ? data.data : null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get client by subdomain
export const useClientBySubdomain = (subdomain: string) => {
  return useQuery({
    queryKey: ["client", "subdomain", subdomain],
    queryFn: () => clientApi.getClientBySubdomain(subdomain),
    enabled: !!subdomain,
    select: (data) => (data.success ? data.data : null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get client homepage
export const useClientHomepage = (clientId: string) => {
  return useQuery({
    queryKey: ["client-homepage", clientId],
    queryFn: () => clientApi.getClientHomepage(clientId),
    enabled: !!clientId,
    select: (data) => (data.success ? data.data : null),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get all clients (admin only)
export const useAllClients = () => {
  return useQuery({
    queryKey: ["all-clients"],
    queryFn: () => clientApi.getAllClients(),
    select: (data) => (data.success ? data.data : null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create client
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientApi.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-clients"] });
    },
  });
};

// Hook to update client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      updates,
    }: {
      clientId: string;
      updates: Partial<import("@/lib/types/client").Client>;
    }) => clientApi.updateClient(clientId, updates),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ["client"] });
      queryClient.invalidateQueries({
        queryKey: ["client-homepage", clientId],
      });
      queryClient.invalidateQueries({ queryKey: ["all-clients"] });
    },
  });
};
