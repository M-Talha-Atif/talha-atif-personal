// Fiverr gig header: Cunocovo proof-of-work, same template as the mobile-app and Full Stack Web SaaS gigs.
// Usage: node build-proof.js <repoRoot> <outPng> [link|nolink] [usersText]
const path = require('path')
const fs = require('fs')

const REPO = process.argv[2]
const OUT = process.argv[3]
const VARIANT = process.argv[4] === 'nolink' ? 'nolink' : 'link'
const USERS = process.argv[5] || '5,000+'
const LIVE_URL = 'uppercase.cc'

const sharp = require(path.join(REPO, 'node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp'))
const React = require(path.join(REPO, 'node_modules/react'))
const { ImageResponse } = require(path.join(REPO, 'node_modules/next/dist/compiled/@vercel/og/index.node.js'))
const h = React.createElement

const W = 1280
const H = 769
const C = { bg: '#0A101C', text: '#E8ECF4', sub: '#8B95A7', teal: '#2DE2B8', orange: '#FF7A3D', line: 'rgba(255,255,255,0.13)', chip: 'rgba(255,255,255,0.055)' }
const pub = (p) => path.join(REPO, 'public', p)
const uri = (buf, type = 'image/png') => `data:${type};base64,${buf.toString('base64')}`
const font = (f) => fs.readFileSync(path.join('C:/Windows/Fonts', f))

// ---------- screenshots ----------
async function phoneScreen(file, { crop, width, height, maskEmail }) {
  const src = pub(file)
  const meta = await sharp(src).metadata()
  let pipeline = sharp(src)
  if (maskEmail) {
    const svg = Buffer.from(
      `<svg width="${meta.width}" height="${meta.height}"><rect x="${maskEmail.x}" y="${maskEmail.y}" width="${maskEmail.w}" height="${maskEmail.h}" fill="#000"/><text x="${maskEmail.x + 6}" y="${maskEmail.y + maskEmail.h - 6}" font-size="${maskEmail.size}" font-family="Segoe UI, Arial" fill="#ffffff">you@company.com</text></svg>`,
    )
    pipeline = sharp(await pipeline.composite([{ input: svg, left: 0, top: 0 }]).png().toBuffer())
  }
  if (crop) pipeline = pipeline.extract({ left: crop.left, top: 0, width: crop.width, height: meta.height })
  const buf = await pipeline.extend({ top: 44, background: '#000000' }).resize(width, height, { fit: 'cover', position: 'top' }).png().toBuffer()
  return uri(buf)
}

async function avatar(size) {
  const buf = await sharp(pub('personal/profileImage.png')).resize(size, size, { fit: 'cover', position: 'top' }).png().toBuffer()
  return uri(buf)
}

// ---------- blocks ----------
const abs = (style, ...children) => h('div', { style: { position: 'absolute', display: 'flex', ...style } }, ...children)

function Icon({ kind, color = C.teal, size = 16 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (kind === 'db') return h('svg', common, h('ellipse', { cx: 12, cy: 6, rx: 7, ry: 3 }), h('path', { d: 'M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6' }), h('path', { d: 'M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6' }))
  if (kind === 'globe') return h('svg', common, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M3 12h18' }), h('path', { d: 'M12 3c3 3 3 15 0 18' }), h('path', { d: 'M12 3c-3 3-3 15 0 18' }))
  return h('svg', common, h('path', { d: 'M8 7l-5 5 5 5' }), h('path', { d: 'M16 7l5 5-5 5' }), h('path', { d: 'M14 4l-4 16' }))
}

function Check({ size = 20 }) {
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' }, h('path', { d: 'M4.5 12.5l5 5L19.5 7', stroke: C.teal, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }))
}

function Chip({ label, icon, small }) {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', padding: small ? '6px 14px' : '8px 16px', borderRadius: 999, border: `1px solid ${C.line}`, backgroundColor: C.chip, color: C.text, fontSize: small ? 15 : 17, fontWeight: 700, marginRight: 10 } },
    icon ? h('div', { style: { display: 'flex', marginRight: 8 } }, h(Icon, { kind: icon, size: small ? 14 : 16 })) : null,
    label,
  )
}

function Bullet({ label, strong }) {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', marginBottom: 8, color: strong ? C.teal : C.text, fontSize: 20, fontWeight: 700 } },
    h('div', { style: { display: 'flex', marginRight: 12 } }, h(Check, { size: 20 })),
    label,
  )
}

