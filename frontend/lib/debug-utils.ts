// Utility functions for debugging dark mode
export const debugUtils = {
  // Log current theme status
  logThemeStatus: (): void => {
    if (typeof window !== 'undefined') {
      console.log('=== Dark Mode Debug Info ===');
      console.log('HTML classList:', document.documentElement.classList);
      console.log('Has dark class:', document.documentElement.classList.contains('dark'));
      console.log('localStorage theme:', localStorage.getItem('theme'));
      console.log('prefers-color-scheme dark:', window.matchMedia('(prefers-color-scheme: dark)').matches);
      console.log('============================');
    }
  },
  
  // Force dark mode
  forceDarkMode: (): void => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  },
  
  // Force light mode
  forceLightMode: (): void => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
};