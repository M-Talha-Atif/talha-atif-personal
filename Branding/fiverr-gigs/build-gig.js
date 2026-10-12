// Fiverr gig header: "Full Stack Web SaaS", same layout as the mobile-app gig template.
// Usage: node build-gig.js <repoRoot> <outPng>
const path = require('path')
const fs = require('fs')

const REPO = process.argv[2]
const OUT = process.argv[3]
const sharp = require(path.join(REPO, 'node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp'))
const React = require(path.join(REPO, 'node_modules/react'))
const { ImageResponse } = require(path.join(REPO, 'node_modules/next/dist/compiled/@vercel/og/index.node.js'))
const h = React.createElement

const W = 1280
const H = 769
const C = {
  bg: '#0A101C',
  text: '#E8ECF4',
  sub: '#8B95A7',
  teal: '#2DE2B8',
  orange: '#FF7A3D',
  line: 'rgba(255,255,255,0.13)',
  chip: 'rgba(255,255,255,0.055)',
}
const pub = (p) => path.join(REPO, 'public', p)
const uri = (buf, type = 'image/png') => `data:${type};base64,${buf.toString('base64')}`
const font = (f) => fs.readFileSync(path.join('C:/Windows/Fonts', f))

// ---------- prepare screenshots ----------
async function browserShot(file, topChrome, width, height) {
  // drop the recorded browser's tabs / bookmarks bar, keep the app itself
  const meta = await sharp(pub(file)).metadata()
  const buf = await sharp(pub(file))
    .extract({ left: 0, top: topChrome, width: meta.width, height: meta.height - topChrome })
    .resize(width, height, { fit: 'cover', position: 'north' })
    .png()
    .toBuffer()
  return uri(buf)
}

async function phoneShot(file, width, height) {
  const src = pub(file)
  const meta = await sharp(src).metadata()
  // swap the visible test email for a neutral placeholder
  const mask = Buffer.from(
    `<svg width="${meta.width}" height="${meta.height}"><rect x="128" y="212" width="236" height="26" fill="#000"/><text x="134" y="231" font-size="13.5" font-family="Segoe UI, Arial" fill="#ffffff">you@company.com</text></svg>`,
  )
  const masked = await sharp(src)
    .composite([{ input: mask, left: 0, top: 0 }])
    .png()
    .toBuffer()
  const buf = await sharp(masked)
    .extract({ left: 96, top: 0, width: 340, height: meta.height })
    .extend({ top: 46, background: '#000000' })
    .resize(width, height, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer()
  return uri(buf)
}

async function avatar(size) {
  const buf = await sharp(pub('personal/profileImage.png'))
    .resize(size, size, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer()
  return uri(buf)
}

// ---------- small building blocks ----------
const abs = (style, ...children) => h('div', { style: { position: 'absolute', display: 'flex', ...style } }, ...children)

function Icon({ kind, color = C.teal, size = 16 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (kind === 'db') {
    return h('svg', common, h('ellipse', { cx: 12, cy: 6, rx: 7, ry: 3 }), h('path', { d: 'M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6' }), h('path', { d: 'M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6' }))
  }
  if (kind === 'globe') {
    return h('svg', common, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M3 12h18' }), h('path', { d: 'M12 3c3 3 3 15 0 18' }), h('path', { d: 'M12 3c-3 3-3 15 0 18' }))
  }
  return h('svg', common, h('path', { d: 'M8 7l-5 5 5 5' }), h('path', { d: 'M16 7l5 5-5 5' }), h('path', { d: 'M14 4l-4 16' }))
}

function Check({ size = 20 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' },
    h('path', { d: 'M4.5 12.5l5 5L19.5 7', stroke: C.teal, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }),
  )
}

function Chip({ label, icon, small }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: small ? '6px 14px' : '8px 16px',
        borderRadius: 999,
        border: `1px solid ${C.line}`,
        backgroundColor: C.chip,
        color: C.text,
        fontSize: small ? 15 : 17,
        fontWeight: 700,
        marginRight: 10,
      },
    },
    icon ? h('div', { style: { display: 'flex', marginRight: 8 } }, h(Icon, { kind: icon, size: small ? 14 : 16 })) : null,
    label,
  )
}

function Bullet({ label }) {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', marginBottom: 8, color: C.text, fontSize: 20, fontWeight: 700 } },
    h('div', { style: { display: 'flex', marginRight: 12 } }, h(Check, { size: 20 })),
    label,
  )
}

