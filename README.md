# Helpora Frontend

## What is implemented

- Provider subscription pricing page with Czech (default) and English copy
- Stripe Checkout redirect from pricing
- Subscription success screen and subscription status checks
- Provider access gating for protected routes (inactive providers are redirected
  to pricing)
- Manage Subscription page with Stripe Billing Portal button
- Terms and SLA acceptance checkbox during provider signup
- Admin Subscribers page with stats cards, revenue trend chart, paginated table,
  and detail modal
- Language switcher support on the pricing page

## Quick start

1. `npm install`
2. `npm run dev`

The app runs on the port defined in `frontend/.env` (default is `3001`).

## Environment

Create or update `frontend/.env`:

```
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_MAP_API=your_google_maps_key_here
PORT=3001
```

## Useful routes (localized)

Routes are localized with `/{lang}` where `lang` is `cz` (default) or `en`.

- `/{lang}/pricing`
- `/{lang}/subscription/manage`
- `/{lang}/subscription/success`
- `/{lang}/dashboard/subscribers`

## Tailwind CSS

- Tailwind is configured and available globally via `src/index.css`.
- Use `tw-` prefixed utilities (example: `tw-flex tw-items-center tw-gap-2`).
- Prefixing avoids collisions with existing Bootstrap utility classes.

## Notes

- Subscription UI depends on backend Stripe configuration.
- If a provider is not an active subscriber, protected routes redirect to
  pricing.

git fetch origin git checkout master git reset --hard origin/master git clean
-fd
