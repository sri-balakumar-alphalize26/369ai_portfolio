/**
 * The six 369AI offices.
 *
 * Originally transcribed from the footer of the old Odoo site, then corrected
 * against the offices' own business cards — which is where the second Ruwi
 * number and Sohar's "Sohar Souq" come from.
 */
export type Office = {
  id: string
  country: string
  countryCode: string
  city: string
  address: string[]
  /**
   * Display form, e.g. '+968 9792 3077'. Strip the separators for the tel:
   * href. An array because Ruwi hands out two numbers.
   */
  phones?: string[]
  /**
   * What the office's QR code encodes — a Google Maps *search* query, not the
   * postal address. Several of these offices sit on streets Maps only knows at
   * district level, so the query leads with the nearest indexed landmark and
   * keeps street/city/country after it: if Maps can't match the business name
   * it still falls back to the right street rather than failing outright.
   */
  mapsQuery: string
}

export const OFFICES: Office[] = [
  {
    id: 'india-kollam',
    country: 'India',
    countryCode: 'in',
    city: 'Kollam, Kerala',
    address: ['Vadayattukotta Road', 'Chinnakada, Kollam 691001', 'Kerala, India'],
    phones: ['+91 70252 05503'],
    // The one office whose query is not landmark-anchored, deliberately: the
    // road itself geocodes to an exact point, which beats the nearest indexed
    // landmark (Chinnakada Clock Tower, ~250 m off on Beach Road). Note that
    // "Chinnakada" and "Rd" both FAIL to geocode — only the full "Road" plus
    // the 691001 PIN resolves — so do not "tidy" this back to the display
    // wording above.
    mapsQuery: 'Vadayattukotta Road, Kollam, Kerala 691001, India',
  },
  {
    id: 'usa-clearwater',
    country: 'USA',
    countryCode: 'us',
    city: 'Clearwater, Florida',
    address: ['15500 George Blvd', 'Clearwater, Florida 33760', 'United States'],
    mapsQuery: '15500 George Blvd, Clearwater, Florida 33760, USA',
  },
  {
    id: 'uae-sharjah',
    country: 'UAE',
    countryCode: 'ae',
    city: 'Sharjah',
    address: [
      'Near Al Barakh Dates, Warehouse No. 3',
      'Industrial Area 17',
      'Sharjah, United Arab Emirates',
    ],
    phones: ['+971 52 945 4455'],
    mapsQuery: 'Al Barakh Dates, Industrial Area 17, Sharjah, United Arab Emirates',
  },
  {
    id: 'oman-ruwi',
    country: 'Oman',
    countryCode: 'om',
    city: 'Ruwi',
    address: ['Computer Street, Ruwi', 'P.O. Box 502, PC 118', 'Sultanate of Oman'],
    phones: ['+968 9792 3077', '+968 9792 2924'],
    mapsQuery: 'Computer Street, Ruwi, Muscat, Oman',
  },
  {
    id: 'oman-salalah',
    country: 'Oman',
    countryCode: 'om',
    city: 'Salalah',
    // Both the old Odoo footer and the office's business card write this as
    // "23 July Road", but Google Maps only resolves "23rd July Street" — and an
    // address a visitor can paste into Maps beats one that matches the card.
    address: [
      '23rd July Street, near NBO',
      'Opposite Sultan Qaboos Mosque',
      'Salalah, Sultanate of Oman',
    ],
    phones: ['+968 9792 3005'],
    mapsQuery: 'Sultan Qaboos Mosque, 23rd July Street, Salalah, Oman',
  },
  {
    id: 'oman-sohar',
    country: 'Oman',
    countryCode: 'om',
    city: 'Sohar',
    address: [
      'Al Hambar Street',
      'Sohar Souq, near Malabar Paris Restaurant',
      'Sohar, Sultanate of Oman',
    ],
    phones: ['+968 9792 3155'],
    mapsQuery: 'Malabar Paris Restaurant, Al Hambar Street, Sohar, Oman',
  },
]

/** Site-wide contact. Call and WhatsApp both use the India number. */
export const CONTACT = {
  phone: '+917025205503',
  phoneDisplay: '+91 70252 05503',
  email: 'hr@alphalize.com',
  whatsapp: '917025205503',
} as const

/** Google Maps deep link — the payload behind each office QR code. */
export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** '+968 9792 3077' -> '+96897923077', for a tel: href. */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}
