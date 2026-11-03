import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserState {
  // Profile
  name: string;
  username: string;
  photoUri: string | null;
  avatarId: string | null; // e.g. 'cat' | 'bird' | 'rabbit' | 'turtle' | 'fish'
  // Progression
  coins: number;
  points: number;
  // Club
  clubId: string | null;
  // Status
  isOnboarded: boolean;
  // Hydration flag — set by zustand onRehydrateStorage
  _hydrated: boolean;
}

export interface UserActions {
  setProfile: (updates: Partial<Pick<UserState, 'name' | 'username' | 'photoUri' | 'avatarId'>>) => void;
  completeOnboarding: (name: string, username: string, photoUri: string | null, avatarId: string | null) => void;
  setHydrated: () => void;
  reset: () => void;
}

const defaultState: UserState = {
  name: '',
  username: '',
  photoUri: null,
  avatarId: null,
  coins: 0,
  points: 0,
  clubId: null,
  isOnboarded: false,
  _hydrated: false,
};

function generateClubId(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `KC${digits}`;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...defaultState,

      setProfile: (updates) => set((s) => ({ ...s, ...updates })),

      completeOnboarding: (name, username, photoUri, avatarId) =>
        set({
          name,
          username,
          photoUri,
          avatarId,
          coins: 500,
          points: 0,
          clubId: generateClubId(),
          isOnboarded: true,
        }),

      setHydrated: () => set({ _hydrated: true }),

      reset: () => set({ ...defaultState, _hydrated: true }),
    }),
    {
      name: 'khel-club-user',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Called after AsyncStorage hydration completes
        state?.setHydrated();
      },
    },
  ),
);

