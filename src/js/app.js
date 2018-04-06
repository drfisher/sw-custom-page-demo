import {loaded} from 'promisified-dom-events';

const SERVICE_WORKER_PATH = '/service-worker.js';
const CSS_MOD_OFFLINE = 'offline';

const {serviceWorker} = navigator;

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
    });
}

/**
 * Обработка сообщения из service worker-а
 * @param {object} message
 */
function handleMessage(message) {
  console.log('>>> recieved a message', message);
  if (message.type === 'networkStatus') {
    toggleNetworkState();
  }
}

/**
 * Переключает состояние онлайн/оффлайн
 * @param {object} params
 */
function toggleNetworkState(params) {
  document.body.classList.toggle(CSS_MOD_OFFLINE, params.isOnline);
  // todo: подсветка закэшированных ссылок
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
 * Отправка сообщения в service worker
 * @param {object} message
 */
function postMessage(message) {
  const {controller} = navigator.serviceWorker;
  if (controller) {
    controller.postMessage(message);
  }
}

