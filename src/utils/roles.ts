const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador(a)',
};

export function getRoleLabel(role?: string): string {
  if (!role) return '-';
  return roleLabels[role] || role;
}

export const roleOptions = [{ value: 'ADMIN', label: 'Administrador' }];
