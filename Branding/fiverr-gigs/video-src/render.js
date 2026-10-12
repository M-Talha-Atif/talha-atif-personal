// Frame renderer for the 65s Full Stack Web Development promo video (1920x1080 @ 30fps).
// Usage: node render.js <repoRoot> <outDir> <startFrame> <endFrame>   (endFrame exclusive)
const path = require('path')
const fs = require('fs')

const REPO = process.argv[2]
const OUT = process.argv[3]
const F0 = parseInt(process.argv[4], 10)
const F1 = parseInt(process.argv[5], 10)

const sharp = require(path.join(REPO, 'node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp'))
const React = require(path.join(REPO, 'node_modules/react'))
const { ImageResponse } = require(path.join(REPO, 'node_modules/next/dist/compiled/@vercel/og/index.node.js'))
const h = React.createElement

const W = 1920
const H = 1080
const FPS = 30
const C = { bg: '#0A101C', text: '#E8ECF4', sub: '#8B95A7', teal: '#2DE2B8', orange: '#FF7A3D', line: 'rgba(255,255,255,0.14)', chip: 'rgba(255,255,255,0.06)' }
const pub = (p) => path.join(REPO, 'public', p)
const uri = (buf) => `data:image/png;base64,${buf.toString('base64')}`
const font = (f) => fs.readFileSync(path.join('C:/Windows/Fonts', f))

// ---------- timeline (durations measured from the processed voiceover of the recorded take) ----------
const LEAD = 0.25
const TAIL = 0.3
const END_HOLD = 1.8
const DUR = JSON.parse(fs.readFileSync(path.join(__dirname, 'voice', 'durations.json'), 'utf8'))

// Spoken captions: [text, startInAudio, endInAudio] (seconds, from word-level timestamps of the take)
const CAPS = {
  s1: [
    ['Got an idea for a web app,', 0.0, 1.55],
    ["but not sure it'll hold up when real users show up?", 1.6, 6.15],
    ["Hey, I'm Talha.", 6.3, 7.4],
    ['I build full stack web apps that scale.', 7.5, 9.7],
  ],
  s2: [
    ["Here's one I worked on: Cunocovo,", 0.0, 2.35],
    ['a social platform for creatives.', 2.4, 4.8],
    ["It's got over five thousand active users now,", 5.2, 8.25],
    ['and I got the feed loading in seven hundred milliseconds,', 8.3, 11.6],
    ['down from three seconds.', 11.65, 13.9],
  ],
  s3: [
    ["I've also built for enterprises.", 0.0, 2.0],
    ['This is an identity governance platform:', 3.1, 5.3],
    ['eight microservices, event-driven workflows,', 5.5, 7.9],
    ['and full audit trails for compliance.', 8.0, 10.2],
    ['Serious software, built properly.', 10.4, 13.1],
  ],
  s4: [
    ["Whatever your stack needs, I've got it covered.", 0.0, 3.7],
    ['React and Next.js on the front end.', 4.0, 6.0],
    ['Nest, Spring Boot or Django on the back end.', 6.1, 8.2],
    ['Logins, admin panels, queues, web sockets,', 8.4, 11.0],
    ['real-time features, cloud deployment.', 11.1, 12.9],
    ['The whole thing.', 13.0, 13.9],
  ],
  s5: [
    ["And it's simple.", 0.0, 0.85],
    ['You tell me the idea.', 0.9, 2.1],
    ['I plan it, I build it in clear milestones,', 2.2, 4.6],
    ['and you see progress the whole way.', 4.7, 6.3],
    ['Then we launch it.', 6.4, 7.35],
  ],
  s6: [
    ['Fifty-plus web projects,', 0.0, 1.15],
    ['over a hundred thousand users served.', 1.2, 3.6],
    ["If you've got an idea, let's build it.", 3.9, 6.05],
    ["Send me a message and let's talk.", 6.2, 8.05],
  ],
}

// Animation anchors: [designed scene time, time in audio]. The scene animations were authored against
// designed times; this maps them onto the moments the matching words are actually spoken.
const CUES = {
  s1: [[0.55, 0.0], [1.35, 1.3], [3.3, 4.1], [3.7, 6.3], [4.0, 7.0], [5.2, 9.2]],
  s2: [[0.3, 0.3], [0.9, 1.8], [1.2, 3.9], [1.8, 5.0], [2.3, 5.7], [4.7, 8.0], [5.2, 10.3], [6.4, 13.0]],
  s3: [[0.3, 0.2], [1.4, 3.3], [2.5, 5.4], [3.0, 5.7], [3.6, 6.7], [5.0, 8.3], [6.0, 8.9], [7.4, 10.4]],
  s4: [[0.3, 0.2], [0.85, 1.0], [1.2, 3.7], [3.4, 5.9], [5.6, 8.2], [7.4, 11.0]],
  s5: [[0.4, 0.2], [0.9, 0.9], [2.3, 2.2], [3.7, 3.2], [5.1, 6.5], [5.6, 7.0]],
  s6: [[0.4, 0.1], [0.9, 0.6], [1.2, 0.9], [2.0, 2.4], [2.6, 3.9], [3.2, 5.4]],
}
const DESIGNED_LEN = { s1: 8.36, s2: 12.2, s3: 11.99, s4: 13.08, s5: 7.93, s6: 11.68 }

