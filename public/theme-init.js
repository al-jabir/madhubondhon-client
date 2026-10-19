// Apply before React/CSS paint to avoid a light flash for dark-mode users.
// Default = follow the OS preference; an explicit mb_theme cookie (light|dark) overrides it.
(() => {
  let saved = null;
  try {
    const cookie = document.cookie.split('; ').find(part => part.startsWith('mb_theme='));
    const value = cookie ? cookie.split('=')[1] : null;
    if (value === 'light' || value === 'dark') saved = value;
  } catch { /* Cookie storage may be blocked. System preference still works. */ }
  const dark = saved === 'dark' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  /* data-theme is the single source of truth — the `.dark` class would fight
     the CSS selectors (which treat [.dark] as dark regardless of data-theme). */
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
})();