function Stat({ value, label }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: 300,
        height: 88,
        padding: '0 22px',
        marginRight: 16,
        borderRadius: 18,
        border: `1px solid ${C.line}`,
        backgroundColor: 'rgba(255,255,255,0.045)',
      },
    },
    h('div', { style: { display: 'flex', fontSize: 36, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.05 } }, value),
    h('div', { style: { display: 'flex', fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: 1.4, marginTop: 4 } }, label),
  )
}

function BrowserWindow({ src, width, height, left, top, url, dim }) {
  const bar = 30
  return abs(
    {
      left,
      top,
      width,
      height,
      flexDirection: 'column',
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: '#161B26',
      border: '1px solid rgba(255,255,255,0.16)',
      boxShadow: '0 28px 60px rgba(0,0,0,0.55)',
      opacity: dim ? 0.92 : 1,
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', height: bar, padding: '0 12px', backgroundColor: '#1D2330' } },
      h('div', { style: { display: 'flex', width: 9, height: 9, borderRadius: 999, backgroundColor: '#FF5F57', marginRight: 6 } }),
      h('div', { style: { display: 'flex', width: 9, height: 9, borderRadius: 999, backgroundColor: '#FEBC2E', marginRight: 6 } }),
      h('div', { style: { display: 'flex', width: 9, height: 9, borderRadius: 999, backgroundColor: '#28C840', marginRight: 14 } }),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', height: 18, padding: '0 12px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)', color: '#9AA4B6', fontSize: 11, fontWeight: 600 } },
        url,
      ),
    ),
    h('img', { src, width, height: height - bar, style: { width, height: height - bar, objectFit: 'cover' } }),
  )
}

function Phone({ src, width, height, left, top, rotate }) {
  const bezel = 8
  return abs(
    {
      left,
      top,
      width,
      height,
      padding: bezel,
      borderRadius: 34,
      backgroundColor: '#0C0F16',
      border: '2px solid #313848',
      boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
      transform: `rotate(${rotate}deg)`,
    },
    h(
      'div',
      { style: { display: 'flex', position: 'relative', width: width - 2 * bezel - 4, height: height - 2 * bezel - 4, borderRadius: 26, overflow: 'hidden', backgroundColor: '#000' } },
      h('img', { src, width: width - 2 * bezel - 4, height: height - 2 * bezel - 4, style: { width: width - 2 * bezel - 4, height: height - 2 * bezel - 4, objectFit: 'cover' } }),
      h('div', { style: { position: 'absolute', top: 8, left: (width - 2 * bezel - 4 - 48) / 2, width: 48, height: 12, borderRadius: 8, backgroundColor: '#05070B' } }),
    ),
  )
}

