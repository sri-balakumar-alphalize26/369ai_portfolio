import Image from 'next/image'
import { cn } from '@/lib/cn'

/**
 * One app's visual — the real icon when its file exists under public/,
 * otherwise a branded gradient monogram tile. Presence is decided server-side
 * (fs check in the /apps page), so delivered icon files light up on the next
 * build with no code change. Shared by the stack card and the detail grid so
 * the fallback exists exactly once.
 */
export type AppIconData = {
  name: string
  initials: string
  icon: string
  hasIcon: boolean
  tile: string
}

export function AppIcon({ app, className }: { app: AppIconData; className?: string }) {
  if (app.hasIcon) {
    // The delivered logos are wordmark lockups, not square icons — fixed
    // height, natural width, so the text never gets cropped. Callers pass
    // only a height class; w-auto keeps the aspect (and satisfies
    // next/image's both-dimensions-modified rule).
    return (
      <Image
        src={app.icon}
        alt=""
        width={384}
        height={256}
        className={cn('w-auto rounded-lg', className)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        'flex aspect-square items-center justify-center rounded-card bg-gradient-to-br text-white shadow-md',
        app.tile,
        className
      )}
    >
      <span className="text-sm font-extrabold tracking-wide">{app.initials}</span>
    </span>
  )
}
