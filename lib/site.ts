/**
 * The canonical production origin — for URLs that must point at the live
 * site regardless of where the code is running (the footer's assistant
 * deep links, metadata, JSON-LD). app/[locale]/layout.tsx and
 * app/[locale]/careers/page.tsx predate this file and still carry their
 * own copies; fold them in when those files are next touched.
 */
export const SITE_URL = 'https://369ai.biz'
