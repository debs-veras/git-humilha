import type { User } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


type UserState = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'user_storage',
    }
  )
);

export default useUserStore;
