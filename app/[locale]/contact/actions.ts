'use server'

import { revalidatePath } from 'next/cache'
import { readContact, writeContact } from '@/lib/contact-settings'
import { requireUnlocked } from '@/lib/careers-auth'

/**
 * Saving the sales contact details. Owner-only: requireUnlocked() throws
 * before anything reaches disk and checks the signed session cookie on the
 * server — the edit button in the browser is not the gate. It is the same
 * unlock that guards the careers editor, so one passcode covers both.
 *
 * Only what a human types is stored; tel:, mailto: and wa.me forms are
 * derived on read (lib/contact-settings.ts).
 */
export async function saveContact(formData: FormData): Promise<void> {
  await requireUnlocked()

  const text = (value: FormDataEntryValue | null) => String(value ?? '').trim()
  const current = await readContact()

  const email = text(formData.get('email'))
  // A blank or obviously broken address would render a dead mailto:, so keep
  // the previous value rather than publishing one that goes nowhere.
  const usableEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : current.email

  await writeContact({
    phoneDisplay: text(formData.get('phoneDisplay')) || current.phoneDisplay,
    email: usableEmail,
    whatsapp: text(formData.get('whatsapp')) || current.whatsapp,
  })

  // The number also shows in the footer and the assistant, so refresh the
  // layout, not just this page.
  revalidatePath('/', 'layout')
}
