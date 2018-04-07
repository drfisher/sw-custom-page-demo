import {clear} from 'idb-keyval';

import {cacheName, dependenciesToCache, offlineListPath} from './config';
import {addToOfflineList, createOfflineListResponse} from './offlineList';
import {fetchSource, log, logError, ping} from './tools';

/*
 * Установка
 */
self.addEventListener('install', (event) => {
  log('Installed');

  // Загружаем файлы, которые потребуются для offline-режима
  const loadDependencies = dependenciesToCache.length ?
    self.caches.open(cacheName)
      .then((cache) => cache.addAll(dependenciesToCache))
      .then(() => log('All dependencies were loaded'))
    : Promise.resolve();

  event.waitUntil(loadDependencies);
});

/*
 * Активация
 */
self.addEventListener('activate', (event) => {
  // чистим записи в IndexedDB
  const promiseClearIDB = clear().then(() => log('IndexedDB has been cleared'));

  // чистим старый кэш
  const promiseClearCache = self.caches.open(cacheName)
    .then((cache) => cache.keys()
      .then((cacheKeys) => Promise.all(cacheKeys.map((request) => {
        // Удаляем все, кроме ресурсов из конфига зависимостей
        const canDelete = !dependenciesToCache.includes(request.url);
        return canDelete ? Promise.resolve()
          : cache.delete(request, {ignoreVary: true});
      }))))
    .then(() => log('Cache has been cleared'));

  const promiseClearAll = Promise.all([promiseClearIDB, promiseClearCache]);
  promiseClearAll
    .then(() => log('Activated'))
    .catch(logError);
  event.waitUntil(promiseClearAll);
});

/*
 * Обработка сетевых запросов
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isOfflineListRequested = offlineListPath.test(url.pathname);

  const responsePromise = isOfflineListRequested
    // Создаем кастомный response cо списком материалов, доступных офлайн
    ? createOfflineListResponse()
    // Делаем обычный запрос или возвращаем данные из кэша
    : fetchSource(event.request);

  event.respondWith(responsePromise);
});

/*
 * Обработка сообщений со страниц
 */
self.addEventListener('message', (event) => {
  const {data = {}} = event;
  const {page} = data;
  switch (data.action) {
    case 'ping':
      ping();
      break;
    case 'registerPage':
      addToOfflineList(page)
        .then(
          () => log(`Page was registered as available offline: ${page.url}`),
          logError
        );
      break;
  }
});
