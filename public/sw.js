const CACHE_NAME = 'is-cap-v1'

// Assets estáticos para cache (shell da aplicação)
const STATIC_ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Instala o service worker e faz cache dos assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Ativa imediatamente sem esperar tabs fecharem
  self.skipWaiting()
})

// Limpa caches antigos quando uma nova versão é ativada
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  // Toma controle de todas as tabs imediatamente
  self.clients.claim()
})

// Estratégia network-first para navegação, cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignora requisições não-GET
  if (request.method !== 'GET') return

  // Ignora requisições de API e auth
  if (url.pathname.startsWith('/api/')) return

  // Assets estáticos (imagens, ícones) → cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Navegação e outros recursos → network-first (app sempre atualizado)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request)
      })
    )
    return
  }
})

// Handler para push notifications (preparação para futuro)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || '/dashboard',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Ao clicar na notificação, abre o dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Se já tem uma janela aberta, foca nela
        for (const client of clients) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus()
          }
        }
        // Senão, abre nova janela
        return self.clients.openWindow(targetUrl)
      })
  )
})
