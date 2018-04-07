// имя хранилища кэша
export const cacheName = 'sw_demo_statics';

// список ресурсов для offline-режима: css, картинки...
export const dependenciesToCache = [
  '/css/app.css',
  '/img/body_bg.png',
  '/img/default_thumb.png',
  '/img/simpsons.png',
];

// ключ, по которому храним в IndexdDB список страниц, доступных офлайн
export const idbPagesListKey = 'cachedPages';

// pathname, по которому отдаем список офлайн страниц
export const offlineListPath = /^\/offline\//ig;

// текущий origin
export const origin = self.location.origin;

// адрес для проверки доступности сервера
export const pingUrl = '/ping.json';

