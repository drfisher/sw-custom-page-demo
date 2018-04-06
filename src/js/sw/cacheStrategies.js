/*
 * Реализация разных стратегий кэширования запросов.
 * Для каждого проектного кейса следует выбрать свою из представленных ниже,
 * либо придумать новый, подходящий для задачи алгоритм.
 */
import config from './config';
import {logError} from './tools';

const openCache = () => self.caches.open(config.cacheName);

/**
 * Возвращаем данные из кэша, затем фоново обновляем кэш из сети
 * @param {Request|string} request - объект запроса или url
 * @return {Promise<Response>}
 */
export function cacheFirst(request) {
  return openCache()
    .then((cache) => cache.match(request, {ignoreVary: true})
      .then((response) => {
        // Каждый раз асинхронно обновляем запрошенный ресурс из сети
        const updatePromise = fetch(request).then((networkResponse) => {
          // Кладем в кэш копию объекта ответа
          cache.put(networkResponse.url, networkResponse.clone());
          return networkResponse;
        })
          .catch(logError);
        // Возвращаем данные из кэша или результат запроса
        return response || updatePromise;
      }));
}

/**
 * Если есть в кэше, то берем оттуда, в сеть не лезем
 * @param {Request|string} request - объект запроса или url
 * @return {Promise<Response>}
 */
export function cacheFallToNetwork() {
  return ''; // fixme
}

/**
 * Сначала лезем в сеть, при неудаче проверяем в кэше
 * @param {Request|string} request - объект запроса или url
 * @return {Promise<Response>}
 */
export function networkFallToCache() {
  return ''; // fixme
}
