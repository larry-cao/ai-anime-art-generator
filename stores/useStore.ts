// stores/useStore.ts
import create from 'zustand';

// Define the type for our store's state and actions
interface StoreState {
  lastPictureId: string;
  setLastPictureId: (data: string) => void;
}

// Create the Zustand store with the defined types
const useStore = create<StoreState>((set) => ({
  lastPictureId: '',
  setLastPictureId: (data) => set({ lastPictureId: data }),
}));

export default useStore;
