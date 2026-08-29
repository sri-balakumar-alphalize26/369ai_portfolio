/**
 * "Technologies We Work With" marquee — three rows, alternating direction.
 * This is 369AI's actual working stack, audited against the ten app repos
 * (every one an Expo / React Native project, three on TypeScript, three on
 * NativeWind, three shipping Firebase config, one on WebRTC, BLE/GPS/barcode
 * in the field apps, ESC/POS printing over TCP), the Odoo module work, and
 * this Next.js site. Nothing is listed that the company does not use.
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
    { name: 'REST API' },
    { name: 'Firebase' },
    { name: 'Linux' },
  ],
  // Apps & frontend
  [
    { name: 'React Native' },
    { name: 'Expo' },
    { name: 'React' },
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'Next.js' },
    { name: 'Tailwind CSS' },
    { name: 'HTML5 / CSS3' },
    { name: 'Android' },
    { name: 'Windows' },
  ],
  // Devices & integrations
  [
    { name: 'ESC/POS' },
    { name: 'Barcode 1D / 2D' },
    { name: 'Bluetooth / BLE' },
    { name: 'GPS / Maps' },
    { name: 'WebRTC' },
    { name: 'IoT devices' },
    { name: 'Payment Gateways' },
    { name: 'AI / ML' },
  ],
]
