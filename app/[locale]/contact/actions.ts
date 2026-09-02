'use server'

import { revalidatePath } from 'next/cache'
import { readContact, writeContact } from '@/lib/contact-settings'
import { requireUnlocked } from '@/lib/careers-auth'
import { emailProblem, EMAIL_MESSAGE } from '@/lib/email'

export type SaveContactResult = { ok: true } | { ok: false; error: string }

/**
 * Saving the sales contact details. Owner-only: requireUnlocked() throws
 * before anything reaches disk and checks the signed session cookie on the
 * server — the edit button in the browser is not the gate. It is the same
 * unlock that guards the careers editor, so one passcode covers both.
 *
 * Only what a human types is stored; tel:, mailto: and wa.me forms are
 * derived on read (lib/contact-settings.ts).
 */
export async function saveContact(formData: FormData): Promise<SaveContactResult> {
  await requireUnlocked()

  const text = (value: FormDataEntryValue | null) => String(value ?? '').trim()
  const current = await readContact()

  const email = text(formData.get('email'))
  const problem = emailProblem(email)
  // Refuse the save and say why. This used to keep the previous address and
  // close the dialog, which looks identical to a save that worked — a typo went
  // live-looking while the old address stayed put, with nothing on screen to
  // explain it.
  if (problem) return { ok: false, error: EMAIL_MESSAGE[problem] }

  await writeContact({
    phoneDisplay: text(formData.get('phoneDisplay')) || current.phoneDisplay,
    email,
  })

  // The number reaches well past this page — the footer, the header, the
  // assistant, every enquiry form's wa.me link and the privacy policy all read
  // it — so refresh the whole layout rather than this route.
  revalidatePath('/', 'layout')
  return { ok: true }
}
