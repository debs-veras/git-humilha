import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import useUserStore from '@/store/useUserStore';
import { validateToken } from '@/services/auth.service';
import Loading from '@/components/Loading';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useUserStore((s) => s.token);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    async function validate() {
      const response = await validateToken();
      if (response.success && response.data?.valid) setIsValid(response.data.valid);
      else {
        useUserStore.getState().logout();
        setIsValid(false);
      }
    }

    validate();
  }, [token]);

  if (isValid === null) return <Loading />;
  if (!isValid) return <Navigate to="/login" replace />;
  return children;
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const user = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);

  if (!token) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return <>{children}</>;
}
