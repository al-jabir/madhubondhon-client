import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Resolved = 'light' | 'dark';

/** saved === null means "follow the OS preference" (the default). */
function readSavedTheme(): 'light' | 'dark' | null {
  try {
    const value = document.cookie.split('; ').find(c => c.startsWith('mb_theme='))?.split('=')[1];
    return value === 'light' || value === 'dark' ? value : null;
  } catch { return null; }
}

function applyTheme(theme: Resolved) {
  document.documentElement.dataset.theme = theme;
  // Legacy `.dark` class must never linger — it overrides data-theme in CSS.
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const [saved, setSaved] = useState<'light' | 'dark' | null>(readSavedTheme);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Effective theme: explicit user choice wins, otherwise follow the OS.
  const effective: Resolved = saved ?? (systemDark ? 'dark' : 'light');
  const dark = effective === 'dark';

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onMedia = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onMedia);
    return () => media.removeEventListener('change', onMedia);
  }, []);

  // Apply whenever the resolved theme changes (OS switch while unsaved → still updates).
  useEffect(() => {
    applyTheme(effective);
  }, [effective]);

  const toggle = () => {
    const next: Resolved = dark ? 'light' : 'dark';
    setSaved(next);
    try {
      document.cookie = 'mb_theme=' + next + '; Max-Age=31536000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    } catch { /* Cookie may be blocked; the choice still applies for this visit. */ }
    window.dispatchEvent(new CustomEvent('mb-theme-change', { detail: next }));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label="রং পরিবর্তন — light/dark থিম সুইচ"
      title={dark ? 'Light থিমে যান' : 'Dark থিমে যান'}
      className="group relative inline-flex h-8 w-16 shrink-0 items-center rounded-full border border-strongline bg-elev cursor-pointer focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 transition-colors hover:border-brand/50"
    >
      {/* Sliding knob */}
      <span
        aria-hidden="true"
        className={`absolute top-[3px] left-[3px] h-[24px] w-[24px] rounded-full bg-card shadow-sm transition-transform duration-200 ease-out ${dark ? 'translate-x-8' : 'translate-x-0'} border border-brand/25 group-hover:border-brand/40`}
      />
      {/* Icons */}
      <span className={`relative z-1 flex h-full w-1/2 items-center justify-center transition-colors ${!dark ? 'text-brand' : 'text-ink-3'}`}>
        <Sun size={15} strokeWidth={2.2} />
      </span>
      <span className={`relative z-1 flex h-full w-1/2 items-center justify-center transition-colors ${dark ? 'text-brand' : 'text-ink-3'}`}>
        <Moon size={15} strokeWidth={2.2} />
      </span>
    </button>
  );
}
