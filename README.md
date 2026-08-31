# Insight Connect

Create a new blank Lovable project (e.g. treetameni

Unzip and copy the folders into it, keeping the same structure (src/routes, src/lib, src/components, src/styles.css).

In the new project's chat, paste this prompt:

Connect this project to the same backend as my insura-ops-insight project: set VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, and VITE_SUPABASE_PROJECT_ID to the same values so both projects share one database.

Publish it and the website gets its own domain while the dashboard stays here — accept/reject and live tracking keep working through the shared database.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tmnbcre.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bd88532b-8f6a-4de0-a7cd-ba894ebada1c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
