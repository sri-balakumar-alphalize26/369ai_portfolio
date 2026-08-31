/**
 * Photos for the solution rows, shared by the Solutions page and the
 * stacking cards on /apps and the home page. POS, Robotics and Vending
 * reuse hardware-catalogue product shots already under
 * public/images/products; the smart-lock image is the owner's own
 * locker-cabinet render. ERP has no product to photograph, so it is a
 * licensed stock photo (Unsplash licence, commercial use permitted) of a
 * live analytics dashboard — a full-bleed picture, unlike the cutouts, so
 * it renders as a framed photo inside the object-contain panel. Replace it
 * with a real Odoo screenshot of our own deployment when one exists —
 * renamed, not overwritten in place (the trophy.jpg cache lesson).
 */
export const SOLUTION_IMAGES: Partial<Record<string, string>> = {
  erp: '/images/solutions/erp.jpg',
  pos: '/images/products/156-inch-cash-register-desktop-dual-screen-version-636/0.webp',
  robotics: '/images/products/concierge-robot-613/0.webp',
  locks: '/images/apps/smart-lockers.jpg',
  vending: '/images/products/hot-food-meals-vending-machine-with-215inch-touch-screen-612/0.webp',
}