function Stat({ value, label }) {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 204, height: 80, padding: '0 18px', marginRight: 12, borderRadius: 18, border: `1px solid ${C.line}`, backgroundColor: 'rgba(255,255,255,0.045)' } },
    h('div', { style: { display: 'flex', fontSize: 33, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.05 } }, value),
    h('div', { style: { display: 'flex', fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 1.2, marginTop: 4 } }, label),
  )
}

function Phone({ src, width, height, left, top, rotate }) {
  const bezel = 8
  const sw = width - 2 * bezel - 4
  const sh = height - 2 * bezel - 4
  return abs(
    { left, top, width, height, padding: bezel, borderRadius: 36, backgroundColor: '#0C0F16', border: '2px solid #313848', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', transform: `rotate(${rotate}deg)` },
    h(
      'div',
      { style: { display: 'flex', position: 'relative', width: sw, height: sh, borderRadius: 28, overflow: 'hidden', backgroundColor: '#000' } },
      h('img', { src, width: sw, height: sh, style: { width: sw, height: sh, objectFit: 'cover' } }),
      h('div', { style: { position: 'absolute', top: 8, left: (sw - 52) / 2, width: 52, height: 13, borderRadius: 8, backgroundColor: '#05070B' } }),
    ),
  )
}

// ---------- compose ----------
async function main() {
  const [left, center, right, face] = await Promise.all([
    phoneScreen('cunocovoProject/about.png', { crop: { left: 96, width: 340 }, width: 340, height: 724 }),
    phoneScreen('cunocovoProject/postCreate.png', { width: 277, height: 640 }),
    phoneScreen('cunocovoProject/signUp-Validation.png', { crop: { left: 96, width: 340 }, width: 340, height: 724, maskEmail: { x: 128, y: 212, w: 236, h: 26, size: 13.5 } }),
    avatar(180),
  ])

  const cta =
    VARIANT === 'link'
      ? [
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', padding: '0 28px', height: 58, borderRadius: 14, backgroundImage: 'linear-gradient(135deg, #FF8A4C, #E8561F)', boxShadow: '0 14px 30px rgba(232,86,31,0.35)', color: '#0B0B0D', fontSize: 21, fontWeight: 900 } },
            'Visit the Live App',
            h('div', { style: { display: 'flex', marginLeft: 12 } }, h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' }, h('path', { d: 'M5 12h14M13 6l6 6-6 6', stroke: '#0B0B0D', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
          ),
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', marginLeft: 20, padding: '10px 18px', borderRadius: 12, border: `1px solid ${C.teal}`, color: C.teal, fontSize: 21, fontWeight: 900 } },
            h('div', { style: { display: 'flex', marginRight: 9 } }, h(Icon, { kind: 'globe', size: 20 })),
            LIVE_URL,
          ),
        ]
      : [
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', padding: '0 28px', height: 58, borderRadius: 14, backgroundImage: 'linear-gradient(135deg, #FF8A4C, #E8561F)', boxShadow: '0 14px 30px rgba(232,86,31,0.35)', color: '#0B0B0D', fontSize: 21, fontWeight: 900 } },
            'Order Now',
            h('div', { style: { display: 'flex', marginLeft: 12 } }, h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' }, h('path', { d: 'M5 12h14M13 6l6 6-6 6', stroke: '#0B0B0D', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', marginLeft: 20, color: '#B9C2D3', fontSize: 17, fontWeight: 600 } }, h(Check, { size: 18 }), h('div', { style: { display: 'flex', marginLeft: 8 } }, 'Live walkthrough on request')),
        ]

  const tree = h(
    'div',
    {
      style: {
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        backgroundColor: C.bg,
        backgroundImage: 'radial-gradient(circle at 10% 0%, rgba(28,196,170,0.26), rgba(10,16,28,0) 46%), radial-gradient(circle at 92% 100%, rgba(255,122,61,0.14), rgba(10,16,28,0) 42%)',
        fontFamily: 'Segoe',
        overflow: 'hidden',
      },
    },
    abs({ left: 0, top: 0, width: W, height: H, backgroundImage: 'radial-gradient(rgba(255,255,255,0.075) 1.2px, rgba(255,255,255,0) 1.4px)', backgroundSize: '26px 26px' }),

    // stack chips
    abs(
      { left: 48, top: 40, flexDirection: 'column' },
      h('div', { style: { display: 'flex', marginBottom: 10 } }, h(Chip, { label: 'Next.js', icon: 'code' }), h(Chip, { label: 'Node.js', icon: 'code' }), h(Chip, { label: 'Express', icon: 'code' }), h(Chip, { label: 'WebSockets', icon: 'code' }), h(Chip, { label: 'Google OAuth', icon: 'code' })),
      h('div', { style: { display: 'flex' } }, h(Chip, { label: 'PostgreSQL', icon: 'db' }), h(Chip, { label: 'Supabase', icon: 'db' }), h(Chip, { label: 'Drizzle ORM', icon: 'db' }), h(Chip, { label: 'Docker', icon: 'code' }), h(Chip, { label: 'Fly.io', icon: 'globe' })),
    ),

    // headline
    abs(
      { left: 48, top: 144, flexDirection: 'column' },
      h('div', { style: { display: 'flex', fontSize: 48, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.08, letterSpacing: -1 } }, 'See My Work Live:'),
      h('div', { style: { display: 'flex', fontSize: 48, fontWeight: 900, color: C.teal, lineHeight: 1.08, letterSpacing: -1 } }, 'Cunocovo Social Web App'),
      h('div', { style: { display: 'flex', fontSize: 48, fontWeight: 900, color: C.orange, lineHeight: 1.08, letterSpacing: -1 } }, 'Open It on Your Phone'),
    ),
    abs({ left: 48, top: 306, color: '#B9C2D3', fontSize: 17, fontWeight: 600 }, 'A production social platform for photographers, videographers & creatives.'),

    // features
    abs(
      { left: 48, top: 346, flexDirection: 'column' },
      h(Bullet, { label: 'Mobile-friendly: Android, iOS & Safari', strong: true }),
      h(Bullet, { label: 'Lightning-fast feed: 3s down to 700ms' }),
      h(Bullet, { label: 'Real-time notifications & live comments' }),
      h(Bullet, { label: 'Admin moderation panel, no engineer needed' }),
    ),

    // similar projects
    abs(
      { left: 48, top: 500, flexDirection: 'column' },
      h('div', { style: { display: 'flex', color: C.sub, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 } }, 'BUILDING SOMETHING SIMILAR? I HAVE SHIPPED:'),
      h('div', { style: { display: 'flex' } }, h(Chip, { label: 'Social Feed', small: true }), h(Chip, { label: 'Auth & OAuth', small: true }), h(Chip, { label: 'Moderation', small: true }), h(Chip, { label: 'Real-time', small: true }), h(Chip, { label: 'Admin Panel', small: true })),
    ),

    // proof stats
    abs({ left: 48, top: 574 }, h(Stat, { value: USERS, label: 'ACTIVE USERS' }), h(Stat, { value: '700ms', label: 'FEED LOAD (WAS 3s)' }), h(Stat, { value: '0', label: 'MIGRATION DOWNTIME' })),

    // CTA
    abs({ left: 48, top: 674, alignItems: 'center' }, ...cta),

    // phones
    Phone({ src: left, width: 190, height: 404, left: 716, top: 238, rotate: -8 }),
    Phone({ src: right, width: 190, height: 404, left: 1030, top: 266, rotate: 8 }),
    Phone({ src: center, width: 232, height: 494, left: 852, top: 176, rotate: 0 }),

    // profile badge
    abs(
      { left: 1118, top: 24, flexDirection: 'column', alignItems: 'center' },
      h('img', { src: face, width: 96, height: 96, style: { width: 96, height: 96, borderRadius: 999, border: '3px solid #2DE2B8', boxShadow: '0 0 28px rgba(45,226,184,0.55)', objectFit: 'cover' } }),
      h('div', { style: { display: 'flex', marginTop: 10, padding: '5px 12px', borderRadius: 10, border: `1px solid ${C.line}`, backgroundColor: 'rgba(10,16,28,0.9)', color: C.text, fontSize: 13, fontWeight: 700 } }, 'Full Stack Engineer'),
    ),
  )

  const res = new ImageResponse(tree, {
    width: W,
    height: H,
    fonts: [
      { name: 'Segoe', data: font('segoeui.ttf'), weight: 400, style: 'normal' },
      { name: 'Segoe', data: font('segoeuib.ttf'), weight: 700, style: 'normal' },
      { name: 'Segoe', data: font('seguibl.ttf'), weight: 900, style: 'normal' },
    ],
  })
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(OUT, buf)
  console.log('written', OUT, buf.length, 'bytes', `variant=${VARIANT}`, `users=${USERS}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
