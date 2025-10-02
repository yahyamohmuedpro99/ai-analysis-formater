// Utility functions for theme management
export const themeUtils = {
  // Get the current theme
  getCurrentTheme: (): string => {
    if (typeof window !== 'undefined') {
      // Check for dark mode preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      // Check for manually set theme
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme;
      }
      // Default to light
      return 'light';
    }
    return 'light';
  },
  
  // Set the theme
  setTheme: (theme: 'light' | 'dark'): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  
  // Toggle between light and dark
  toggleTheme: (): void => {
    const currentTheme = themeUtils.getCurrentTheme();
    themeUtils.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }
};