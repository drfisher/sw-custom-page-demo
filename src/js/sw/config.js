/**
 * @type {object}
 * @property {string} cacheName - имя хранилища кэша
 * @property {array} dependenciesToCache - список ресурсов для offline-режима
 * @property {regexp} offlineListPath - pathname,
 *     по которому отдаем список офлайн страниц
 * @property {string} origin - текущий origin
 * @property {number} pingInterval - интервал проверки доступности сервера
 * @property {string} pingUrl - адрес для проверки доступности сервера
 */
export default {
  cacheName: 'sw_demo_statics',
  dependenciesToCache: [],
  offlineListPath: /^\/offline\//,
  origin: self.location.origin,
  pingInterval: 10 * 1000,
  pingUrl: '/ping.json',
};
