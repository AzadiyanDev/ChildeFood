// سرویس‌ورکر برای پاکسازی خودکار کش‌های قبلی مرورگر و لود مستقیم آخرین تغییرات از سرور
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // بدون هیچ کش اجباری، همیشه آخرین فایل‌ها از شبکه فراخوانی می‌شن
  event.respondWith(fetch(event.request));
});
