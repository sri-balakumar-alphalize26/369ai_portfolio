/**
 * ============================================================================
 * THE ONE PLACE TO WIRE A REAL BACKEND.
 * ============================================================================
 *
 * Both the contact form and the per-product enquiry dialog call this. Right
 * now it validates the payload and resolves successfully without sending
 * anything anywhere.
 *
 * To make enquiries actually arrive, replace the marked block below with one
 * of these and nothing else in the codebase needs to change:
 *
 *   Resend      POST to an /api/inquiry route that calls resend.emails.send()
 *   Formspree   fetch('https://formspree.io/f/<id>', { method: 'POST', ... })
 *   Own API     fetch('/api/inquiry', { method: 'POST', body: ... })
 */

export type InquiryPayload = {
  name: string
  email: string
  phone?: string
  company?: string
  subject?: string
  message: string
  /** Set when the enquiry came from a specific product page. */
  product?: string
}

export type InquiryResult = { ok: true } | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateInquiry(payload: Partial<InquiryPayload>) {
  const errors: Partial<Record<keyof InquiryPayload, string>> = {}
  if (!payload.name?.trim()) errors.name = 'required'
  if (!payload.email?.trim()) errors.email = 'required'
  else if (!EMAIL_RE.test(payload.email.trim())) errors.email = 'invalid'
  if (!payload.message?.trim()) errors.message = 'required'
  return errors
}

export async function submitInquiry(payload: InquiryPayload): Promise<InquiryResult> {
  const errors = validateInquiry(payload)
  if (Object.keys(errors).length) {
    return { ok: false, error: 'validation' }
  }

  // ---------------------------------------------------------------------
  // REPLACE THIS BLOCK to deliver enquiries for real.
  // Until then we simulate a short round-trip so the UI states are honest.
  // ---------------------------------------------------------------------
  await new Promise((resolve) => setTimeout(resolve, 700))

  if (process.env.NODE_ENV === 'development') {
    // Visible in the browser console so nothing is silently swallowed in dev.
    console.info('[369AI] Enquiry captured (not yet delivered anywhere):', payload)
  }

  return { ok: true }
  // ---------------------------------------------------------------------
}
