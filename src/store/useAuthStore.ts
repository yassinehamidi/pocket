import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { hashPassword, makeSalt } from '@/lib/auth';
import { useFinanceStore } from '@/store/useFinanceStore';

interface Account {
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface AuthState {
  /** The device-local account, or null if nobody has signed up yet. */
  account: Account | null;
  /** True while the user is logged in. */
  session: boolean;
  /** True once the first-launch guide has been completed or skipped. */
  hasOnboarded: boolean;
  /** True once persisted state has been read back from storage. */
  hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  completeOnboarding: () => void;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  logIn: (input: { email: string; password: string }) => Promise<boolean>;
  /** Enters the app without an account, skipping sign-up/log-in. */
  continueAsGuest: () => void;
  logOut: () => void;
  updateName: (name: string) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  /** Deletes the account and all finance data on this device. */
  deleteAccount: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      session: false,
      hasOnboarded: false,
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      completeOnboarding: () => set({ hasOnboarded: true }),

      signUp: async ({ name, email, password }) => {
        const salt = makeSalt();
        const passwordHash = await hashPassword(password, salt);
        set({
          account: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            passwordHash,
            salt,
            createdAt: new Date().toISOString(),
          },
          session: true,
        });
        useFinanceStore.getState().setUserName(name.trim());
      },

      logIn: async ({ email, password }) => {
        const account = get().account;
        if (!account || account.email !== email.trim().toLowerCase()) return false;
        const hash = await hashPassword(password, account.salt);
        if (hash !== account.passwordHash) return false;
        set({ session: true });
        return true;
      },

      continueAsGuest: () => set({ session: true }),

      logOut: () => set({ session: false }),

      updateName: (name) => {
        const account = get().account;
        if (!account) return;
        set({ account: { ...account, name: name.trim() } });
        useFinanceStore.getState().setUserName(name.trim());
      },

      changePassword: async (currentPassword, newPassword) => {
        const account = get().account;
        if (!account) return false;
        const currentHash = await hashPassword(currentPassword, account.salt);
        if (currentHash !== account.passwordHash) return false;
        const salt = makeSalt();
        const passwordHash = await hashPassword(newPassword, salt);
        set({ account: { ...account, passwordHash, salt } });
        return true;
      },

      deleteAccount: () => {
        useFinanceStore.getState().eraseAllData();
        useFinanceStore.getState().setUserName('');
        set({ account: null, session: false });
      },
    }),
    {
      name: 'pocket-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        account: s.account,
        session: s.session,
        hasOnboarded: s.hasOnboarded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
