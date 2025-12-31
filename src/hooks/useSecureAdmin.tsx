import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useSecureAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userId =
          (user as any)?.uid || (user as any)?.localId || user?.id || user?.email;

        const { data, error } = await supabase.functions.invoke("verify-admin", {
          body: {
            firebaseUserId: userId,
            email: user?.email ?? null,
            phoneNumber: (user as any)?.phoneNumber ?? null,
          },
        });

        if (error) {
          console.error("[useSecureAdmin] verify-admin error:", error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(Boolean((data as any)?.isAdmin));
      } catch (err) {
        console.error("[useSecureAdmin] Exception checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
