## Stack

- Next.js 16.2.1 (App Router, React 19)
- TypeScript (strict mode)
- Prisma + PostgreSQL
- Tailwind CSS v4 (uses `@tailwindcss/postcss`, NOT `tailwind.config.js`)
- Zustand (cart persisted in localStorage as `emanella-cart-storage`)
- Cloudinary for image uploads
- React Compiler enabled (`reactCompiler: true` in next.config.ts)

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # ESLint only (no typecheck/test scripts)
npx prisma generate  # regenerate Prisma client after schema changes
npx prisma db push  # push schema to DB
npx prisma db seed  # seed database (uses tsx prisma/seed.ts)
```

## Architecture

- Route Handlers (`/src/app/api/**`) for APIs — never put business logic here
- **Service layer** (`/src/services/**`) for all business logic
- Zod for validation (`/src/lib/validators/**`)
- `/src/lib/db.ts` — singleton Prisma client
- `/src/store/useCartStore.ts` — Zustand cart (client-only)
- Components organized in `/src/components/shop/**` and `/src/components/admin/**`

## Database

- Uses `DIRECT_URL` and `DATABASE_URL` env vars in Prisma schema
- Enums: `OrderStatus` (PENDIENTE/CONFIRMADO/ENVIADO/ENTREGADO/CANCELADO), `WaDirection`, `WaStatus`, `WaProvider`
- Models: Customer, Product, ProductImage, ProductVariant, Order, OrderItem, OrderEvent, WhatsappMessage
- **ProductImage**: stores up to 4 images per product with `position` field (0-3)

## Admin Auth

- Protected via `/src/middleware.ts` using `ADMIN_SECRET` cookie
- Protected paths: `/admin/*` except `/admin/login`
- Session value compared against `process.env.ADMIN_SECRET`

## Key Env Vars

```
DATABASE_URL, DIRECT_URL        # PostgreSQL
ADMIN_SECRET                     # admin session cookie
N8N_WEBHOOK_URL                 # n8n order webhook
N8N_SHIPPING_WEBHOOK_URL        # n8n shipping webhook
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

## Directory Structure

```
/src/
├── app/                    — Next.js pages and API routes
│   ├── admin/            — Admin pages
│   ├── api/              — API routes
│   ├── catalogo/         — Catalog page
│   ├── carrito/          — Cart page
│   ├── checkout/         — Checkout page
│   ├── gracias/          — Success page
│   └── producto/[slug]/  — Product detail page
├── components/            — Reusable components
│   ├── shop/            — Shop components (Navbar, ProductCard, etc.)
│   └── admin/           — Admin components (ProductForm, etc.)
├── services/             — Business logic layer
│   ├── product.service.ts
│   ├── order.service.ts
│   └── checkout.service.ts
├── lib/                  — Utilities
│   ├── db.ts            — Prisma client
│   ├── cloudinary.ts    — Image upload
│   └── validators/      — Zod schemas
├── store/               — Zustand stores
├── types/               — TypeScript types
└── middleware.ts         — Auth middleware
```

## Services Pattern

Always use services for business logic:
```typescript
// ✅ Correct - use services
import { createOrder } from "@/services/checkout.service";

// ❌ Wrong - business logic in routes
export async function POST(request: Request) {
  // ... direct db calls
}
```

## React Compiler Notes

- Avoid `setState` in `useEffect` (use `useSyncExternalStore` pattern)
- Don't access refs during render
- Keep components pure and avoid side effects in render

## Existing Instruction Files

- `ai/context.md` and `ai/rules.md` contain architecture guidance — follow these
- `CLAUDE.md` just references `@AGENTS.md`.
