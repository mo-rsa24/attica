import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: roles } = await supabase
          .from("user_roles" as any)
          .select("role")
          .eq("user_id", session.user.id);
        const admin = (roles as any[] | null)?.some((r: any) => r.role === "admin");
        setIsAdmin(!!admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data: roles } = await supabase
          .from("user_roles" as any)
          .select("role")
          .eq("user_id", session.user.id);
        const admin = (roles as any[] | null)?.some((r: any) => r.role === "admin");
        setIsAdmin(!!admin);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-body text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};

export default Admin;
