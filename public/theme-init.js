// Apply before React/CSS paint to avoid a light flash for dark-mode users.
(() => {
  let preference = 'system';
  try {
    const saved = document.cookie.split('; ').find(part => part.startsWith('mb_theme='))?.split('=')[1];
    if (saved === 'light' || saved === 'dark' || saved === 'system') preference = saved;
  } catch { /* Cookie storage may be blocked. System preference still works. */ }
  const dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
})();