// ---------- compose ----------
async function main() {
  const [mainShot, backShot, thirdShot, phone, face] = await Promise.all([
    browserShot('intimecProject/image-1.png', 158, 1040, 474),
    browserShot('intimecProject/image-6.png', 158, 880, 401),
    browserShot('intimecProject/image-21.png', 158, 880, 401),
    phoneShot('cunocovoProject/signUp-Validation.png', 320, 700),
    avatar(180),
  ])

  const tree = h(
    'div',
    {
      style: {
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        backgroundColor: C.bg,
        backgroundImage:
          'radial-gradient(circle at 10% 0%, rgba(28,196,170,0.26), rgba(10,16,28,0) 46%), radial-gradient(circle at 92% 100%, rgba(255,122,61,0.14), rgba(10,16,28,0) 42%)',
        fontFamily: 'Segoe',
        overflow: 'hidden',
      },
    },
    // dot grid
    abs({ left: 0, top: 0, width: W, height: H, backgroundImage: 'radial-gradient(rgba(255,255,255,0.075) 1.2px, rgba(255,255,255,0) 1.4px)', backgroundSize: '26px 26px' }),

    // tech chips
    abs(
      { left: 48, top: 44, flexDirection: 'column' },
      h(
        'div',
        { style: { display: 'flex', marginBottom: 10 } },
        h(Chip, { label: 'React', icon: 'code' }),
        h(Chip, { label: 'Next.js', icon: 'code' }),
        h(Chip, { label: 'NestJS', icon: 'code' }),
        h(Chip, { label: 'Spring Boot', icon: 'code' }),
        h(Chip, { label: 'Django', icon: 'code' }),
      ),
      h(
        'div',
        { style: { display: 'flex' } },
        h(Chip, { label: 'Flask', icon: 'code' }),
        h(Chip, { label: 'PostgreSQL', icon: 'db' }),
        h(Chip, { label: 'Supabase', icon: 'db' }),
        h(Chip, { label: 'Firebase', icon: 'db' }),
        h(Chip, { label: 'Cross-Browser', icon: 'globe' }),
      ),
    ),

    // headline
    abs(
      { left: 48, top: 150, flexDirection: 'column' },
      h('div', { style: { display: 'flex', fontSize: 52, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.08, letterSpacing: -1 } }, 'I’ll Build Your Custom'),
      h('div', { style: { display: 'flex', fontSize: 52, fontWeight: 900, color: C.teal, lineHeight: 1.08, letterSpacing: -1 } }, 'Full Stack Web SaaS'),
      h('div', { style: { display: 'flex', fontSize: 52, fontWeight: 900, color: C.orange, lineHeight: 1.08, letterSpacing: -1 } }, 'Start to Finish'),
    ),

    // domains
    abs(
      { left: 48, top: 330, flexDirection: 'column' },
      h('div', { style: { display: 'flex', color: C.sub, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 } }, 'POPULAR MVP DOMAINS'),
      h(
        'div',
        { style: { display: 'flex' } },
        h(Chip, { label: 'E-commerce', small: true }),
        h(Chip, { label: 'Healthcare', small: true }),
        h(Chip, { label: 'Fintech', small: true }),
        h(Chip, { label: 'EdTech', small: true }),
        h(Chip, { label: 'On-Demand', small: true }),
      ),
    ),

    // bullets
    abs(
      { left: 48, top: 400 },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', width: 300 } },
        h(Bullet, { label: 'AI Integrations' }),
        h(Bullet, { label: 'Fully Responsive' }),
        h(Bullet, { label: 'Scalability' }),
        h(Bullet, { label: 'Reliability' }),
        h(Bullet, { label: 'SLA, SLI & SLO' }),
      ),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        h(Bullet, { label: 'Web Design' }),
        h(Bullet, { label: 'Figma to Web App' }),
        h(Bullet, { label: 'Functional Admin Panel' }),
        h(Bullet, { label: 'Eye-Catching Landing Page' }),
        h(Bullet, { label: 'Cross-Browser Compatible' }),
      ),
    ),

    // stats
    abs(
      { left: 48, top: 590 },
      h(Stat, { value: '50+', label: 'WEB PROJECTS COMPLETED' }),
      h(Stat, { value: '100K+', label: 'USERS ACROSS WEB PLATFORMS' }),
    ),

    // CTA
    abs(
      { left: 48, top: 696, alignItems: 'center' },
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            padding: '0 30px',
            height: 58,
            borderRadius: 14,
            backgroundImage: 'linear-gradient(135deg, #FF8A4C, #E8561F)',
            boxShadow: '0 14px 30px rgba(232,86,31,0.35)',
            color: '#0B0B0D',
            fontSize: 22,
            fontWeight: 900,
          },
        },
        'Order Now',
        h('div', { style: { display: 'flex', marginLeft: 12 } }, h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' }, h('path', { d: 'M5 12h14M13 6l6 6-6 6', stroke: '#0B0B0D', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', marginLeft: 22, color: '#B9C2D3', fontSize: 17, fontWeight: 600 } }, h(Check, { size: 18 }), h('div', { style: { display: 'flex', marginLeft: 8 } }, 'Idea to production, end to end')),
    ),

    // mockups
    BrowserWindow({ src: backShot, width: 440, height: 230, left: 790, top: 150, url: 'app.yourproduct.com/roles', dim: true }),
    BrowserWindow({ src: mainShot, width: 540, height: 277, left: 712, top: 262, url: 'app.yourproduct.com/dashboard' }),
    BrowserWindow({ src: thirdShot, width: 430, height: 226, left: 676, top: 508, url: 'app.yourproduct.com/requests' }),
    Phone({ src: phone, width: 186, height: 396, left: 1058, top: 352, rotate: 6 }),

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
  console.log('written', OUT, buf.length, 'bytes')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
