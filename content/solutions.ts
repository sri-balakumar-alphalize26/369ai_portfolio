/**
 * Photos for the solution rows, shared by the Solutions page and the
 * stacking cards on /apps and the home page. Robotics and Vending reuse
 * hardware-catalogue product shots already under public/images/products;
 * the smart-lock image is the owner's own locker-cabinet render. Keys
 * without a photo (erp, pos) keep the abstract brand panel.
 */
export const SOLUTION_IMAGES: Partial<Record<string, string>> = {
  robotics: '/images/products/concierge-robot-613/0.webp',
  locks: '/images/apps/smart-lockers.jpg',
  vending: '/images/products/hot-food-meals-vending-machine-with-215inch-touch-screen-612/0.webp',
}