const NARR = ['s1', 's2', 's3', 's4', 's5', 's6'].map((id) => ({ id, dur: DUR.find((x) => x.id === id).dur }))
let cursor = 0
const SCENES = NARR.map((n, i) => {
  const len = LEAD + n.dur + TAIL + (i === NARR.length - 1 ? END_HOLD : 0)
  const sc = { ...n, start: cursor, len, audioAt: LEAD }
  cursor += len
  return sc
})
const TOTAL = cursor
const TOTAL_FRAMES = Math.round(TOTAL * FPS)

// piecewise-linear map: real local time -> designed time
function warp(sc, lt) {
  const pts = [[0, 0], ...CUES[sc.id].map(([dsg, aud]) => [aud + LEAD, dsg]), [sc.len, DESIGNED_LEN[sc.id]]]
  // make actual times strictly increasing
  for (let i = 1; i < pts.length; i++) if (pts[i][0] <= pts[i - 1][0]) pts[i][0] = pts[i - 1][0] + 0.01
  if (lt <= 0) return 0
  for (let i = 1; i < pts.length; i++) {
    if (lt <= pts[i][0]) {
      const [a0, d0] = pts[i - 1]
      const [a1, d1] = pts[i]
      return d0 + ((lt - a0) / (a1 - a0)) * (d1 - d0)
    }
  }
  return DESIGNED_LEN[sc.id]
}

