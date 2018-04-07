import {get, set} from 'idb-keyval';
import {fetchSource, logError} from './tools';
import {idbPagesListKey} from './config';

const template = require('../../templates/offlinePage.pug');

/**
 * Формирует объект response с данными о страницах,
 * доступных офлайн
 * @return {Promise<Request>}
 */
export function createOfflineListResponse() {
  // Получаем данные об офлайн страницах
  return get(idbPagesListKey)
    .then((pagesList = {}) => {
      const html = template({
        pages: Object.values(pagesList),
      });

      // Создаем и возвращаем объект ответа
      const blob = new Blob([html], {
        type: 'text/html; charset=utf-8',
      });
      return new Response(blob, {
        status: 200,
        statusText: 'OK',
      });
    }).catch(logError);
}

/**
 * Регистрирует страницу, как доступную офлайн
 * @param {object} pageInfo
 * @return {Promise}
 */
export function addToOfflineList(pageInfo) {
  // кэшируем превью страницы, оно пригодится в offline режиме
  if (pageInfo.thumb) {
    fetchSource(pageInfo.thumb);
  }

  // добавляем информацию о странице в реестр
  return get(idbPagesListKey)
    .then((pages = {}) => {
      const {url} = pageInfo;
      return set(idbPagesListKey, Object.assign({}, pages, {[url]: pageInfo}));
    });
}
