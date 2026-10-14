# Al Mamoura Short Films Jury Portal

Official screening and jury evaluation portal for the short films section of the Al Mamoura International Film Festival. Films are loaded from Bunny Stream.

## Configure environment variables

Copy `.env.example` to `.env` for local development, then set:

| Variable | Required | Description |
| --- | --- | --- |
| `BUNNY_API_KEY` | Yes | Bunny Stream API key. Keep this server-side and do not use a `VITE_` prefix. |
| `BUNNY_LIBRARY_ID` | Yes | Numeric Bunny Stream video library ID. |
| `BUNNY_COLLECTION_ID` | If needed | Set this to the short films collection when the library contains multiple contest sections. Leave blank only when the library contains short films alone. |
| `BUNNY_PULL_ZONE` | No | Bunny CDN hostname. Defaults to `vz-<BUNNY_LIBRARY_ID>.b-cdn.net`. |
| `PORT` | No | HTTP port; defaults to `8080`. |

The API key is used only by the server-side `/api/bunny/videos` endpoint and is not included in the browser bundle. For deployment, add these variables in your hosting provider's environment/secrets settings. Deploy the app as a Node.js web service that runs `npm start`, not as a static `dist` directory, because the server provides the Bunny API endpoint.

## Run locally

Prerequisite: Node.js.

```sh
npm install
cp .env.example .env
# Edit .env with your Bunny Stream values.
npm run dev
```

The Vite development server runs on port `3000`. To build and run the production server locally:

```sh
npm run build
npm start
```
