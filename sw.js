// EMD Digital Platform offline support. Pages are fetched from the network first (new versions show at once)
// and served from the cache only when there is no connection. Version-pinned CDN libraries are cached on first use.
const CACHE="emd-v2";
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","./index.html"]).catch(()=>{}))); });
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{ const r=e.request; if(r.method!=="GET") return; const u=new URL(r.url);
  if(u.origin===location.origin){ const key=u.origin+u.pathname.replace(/\/$/,"/index.html");
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(key,cp)); } return res; }).catch(()=>caches.match(key).then(h=>h||caches.match(r,{ignoreSearch:true})))); return; }
  if(/(^|\.)(jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|storage\.googleapis\.com|tfhub\.dev)$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok||res.type==="opaque"){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; }))); } });
