import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LanguageId } from '../data/dummy';

export interface SettingsState {
  sounds: boolean;
  music: boolean;
  notifications: boolean;
  language: LanguageId;
}

export interface SettingsActions {
  setSounds: (v: boolean) => void;
  setMusic: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
  setLanguage: (l: LanguageId) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      sounds: true,
      music: false,
      notifications: true,
      language: 'en',

      setSounds: (sounds) => set({ sounds }),
      setMusic: (music) => set({ music }),
      setNotifications: (notifications) => set({ notifications }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'khel-club-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

