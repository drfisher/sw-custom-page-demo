import {get} from 'idb-keyval';
import * as cacheStrategies from './cacheStrategies';
import {origin, pingUrl, idbPagesListKey} from './config';

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
  if (typeof request == 'string' || !request.url.includes(origin)) {
    // Чужой домен, не обрабатываем этот запрос
    return fetch(request).catch(logError);
  }

  // Здесь в зависимости от урла мы можем применять
  // разные стратегии кэширования, что-то сохранять "на века",
  // что-то каждый раз обновлять и т.д. (см. './cacheStrategies.js')
  return cacheStrategies.cacheFirst(request);
}

/**
 * Отправляет данные на все страницы и вкладки,
 * обслуживаемые сервис вокером
 * @param {object} message
 */
export function postMessage(message) {
  self.clients.matchAll().then((clients) => {
    // При отсутствии сети добавляем в сообщение список закэшированных страниц
    const offlinePagesPromise = message.online ? Promise.resolve()
      : get(idbPagesListKey);

    offlinePagesPromise.then((offlinePages) => {
      if (offlinePages) {
        message.offlinePages = offlinePages;
      }
      clients.forEach((client) => {
        // Клиента может не быть, если перезагрузили страницу сайта
        if (client) {
          client.postMessage(message);
        }
      });
    });
  });
}

/**
 * Проверка доступности сервера
 */
export function ping() {
  fetch(pingUrl).then(
    () => pingHandler(true),
    () => pingHandler(false)
  );
}

/**
 * Логирует и отправляет сообщение на страницу о (не)успешности пинга
 * @param {boolean} isOnline
 * @return {object}
 */
function pingHandler(isOnline) {
  log(`ping... you are ${isOnline ? 'online' : 'offline'}`);
  const report = {
    action: 'ping',
    online: isOnline,
  };
  postMessage(report);
  return report;
}
