/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/capi.service.ts
import crypto from "crypto";

export interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  ip?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
}

export interface CustomData {
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contentType?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    item_price?: number;
  }>;
  numItems?: number;
  coupon?: string;
}

export interface CapiEventInput {
  eventName: string;
  eventUrl: string;
  eventId: string;
  userData: UserData;
  customData?: CustomData;
}

// Helper to hash details using SHA-256 as required by Meta CAPI
function sha256(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "") return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

// Normalizes Colombian phone numbers (e.g. 3001234567 -> 573001234567)
function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  let cleaned = phone.replace(/\D/g, ""); // Remove non-digits

  if (cleaned.length === 10 && cleaned.startsWith("3")) {
    cleaned = "57" + cleaned; // Add country code for Colombia
  }

  return cleaned;
}

/**
 * Service to send events to Meta Conversion API (CAPI)
 */
export async function sendMetaCapiEvent({
  eventName,
  eventUrl,
  eventId,
  userData,
  customData,
}: CapiEventInput): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("Meta Pixel ID or Access Token is missing in environment variables. Skipping CAPI event:", eventName);
    return false;
  }

  try {
    // 1. Prepare User Data
    const hashedEmail = sha256(userData.email);
    const hashedPhone = sha256(normalizePhone(userData.phone));

    let hashedFirstName = sha256(userData.firstName);
    let hashedLastName = sha256(userData.lastName);

    // Fallback: If we have full name but not separated
    if (!hashedFirstName && userData.firstName) {
      const parts = userData.firstName.trim().split(/\s+/);
      hashedFirstName = sha256(parts[0]);
      if (parts.length > 1) {
        hashedLastName = sha256(parts.slice(1).join(" "));
      }
    }

    const hashedCity = sha256(userData.city);
    const hashedCountry = sha256("co"); // Default to Colombia ("co")

    const formattedUserData: Record<string, any> = {
      client_ip_address: userData.ip || undefined,
      client_user_agent: userData.userAgent || undefined,
      fbp: userData.fbp || undefined,
      fbc: userData.fbc || undefined,
    };

    if (hashedEmail) formattedUserData.em = [hashedEmail];
    if (hashedPhone) formattedUserData.ph = [hashedPhone];
    if (hashedFirstName) formattedUserData.fn = [hashedFirstName];
    if (hashedLastName) formattedUserData.ln = [hashedLastName];
    if (hashedCity) formattedUserData.ct = [hashedCity];
    if (hashedCountry) formattedUserData.country = [hashedCountry];

    // 2. Prepare Custom Data
    const formattedCustomData: Record<string, any> = {};
    if (customData) {
      if (customData.value !== undefined) formattedCustomData.value = Number(customData.value);
      if (customData.currency) formattedCustomData.currency = customData.currency.toUpperCase();
      if (customData.contentName) formattedCustomData.content_name = customData.contentName;
      if (customData.contentCategory) formattedCustomData.content_category = customData.contentCategory;
      if (customData.contentIds) formattedCustomData.content_ids = customData.contentIds;
      if (customData.contentType) formattedCustomData.content_type = customData.contentType;
      if (customData.contents) formattedCustomData.contents = customData.contents;
      if (customData.numItems !== undefined) formattedCustomData.num_items = customData.numItems;
      if (customData.coupon) formattedCustomData.coupon = customData.coupon;
    }

    // 3. Format Event Payload
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventUrl,
          action_source: "website",
          user_data: formattedUserData,
          custom_data: Object.keys(formattedCustomData).length > 0 ? formattedCustomData : undefined,
        },
      ],
    };

    // 4. Send Event to Meta Graph API
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: payload.data,
        access_token: accessToken,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Meta CAPI Error Response:", JSON.stringify(result));
      return false;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[CAPI Service] Successfully sent event to Meta:`, JSON.stringify(result));
    }

    return true;
  } catch (error) {
    console.error("Error sending Meta CAPI Event:", error);
    return false;
  }
}
