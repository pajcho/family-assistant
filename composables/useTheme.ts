export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'theme-mode';

export function useTheme() {
  const mode = useState<ThemeMode>('theme-mode', () => 'auto');
  const isDark = useState<boolean>('theme-is-dark', () => false);

  function applyTheme(themeMode: ThemeMode): void {
    let shouldBeDark = false;

    if (themeMode === 'dark') {
      shouldBeDark = true;
    } else if (themeMode === 'auto') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    isDark.value = shouldBeDark;

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function setMode(newMode: ThemeMode): void {
    mode.value = newMode;
    localStorage.setItem(STORAGE_KEY, newMode);
    applyTheme(newMode);
  }

  function init(): void {
    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      mode.value = stored;
    }

    // Apply initial theme
    applyTheme(mode.value);

    // Listen for system preference changes (for auto mode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (mode.value === 'auto') {
        applyTheme('auto');
      }
    });
  }

  return {
    mode,
    isDark,
    setMode,
    init,
  };
}
