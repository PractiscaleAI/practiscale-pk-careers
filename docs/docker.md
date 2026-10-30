# Docker preview

Docker is an optional production-style preview. The live practiscale.pk site remains on Vercel.

From the project root, stop any other local server using port 3000, then run:

```powershell
docker compose up --build -d
docker compose ps
```

Open http://127.0.0.1:3000/. Stop it with `docker compose down` before restarting the local development server. Docker and the development server cannot both bind port 3000.

The image builds with the locked dependencies and Next.js standalone output. It includes the published `public/` media but excludes local source footage, Git history, environment files, and development dependencies from the runtime image. The process runs as a nonroot user. Compose binds only to localhost and uses a read-only filesystem with temporary writable caches.

To check the container:

```powershell
docker compose ps
docker compose logs --tail=50 web
```

The default canonical site URL is `https://practiscale.pk`. If this image is ever deployed under another domain, set `SITE_URL` in the environment before `docker compose up --build`; the sitemap and metadata are generated during the build. A public Docker deployment also needs a reverse proxy or hosting layer for HTTPS and edge protection. Dockerizing this repository does not change its Vercel deployment.
