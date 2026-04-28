# Database Setup Notes

Recommended starter database: Neon Postgres.

Why Neon:
- The app already uses Prisma with PostgreSQL.
- Neon works cleanly with Vercel.
- The free tier is enough to start cheaply.
- Upgrade later only when real usage needs it.

Vercel environment variables to set:

```env
DATABASE_URL=pooled_neon_connection_string
DATABASE_URL_UNPOOLED=direct_neon_connection_string
AUTH_SECRET=your_32_plus_character_secret
AUTH_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

Neon connection string mapping:
- Use the pooled Neon connection string for `DATABASE_URL`.
- Use the direct Neon connection string for `DATABASE_URL_UNPOOLED`.

Production seed variables:

```env
SEED_ADMIN_EMAIL=your@email.com
SEED_ADMIN_PASSWORD=a_strong_password
SEED_ADMIN_NAME=Your Name
```

Initial database commands:

```bash
npx prisma db push
npm run db:seed
```

Notes:
- This repo currently has `prisma/schema.prisma` and `prisma/seed.ts`, but no committed Prisma migrations.
- `prisma db push` is fine for the early/cheap stage.
- Once real users are using the app, switch to Prisma migrations so database changes are versioned cleanly.
- Supabase is also a good option, especially if the app later needs Supabase Auth or Storage, but Neon is the simpler first choice for this Prisma/Postgres/Vercel setup.
