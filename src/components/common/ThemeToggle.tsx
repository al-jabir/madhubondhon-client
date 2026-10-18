import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
type Preference = 'system' | 'light' | 'dark';
function readPreference(): Preference {
  try {
    const value = document.cookie.split('; ').find(c => c.startsWith('mb_theme='))?.split('=')[1];
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch { return 'system'; }
}
function apply(preference: Preference) {
  const dark = preference === 'dark' || (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}
export default function ThemeToggle() {
  const [preference, setPreference] = useState<Preference>(readPreference);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => apply(preference);
    update();
    media.addEventListener('change', update);
    const sync = (event: Event) => setPreference((event as CustomEvent<Preference>).detail);
    window.addEventListener('mb-theme-change', sync);
    return () => { media.removeEventListener('change', update); window.removeEventListener('mb-theme-change', sync); };
  }, [preference]);
  const Icon = preference === 'system' ? Monitor : preference === 'dark' ? Moon : Sun;
  const next: Preference = preference === 'light' ? 'dark' : preference === 'dark' ? 'system' : 'light';
  const names = { light: 'Light', dark: 'Dark', system: 'System' };
  const label = 'থিম: ' + names[preference] + '। ' + names[next] + ' mode-এ বদলান';
  return (
    <button type="button" className="theme-toggle theme-icon-button" title={label} aria-label={label} onClick={() => {
      setPreference(next);
      apply(next);
      try { document.cookie = 'mb_theme=' + next + '; Max-Age=31536000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); } catch { /* The selection still applies for this visit. */ }
      window.dispatchEvent(new CustomEvent('mb-theme-change', { detail: next }));
    }}>
      <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
    </button>
  );
}
