import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { APPLICATIONS_DIR, isSafeApplicationId, verifyCvToken } from '@/lib/careers'
import { isUnlocked } from '@/lib/careers-auth'

/**
 * Download a stored CV. Reached from the link inside the WhatsApp message, so
 * it authenticates with a signed, expiring token rather than a session — the
 * owner taps it on their phone and the PDF opens, with no passcode prompt.
 *
 * Two ways in and no others: a valid, unexpired signature for that exact id
 * (the WhatsApp link), or the passcode session (the applications inbox).
 * Applications are never served statically. `/api` is excluded from the
 * locale middleware (see proxy.ts).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = new URL(request.url).searchParams.get('t') ?? ''

  const allowed =
    isSafeApplicationId(id) &&
    ((await verifyCvToken(id, token, Date.now())) || (await isUnlocked()))
  if (!allowed) return new Response('Not found', { status: 404 })

  try {
    const file = await readFile(join(APPLICATIONS_DIR, id, 'cv.pdf'))
    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${id}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
