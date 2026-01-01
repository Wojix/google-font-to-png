const fonts = {
  "Baloo 2": { w: [400, 500, 600, 700, 800] },
  "Bangers": { w: [400] },
  "Barrio": { w: [400] },
  "Chokokutai": { w: [400] },
  "Coral Pixels": { w: [400] },
  "Dela Gothic One": { w: [400] },
  "DotGothic16": { w: [400] },
  "Kaisei Decol": { w: [400, 500, 700] },
  "Lobster": { w: [400] },
  "Notable": { w: [400] },
  "Noto Sans JP": { w: [100, 300, 400, 500, 700, 900] },
  "Noto Serif JP": { w: [200, 400, 600, 900] },
  "Open Sans": { w: [300, 400, 600, 700, 800], i: 1 },
  "Roboto": { w: [100, 300, 400, 500, 700, 900], i: 1 },
  "Rock 3D": { w: [400] },
  "Shizuru": { w: [400] },
  "WDXL Lubrifont JP N": { w: [400] },
  "Zen Kaku Gothic Antique": { w: [300, 400, 500, 700] }
}

const c = document.getElementById("c")
const ctx = c.getContext("2d")

const fontSel = document.getElementById("font")
const varSel = document.getElementById("variant")
const copyBtn = document.getElementById("copy")

Object.keys(fonts).forEach(font => {
  const o = document.createElement("option")
  o.textContent = font
  fontSel.appendChild(o)
})

function variants() {
  varSel.innerHTML = ""
  const f = fonts[fontSel.value]

  f.w.forEach(w => {
    const o = document.createElement("option")
    o.value = `normal ${w}`
    o.textContent = w
    varSel.appendChild(o)
  })

  if (f.i) {
    f.w.forEach(w => {
      const o = document.createElement("option")
      o.value = `italic ${w}`
      o.textContent = `${w} italic`
      varSel.appendChild(o)
    })
  }
}

async function draw() {
  const font = fontSel.value
  if (!font) return

  const text = document.getElementById("text").value
  const size = +document.getElementById("size").value
  const dxf = +document.getElementById("dxf").value
  const fill = document.getElementById("fill").value
  const stroke = document.getElementById("stroke").value
  const sw = +document.getElementById("strokeW").value
  const fillOn = document.getElementById("fillOn").checked
  const kerningOn = document.getElementById("kerning").checked

  const [style, weight] = varSel.value.split(" ")

  const dpr = window.devicePixelRatio || 1
  const w = c.clientWidth
  const h = c.clientHeight

  c.width = w * dpr
  c.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  ctx.fontKerning = kerningOn ? "normal" : "none"

  await document.fonts.load(`${style} ${weight} ${size * dxf}px '${font}'`)
  ctx.font = `${style} ${weight} ${size * dxf}px '${font}'`
  ctx.textBaseline = "top"

  let x = 0
  for (const ch of text) {
    if (fillOn) {
      ctx.fillStyle = fill
      ctx.fillText(ch, x, 0)
    }
    if (sw > 0) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = sw
      ctx.strokeText(ch, x, 0)
    }
    x += ctx.measureText(ch).width
  }
}

document.querySelectorAll("select,input").forEach(e => e.oninput = draw)

fontSel.onchange = () => {
  variants()
  draw()
}

document.getElementById("png").onclick = () => {
  const a = document.createElement("a")
  a.href = c.toDataURL("image/png")
  a.download = "text.png"
  a.click()
}

copyBtn.onclick = async () => {
  const original = copyBtn.textContent
  const b = await new Promise(r => c.toBlob(r))
  await navigator.clipboard.write([new ClipboardItem({ "image/png": b })])
  copyBtn.textContent = "Copied"
  setTimeout(() => copyBtn.textContent = original, 3000)
}

document.getElementById("link").onclick = () => {
  const p = new URLSearchParams()
  ;[
    "font",
    "variant",
    "text",
    "size",
    "dxf",
    "fill",
    "stroke",
    "strokeW",
    "fillOn",
    "kerning"
  ].forEach(id => {
    const e = document.getElementById(id)
    p.set(id, e.type === "checkbox" ? e.checked : e.value)
  })
  location.hash = p.toString()
}

document.getElementById("cocoa").onclick = () => {
  window.open("https://buymeacoffee.com/wojix", "_blank")
}

if (location.hash) {
  const p = new URLSearchParams(location.hash.slice(1))
  p.forEach((v, k) => {
    const e = document.getElementById(k)
    if (e) e.type === "checkbox" ? e.checked = v === "true" : e.value = v
  })
}

variants()
draw()
