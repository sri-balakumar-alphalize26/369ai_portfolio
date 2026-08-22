/**
 * The six 369AI offices, transcribed from the footer of the old Odoo site.
 * `mapsQuery` is what gets encoded into each office's QR code.
 */
export type Office = {
  id: string
  country: string
  countryCode: string
  city: string
  address: string[]
  phone?: string
  mapsQuery: string
}

export const OFFICES: Office[] = [
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
    phone: '+971529454455',
    mapsQuery: 'Industrial Area 17, Sharjah, United Arab Emirates',
  },
  {
    id: 'oman-ruwi',
    country: 'Oman',
    countryCode: 'om',
    city: 'Ruwi',
    address: ['Computer Street, Ruwi', 'P.O. Box 502, PC 118', 'Sultanate of Oman'],
    phone: '+96897922924',
    mapsQuery: 'Computer Street, Ruwi, Muscat, Oman',
  },
  {
    id: 'oman-salalah',
    country: 'Oman',
    countryCode: 'om',
    city: 'Salalah',
    address: [
      '23 July Road, near NBO',
      'Opposite Sultan Qaboos Mosque',
      'Salalah, Sultanate of Oman',
    ],
    phone: '+96897923005',
    mapsQuery: '23 July Road, Salalah, Oman',
  },
  {
    id: 'oman-sohar',
    country: 'Oman',
    countryCode: 'om',
    city: 'Sohar',
    address: [
      'Al Hambar Street',
      'Near Malabar Paris Restaurant',
      'Sohar, Sultanate of Oman',
    ],
    phone: '+96897923155',
    mapsQuery: 'Al Hambar Street, Sohar, Oman',
  },
  {
    id: 'india-kollam',
    country: 'India',
    countryCode: 'in',
    city: 'Kollam, Kerala',
    address: [
      'Danat Building, opposite Reliance Petrol Pump',
      'Chandanathope, Kollam',
      'Kerala, India',
    ],
    phone: '+917025205503',
    mapsQuery: 'Chandanathope, Kollam, Kerala, India',
  },
]

export const CONTACT = {
  phone: '+971529454455',
  phoneDisplay: '+971 52 945 4455',
  email: 'info@369ai.biz',
  whatsapp: '971529454455',
} as const

/** Google Maps deep link — the payload behind each office QR code. */
export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
