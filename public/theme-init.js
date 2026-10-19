// Apply before React/CSS paint to avoid a light flash for dark-mode users.
// Default = follow the OS preference; an explicit mb_theme cookie (light|dark) overrides it.
(() => {
  let saved: 'light' | 'dark' | null = null;
  try {
    const value = document.cookie.split('; ').find(part => part.startsWith('mb_theme='))?.split('=')[1];
    if (value === 'light' || value === 'dark') saved = value;
  } catch { /* Cookie storage may be blocked. System preference still works. */ }
  const dark = saved === 'dark' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
})();
