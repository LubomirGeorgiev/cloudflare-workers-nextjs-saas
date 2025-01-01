# Cloudflare Workers SaaS

This is a SaaS template for Cloudflare Workers. It uses the [OpenNext](https://opennextjs.com/) framework to build a SaaS application.

It is based on https://github.com/flarelabs-net/workers-next

Supported Features:

- ✅ Authentication with NextAuth
- ✅ Database with Drizzle and Cloudflare D1
- ✅ Deployment with Github Actions
- ✅ Tailwind CSS

Planned features (TODO):

- [ ] Billing
- [ ] Admin dashboard
- [ ] Email
- [ ] Notifications
- [ ] Payments
- [ ] Webhooks

## Running it locally

1. `pnpm install`
2. `pnpm db:migrate:dev` - Creates a local SQLite database and applies migrations
3. Update the documentation in `./cursor-docs` so that Cursor AI can understand the project
4. `pnpm dev`
5. Open http://localhost:3000

## Deploying to Cloudflare with Github Actions

TODO
