export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[CareBuddy PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[CareBuddy PWA] Service Worker registration warning:', err);
        });
    });
  }
}
