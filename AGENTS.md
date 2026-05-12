## Stack

- Next.js 16.2.1 (App Router, React 19)
- TypeScript (strict mode)
- Prisma + PostgreSQL
- Tailwind CSS v4 (uses `@tailwindcss/postcss`, NOT `tailwind.config.js`)
- Zustand (cart persisted in localStorage as `emanella-cart-storage`)
- Cloudinary for image uploads
- JWT (JWT sessions via cookie `session_token`)
- React Compiler enabled (`reactCompiler: true` in next.config.ts)

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # production runtime
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
- `/src/lib/session.ts` — JWT sessions (`signSession`, `verifySession`, cookie management)
- `/src/store/useCartStore.ts` — Zustand cart (client-only)
- Components organized in `/src/components/shop/**` and `/src/components/admin/**`
- n8n workflows are versioned in `/src/flows/**`

## Database

- Uses `DIRECT_URL` and `DATABASE_URL` env vars in Prisma schema
- Enums: `OrderStatus` (PENDIENTE/CONFIRMADO/ENVIADO/ENTREGADO/CANCELADO), `WaDirection`, `WaStatus`, `WaProvider`
- Models include: Customer, Product, ProductImage, ProductVariant, Order, OrderItem, OrderEvent, Coupon, Cart, CartItem, Conversation, Message, WhatsappMessage
- **ProductImage**: stores up to 4 images per product with `position` field (0-3)

## Admin Auth

- Protected via `/src/middleware.ts` using JWT session cookie (`session_token`)
- Protected paths: `/admin/*` and `/api/admin/*`
- Middleware validates role `ADMIN`
- Trusted automation access may use header `x-n8n-token` matching `process.env.N8N_SECRET`

## Key Env Vars

```
DATABASE_URL, DIRECT_URL        # PostgreSQL
JWT_SECRET                      # JWT signing/verification secret
N8N_SECRET                      # token for trusted n8n/admin API calls
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
│   ├── checkout.service.ts
│   └── auth.service.ts
├── lib/                  — Utilities
│   ├── db.ts            — Prisma client
│   ├── session.ts       — JWT session helpers
│   ├── cloudinary.ts    — Image upload
│   └── validators/      — Zod schemas
├── store/               — Zustand stores
├── flows/               — Versioned n8n workflows (JSON)
├── types/               — TypeScript types
└── middleware.ts         — Auth middleware
```

## n8n Workflows (Current)

Under `/src/flows/**`:

- Cart recovery: `cart-recovery-step-1/2/3.json`
- Cart cleanup: `cart-cleanup-lost.json`
- Order lifecycle messaging: `order-lifecycle.json`
- Marketing campaigns: `Welcome Coupon.json`, `Review Request.json`, `Repurchase 30_60_90.json`, `Winback.json`
- Conversational assistant: `Chatbot IA.json`

These workflows integrate with project APIs for segmentation, coupon generation, cart status transitions, AI response logging, and order-state notifications.

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
