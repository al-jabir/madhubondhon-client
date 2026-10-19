import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Hide the branded preloader from index.html once React has mounted.
function hidePreloader() {
  const node = document.getElementById('preloader')
  if (!node || node.classList.contains('mb-done')) return
  node.classList.add('mb-done')
  document.documentElement.classList.add('mb-preloader-done')
  setTimeout(() => node.remove(), 400)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// rAF never fires in background tabs (Timers get heavily throttled). A
// MessageChannel task — same trick React's scheduler uses — runs unthrottled,
// so the preloader is always removed as soon as React has committed.
let scheduled = false
function scheduleHide() {
  if (scheduled) return
  scheduled = true
  if (typeof MessageChannel !== 'undefined') {
    const ch = new MessageChannel()
    ch.port1.onmessage = hidePreloader
    ch.port2.postMessage(0)
  } else {
    setTimeout(hidePreloader, 300)
  }
  requestAnimationFrame(() => requestAnimationFrame(hidePreloader))
}
scheduleHide()

// PWA: register the service worker only in production (dev needs HMR untouched).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}
