import { decodeJwt } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useAuth = (requiredRole: string) => {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const clearTokenAndRedirect = () => {
      localStorage.removeItem("token");
      router.push("/login");
    };

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        clearTokenAndRedirect();
        return;
      }
  
      try {
        const decodedToken = decodeJwt(token);
        const currentTime = Date.now() / 1000;
  
        if (decodedToken.exp < currentTime) {
          clearTokenAndRedirect();
          return;
        }

        if (requiredRole && decodedToken.role !== requiredRole) {
          clearTokenAndRedirect();
          return;
        }

        setUsername(decodedToken.username);
      } catch (error) {
        console.error("Erro ao verificar o token:", error);
        clearTokenAndRedirect();
      }
    };

    checkAuth();
  }, [requiredRole, router]);

  return { username };
};
