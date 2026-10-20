// LuxLog offline support. The page itself is fetched from the network first (so new versions show at once)
// and served from the cache only when there is no connection. Libraries from CDNs are version-pinned, so they are cached on first use.
const CACHE="luxlog-v1";
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","./index.html"]).catch(()=>{}))); });
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{ const r=e.request; if(r.method!=="GET") return; const u=new URL(r.url);
  if(u.origin===location.origin){ e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r.mode==="navigate"?"./index.html":r,cp)); } return res; }).catch(()=>caches.match(r.mode==="navigate"?"./index.html":r,{ignoreSearch:true}))); return; }
  if(/(^|\.)(jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok||res.type==="opaque"){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; }))); } });
