# 06 · Despliegue — dejar la app en internet

> Objetivo inmediato: que la **Cartera** funcione desde el celular de Steven y su
> esposa, sin depender de que el PC esté encendido.
> La tienda Next.js sube en el mismo despliegue, pero **no reemplaza** todavía a
> la de Shopify (emanellastore.com sigue siendo la tienda pública).

---

## Dónde vive cada cosa

| Pieza | Hoy | En producción |
|---|---|---|
| App Next.js (tienda + admin + cartera) | localhost:3000 | **Vercel** |
| Base de datos | Neon (ya en la nube) | **la misma Neon**, sin cambios |
| Imágenes de producto | Cloudinary (ya en la nube) | igual |
| Pagos Wompi | llaves de producción en `.env` | igual + registrar webhook |
| Automatizaciones n8n | localhost:5678 | **se quedan locales** (ver nota) |

**Recomendación: Vercel.** Es de los mismos creadores de Next.js, el proyecto ya
es compatible (Prisma externalizado, imágenes remotas configuradas), da HTTPS
automático (necesario para instalar la PWA y para Wompi) y se actualiza solo cada
vez que subamos cambios a GitHub.

## Qué funciona apenas se despliega y qué no

- ✅ **Cartera** (fiados): funciona 100%. No depende de n8n ni del Pixel.
- ✅ **Tienda, catálogo, PDP, carrito, checkout, admin**: funcionan.
- ✅ **Pagos Wompi**: funcionan tras registrar el webhook con la URL pública.
- ⚠️ **Automatizaciones n8n** (recuperación de carrito, campañas, chatbot): NO
  corren en la nube porque n8n sigue en tu PC. Solo funcionan con el PC + n8n
  encendidos. No afecta a la cartera. Se resuelve después con un VPS (~5 USD/mes)
  cuando quieras activar el marketing automático — es la decisión D3 del plan.

## El dominio (importante)

`emanellastore.com` **apunta hoy a Shopify** (tu tienda pública real). No lo
tocamos. Opciones para la app nueva:

1. **Empezar con el dominio gratis de Vercel** (`emanella-store-web.vercel.app`):
   cero configuración, listo en minutos. Sirve perfecto para la cartera.
2. **Subdominio propio** (recomendado cuando quieras algo más tuyo):
   `app.emanellastore.com` → apunta a Vercel con un registro DNS. La cartera
   quedaría en `app.emanellastore.com/cartera`. Shopify sigue intacto en el
   dominio principal.

Mi sugerencia: **arrancar con el `.vercel.app`** para tener la cartera ya en el
celular hoy mismo, y montar el subdomino bonito después.

## La tienda Next.js mientras tanto

Como la de Shopify es la que vende, la tienda Next.js sube pero se marca como
**"no indexar"** (para que Google no la muestre y no compita ni confunda). Queda
accesible por si quieres revisarla, pero no se anuncia. Cuando esté 100% lista
para reemplazar a Shopify, se decide el cambio de dominio con calma.

## Antes de abrir al público — checklist de seguridad

- [ ] **Cambiar la contraseña del admin** (`admin@emanella.com / admin123` del
      seed — es demo, no puede quedar en producción).
- [ ] Guardar la contraseña del usuario de cartera en el gestor del celular.
- [x] `N8N_SECRET` ya rotado.
- [x] `.env` fuera de Git (verificado).
- [ ] Cargar todas las variables de entorno en Vercel (no se suben con el código).
- [ ] Poner `noindex` en la tienda hasta que reemplace a Shopify.

## Pasos del despliegue (los hago yo, con tu autorización)

1. **Subir el código a GitHub** (rama nueva; NO toco `main` sin tu OK). Requiere
   tu autorización explícita para hacer push (regla 1).
2. **Crear el proyecto en Vercel** conectado al repo `EmanellaStore/emanella-store-web`.
   Necesito que inicies sesión en vercel.com con tu cuenta (o me des acceso).
3. **Cargar las variables de entorno** en Vercel (las de tu `.env`).
4. **Primer deploy** — Vercel corre `prisma generate && next build`.
5. **Verificar**: cartera, login, tienda, un pago de prueba en Wompi.
6. **Registrar el webhook de Wompi** con la URL pública
   (`https://<dominio>/api/webhook/wompi`) y hacer un pago real pequeño.
7. **Instalar la PWA** en los dos celulares ("Agregar a pantalla de inicio").

## Costo

- **Vercel**: plan gratis (Hobby) alcanza para la cartera y las pruebas. Para uso
  comercial formal Vercel pide el plan Pro (~20 USD/mes); se puede empezar gratis
  y subir cuando la tienda reemplace a Shopify.
- **Neon**: la que ya tienes.
- **Dominio**: ya es tuyo.
- **n8n en la nube** (opcional, solo si quieres las automatizaciones activas
  siempre): ~5 USD/mes en un VPS. Decisión aparte.

## Lo que necesito de ti para arrancar

1. Autorización para **hacer push** del código a GitHub.
2. Que crees (o me des acceso a) una cuenta en **vercel.com** — se puede entrar
   con el mismo GitHub.
3. Decidir: ¿arrancamos con el dominio gratis `.vercel.app` (rápido) o montamos
   ya `app.emanellastore.com`? (Si es lo segundo, necesito saber dónde administras
   el DNS de emanellastore.com.)
