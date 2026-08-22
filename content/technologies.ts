/**
 * "Technologies We Work With" marquee — three rows, alternating direction.
 * This is 369AI's actual working stack: Odoo and Python on the backend,
 * React Native for the apps, and the device/cloud layer underneath.
 *
 * Rendered as text chips so the section ships without vendor logo files.
 * Drop a file into /public/images/tech/ and set `logo` to swap any chip
 * over to a real mark.
 */
export type Tech = {
  name: string
  logo?: string
}

export const TECH_ROWS: Tech[][] = [
  // Platform & backend
  [
    { name: 'Odoo' },
    { name: 'Python' },
    { name: 'PostgreSQL' },
    { name: 'XML / QWeb' },
    { name: 'Django' },
    { name: 'REST API' },
    { name: 'Celery' },
    { name: 'Redis' },
    { name: 'GraphQL' },
  ],
  // Apps & frontend
  [
    { name: 'React Native' },
    { name: 'React' },
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'Next.js' },
    { name: 'Android' },
    { name: 'Flutter' },
    { name: 'HTML5 / CSS3' },
    { name: 'Tailwind CSS' },
  ],
  // Devices, cloud & AI
  [
    { name: 'IoT / MQTT' },
    { name: 'ESC/POS' },
    { name: 'RFID / NFC' },
    { name: 'Barcode 1D / 2D' },
    { name: 'Docker' },
    { name: 'Linux' },
    { name: 'AWS' },
    { name: 'AI / ML' },
    { name: 'Payment Gateways' },
  ],
]
