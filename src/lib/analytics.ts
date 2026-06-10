/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/analytics.ts


export const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Generates a unique event ID for deduplication between Pixel and CAPI
export function generateEventId(): string {
  return "evt_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
}

interface AnalyticsItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  slug?: string;
}

interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
}

/**
 * Safe wrapper for Meta Pixel browser events
 */
export function trackPixelEvent(eventName: string, customData?: object, eventId?: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] 🟦 Pixel Event: ${eventName}`, { customData, eventId });
  }
  if (typeof window !== "undefined" && (window as any).fbq) {
    if (eventId) {
      (window as any).fbq("track", eventName, customData, { eventID: eventId });
    } else {
      (window as any).fbq("track", eventName, customData);
    }
  }
}

/**
 * Safe wrapper for Google Analytics 4 browser events (DISABLED)
 */
export function trackGAEvent(eventName: string, params?: object) {
  // if (process.env.NODE_ENV === "development") {
  //   console.log(`[Analytics] 🟧 GA4 Event: ${eventName}`, params);
  // }
  // if (typeof window !== "undefined" && (window as any).gtag) {
  //   (window as any).gtag("event", eventName, params);
  // }
}

/**
 * Proxy helper to send CAPI events through our secure route handler (DISABLED)
 */
async function sendCapiProxy(
  eventName: string,
  eventId: string,
  customData?: object,
  customerInfo?: CustomerInfo
) {
  // if (process.env.NODE_ENV === "development") {
  //   console.log(`[Analytics] 🟩 CAPI Proxy Initiated: ${eventName}`, { eventId, customData, customerInfo });
  // }
  // try {
  //   const userData: Record<string, any> = {};
  //   if (customerInfo) {
  //     if (customerInfo.name) {
  //       userData.firstName = customerInfo.name;
  //     }
  //     if (customerInfo.phone) userData.phone = customerInfo.phone;
  //     if (customerInfo.email) userData.email = customerInfo.email;
  //     if (customerInfo.city) userData.city = customerInfo.city;
  //   }

  //   await fetch("/api/analytics/capi", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       eventName,
  //       eventId,
  //       eventUrl: window.location.href,
  //       userData,
  //       customData,
  //     }),
  //   });
  // } catch (error) {
  //   console.error("Failed to forward event to CAPI proxy:", error);
  // }
}

/**
 * ViewContent (Product View)
 */
export function trackViewContent(
  product: { id: string; name: string; price: number; category: string; slug: string },
  customerInfo?: CustomerInfo
) {
  const eventId = generateEventId();
  const value = Number(product.price);
  const currency = "COP";

  // Pixel
  trackPixelEvent(
    "ViewContent",
    {
      value,
      currency,
      content_name: product.name,
      content_category: product.category,
      content_ids: [product.id],
      content_type: "product",
    },
    eventId
  );

  // GA4
  // trackGAEvent("view_item", {
  //   currency,
  //   value,
  //   items: [
  //     {
  //       item_id: product.id,
  //       item_name: product.name,
  //       price: value,
  //       item_category: product.category,
  //       quantity: 1,
  //     },
  //   ],
  // });

  // CAPI
  // sendCapiProxy(
  //   "ViewContent",
  //   eventId,
  //   {
  //     value,
  //     currency,
  //     contentName: product.name,
  //     contentCategory: product.category,
  //     contentIds: [product.id],
  //     contentType: "product",
  //   },
  //   customerInfo
  // );
}

/**
 * AddToCart
 */
export function trackAddToCart(
  item: AnalyticsItem,
  customerInfo?: CustomerInfo
) {
  const eventId = generateEventId();
  const value = Number(item.price) * item.quantity;
  const currency = "COP";

  // Pixel
  trackPixelEvent(
    "AddToCart",
    {
      value,
      currency,
      content_name: item.name,
      content_ids: [item.id],
      content_type: "product",
      contents: [{ id: item.id, quantity: item.quantity }],
    },
    eventId
  );

  // GA4
  // trackGAEvent("add_to_cart", {
  //   currency,
  //   value,
  //   items: [
  //     {
  //       item_id: item.id,
  //       item_name: item.name,
  //       price: Number(item.price),
  //       item_category: item.category || "General",
  //       quantity: item.quantity,
  //     },
  //   ],
  // });

  // CAPI
  // sendCapiProxy(
  //   "AddToCart",
  //   eventId,
  //   {
  //     value,
  //     currency,
  //     contentName: item.name,
  //     contentIds: [item.id],
  //     contentType: "product",
  //     contents: [{ id: item.id, quantity: item.quantity }],
  //   },
  //   customerInfo
  // );
}

/**
 * InitiateCheckout
 */
export function trackInitiateCheckout(
  items: AnalyticsItem[],
  totalAmount: number,
  coupon?: string,
  customerInfo?: CustomerInfo
) {
  const eventId = generateEventId();
  const currency = "COP";

  // Pixel
  trackPixelEvent(
    "InitiateCheckout",
    {
      value: totalAmount,
      currency,
      content_ids: items.map((i) => i.id),
      content_type: "product",
      contents: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      num_items: items.reduce((acc, i) => acc + i.quantity, 0),
    },
    eventId
  );

  // GA4
  // trackGAEvent("begin_checkout", {
  //   currency,
  //   value: totalAmount,
  //   coupon: coupon || undefined,
  //   items: items.map((i) => ({
  //     item_id: i.id,
  //     item_name: i.name,
  //     price: Number(i.price),
  //     item_category: i.category || "General",
  //     quantity: i.quantity,
  //   })),
  // });

  // CAPI
  // sendCapiProxy(
  //   "InitiateCheckout",
  //   eventId,
  //   {
  //     value: totalAmount,
  //     currency,
  //     contentIds: items.map((i) => i.id),
  //     contentType: "product",
  //     contents: items.map((i) => ({ id: i.id, quantity: i.quantity })),
  //     numItems: items.reduce((acc, i) => acc + i.quantity, 0),
  //     coupon: coupon || undefined,
  //   },
  //   customerInfo
  // );
}

/**
 * Purchase (Client Side ONLY - Server Side is sent directly via checkout.service.ts)
 * Deduplicated on the orderId
 */
export function trackPurchaseClient(
  orderId: string,
  items: AnalyticsItem[],
  totalAmount: number,
  shippingAmount: number,
  discountAmount: number,
  coupon?: string
) {
  const currency = "COP";

  // Pixel
  trackPixelEvent(
    "Purchase",
    {
      value: totalAmount,
      currency,
      content_ids: items.map((i) => i.id),
      content_type: "product",
      contents: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      num_items: items.reduce((acc, i) => acc + i.quantity, 0),
    },
    orderId // Use orderId as the Event ID for deduplication
  );

  // GA4
  // trackGAEvent("purchase", {
  //   transaction_id: orderId,
  //   value: totalAmount,
  //   currency,
  //   tax: 0,
  //   shipping: shippingAmount,
  //   coupon: coupon || undefined,
  //   items: items.map((i) => ({
  //     item_id: i.id,
  //     item_name: i.name,
  //     price: Number(i.price),
  //     item_category: i.category || "General",
  //     quantity: i.quantity,
  //   })),
  // });
}

/**
 * Contact (WhatsApp Click)
 */
export function trackContact(details: string, customerInfo?: CustomerInfo) {
  const eventId = generateEventId();

  // Pixel
  trackPixelEvent("Contact", { content_category: "WhatsApp", content_name: details }, eventId);

  // GA4
  // trackGAEvent("contact", { method: "WhatsApp", details });

  // CAPI
  // sendCapiProxy(
  //   "Contact",
  //   eventId,
  //   {
  //     contentCategory: "WhatsApp",
  //     contentName: details,
  //   },
  //   customerInfo
  // );
}

/**
 * Search
 */
export function trackSearch(query: string, customerInfo?: CustomerInfo) {
  const eventId = generateEventId();

  // Pixel
  trackPixelEvent("Search", { search_string: query }, eventId);

  // GA4
  // trackGAEvent("search", { search_term: query });

  // CAPI
  // sendCapiProxy("Search", eventId, { search_string: query }, customerInfo);
}

/**
 * CompleteRegistration (For modal lead signup or user creation)
 */
export function trackCompleteRegistration(method: string, customerInfo?: CustomerInfo) {
  const eventId = generateEventId();

  // Pixel
  trackPixelEvent("CompleteRegistration", { content_name: method }, eventId);

  // GA4
  // trackGAEvent("sign_up", { method });

  // CAPI
  // sendCapiProxy("CompleteRegistration", eventId, { contentName: method }, customerInfo);
}

/**
 * Lead
 */
export function trackLead(category: string, details: string, customerInfo?: CustomerInfo) {
  const eventId = generateEventId();

  // Pixel
  trackPixelEvent("Lead", { content_category: category, content_name: details }, eventId);

  // GA4
  // trackGAEvent("generate_lead", { lead_type: category, details });

  // CAPI
  // sendCapiProxy(
  //   "Lead",
  //   eventId,
  //   {
  //     contentCategory: category,
  //     contentName: details,
  //   },
  //   customerInfo
  // );
}
