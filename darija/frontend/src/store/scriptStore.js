import { create } from 'zustand';

const STORAGE_KEY = 'darijalingo_script_mode';

const useScriptStore = create((set) => ({
  scriptMode: localStorage.getItem(STORAGE_KEY) || 'latin',

  setScriptMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    // Update body direction
    if (mode === 'arabic') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
    set({ scriptMode: mode });
  },
}));

export default useScriptStore;
