// const STATIC_DATA = [
//     'index.html',
//     'js/main.js'
// ];

// self.addEventListener('install', (e) => {
//     e.waitUntil(async () => {
//         const cashe = await caches.open('v1');
//         await cache.addAll(STATIC_DATA);
//     });
// });

// self.addEventListener('fetch', function (event) {
//     console.log(event.request.url);

//     event.respondWith(async () => {
//         const responseFromCache = await caches.match(event.request);
//         if (responseFromCache) {
//             return responseFromCache;
//         }
//         return fetch(event.request);
//     });
// });

// オフラインでも見たいファイルの一覧を指定
const cacheFiles = ['/index.html', '/js/main.js'];
const cacheName = 'v1';
// インストール時に実行されるイベント
self.addEventListener('install', event => {
  // キャッシュしたいファイルを指定
  caches.open(cacheName).then(cache => cache.addAll(cacheFiles));
});
// インストール後に実行されるイベント
self.addEventListener('activate', event => {
  // 必要に応じて古いキャッシュの削除処理などを行う
});
// fetchイベント
self.addEventListener('fetch', event => {
  // キャッシュがあればキャッシュを返す
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        let responseClone = response.clone();
        caches.open(cacheName).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    }).catch(function() {
      return caches.match('index.html');
    }));
});
