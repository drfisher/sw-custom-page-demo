/*
 * Реализация разных стратегий кэширования запросов.
 * Для каждого проектного кейса следует выбрать свою из представленных ниже,
 * либо придумать новый, подходящий для задачи алгоритм.
 */
import {cacheName} from './config';
import {logError} from './tools';

const openCache = () => self.caches.open(cacheName);

/**
 * Возвращаем данные из кэша, затем фоново обновляем кэш из сети
 * (актуальные данные будут показаны в "следующий" раз)
 * @param {Request|string} request - объект запроса или url
 * @return {Promise<Response>}
 */
export function cacheFirst(request) {
  return openCache()
    .then((cache) => cache.match(request, {ignoreVary: true})
      .then((response) => {
        // Каждый раз асинхронно обновляем запрошенный ресурс из сети
        const updatePromise = fetch(request).then((networkResponse) => {
          // Кладем в кэш
          cache.put(networkResponse.url, networkResponse.clone());
          // Возвращаем копию
          return networkResponse;
        })
          .catch(logError);
        // Возвращаем данные из кэша или результат запроса
        return response || updatePromise;
      }));
}

/**
 * Если есть в кэше, то берем оттуда, в сеть не лезем
 * (актуальные данные не будут показаны, пока не очистим кэш)
 * @param {Request|string} request - объект запроса или url
 * @return {Promise<Response>}
 */
export function cacheFallToNetwork(request) {
  return openCache()
    .then((cache) => cache.match(request, {ignoreVary: true})
      // если response отсутствует, только тогда загружаем его
      .then((response) => response || fetch(request)
        .then((networkResponse) => {
          // Кладем в кэш
          cache.put(networkResponse.url, networkResponse);
          // Возвращаем копию
          return networkResponse.clone();
        })));
}

/**
 * Сначала лезем в сеть, при неудаче проверяем в кэше
 * (данные всегда актуальные, если онлайн, но есть задержка на загрузку)
 * @param {Request|string} request - объект запроса или url
 * @return {Promise<Response>}
 */
export function networkFallToCache(request) {
  return fetch(request)
    .then(
      (networkResponse) => {
        // Кладем в кэш
        openCache().then((cache) =>
          cache.put(networkResponse.url, networkResponse));
        // Возвращаем копию ответа
        return networkResponse.clone();
      },
      // При ошибке во время запроса пытаемся найти ответ в кэше
      (err) => openCache()
          .then((cache) => cache.match(request, {ignoreVary: true}))
    );
}
