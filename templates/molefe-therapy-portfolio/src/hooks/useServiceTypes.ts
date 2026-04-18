import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number | null;
  category: string;
  mode: string;
  is_first_consult: boolean;
  is_follow_up: boolean;
  requires_intake: boolean;
  max_participants: number;
  color: string | null;
  is_active: boolean;
  sort_order: number;
}

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as any[] as ServiceType[];
    },
  });
};
