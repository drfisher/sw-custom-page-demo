import {loaded} from 'promisified-dom-events';

const SERVICE_WORKER_PATH = '/service-worker.js';
const CSS_MOD_OFFLINE = 'offline';
const CSS_MOD_CACHED = 'cached';
const PING_INTERVAL = 10 * 1000;

const {serviceWorker} = navigator;

let isOnline = true;

// После полной загрузки страницы регистрируем service worker
if (serviceWorker) {
  loaded.then(() => serviceWorker.register(SERVICE_WORKER_PATH))
    .then((registration) => {
      if (!registration.active) {
        // Если сервис вокер еще не активирован, то уходим
        return;
      }
      // Начинаем слушать сообщения от сервис вокера
      serviceWorker.addEventListener('message', handleMessage);

      // Сообщаем, что текущая страница теперь доступна офлайн
      registerPageAsCached();

      // Запускаем ping
      ping();
    });
}

/**
 * Обработка сообщения из service worker-а
 * @param {MessageEvent} e
 */
function handleMessage(e) {
  const {data} = e;
  if (data.action === 'ping' && isOnline !== data.online) {
    isOnline = data.online;
    toggleNetworkState(data);
  }
}

/**
 * Переключает состояние онлайн/оффлайн
 * @param {object} params
 */
function toggleNetworkState(params) {
  const {online, offlinePages = {}} = params;

  document.body.classList.toggle(CSS_MOD_OFFLINE, !online);

  // Для офлайн режима подсвечиваем закэшированные ссылки
  if (!online) {
    Array.from(document.links).forEach((link) => {
      const href = link.getAttribute('href');
      const isAvailableOffline = !!offlinePages[href] || href === '/offline/';
      link.classList.toggle(CSS_MOD_CACHED, isAvailableOffline);
    });
  }
}

/**
 * Регистрирует текущую страницу сайта, как доступную офлайн
 */
function registerPageAsCached() {
  const {title, head} = document;
  const url = location.pathname; // лучше использовать canonical или og:url
  const metaThumb = head.querySelector('meta[name=offline-preview]');
  const thumb = metaThumb ? metaThumb.content : '';

  postMessage({
    action: 'registerPage',
    page: {url, title, thumb},
  });
}

/**
 * Периодическая проверка доступности сети (нашего сервера)
 */
function ping() {
  postMessage({
    action: 'ping',
  });
   setTimeout(ping, PING_INTERVAL);
}

/**
 * Отправка сообщения в service worker
 * @param {object} message
 */
function postMessage(message) {
  const {controller} = navigator.serviceWorker;
  if (controller) {
    controller.postMessage(message);
  }
}

