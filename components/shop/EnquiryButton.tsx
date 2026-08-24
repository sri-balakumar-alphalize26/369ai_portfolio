'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MessageSquareText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EnquiryDialog } from '@/components/shop/EnquiryDialog'

/**
 * Owns the open/closed state for a product's EnquiryDialog, so the product
 * page itself can stay a server component.
 */
export function EnquiryButton({ product }: { product: string }) {
  const t = useTranslations('common')
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="accent" size="lg" onClick={() => setOpen(true)}>
        <MessageSquareText className="h-4 w-4" aria-hidden />
        {t('requestQuote')}
      </Button>
      <EnquiryDialog product={product} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
