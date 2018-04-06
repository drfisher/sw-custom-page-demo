import {get, set} from 'idb-keyval';
import {fetchSource} from './tools';

const OFFLINE_LIST_KEY = 'cachedPages';

/**
 * Создает экземпляр Response со списком закешированных страниц
 * @return {Response}
 */
export function getOfflinePageResponse() {
  return ''; // fixme
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
  return get(OFFLINE_LIST_KEY)
    .then((pages = {}) => {
      const {url} = pageInfo;
      return set(OFFLINE_LIST_KEY, Object.assign({}, pages, {[url]: pageInfo}));
    });
}
