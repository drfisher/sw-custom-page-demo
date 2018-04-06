import {cacheFirst} from './cacheStrategies';
import config from './config';

/**
 * log, просто log
 */
export function log(...args) {
  args.unshift('SW:');
  console.log(...args);
}

/**
 * Заглушка на catch промисов
 * @param {Error} err
 * @return {Error}
 */
export function logError(err) {
  log('error:', err);
  return err;
}

/**
 * Возвращает запрошенный ресурс из сети или из кэша
 * @param {Request|string} request - объект запроса или url
 * @return {Promise<Response>}
 */
export function fetchSource(request) {
  if (typeof request == 'string' || !request.url.includes(config.origin)) {
    // Чужой домен, не обрабатываем этот запрос
    return fetch(request).catch(logError);
  }

  // Здесь в зависимости от урла мы можем применять
  // разные стратегии кэширования, что-то сохранять "на века",
  // что-то каждый раз обновлять и т.д. (см. './cacheStrategies.js')
  return cacheFirst(request);
}