// ---------- motion ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const ease = (p) => 1 - Math.pow(1 - p, 3)
const back = (p) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
}
const P = (t, a, d = 0.6) => clamp((t - a) / d)
const inn = (t, a, o = {}) => {
  const { dy = 34, dx = 0, dur = 0.6 } = o
  const p = ease(P(t, a, dur))
  return { opacity: p, transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px)` }
}
const pop = (t, a, dur = 0.55) => {
  const p = P(t, a, dur)
  const s = 0.6 + 0.4 * back(p)
  return { opacity: clamp(p * 2.2), transform: `scale(${s})` }
}
const num = (v) => Math.round(v).toLocaleString('en-US')

// ---------- primitives ----------
const d = (style, ...ch) => h('div', { style: { display: 'flex', ...style } }, ...ch)
const abs = (style, ...ch) => d({ position: 'absolute', ...style }, ...ch)

function Icon({ kind, color = C.teal, size = 22 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (kind === 'db') return h('svg', c, h('ellipse', { cx: 12, cy: 6, rx: 7, ry: 3 }), h('path', { d: 'M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6' }), h('path', { d: 'M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6' }))
  if (kind === 'globe') return h('svg', c, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M3 12h18' }), h('path', { d: 'M12 3c3 3 3 15 0 18' }), h('path', { d: 'M12 3c-3 3-3 15 0 18' }))
  return h('svg', c, h('path', { d: 'M8 7l-5 5 5 5' }), h('path', { d: 'M16 7l5 5-5 5' }), h('path', { d: 'M14 4l-4 16' }))
}
const Check = ({ size = 30, color = C.teal }) =>
  h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' }, h('path', { d: 'M4.5 12.5l5 5L19.5 7', stroke: color, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }))

const Chip = ({ label, icon, style }) =>
  d(
    { alignItems: 'center', padding: '10px 22px', borderRadius: 999, border: `1.5px solid ${C.line}`, backgroundColor: C.chip, color: C.text, fontSize: 26, fontWeight: 700, marginRight: 14, ...style },
    icon ? d({ marginRight: 10 }, h(Icon, { kind: icon, size: 22 })) : null,
    label,
  )

const Tick = ({ label, style, strong }) =>
  d({ alignItems: 'center', marginBottom: 16, color: strong ? C.teal : C.text, fontSize: 34, fontWeight: 700, ...style }, d({ marginRight: 16 }, h(Check, { size: 32 })), label)

const Stat = ({ value, label, style, w = 300 }) =>
  d(
    { flexDirection: 'column', justifyContent: 'center', width: w, height: 128, padding: '0 28px', marginRight: 20, borderRadius: 24, border: `1.5px solid ${C.line}`, backgroundColor: 'rgba(255,255,255,0.05)', ...style },
    d({ fontSize: 56, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.05 }, value),
    d({ fontSize: 19, fontWeight: 700, color: C.sub, letterSpacing: 1.6, marginTop: 6 }, label),
  )

const Tag = ({ text, color = C.teal }) =>
  d({ alignSelf: 'flex-start', alignItems: 'center', padding: '8px 20px', borderRadius: 999, border: `1.5px solid ${color}`, color, fontSize: 22, fontWeight: 800, letterSpacing: 3 }, text)

function BrowserWindow({ src, width, height, left, top, url, style }) {
  const bar = 44
  return abs(
    { left, top, width, height, flexDirection: 'column', borderRadius: 20, overflow: 'hidden', backgroundColor: '#161B26', border: '1.5px solid rgba(255,255,255,0.18)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', ...style },
    d(
      { alignItems: 'center', height: bar, padding: '0 18px', backgroundColor: '#1D2330' },
      d({ width: 13, height: 13, borderRadius: 999, backgroundColor: '#FF5F57', marginRight: 9 }),
      d({ width: 13, height: 13, borderRadius: 999, backgroundColor: '#FEBC2E', marginRight: 9 }),
      d({ width: 13, height: 13, borderRadius: 999, backgroundColor: '#28C840', marginRight: 20 }),
      d({ alignItems: 'center', height: 26, padding: '0 18px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)', color: '#9AA4B6', fontSize: 16, fontWeight: 600 }, url),
    ),
    h('img', { src, width, height: height - bar, style: { width, height: height - bar, objectFit: 'cover' } }),
  )
}

function Phone({ src, width, height, left, top, rotate, style }) {
  const bezel = 11
  const sw = width - 2 * bezel - 6
  const sh = height - 2 * bezel - 6
  return abs(
    { left, top, width, height, padding: bezel, borderRadius: 50, backgroundColor: '#0C0F16', border: '3px solid #313848', boxShadow: '0 40px 80px rgba(0,0,0,0.65)', transform: `rotate(${rotate}deg)`, ...style },
    d(
      { position: 'relative', width: sw, height: sh, borderRadius: 40, overflow: 'hidden', backgroundColor: '#000' },
      h('img', { src, width: sw, height: sh, style: { width: sw, height: sh, objectFit: 'cover' } }),
      abs({ top: 12, left: (sw - 76) / 2, width: 76, height: 19, borderRadius: 12, backgroundColor: '#05070B' }),
    ),
  )
}

// ---------- assets ----------
const A = {}
async function browserShot(file, width, height) {
  const meta = await sharp(pub(file)).metadata()
  const buf = await sharp(pub(file))
    .extract({ left: 0, top: 158, width: meta.width, height: meta.height - 158 })
    .resize(width, height, { fit: 'cover', position: 'north' })
    .png()
    .toBuffer()
  return uri(buf)
}
async function phoneScreen(file, { crop, width, height, maskEmail }) {
  const src = pub(file)
  const meta = await sharp(src).metadata()
  let pipe = sharp(src)
  if (maskEmail) {
    const svg = Buffer.from(
      `<svg width="${meta.width}" height="${meta.height}"><rect x="${maskEmail.x}" y="${maskEmail.y}" width="${maskEmail.w}" height="${maskEmail.h}" fill="#000"/><text x="${maskEmail.x + 6}" y="${maskEmail.y + maskEmail.h - 6}" font-size="${maskEmail.size}" font-family="Segoe UI, Arial" fill="#ffffff">you@company.com</text></svg>`,
    )
    pipe = sharp(await pipe.composite([{ input: svg, left: 0, top: 0 }]).png().toBuffer())
  }
  if (crop) pipe = pipe.extract({ left: crop.left, top: 0, width: crop.width, height: meta.height })
  const buf = await pipe.extend({ top: 44, background: '#000000' }).resize(width, height, { fit: 'cover', position: 'top' }).png().toBuffer()
  return uri(buf)
}
async function square(file, size) {
  const buf = await sharp(pub(file)).resize(size, size, { fit: 'cover', position: 'top' }).png().toBuffer()
  return uri(buf)
}

async function prepare() {
  // phone display sizes: side 285x606 -> screen 267x588, centre 348x741 -> screen 330x723
  const [about, post, alert, signup, i1, i6, i24, i25, i21, face, faceBig] = await Promise.all([
    phoneScreen('cunocovoProject/about.png', { crop: { left: 96, width: 340 }, width: 267, height: 588 }),
    phoneScreen('cunocovoProject/postCreate.png', { width: 330, height: 723 }),
    phoneScreen('cunocovoProject/alertDialog.png', { width: 267, height: 588 }),
    phoneScreen('cunocovoProject/signUp-Validation.png', { crop: { left: 96, width: 340 }, width: 267, height: 588, maskEmail: { x: 128, y: 212, w: 236, h: 26, size: 13.5 } }),
    browserShot('intimecProject/image-1.png', 1000, 456),
    browserShot('intimecProject/image-6.png', 800, 365),
    browserShot('intimecProject/image-24.png', 780, 355),
    browserShot('intimecProject/image-25.png', 620, 283),
    browserShot('intimecProject/image-21.png', 700, 319),
    square('personal/profileImage.png', 240),
    square('personal/profileImage.png', 360),
  ])
  Object.assign(A, { about, post, alert, signup, i1, i6, i24, i25, i21, face, faceBig })
}

// ---------- chrome shared by every scene ----------
function Backdrop(t) {
  const a = 12 + 5 * Math.sin(t / 5)
  const b = 90 - 5 * Math.cos(t / 6)
  return [
    abs({
      left: 0,
      top: 0,
      width: W,
      height: H,
      backgroundImage: `radial-gradient(circle at ${a}% 0%, rgba(28,196,170,0.28), rgba(10,16,28,0) 48%), radial-gradient(circle at ${b}% 100%, rgba(255,122,61,0.16), rgba(10,16,28,0) 44%)`,
    }),
    abs({ left: 0, top: 0, width: W, height: H, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.8px, rgba(255,255,255,0) 2.1px)', backgroundSize: '39px 39px' }),
  ]
}

function Header(t) {
  return abs(
    { left: 90, top: 44, alignItems: 'center', ...inn(t, 0.2, { dy: -14 }) },
    d({ width: 14, height: 14, borderRadius: 999, backgroundColor: C.teal, marginRight: 14, boxShadow: '0 0 18px rgba(45,226,184,0.9)' }),
    d({ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: 0.5 }, 'Talha Atif'),
    d({ fontSize: 26, fontWeight: 600, color: C.sub, marginLeft: 14 }, 'Full Stack Web Development'),
  )
}

function Captions(t) {
  for (const sc of SCENES) {
    const lt = t - sc.start
    if (lt < 0 || lt >= sc.len) continue
    const caps = CAPS[sc.id]
    for (let i = 0; i < caps.length; i++) {
      const [text, a, b] = caps[i]
      const from = a + LEAD
      const to = Math.max(b + LEAD, from + 0.6) + 0.12
      if (lt >= from - 0.05 && lt <= to) {
        const p = Math.min(P(lt, from - 0.05, 0.15), 1 - P(lt, to - 0.1, 0.12))
        return abs(
          { left: 0, top: 962, width: W, justifyContent: 'center', opacity: clamp(p) },
          d(
            { maxWidth: 1500, padding: '14px 36px', borderRadius: 18, backgroundColor: 'rgba(6,9,16,0.78)', border: `1.5px solid ${C.line}`, color: '#FFFFFF', fontSize: 38, fontWeight: 700, textAlign: 'center', justifyContent: 'center' },
            text,
          ),
        )
      }
    }
  }
  return null
}

// ---------- scenes (t = seconds since scene start) ----------
function S1(t) {
  const w1 = inn(t, 0.55, { dy: 50, dur: 0.7 })
  const w2 = inn(t, 1.35, { dy: 50, dur: 0.7 })
  const sub = inn(t, 3.3, { dy: 30 })
  const drift = 1 + 0.04 * clamp(t / 8)
  return [
    // dimmed product wall behind the headline
    abs({ left: 1330, top: 330, width: 1000, height: 456, opacity: 0.42 * ease(P(t, 0.2, 1.2)), transform: `scale(${drift}) rotate(-3deg)` }, h('img', { src: A.i1, width: 1000, height: 456, style: { width: 1000, height: 456, borderRadius: 20 } })),
    abs({ left: 1180, top: 640, width: 800, height: 365, opacity: 0.3 * ease(P(t, 0.6, 1.2)), transform: `scale(${drift}) rotate(4deg)` }, h('img', { src: A.i6, width: 800, height: 365, style: { width: 800, height: 365, borderRadius: 20 } })),
    abs({ left: 90, top: 210, flexDirection: 'column' },
      d({ fontSize: 118, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.04, letterSpacing: -2, ...w1 }, 'Need a web app'),
      d({ fontSize: 118, fontWeight: 900, color: C.teal, lineHeight: 1.04, letterSpacing: -2, ...w2 }, 'that actually scales?'),
      d({ fontSize: 50, fontWeight: 800, color: C.orange, marginTop: 30, ...sub }, 'Full Stack Web Development, end to end'),
    ),
    abs({ left: 90, top: 640 },
      ...['Next.js', 'React', 'NestJS', 'Spring Boot', 'Django', 'PostgreSQL'].map((l, i) =>
        h(Chip, { key: l, label: l, icon: i === 5 ? 'db' : 'code', style: { ...inn(t, 4.0 + i * 0.22, { dy: 24, dur: 0.45 }) } }),
      ),
    ),
    abs({ left: 1480, top: 90, flexDirection: 'column', alignItems: 'center', ...pop(t, 3.7, 0.7) },
      h('img', { src: A.face, width: 190, height: 190, style: { width: 190, height: 190, borderRadius: 999, border: '5px solid #2DE2B8', boxShadow: '0 0 50px rgba(45,226,184,0.55)', objectFit: 'cover' } }),
      d({ marginTop: 16, padding: '8px 20px', borderRadius: 14, border: `1.5px solid ${C.line}`, backgroundColor: 'rgba(10,16,28,0.9)', color: C.text, fontSize: 24, fontWeight: 800 }, 'Talha Atif'),
      d({ marginTop: 10, color: C.teal, fontSize: 22, fontWeight: 800 }, '3+ years shipping production apps'),
    ),
  ]
}

function S2(t) {
  const users = Math.round(5000 * ease(P(t, 2.3, 2.4)))
  const float = (k) => 8 * Math.sin(t * 1.4 + k)
  return [
    abs({ left: 90, top: 150, flexDirection: 'column' },
      d({ ...inn(t, 0.3) }, h(Tag, { text: 'CASE STUDY 01' })),
      d({ fontSize: 112, fontWeight: 900, color: '#FFFFFF', letterSpacing: -2, marginTop: 20, ...inn(t, 0.55, { dy: 44 }) }, 'Cunocovo'),
      d({ fontSize: 42, fontWeight: 700, color: C.teal, marginTop: 4, ...inn(t, 0.9) }, 'Social web app for creatives'),
      d({ fontSize: 30, fontWeight: 600, color: '#B9C2D3', marginTop: 14, ...inn(t, 1.2) }, 'Real-time feed, notifications, moderation'),
    ),
    abs({ left: 90, top: 520, flexDirection: 'column' },
      d({ ...inn(t, 1.8, { dy: 30 }) },
        h(Stat, { value: `${num(users)}+`, label: 'ACTIVE USERS', w: 360 }),
        h(Stat, { value: '700ms', label: 'FEED LOAD, WAS 3s', w: 360, style: { ...inn(t, 5.2, { dy: 30 }) } }),
      ),
      d({ marginTop: 22, ...inn(t, 6.4, { dy: 30 }) }, h(Stat, { value: '0', label: 'MIGRATION DOWNTIME', w: 360 }),
        d({ alignItems: 'center', padding: '0 30px', height: 128, borderRadius: 24, border: `1.5px solid ${C.teal}`, color: C.teal, fontSize: 38, fontWeight: 900 }, d({ width: 18, height: 18, borderRadius: 999, backgroundColor: C.teal, marginRight: 16, boxShadow: '0 0 22px rgba(45,226,184,0.95)', opacity: 0.55 + 0.45 * Math.sin(t * 4) }), 'Live in production'),
      ),
    ),
    Phone({ src: A.about, width: 285, height: 606, left: 985, top: 300 + float(0), rotate: -8, style: inn(t, 0.7, { dy: 120, dur: 0.9 }) }),
    Phone({ src: A.alert, width: 285, height: 606, left: 1560, top: 310 + float(2), rotate: 8, style: inn(t, 1.1, { dy: 120, dur: 0.9 }) }),
    Phone({ src: A.post, width: 348, height: 741, left: 1230, top: 170 + float(1), rotate: 0, style: inn(t, 0.9, { dy: 140, dur: 0.9 }) }),
  ]
}

function S3(t) {
  const float = (k) => 7 * Math.sin(t * 1.2 + k)
  const ms = Math.round(8 * ease(P(t, 3.2, 1.2)))
  const lat = Math.round(50 * ease(P(t, 6.2, 1.4)))
  return [
    abs({ left: 90, top: 140, flexDirection: 'column' },
      d({ ...inn(t, 0.3) }, h(Tag, { text: 'CASE STUDY 02', color: C.orange })),
      d({ fontSize: 84, fontWeight: 900, color: '#FFFFFF', letterSpacing: -1.5, marginTop: 20, lineHeight: 1.05, flexDirection: 'column', ...inn(t, 0.55, { dy: 44 }) },
        d({}, 'Identity Governance'), d({ color: C.teal }, '& Access Platform')),
      d({ marginTop: 28, flexDirection: 'column' },
        h(Tick, { label: 'Self-service access portal', style: inn(t, 1.4, { dx: -30, dy: 0 }) }),
        h(Tick, { label: 'Rule-based role engine', style: inn(t, 2.5, { dx: -30, dy: 0 }) }),
        h(Tick, { label: 'Event-driven workflows (Kafka)', style: inn(t, 3.6, { dx: -30, dy: 0 }) }),
        h(Tick, { label: 'PII-free, compliance-grade audit', style: inn(t, 5.0, { dx: -30, dy: 0 }) }),
      ),
    ),
    abs({ left: 90, top: 770, ...inn(t, 3.0, { dy: 30 }) },
      h(Stat, { value: `${ms}+`, label: 'MICROSERVICES', w: 250 }),
      h(Stat, { value: `${lat}%`, label: 'LATENCY CUT (gRPC)', w: 300, style: { ...inn(t, 6.0, { dy: 30 }) } }),
      h(Stat, { value: '100K+', label: 'LOGS PER CYCLE', w: 250, style: { ...inn(t, 7.4, { dy: 30 }) } }),
    ),
    BrowserWindow({ src: A.i6, width: 740, height: 355, left: 1130, top: 120 + float(0), url: 'app.yourproduct.com/roles', style: inn(t, 0.6, { dy: 90, dur: 0.9 }) }),
    BrowserWindow({ src: A.i1, width: 840, height: 400, left: 1020, top: 260 + float(1), url: 'app.yourproduct.com/governance', style: inn(t, 0.9, { dy: 90, dur: 0.9 }) }),
    BrowserWindow({ src: A.i24, width: 660, height: 320, left: 960, top: 600 + float(2), url: 'app.yourproduct.com/workflows', style: inn(t, 1.2, { dy: 90, dur: 0.9 }) }),
    BrowserWindow({ src: A.i25, width: 560, height: 280, left: 1320, top: 650 + float(3), url: 'app.yourproduct.com/permissions', style: inn(t, 1.5, { dy: 90, dur: 0.9 }) }),
  ]
}

function S4(t) {
  const col = (title, color, items, at, icon) =>
    d(
      { flexDirection: 'column', width: 540, padding: '34px 36px', marginRight: 36, borderRadius: 28, border: `1.5px solid ${C.line}`, backgroundColor: 'rgba(255,255,255,0.05)', boxShadow: '0 30px 60px rgba(0,0,0,0.35)', ...inn(t, at, { dy: 60, dur: 0.7 }) },
      d({ alignItems: 'center', marginBottom: 22 }, d({ marginRight: 14 }, h(Icon, { kind: icon, size: 40, color })), d({ fontSize: 40, fontWeight: 900, color }, title)),
      ...items.map((x, i) => d({ alignItems: 'center', fontSize: 33, fontWeight: 700, color: C.text, marginBottom: 12, ...inn(t, at + 0.35 + i * 0.18, { dx: -20, dy: 0, dur: 0.4 }) }, d({ marginRight: 12 }, h(Check, { size: 26, color })), x)),
    )
  const row = ['Auth & roles', 'Admin panels', 'Real-time', 'AI integrations', 'SLA / SLO ready', 'Fully responsive']
  return [
    abs({ left: 90, top: 140, flexDirection: 'column' },
      d({ ...inn(t, 0.3) }, h(Tag, { text: 'WHAT YOU GET' })),
      d({ fontSize: 86, fontWeight: 900, color: '#FFFFFF', letterSpacing: -1.5, marginTop: 20, ...inn(t, 0.55, { dy: 44 }) }, 'The whole product,'),
      d({ fontSize: 86, fontWeight: 900, color: C.orange, letterSpacing: -1.5, ...inn(t, 0.85, { dy: 44 }) }, 'idea to production'),
    ),
    abs({ left: 90, top: 480 },
      col('Frontend', C.teal, ['React & Next.js', 'TypeScript', 'Tailwind, Figma to web'], 1.2, 'code'),
      col('Backend', C.orange, ['NestJS', 'Spring Boot', 'Django & Flask'], 3.4, 'code'),
      col('Data & Cloud', '#8FB8FF', ['PostgreSQL, Supabase', 'Firebase', 'Docker & CI/CD'], 5.6, 'db'),
    ),
    abs({ left: 90, top: 826 },
      ...row.map((l, i) => h(Chip, { key: l, label: l, style: { ...inn(t, 7.4 + i * 0.25, { dy: 20, dur: 0.4 }) } })),
    ),
  ]
}

function S5(t) {
  const steps = [
    { n: '1', title: 'Share the idea', sub: 'Quick call, clear scope', at: 0.9 },
    { n: '2', title: 'Plan & design', sub: 'Architecture, Figma, estimate', at: 2.3 },
    { n: '3', title: 'Build in milestones', sub: 'Weekly demos you can click', at: 3.7 },
    { n: '4', title: 'Launch & monitor', sub: 'Deploy, observe, scale', at: 5.1 },
  ]
  const line = ease(P(t, 0.9, 5.2))
  return [
    abs({ left: 90, top: 140, flexDirection: 'column' },
      d({ ...inn(t, 0.2) }, h(Tag, { text: 'HOW IT WORKS', color: C.orange })),
      d({ fontSize: 86, fontWeight: 900, color: '#FFFFFF', letterSpacing: -1.5, marginTop: 20, ...inn(t, 0.4, { dy: 44 }) }, 'Simple, clear, on schedule'),
    ),
    // track
    abs({ left: 190, top: 560, width: 1540, height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)' }),
    abs({ left: 190, top: 560, width: 1540 * line, height: 6, borderRadius: 6, backgroundImage: 'linear-gradient(90deg, #2DE2B8, #FF7A3D)' }),
    ...steps.map((s, i) => {
      const x = 190 + i * (1540 / 3)
      return abs(
        { left: x - 150, top: 470, width: 300, flexDirection: 'column', alignItems: 'center', ...pop(t, s.at, 0.6) },
        d({ width: 100, height: 100, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A101C', border: `5px solid ${i % 2 ? C.orange : C.teal}`, boxShadow: `0 0 36px ${i % 2 ? 'rgba(255,122,61,0.5)' : 'rgba(45,226,184,0.5)'}`, color: '#FFFFFF', fontSize: 46, fontWeight: 900 }, s.n),
        d({ marginTop: 36, fontSize: 38, fontWeight: 900, color: '#FFFFFF', textAlign: 'center', justifyContent: 'center' }, s.title),
        d({ marginTop: 10, fontSize: 26, fontWeight: 600, color: C.sub, textAlign: 'center', justifyContent: 'center' }, s.sub),
      )
    }),
    abs({ left: 90, top: 800, ...inn(t, 5.6, { dy: 30 }) },
      h(Chip, { label: 'Fixed scope', icon: 'code' }), h(Chip, { label: 'Weekly progress updates', icon: 'globe' }), h(Chip, { label: 'Source code is yours', icon: 'code' }),
    ),
  ]
}

function Badge({ kind, title, sub, style }) {
  const paths = {
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z M8.5 12.5l2.5 2.5 4.5-5',
    wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z',
  }
  return d(
    { alignItems: 'center', padding: '0 26px 0 18px', height: 96, borderRadius: 26, border: `1.5px solid ${C.line}`, backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 18, ...style },
    d({ width: 60, height: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundImage: 'linear-gradient(135deg, rgba(45,226,184,0.35), rgba(45,226,184,0.1))', border: '1.5px solid rgba(45,226,184,0.7)', marginRight: 16 },
      h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: C.teal, strokeWidth: 2.3, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: paths[kind] })),
    ),
    d({ flexDirection: 'column' },
      d({ fontSize: 31, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.05 }, title),
      d({ fontSize: 19, fontWeight: 700, color: C.sub, marginTop: 4 }, sub),
    ),
  )
}

function S6(t) {
  const pulse = 1 + 0.025 * Math.sin(t * 4)
  const projects = Math.round(50 * ease(P(t, 0.9, 1.4)))
  const users = Math.round(100 * ease(P(t, 1.4, 1.6)))
  return [
    abs({ left: 90, top: 140, flexDirection: 'column' },
      d({ fontSize: 124, fontWeight: 900, color: '#FFFFFF', letterSpacing: -2, lineHeight: 1.04, ...inn(t, 0.4, { dy: 50, dur: 0.7 }) }, "Let's build"),
      d({ fontSize: 124, fontWeight: 900, color: C.teal, letterSpacing: -2, lineHeight: 1.04, ...inn(t, 0.9, { dy: 50, dur: 0.7 }) }, 'your web app.'),
    ),
    abs({ left: 90, top: 440 },
      h(Badge, { kind: 'bolt', title: 'Fast delivery', sub: 'Milestones, weekly demos', style: pop(t, 2.5, 0.5) }),
      h(Badge, { kind: 'shield', title: 'Reliable code', sub: 'Built for production', style: pop(t, 2.85, 0.5) }),
      h(Badge, { kind: 'wrench', title: 'Bug-fix support', sub: 'I fix what breaks', style: pop(t, 3.2, 0.5) }),
    ),
    abs({ left: 90, top: 580 },
      h(Stat, { value: `${projects}+`, label: 'WEB PROJECTS', w: 330, style: { ...inn(t, 1.2, { dy: 30 }) } }),
      h(Stat, { value: `${users}K+`, label: 'USERS SERVED', w: 330, style: { ...inn(t, 1.6, { dy: 30 }) } }),
      h(Stat, { value: '3+', label: 'YEARS EXPERIENCE', w: 330, style: { ...inn(t, 2.0, { dy: 30 }) } }),
    ),
    abs({ left: 90, top: 770, alignItems: 'center', ...inn(t, 4.2, { dy: 30 }) },
      d({ alignItems: 'center', padding: '0 52px', height: 112, borderRadius: 26, backgroundImage: 'linear-gradient(135deg, #FF8A4C, #E8561F)', boxShadow: '0 24px 50px rgba(232,86,31,0.45)', color: '#0B0B0D', fontSize: 46, fontWeight: 900, transform: `scale(${pulse})` }, 'Order Now', d({ marginLeft: 18 }, h('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none' }, h('path', { d: 'M5 12h14M13 6l6 6-6 6', stroke: '#0B0B0D', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' })))),
      d({ marginLeft: 36, fontSize: 34, fontWeight: 800, color: C.teal }, 'Message me your idea'),
    ),
    abs({ left: 1330, top: 150, flexDirection: 'column', alignItems: 'center', ...pop(t, 0.9, 0.8) },
      h('img', { src: A.faceBig, width: 360, height: 360, style: { width: 360, height: 360, borderRadius: 999, border: '7px solid #2DE2B8', boxShadow: '0 0 80px rgba(45,226,184,0.55)', objectFit: 'cover' } }),
      d({ marginTop: 26, fontSize: 44, fontWeight: 900, color: '#FFFFFF' }, 'Talha Atif'),
      d({ marginTop: 6, fontSize: 28, fontWeight: 700, color: C.teal }, 'Full Stack Engineer'),
    ),
  ]
}

const SCENE_FN = [S1, S2, S3, S4, S5, S6]

function frameTree(frame) {
  const t = frame / FPS
  let idx = SCENES.findIndex((s) => t >= s.start && t < s.start + s.len)
  if (idx < 0) idx = SCENES.length - 1
  const s = SCENES[idx]
  const lt = t - s.start
  const fadeIn = ease(P(lt, 0, 0.35))
  const fadeOut = idx === SCENES.length - 1 ? 1 : 1 - ease(P(lt, s.len - 0.35, 0.35))
  const scene = SCENE_FN[idx](warp(s, lt))
  return h(
    'div',
    { style: { width: W, height: H, display: 'flex', position: 'relative', backgroundColor: C.bg, fontFamily: 'Segoe', overflow: 'hidden' } },
    ...Backdrop(t),
    abs({ left: 0, top: 0, width: W, height: H, opacity: Math.min(fadeIn, fadeOut) }, ...scene),
    Header(t),
    Captions(t),
    abs({ left: 0, top: H - 8, width: W * (t / TOTAL), height: 8, backgroundImage: 'linear-gradient(90deg, #2DE2B8, #FF7A3D)' }),
  )
}

async function main() {
  await prepare()
  fs.mkdirSync(OUT, { recursive: true })
  const fonts = [
    { name: 'Segoe', data: font('segoeui.ttf'), weight: 400, style: 'normal' },
    { name: 'Segoe', data: font('segoeuib.ttf'), weight: 700, style: 'normal' },
    { name: 'Segoe', data: font('seguibl.ttf'), weight: 900, style: 'normal' },
  ]
  if (process.argv[6] === 'info') {
    console.log(JSON.stringify({ TOTAL, TOTAL_FRAMES, SCENES: SCENES.map((s) => ({ id: s.id, start: +s.start.toFixed(3), len: +s.len.toFixed(3), audioAt: +(s.start + s.audioAt).toFixed(3) })) }, null, 1))
    return
  }
  const end = Math.min(F1, TOTAL_FRAMES)
  const t0 = Date.now()
  for (let f = F0; f < end; f++) {
    const res = new ImageResponse(frameTree(f), { width: W, height: H, fonts })
    fs.writeFileSync(path.join(OUT, `f${String(f).padStart(5, '0')}.png`), Buffer.from(await res.arrayBuffer()))
    if ((f - F0) % 30 === 0) console.log(`frame ${f}/${end} ${(((Date.now() - t0) / 1000) | 0)}s`)
  }
  console.log('done', F0, end)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
