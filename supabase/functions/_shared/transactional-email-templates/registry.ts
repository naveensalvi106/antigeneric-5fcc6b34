/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Img, Section, Hr,
} from 'npm:@react-email/components@0.0.22'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

// ─── Result Ready Template ───
const SITE_NAME = "AntiGeneric AI"

const ResultReadyEmail = ({ title, resultImageUrl }: { title?: string; resultImageUrl?: string }) => {
  const e = React.createElement
  return e(Html, { lang: 'en', dir: 'ltr' },
    e(Head, null),
    e(Preview, null, `Your thumbnail for "${title || 'your video'}" is ready!`),
    e(Body, { style: { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" } },
      e(Container, { style: { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' } },
        e(Heading, { style: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 20px' } }, 'Your Thumbnail is Ready! 🎨'),
        e(Text, { style: { fontSize: '15px', color: '#444444', lineHeight: '1.6', margin: '0 0 20px' } },
          `Great news! Your custom AI-generated thumbnail${title ? ` for "${title}"` : ''} has been completed by the ${SITE_NAME} team.`
        ),
        resultImageUrl ? e(Section, { style: { margin: '0 0 25px', textAlign: 'center' } },
          e(Img, { src: resultImageUrl, alt: 'Your thumbnail', style: { width: '100%', maxWidth: '500px', borderRadius: '12px', border: '1px solid #e2e8f0' } })
        ) : null,
        e(Section, { style: { textAlign: 'center', margin: '0 0 25px' } },
          e(Button, { style: { backgroundColor: '#3b82f6', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }, href: 'https://antigeneric.lovable.app/dashboard' }, 'View in Dashboard')
        ),
        e(Hr, { style: { borderColor: '#e2e8f0', margin: '25px 0' } }),
        e(Text, { style: { fontSize: '12px', color: '#999999', margin: '0', lineHeight: '1.5' } }, `Thank you for using ${SITE_NAME}. No designing or prompting skill needed.`)
      )
    )
  )
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'result-ready': {
    component: ResultReadyEmail,
    subject: (data: Record<string, any>) =>
      `Your thumbnail${data.title ? ` for "${data.title}"` : ''} is ready!`,
    displayName: 'Result ready notification',
    previewData: { title: 'How I Built a $1M Business', resultImageUrl: 'https://placehold.co/640x360' },
  },
}
