/* =========================================================
   SISCOM ERP — main.js
   Tanpa framework, tanpa build. Semua animasi memakai
   requestAnimationFrame / IntersectionObserver.
   ========================================================= */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const WA = "6281299817515"; // ISI: nomor WhatsApp sales resmi (format 628xxx)
const waUrl = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v) => v * v * (3 - 2 * v);
/* fase warna bola: krem -> biru dongker -> krem, dengan jeda di tiap ujung */
function orbPhase(t) {
  const p = (t % 18) / 18;
  if (p < 0.12) return 0;
  if (p < 0.28) return smooth((p - 0.12) / 0.16);
  if (p < 0.55) return 1;
  if (p < 0.71) return 1 - smooth((p - 0.55) / 0.16);
  return 0;
}

/* WhatsApp ------------------------------------------------- */
$$("[data-wa]").forEach((a) => {
  a.href = waUrl(a.dataset.wa);
  a.target = "_blank";
  a.rel = "noopener";
});

/* Header: pil mengambang saat digulir + indikator geser ----- */
const head = $("#top");
const nav = $("#nav");
const ink = $(".nav-ink");
const navLinks = $$("a", nav).filter((a) => !a.closest(".nav-drop"));
let activeLink = null;

function moveInk(el) {
  if (!ink) return;
  if (!el) {
    ink.style.opacity = "0";
    return;
  }
  ink.style.width = el.offsetWidth + "px";
  ink.style.transform = `translateX(${el.offsetLeft - 4}px)`;
  ink.style.opacity = "1";
}
navLinks.forEach((a) => {
  a.addEventListener("pointerenter", () => moveInk(a));
});
const navDropBtn = $(".nav-drop-btn");
if (navDropBtn) navDropBtn.addEventListener("pointerenter", () => moveInk(null));
nav.addEventListener("pointerleave", () => moveInk(activeLink));

const spy = ["solusi", "hisis", "produk", "klien", "faq"]
  .map((id) => ({ id, el: document.getElementById(id) }))
  .filter((x) => x.el);

function onScroll() {
  const y = scrollY;
  head.classList.toggle("scrolled", y > 20);
  $("#wa").classList.toggle("on", y > innerHeight * 0.5);

  let current = null;
  spy.forEach((s) => {
    const r = s.el.getBoundingClientRect();
    if (r.top <= 150 && r.bottom > 140) current = s;
  });
  const link = current
    ? navLinks.find((a) => a.hash === "#" + current.id)
    : null;
  if (link !== activeLink) {
    activeLink = link || null;
    navLinks.forEach((a) => a.classList.toggle("active", a === link));
  }
  const hovering = navLinks.some((a) => a.matches(":hover"));
  if (!hovering) moveInk(activeLink);
}
let ticking = false;
addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  },
  { passive: true },
);
addEventListener("resize", () => moveInk(activeLink));
onScroll();

/* Drawer ---------------------------------------------------- */
const drawer = $("#drawer");
function setDrawer(open) {
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", !open);
  $("#burger").setAttribute("aria-expanded", open);
  document.body.classList.toggle("lock", open);
}
$("#burger").addEventListener("click", () =>
  setDrawer(!drawer.classList.contains("open")),
);
$("#close").addEventListener("click", () => setDrawer(false));
$$("a", drawer).forEach((a) =>
  a.addEventListener("click", () => setDrawer(false)),
);
addEventListener("keydown", (e) => e.key === "Escape" && setDrawer(false));

/* Dropdown produk ------------------------------------------ */
const navDrop = $(".nav-drop");
if (navDrop) {
  const dropBtn = $(".nav-drop-btn", navDrop);
  const closeDrop = () => {
    navDrop.classList.remove("open");
    dropBtn.setAttribute("aria-expanded", "false");
  };
  dropBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !navDrop.classList.contains("open");
    navDrop.classList.toggle("open", open);
    dropBtn.setAttribute("aria-expanded", open);
  });
  document.addEventListener("click", (e) => {
    if (!navDrop.contains(e.target)) closeDrop();
  });
  $$("a", navDrop).forEach((a) => a.addEventListener("click", closeDrop));
  addEventListener("keydown", (e) => e.key === "Escape" && closeDrop());
}

/* Reveal + counter ----------------------------------------- */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }),
  { threshold: 0.12 },
);
$$(".rv").forEach((el) => (reduce ? el.classList.add("in") : io.observe(el)));

const cio = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const n = +el.dataset.n;
      const suffix = el.dataset.suf || "";
      const start = performance.now();
      cio.unobserve(el);
      const tick = (t) => {
        const k = reduce ? 1 : clamp((t - start) / 1300);
        const v = Math.round(n * (1 - Math.pow(1 - k, 3)));
        el.textContent =
          (el.hasAttribute("data-plain") ? v : v.toLocaleString("id-ID")) +
          (k === 1 ? suffix : "");
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }),
  { threshold: 0.6 },
);
$$("[data-n]").forEach((el) => cio.observe(el));

/* Dashboard cabang ----------------------------------------- */
const branch = [
  {
    k: ["Rp 842.650.000", "Rp 418.200.000", "Rp 126.400.000", "Rp 294.850.000"],
    d: "M4 64L54 52L104 56L154 38L204 42L254 24L304 14",
  },
  {
    k: ["Rp 396.120.000", "Rp 184.500.000", "Rp 54.900.000", "Rp 141.300.000"],
    d: "M4 58L54 60L104 45L154 49L204 30L254 28L304 18",
  },
];
$$(".sw button").forEach((b) =>
  b.addEventListener("click", () => {
    $$(".sw button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    const d = branch[+b.dataset.b];
    d.k.forEach((v, i) => ($("#k" + i).textContent = v));
    $("#spark").setAttribute("d", d.d);
  }),
);

/* Story: dua langkah mengikuti scroll ---------------------- */
const story = $("#solusi");
const slides = $$(".story-slide", story);
const visuals = $$(".vis", story);
const rail = $(".story-rail i", story);
const count = $(".story-count b", story);
let storyStep = -1;

const storyPin = $(".story-sticky", story);
function storyUpdate() {
  const r = story.getBoundingClientRect();
  const total =
    story.offsetHeight - (storyPin ? storyPin.offsetHeight : innerHeight);
  const p = total > 0 ? clamp(-r.top / total) : 0;
  const step = p < 0.5 ? 0 : 1;
  if (rail) rail.style.transform = `scaleX(${0.4 + p * 1.6})`;
  if (step !== storyStep) {
    storyStep = step;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === step));
    visuals.forEach((v, i) => v.classList.toggle("is-active", i === step));
    if (count) count.textContent = "0" + (step + 1);
    if (step === 1) startSystems();
    else startKnowSync();
  }
}

/* Kartu pengetahuan: baris data berganti sorotan ---------- */
const knowRows = $$(".know-list div", story);
let knowIndex = 0;
let knowTimer = 0;
function startKnowSync() {
  if (!knowRows.length) return;
  knowRows.forEach((r, i) => r.classList.toggle("is-sync", i === knowIndex));
  if (knowTimer || reduce) return;
  knowTimer = setInterval(() => {
    if (document.hidden) return;
    if (!visuals[0] || !visuals[0].classList.contains("is-active")) return;
    knowIndex = (knowIndex + 1) % knowRows.length;
    knowRows.forEach((r, i) => r.classList.toggle("is-sync", i === knowIndex));
  }, 1600);
}

/* Sistem: pil aktif bergiliran + badge centang -------------- */
const sysPills = $$(".sys-pill");
const sysPaths = $$(".sys-path");
const sysCaption = $(".sys-caption");
let sysIndex = 0;
let sysTimer = 0;

function paintSystems(i) {
  sysPills.forEach((p, j) => p.classList.toggle("is-on", j === i));
  sysPaths.forEach((p, j) => {
    p.classList.toggle("is-on", j === i);
    const dot = $("circle", p);
    if (dot) dot.setAttribute("r", j === i ? "3.4" : "2.4");
  });
  const pill = sysPills[i];
  if (sysCaption && pill) {
    const label = $("span", pill);
    const badge = $(".sys-badge", pill);
    const name = $("b", sysCaption);
    const rest = $("span", sysCaption);
    if (name && label) name.textContent = label.textContent;
    if (rest && badge) rest.textContent = " · " + badge.textContent;
  }
}
/* Waktu tempuh bulatan dari bola sampai ke pil; pergantian aktif
   menunggu bulatan selesai, seperti di kivoagentic.ai. */
const SYS_TRAVEL = 2400;
let sysFlowStart = performance.now();
function startSystems() {
  paintSystems(sysIndex);
  sysFlowStart = performance.now();
}
sysPills.forEach((p, i) =>
  p.addEventListener("pointerenter", () => {
    sysIndex = i;
    paintSystems(i);
    sysFlowStart = performance.now();
  }),
);

/* Garis penghubung: berjarak dari bola dan mengalir ke tiap pil ------ */
const sysWrap = $(".sys-wrap", story);
const sysSvg = $(".sys-lines", story);
/* Bola mengisi 84,9% kotak kanvasnya: sisa ruang mencegah tepi terpotong. */
const ORB_FILL = 0.849;
/* Jarak awal garis dari permukaan bola (px), supaya tidak menempel. */
const LINE_GAP = 26;
const SVGNS = "http://www.w3.org/2000/svg";

/* Titik kecil yang berjalan di sepanjang cada garis. */
function flowDot(group, cls, r) {
  if (!group || $(".sys-flow,.orbit-flow", group)) return $(".sys-flow,.orbit-flow", group);
  const c = document.createElementNS(SVGNS, "circle");
  c.setAttribute("class", cls);
  c.setAttribute("r", String(r));
  group.appendChild(c);
  return c;
}
sysPaths.forEach((g) => flowDot(g, "sys-flow", 2.6));

function layoutSystems() {
  if (!sysWrap || !sysSvg || !sysPaths.length) return;
  const wrap = sysWrap.getBoundingClientRect();
  const sphere = $(".sys-sphere", story);
  if (!sphere || wrap.width < 2) return;
  const sr = sphere.getBoundingClientRect();
  sysSvg.setAttribute(
    "viewBox",
    `0 0 ${Math.round(wrap.width)} ${Math.round(wrap.height)}`,
  );
  const cx = sr.left - wrap.left + sr.width / 2;
  const cy = sr.top - wrap.top + sr.height / 2;
  const radius = (sr.width / 2) * ORB_FILL;
  const spread = radius * 0.88;
  const last = sysPaths.length - 1;

  sysPaths.forEach((g, i) => {
    const pill = sysPills[i];
    if (!pill) return;
    const pr = pill.getBoundingClientRect();
    const ex = pr.left - wrap.left - 6;
    const ey = pr.top - wrap.top + pr.height / 2;
    const dy = last ? -spread + (2 * spread * i) / last : 0;
    /* Mulai di luar permukaan bola, bukan tepat di pinggirnya. */
    const sx = cx + Math.sqrt(Math.max(0, radius * radius - dy * dy)) + LINE_GAP;
    const sy = cy + dy;
    const bend = Math.max(22, Math.min(70, (ex - sx) * 0.6));
    const path = $("path", g);
    const dot = $("circle", g);
    if (path) {
      path.setAttribute(
        "d",
        `M${sx.toFixed(1)} ${sy.toFixed(1)} C${(sx + bend).toFixed(1)} ${sy.toFixed(1)} ${(ex - bend).toFixed(1)} ${ey.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      );
    }
    if (dot) {
      dot.setAttribute("cx", sx.toFixed(1));
      dot.setAttribute("cy", sy.toFixed(1));
      dot.setAttribute("r", g.classList.contains("is-on") ? "3.4" : "2.4");
    }
  });
}

layoutSystems();
addEventListener("resize", layoutSystems, { passive: true });
if (document.fonts && document.fonts.ready)
  document.fonts.ready.then(layoutSystems).catch(() => {});

let storyTick = false;
addEventListener(
  "scroll",
  () => {
    if (storyTick) return;
    storyTick = true;
    requestAnimationFrame(() => {
      storyUpdate();
      storyTick = false;
    });
  },
  { passive: true },
);
storyUpdate();

/* Label mengelilingi globe + aliran garis (ala Kivo) -------- */
const orbitStage = $(".orbit-stage", story);
const orbitChips = $$(".orbit-chip", orbitStage || story);
const orbitGlobe = $(".orbit-globe", story);
let flowsVisible = false;
new IntersectionObserver(
  (entries) => (flowsVisible = entries[0].isIntersecting),
  { rootMargin: "80px" },
).observe(story);

/* orbit: jari-jari relatif terhadap panggung, sudut awal, kecepatan (derajat/detik) */
const ORBIT_CFG = [
  /* kecepatan sama supaya jarak antar label tetap terjaga saat berputar */
  { rx: 0.445, ry: 0.405, a: -152, spd: 4.6 },
  { rx: 0.475, ry: 0.43, a: -28, spd: 4.6 },
  { rx: 0.445, ry: 0.405, a: 158, spd: 4.6 },
  { rx: 0.475, ry: 0.43, a: 22, spd: 4.6 },
  { rx: 0.46, ry: 0.415, a: 76, spd: 4.6 },
];
let orbitSize = { w: 0, h: 0, cx: 0, cy: 0, rad: 0 };
function measureOrbit() {
  if (!orbitStage || !orbitGlobe) return;
  if (innerWidth < 961) {
    orbitChips.forEach((c) => (c.style.transform = ""));
    return;
  }
  const sr = orbitStage.getBoundingClientRect();
  const gr = orbitGlobe.getBoundingClientRect();
  orbitSize = {
    w: sr.width,
    h: sr.height,
    cx: gr.left - sr.left + gr.width / 2,
    cy: gr.top - sr.top + gr.height / 2,
    rad: gr.width * 0.5 * 0.84,
  };
  orbitChips.forEach((c) => {
    c.dataset.w = c.offsetWidth;
    c.dataset.h = c.offsetHeight;
  });
}

const flowT0 = performance.now();
function flowLoop(now) {
  requestAnimationFrame(flowLoop);
  if (!flowsVisible || document.hidden) return;
  const t = (now - flowT0) / 1000;

  /* bulatan berjalan hanya pada garis aktif, lalu pindah setelah sampai */
  if (visuals[1] && visuals[1].classList.contains("is-active")) {
    if (!reduce && now - sysFlowStart >= SYS_TRAVEL) {
      sysIndex = (sysIndex + 1) % sysPills.length;
      paintSystems(sysIndex);
      sysFlowStart = now;
    }
    const q = smooth(clamp((now - sysFlowStart) / SYS_TRAVEL));
    sysPaths.forEach((g) => {
      const p = $("path", g);
      const dot = $(".sys-flow", g);
      if (!p || !dot) return;
      if (!g.classList.contains("is-on")) {
        dot.classList.remove("is-lit");
        return;
      }
      const len = p.getTotalLength();
      const pt = p.getPointAtLength(q * len);
      dot.setAttribute("cx", pt.x.toFixed(1));
      dot.setAttribute("cy", pt.y.toFixed(1));
      /* sedikit denyut supaya bulatannya terasa hidup */
      dot.setAttribute("r", (3.2 + Math.sin(t * 4.2) * 0.35).toFixed(2));
      dot.classList.add("is-lit");
    });
  }

  /* label mengorbit mengelilingi globe — tanpa garis penghubung */
  if (
    visuals[0] &&
    visuals[0].classList.contains("is-active") &&
    innerWidth >= 961
  ) {
    if (!orbitSize.w) measureOrbit();
    const { w, h, cx, cy } = orbitSize;
    if (!w) return;
    orbitChips.forEach((chip, i) => {
      const o = ORBIT_CFG[i % ORBIT_CFG.length];
      const a = ((o.a + t * o.spd) * Math.PI) / 180;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      const px = cx + ux * w * o.rx;
      const py = cy + uy * h * o.ry;
      const cw = +chip.dataset.w || chip.offsetWidth;
      const ch = +chip.dataset.h || chip.offsetHeight;
      chip.style.transform = `translate3d(${(px - cw / 2).toFixed(1)}px, ${(py - ch / 2).toFixed(1)}px, 0)`;
    });
  }
}
if (orbitStage && orbitChips.length) {
  measureOrbit();
  addEventListener("resize", () => measureOrbit(), { passive: true });
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(measureOrbit).catch(() => {});
  requestAnimationFrame(flowLoop);
}

/* Produk / domain ------------------------------------------ */
const suites = [
  {
    key: "retail",
    label: "Retail",
    name: "SIS SmartPOS",
    head: "Retail: Dari Niat Beli Sampai Transaksi Selesai",
    desc: "Bantu tim toko mengubah pertanyaan pelanggan menjadi transaksi, tanpa stok dan pembukuan yang tercecer.",
    out: "Langkah antara niat pelanggan dan transaksi selesai jadi lebih sedikit.",
    query: "Cari produk di bawah Rp 500.000",
    ask: "Ada stok ukuran L warna navy?",
    reply: "Tersedia 12 pcs, siap kirim hari ini.",
    foot: [
      "Penjualan, stok, dan pembayaran dalam satu alur",
      "Ketersediaan produk dan rekomendasi real-time",
    ],
    mods: [
      "Kasir barcode dan multi-pembayaran",
      "Stok multi-cabang real-time",
      "Promo, diskon, dan member",
      "Laba rugi per outlet otomatis",
    ],
    rows: [
      ["Kemeja oxford", "3 pcs", "Rp 450.000"],
      ["Jaket kanvas", "2 set", "Rp 780.000"],
      ["Sepatu kulit", "1 pasang", "Rp 1.150.000"],
    ],
  },
  {
    key: "distribusi",
    label: "Distribusi",
    name: "SIS Distribution Suite",
    head: "Distribusi: Dari Purchase Order Sampai Barang Diterima",
    desc: "Kelola pengadaan, multi-gudang, piutang, dan Landed Cost dalam satu rantai yang bisa ditelusuri.",
    out: "Barang, biaya, dan tagihan bergerak di satu alur yang sama.",
    query: "Cari pesanan yang belum diterima",
    ask: "PO mana yang masih di jalan?",
    reply: "Tiga PO, tiba paling lambat Kamis.",
    foot: [
      "Pembelian, penerimaan, dan tagihan terhubung",
      "Status pengiriman dan umur piutang terpantau",
    ],
    mods: [
      "Pembelian impor/lokal dan Landed Cost",
      "Umur piutang dan limit kredit",
      "Mutasi antar gudang",
      "Faktur pajak dan akuntansi",
    ],
    rows: [
      ["PO-8801", "Per unit", "Rp 250.000.000"],
      ["Freight", "Proporsional", "Rp 18.500.000"],
      ["Bea masuk", "Estimasi", "Rp 7.400.000"],
    ],
  },
  {
    key: "manufaktur",
    label: "Manufaktur",
    name: "SIS Manufacturing Suite",
    head: "Manufaktur: Dari Bahan Baku Sampai Harga Pokok Jadi",
    desc: "Hitung HPP produksi aktual dari BOM bertingkat, work order, dan pemakaian bahan di lantai produksi.",
    out: "HPP aktual keluar otomatis tanpa rekap manual di akhir bulan.",
    query: "Cari work order yang masih berjalan",
    ask: "HPP batch terakhir sudah keluar?",
    reply: "Sudah, Rp 94 juta termasuk overhead.",
    foot: [
      "BOM, work order, dan pemakaian bahan satu jalur",
      "HPP aktual dan varian langsung ke keuangan",
    ],
    mods: [
      "BOM bertingkat",
      "Work Order produksi",
      "HPP aktual dan varian",
      "Terhubung stok dan keuangan",
    ],
    rows: [
      ["Bahan baku", "Issued", "Rp 94.000.000"],
      ["Overhead", "Alokasi", "Rp 21.500.000"],
      ["Tenaga kerja", "Aktual", "Rp 12.800.000"],
    ],
  },
  {
    key: "konstruksi",
    label: "Konstruksi",
    name: "SIS Construction One",
    head: "Konstruksi: Dari RAB Sampai Opname Proyek",
    desc: "Pantau RAP, kurva-S, subkon, dan termin owner dari satu tempat, tanpa menunggu laporan bulanan.",
    out: "Progres proyek dan tagihan terlihat sama di kantor dan lapangan.",
    query: "Cari proyek dengan deviasi progress",
    ask: "Deviasi proyek B masih aman?",
    reply: "Masih 1,2% di bawah kurva rencana.",
    foot: [
      "RAB, progress, dan termin dalam satu tampilan",
      "Deviasi dan tagihan subkon terpantau",
    ],
    mods: [
      "RAP dan RAB",
      "Kurva-S real-time",
      "Tagihan subkon dan termin owner",
      "Procurement dan aset proyek",
    ],
    rows: [
      ["Rencana", "RAP", "Rp 1,2 M"],
      ["Realisasi", "Lapangan", "Rp 1,24 M"],
      ["Deviasi", "Kurva-S", "-3,3%"],
    ],
  },
  {
    key: "berikat",
    label: "Kawasan Berikat",
    name: "SIS PusatBerikat",
    head: "Kawasan Berikat: Dari Pabean Sampai Audit",
    desc: "Laporan IT Inventory yang siap audit dan tersambung ke pembukuan, tanpa rekonsiliasi manual.",
    out: "Dokumen pabean dan mutasi barang siap ditunjukkan kapan saja.",
    query: "Cari dokumen BC yang belum ditutup",
    ask: "BC masuk bulan ini sudah lengkap?",
    reply: "Lengkap, tinggal dua dokumen pengeluaran.",
    foot: [
      "Pemasukan, pengeluaran, dan mutasi tercatat",
      "Jejak audit dan kuadran BC siap diperiksa",
    ],
    mods: [
      "Pemasukan dan pengeluaran pabean",
      "Mutasi bahan baku, WIP, scrap",
      "Jejak audit dokumen BC",
      "Terintegrasi akuntansi",
    ],
    rows: [
      ["Pemasukan", "Nov 2026", "Siap audit"],
      ["WIP", "Nov 2026", "Real-time"],
      ["Scrap", "Nov 2026", "Tercatat"],
    ],
  },
  {
    key: "valas",
    label: "Money Changer",
    name: "SIS ForexSuite",
    head: "Money Changer: Dari Kurs Sampai Nota Transaksi",
    desc: "Layani valas cepat dengan kurs berjenjang, stok brankas, dan pelaporan tertib sesuai Bank Indonesia.",
    out: "Nota dan laporan valas tertib tanpa input ulang di belakang.",
    query: "Cari transaksi USD hari ini",
    ask: "Kurs USD untuk 10 ribu sekarang?",
    reply: "Rp 15.840, stok brankas aman.",
    foot: [
      "Kurs, brankas, dan nota dalam satu alur",
      "Data KYC dan pelaporan tertib otomatis",
    ],
    mods: [
      "Kurs beli/jual multi-mata uang",
      "Selisih kurs dan stok brankas",
      "Data KYC dan nota",
      "Terhubung akuntansi",
    ],
    rows: [
      ["USD", "42.500", "Rp 15.840"],
      ["SGD", "28.000", "Rp 11.820"],
      ["EUR", "16.400", "Rp 17.240"],
    ],
  },
  {
    key: "hris",
    label: "HRIS",
    name: "SIS CoreHR",
    head: "HRIS: Dari Absensi Sampai Slip Gaji",
    desc: "Data karyawan, shift, cuti, dan lembur langsung menjadi payroll yang siap ditransfer.",
    out: "Payroll bulanan selesai tanpa rekap absensi manual.",
    query: "Cari karyawan dengan lembur bulan ini",
    ask: "Lembur tim produksi sudah masuk?",
    reply: "Sudah 128 jam, masuk slip November.",
    foot: [
      "Absensi, lembur, dan payroll satu jalur",
      "Jurnal beban gaji langsung ke akuntansi",
    ],
    mods: [
      "Database karyawan dan kontrak",
      "Absensi, shift, cuti, lembur",
      "Komponen gaji dan slip otomatis",
      "Jurnal beban gaji ke akuntansi",
    ],
    rows: [
      ["Produksi", "84 org", "Terverifikasi"],
      ["Penjualan", "46 org", "Terverifikasi"],
      ["Gudang", "22 org", "Terverifikasi"],
    ],
  },
];
const pillBox = $("#domainPills");
const two = (n) => String(n).padStart(2, "0");
const domSection = $(".domains");
const domStage = $(".dom-stage", domSection);
const domShow = $("#domShow");
const domTag = $("#domTag");
const domName = $("#domName");
const domCount = $("#domCount");
const domDesc = $("#domDesc");
const domOutcome = $("#domOutcome");
const domHead = $("#domHead");
const domPanels = $("#domPanels");
const domBgs = $$(".dom-bg", domSection);
/* Warna titik latar: abu saat pembuka, hangat saat kartu suite (ala Kivo) */
const FIELD_FX = { dot: "125,129,135" };
/* Empat latar gradien seperti Kivo, berganti tiap suite (fade 700ms) */
function paintBg(i) {
  const idx = i < 0 ? -1 : i % domBgs.length;
  domBgs.forEach((l, j) => l.classList.toggle("on", j === idx));
  /* warna titik ikut bergeser tipis per produk, masih satu keluarga biru */
  const dots = ["125,129,135", "116,131,158", "124,130,152", "112,128,160"];
  FIELD_FX.dot = i < 0 ? dots[0] : dots[i % dots.length];
}
/* Posisi pil mengelilingi bola, dalam persen bidang */
const PILL_POS = [
  [13, 62],
  [26, 24],
  [43, 11],
  [65, 20],
  [83, 40],
  [21, 86],
  [75, 82],
];
let activeSuite = 0;
let suiteReady = false;
let suiteTimer = 0;
let globeAPI = null;
let shownState = null;
let globeTone = null;

/* Warna bola: navy-abu saat pembuka, oranye saat masuk kartu (ala Kivo) */
function toneIntro() {
  if (!globeAPI || globeTone === "intro") return;
  globeTone = "intro";
  globeAPI.setTone(0x2a4a86, 0x6a9ad8, 0x0a1f44);
  globeAPI.setTint(0);
  globeAPI.setTone(0x2a4a86, 0x6a9ad8, 0x0a1f44);
  globeAPI.setTint(0);
}
function toneCard() {
  if (!globeAPI || globeTone === "card") return;
  globeTone = "card";
  globeAPI.setTone(0x16305c, 0x4a7fc4, 0x0a1f44);
  globeAPI.setTint(0);
}

/* Bola pindah dari tengah panggung ke dalam kartu, lalu kembali */
function layoutGlobe() {
  const g = $(".dom-globe");
  const field = $(".dom-field");
  const slot = $(".dom-ball");
  if (!g || !field) return;
  if (innerWidth < 961) {
    g.style.transform = "";
    return;
  }
  const base = g.offsetWidth || 1;
  const fr = field.getBoundingClientRect();
  if (!domSection.classList.contains("is-show") || !slot) {
    g.style.transform = "translate(-50%, -50%) translate(0px, 0px) scale(1)";
    return;
  }
  const sr = slot.getBoundingClientRect();
  /* Abaikan geseran kartu saat transisi saat mengukur slot bola */
  const cardEl = $(".dom-card");
  const ct = cardEl ? getComputedStyle(cardEl).transform : "none";
  let ox = 0;
  let oy = 0;
  if (ct && ct !== "none") {
    const m = ct.match(/matrix\(([^)]+)\)/);
    if (m) {
      const v = m[1].split(",").map(Number);
      ox = v[4] || 0;
      oy = v[5] || 0;
    }
  }
  const dx = sr.left + sr.width / 2 - ox - (fr.left + fr.width / 2);
  const dy = sr.top + sr.height / 2 - oy - (fr.top + fr.height / 2);
  const k = Math.max(0.22, sr.width / base);
  g.style.transform = `translate(-50%, -50%) translate(${Math.round(dx)}px, ${Math.round(dy)}px) scale(${k.toFixed(3)})`;
}

suites.forEach((s, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "domain-pill" + (i === 0 ? " is-on" : "");
  const pos = PILL_POS[i % PILL_POS.length];
  b.style.setProperty("--x", pos[0] + "%");
  b.style.setProperty("--y", pos[1] + "%");
  b.innerHTML = `<span class="pd" aria-hidden="true"></span><span class="pn">SIS</span>${s.label}`;
  b.setAttribute("aria-pressed", i === 0);
  b.addEventListener("click", () => {
    paintSuite(i, true);
    scrollToSuite(i);
  });
  pillBox.append(b);
});

/* Mockup tiap suite, disusun sekali sebagai rel kartu horizontal */
function panelMarkup(s) {
  return `
      <div class="dom-panel mock mock-search">
        <div class="mock-field">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>
          <span>${s.query}</span>
        </div>
        <ul class="mock-rows">
          ${s.rows
            .map(
              (r) =>
                `<li><span class="mock-thumb"></span><span class="mock-item">${r[0]}<i>· ${r[2]}</i></span></li>`,
            )
            .join("")}
        </ul>
        <div class="mock-foot">
          <span class="mock-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg></span>
          <span>${s.foot[0]}</span>
        </div>
      </div>
      <div class="dom-panel mock mock-chat">
        <div class="mock-stream">
          <p class="mock-bubble ask">${s.ask}</p>
          <p class="mock-bubble reply">${s.reply}</p>
        </div>
        <div class="mock-foot">
          <span class="mock-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"></path><circle cx="12" cy="12" r="3"></circle></svg></span>
          <span>${s.foot[1]}</span>
        </div>
      </div>
      <div class="dom-panel mock mock-mods">
        <p class="mock-label">Modul utama</p>
        <ul class="mock-checks">
          ${s.mods
            .map(
              (m) =>
                `<li><span class="mock-check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"></path></svg></span><span>${m}</span></li>`,
            )
            .join("")}
        </ul>
        <div class="mock-foot">
          <span class="mock-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"></path></svg></span>
          <span>Satu basis data ${s.label.toLowerCase()} untuk semua tim</span>
        </div>
      </div>`;
}

let trackReady = false;
function buildTrack() {
  if (!domPanels || trackReady) return;
  /* Satu rel kartu untuk tiap produk, hanya produk aktif yang ditampilkan */
  domPanels.innerHTML = suites
    .map(
      (s, i) =>
        `<div class="dom-track${i === 0 ? " is-on" : ""}" data-suite="${i}">` +
        panelMarkup(s) +
        "</div>",
    )
    .join("");
  [...domPanels.querySelectorAll(".dom-panel")].forEach((p, i) => {
    p.dataset.suite = String(Math.floor(i / 3));
  });
  trackReady = true;
}

let cardIndex = 0;

/* Tampilkan rel kartu milik produk aktif, mulai dari kartu pertama */
function scrollPanelsTo(i) {
  if (!domPanels) return;
  $$(".dom-track", domPanels).forEach((t, j) =>
    t.classList.toggle("is-on", j === i),
  );
  cardIndex = 0;
  domPanels.scrollLeft = 0;
}

/* Tarik kartu dengan mouse / jari untuk melihat semua kartu kiri-kanan */
let pDrag = false;
let pStartX = 0;
let pStartScroll = 0;
if (domPanels) {
  domPanels.addEventListener("pointerdown", (e) => {
    pDrag = true;
    pStartX = e.clientX;
    pStartScroll = domPanels.scrollLeft;
    domPanels.classList.add("is-dragging");
    if (domPanels.setPointerCapture) domPanels.setPointerCapture(e.pointerId);
  });
  domPanels.addEventListener("pointermove", (e) => {
    if (!pDrag) return;
    domPanels.scrollLeft = pStartScroll - (e.clientX - pStartX);
  });
  const endDrag = () => {
    pDrag = false;
    domPanels.classList.remove("is-dragging");
  };
  domPanels.addEventListener("pointerup", endDrag);
  domPanels.addEventListener("pointercancel", endDrag);
  domPanels.addEventListener("pointerleave", endDrag);

  const prevBtn = $(".dom-scroll-btn.prev");
  const nextBtn = $(".dom-scroll-btn.next");
  if (prevBtn)
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cardIndex = 0;
      domPanels.scrollTo({ left: 0, behavior: "auto" });
    });
  if (nextBtn)
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cardIndex = 1;
      const track = domPanels.querySelector(".dom-track.is-on");
      const card = track && track.querySelectorAll(".dom-panel")[1];
      domPanels.scrollTo({
        left: card ? card.offsetLeft - track.offsetLeft : 0,
        behavior: "auto",
      });
    });
}

function paintSuite(i, immediate) {
  if (i === activeSuite && suiteReady) return;
  const from = activeSuite;
  activeSuite = i;
  domShow.classList.toggle("is-prev", i < from);
  $$(".domain-pill", pillBox).forEach((b, j) => {
    b.classList.toggle("is-on", j === i);
    b.setAttribute("aria-pressed", j === i);
  });
  const s = suites[i];
  paintBg(i);
  const paint = () => {
    suiteReady = true;
    domTag.textContent = s.label;
    domCount.innerHTML = `${two(i + 1)} <i>/ ${two(suites.length)}</i>`;
    domName.textContent = s.name;
    domHead.textContent = s.head;
    domDesc.textContent = s.desc;
    domOutcome.textContent = s.out;
    [...domPanels.querySelectorAll(".dom-panel")].forEach((p) => {
      p.classList.toggle("is-on", p.dataset.suite === String(i));
    });
    scrollPanelsTo(i);
    domShow.classList.remove("is-out");
    domShow.classList.add("is-swap");
    requestAnimationFrame(() => {
      domShow.classList.remove("is-swap");
      requestAnimationFrame(() => {
        if (!domShow.classList.contains("is-out"))
          domShow.classList.add("is-in");
        layoutGlobe();
        setTimeout(layoutGlobe, 800);
      });
    });
  };
  clearTimeout(suiteTimer);
  if (immediate || reduce) {
    paint();
    return;
  }
  domShow.classList.add("is-out");
  domShow.classList.remove("is-in");
  /* Panggung memudar halus sebelum isi ditukar */
  suiteTimer = setTimeout(paint, 320);
}

/* Gulir ke posisi suite tertentu saat pil diklik */
function scrollToSuite(i) {
  if (!domSection || !domStage || innerWidth < 961) return;
  const total = domSection.offsetHeight - domStage.offsetHeight;
  const p = 0.12 + ((i + 0.5) / suites.length) * 0.88;
  scrollTo({
    top: domSection.offsetTop + total * p,
    behavior: reduce ? "auto" : "smooth",
  });
}

/* Scroll menggerakkan panggung: pembuka, lalu kartu tiap suite */
function domainsUpdate() {
  if (!domSection || !domStage || innerWidth < 961) return;
  const r = domSection.getBoundingClientRect();
  const total = domSection.offsetHeight - domStage.offsetHeight;
  const p = total > 0 ? clamp(-r.top / total) : 0;
  const intro = p < 0.1;
  domSection.classList.toggle("is-show", !intro);
  if (shownState !== !intro) {
    shownState = !intro;
    if (shownState) toneCard();
    else toneIntro();
    requestAnimationFrame(layoutGlobe);
  }
  if (intro) {
    toneIntro();
    paintBg(-1);
    domShow.classList.remove("is-in");
    return;
  }
  if (!domShow.classList.contains("is-in")) {
    requestAnimationFrame(() => domShow.classList.add("is-in"));
  }
  paintBg(activeSuite);
  const q = clamp((p - 0.1) / 0.9);
  const i = Math.min(suites.length - 1, Math.floor(q * suites.length));
  if (i !== activeSuite) paintSuite(i);
}

let domTick = false;
addEventListener(
  "scroll",
  () => {
    if (domTick) return;
    domTick = true;
    requestAnimationFrame(() => {
      domainsUpdate();
      domTick = false;
    });
  },
  { passive: true },
);
addEventListener(
  "resize",
  () => {
    domainsUpdate();
    layoutGlobe();
  },
  { passive: true },
);
buildTrack();
paintSuite(0, true);
domainsUpdate();

const domains = $("#produk");
new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
  { threshold: 0.2 },
).observe(domains);

/* HISIS: kartu bergantian + teks mengetik ------------------ */
const agentCards = $$(".agent-card");
const promptText = $(".prompt-text");
const prompts = [
  "Ringkas performa cabang minggu ini",
  "Ingatkan faktur yang jatuh tempo besok",
  "Bandingkan margin retail dan distribusi",
  "Buat rekap absensi untuk payroll",
];
let agentIndex = 0;
let agentTimer = 0;
let typeTimer = 0;

function typePrompt(text) {
  if (!promptText) return;
  clearInterval(typeTimer);
  if (reduce) {
    promptText.textContent = text;
    return;
  }
  promptText.textContent = "";
  let i = 0;
  typeTimer = setInterval(() => {
    promptText.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(typeTimer);
  }, 32);
}
function showAgent(i) {
  agentIndex = i;
  agentCards.forEach((c, j) => c.classList.toggle("is-on", j === i));
  typePrompt(prompts[i]);
}
agentCards.forEach((c, i) => {
  c.addEventListener("pointerenter", () => {
    clearInterval(agentTimer);
    agentTimer = 0;
    showAgent(i);
  });
});
const hisis = $("#hisis");
new IntersectionObserver(
  (entries) => {
    const on = entries[0].isIntersecting;
    if (on && !agentTimer && !reduce) {
      agentTimer = setInterval(() => {
        if (document.hidden || hisis.matches(":hover")) return;
        showAgent((agentIndex + 1) % agentCards.length);
      }, 3600);
    }
    if (!on && agentTimer) {
      clearInterval(agentTimer);
      agentTimer = 0;
    }
  },
  { threshold: 0.35 },
).observe(hisis);
typePrompt(prompts[0]);

/* Form -> WhatsApp ----------------------------------------- */
const form = $("#demoform");
if (form)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$(".f", form).forEach((f) => {
      const input = $("input,select", f);
      const v = input.value.trim();
      let good = !!v;
      if (input.name === "wa") good = v.replace(/\D/g, "").length >= 9;
      f.classList.toggle("bad", !good);
      if (!good) ok = false;
    });
    if (!ok) return $(".bad input,.bad select", form).focus();
    const d = Object.fromEntries(new FormData(form));
    const msg = `Halo Tim SISCOM, saya ingin menjadwalkan demo ERP 30 menit.\nNama: ${d.nama}\nPerusahaan: ${d.perusahaan}\nWhatsApp: ${d.wa}\nSektor: ${d.industri}`;
    $("#st").textContent =
      "Permintaan siap dikirim. Jika WhatsApp tidak terbuka, klik tombol Chat WhatsApp.";
    open(waUrl(msg), "_blank", "noopener");
  });

$("#year").textContent = new Date().getFullYear();

/* three.js: orb kubus (khas Kivo) -------------------------- */
function initOrbs() {
  const T = window.THREE;
  if (!T) return;

  function orb(canvas, opts = {}) {
    if (!canvas) return;
    const size = () => Math.max(120, canvas.clientWidth || 300);
    const renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(34, 1, 0.1, 50);
    cam.position.set(0, 0, 3.92);

    const hemi = new T.HemisphereLight(0xffffff, 0x8d8478, 0.85);
    scene.add(hemi);
    const key = new T.DirectionalLight(0xfff6ec, 1.2);
    key.position.set(3.6, 4.4, 5);
    scene.add(key);
    const warmLight = new T.PointLight(0x4a8eeb, 0.55, 16);
    warmLight.position.set(-3.2, -2.2, 3);
    scene.add(warmLight);
    const coolLight = new T.PointLight(0x4a8eeb, 0.6, 18);
    coolLight.position.set(2.8, 2.6, -3.6);
    scene.add(coolLight);

    /* Bola kubus: grid lintang/bujur supaya bentuknya bulat mulus.
       Tiap kubus menghadap keluar dan warnanya berubah dari krem
       ke gradasi hitam -> biru (#4a8eeb) dari bawah ke atas. */
    /* Sebaran Fibonacci: tiap kubus berjarak sama di seluruh permukaan,
       jadi siluet bolanya bulat penuh tanpa baris lintang yang menggelombang. */
    const rows = opts.rows || (innerWidth < 720 ? 20 : 26);
    const count = Math.round(rows * 86);
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - ((i + 0.5) / count) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * golden;
      pts.push(new T.Vector3(Math.cos(th) * ring, y, Math.sin(th) * ring));
    }

    const coreMat = new T.MeshStandardMaterial({
      color: 0xf1eade,
      roughness: 0.96,
      metalness: 0,
    });
    const core = new T.Mesh(new T.SphereGeometry(0.988, 64, 48), coreMat);

    const tile = Math.sqrt((4 * Math.PI) / count) * 1.06;
    const geo = new T.BoxGeometry(tile, tile, tile * 0.34);
    const mat = new T.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.62,
      metalness: 0.08,
    });
    const mesh = new T.InstancedMesh(geo, mat, count);
    const dummy = new T.Object3D();
    const zAxis = new T.Vector3(0, 0, 1);
    const roll = new T.Quaternion();
    let warmC = new T.Color(opts.warmTone ?? 0xf1e8da);
    let warmTop = new T.Color(opts.warmTop ?? 0xfbf6ec);
    const blackC = new T.Color(0x06070a);
    const blueC = new T.Color(0x4a8eeb);
    let coreWarm = new T.Color(opts.coreWarm ?? opts.warmTone ?? 0xf1eade);
    const coreDark = new T.Color(0x0c1220);
    const hemiWarm = new T.Color(0xffffff);
    const hemiCool = new T.Color(0xa8caf5);
    const keyWarm = new T.Color(0xfff6ec);
    const keyCool = new T.Color(0xcfdff7);
    const tmp = new T.Color();
    const baseWarm = [];
    const baseCold = [];
    for (let i = 0; i < count; i++) {
      const n = pts[i].clone().normalize();
      dummy.position.copy(n).multiplyScalar(1.002);
      dummy.quaternion.setFromUnitVectors(zAxis, n);
      roll.setFromAxisAngle(zAxis, (i * 2.399) % (Math.PI * 2));
      dummy.quaternion.multiply(roll);
      dummy.scale.setScalar(0.97 + ((i * 37) % 9) / 200);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const up = clamp(pts[i].y * 0.5 + 0.5);
      baseWarm.push(warmC.clone().lerp(warmTop, up * 0.8));
      baseCold.push(blackC.clone().lerp(blueC, smooth(up)));
    }

    let lastTint = -1;
    let currentK = 0;
    function tint(k) {
      k = clamp(k);
      if (Math.abs(k - lastTint) < 0.008) return;
      lastTint = k;
      currentK = k;
      for (let i = 0; i < count; i++) {
        tmp.copy(baseWarm[i]).lerp(baseCold[i], k);
        mesh.setColorAt(i, tmp);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      coreMat.color.copy(coreWarm).lerp(coreDark, k);
      // cahaya ditahan supaya gradasi biru tetap terlihat saat gelap
      hemi.intensity = 0.85 - k * 0.42;
      key.intensity = 1.2 - k * 0.62;
      warmLight.intensity = 0.5 - k * 0.42;
      coolLight.intensity = 0.6 + k * 1.05;
      hemi.color.copy(hemiWarm).lerp(hemiCool, k);
      key.color.copy(keyWarm).lerp(keyCool, k);
      renderer.toneMappingExposure = 1.04 - k * 0.06;
    }
    tint(0);

    let fixed = opts.fixedTint;
    const api = {
      setTint(k) {
        fixed = k;
        lastTint = -1;
        tint(k);
      },
      setTone(w, t, c) {
        warmC = new T.Color(w);
        warmTop = new T.Color(t);
        coreWarm = new T.Color(c);
        for (let i = 0; i < count; i++) {
          const up = clamp(pts[i].y * 0.5 + 0.5);
          baseWarm[i] = warmC.clone().lerp(warmTop, up * 0.8);
        }
        lastTint = -1;
        tint(currentK);
      },
    };

    const group = new T.Group();
    group.add(core, mesh);
    group.rotation.z = -0.06;
    scene.add(group);

    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth || size();
      h = canvas.clientHeight || size();
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let mx = 0;
    let my = 0;
    /* Bola bisa diputar dengan mouse / jari seperti di Kivo. */
    let held = false;
    let lastX = 0;
    let lastY = 0;
    let dragX = 0;
    let dragY = 0;
    let velX = 0;
    let velY = 0;
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("pointerdown", (e) => {
      held = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
      canvas.style.cursor = "grabbing";
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener(
      "pointermove",
      (e) => {
        const r = canvas.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - 0.5;
        my = (e.clientY - r.top) / r.height - 0.5;
        if (!held) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        dragX += dx * 0.008;
        dragY = Math.max(-0.75, Math.min(0.75, dragY + dy * 0.006));
        velX = dx * 0.008;
        velY = dy * 0.006;
      },
      { passive: true },
    );
    const release = () => {
      held = false;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("pointerleave", () => {
      mx = 0;
      my = 0;
      release();
    });

    let visible = true;
    new IntersectionObserver(
      (entries) => (visible = entries[0].isIntersecting),
      { rootMargin: "80px" },
    ).observe(canvas);

    const spin = opts.spin ?? 0.0035;
    const t0 = performance.now();
    let rotY = 0;
    let tx = 0;
    let ty = 0;
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const t = (now - t0) / 1000;
      tx += (-my * 0.45 - tx) * 0.05;
      ty += (mx * 0.6 - ty) * 0.05;
      if (!reduce) {
        if (fixed !== undefined) tint(fixed);
        if (held) {
          velX *= 0.5;
          velY *= 0.5;
        } else {
          dragX += velX;
          dragY = Math.max(-0.75, Math.min(0.75, dragY + velY));
          velX *= 0.94;
          velY *= 0.92;
          rotY += spin;
        }
        group.rotation.y = rotY + dragX + ty;
        group.rotation.x = dragY + Math.sin(t * 0.24) * 0.035 + tx;
        group.rotation.z = -0.06 + Math.sin(t * 0.18) * 0.025;
        group.position.y = Math.sin(t * 0.7) * 0.025;
        if (opts.tint !== false && fixed === undefined) tint(orbPhase(t));
      }
      renderer.render(scene, cam);
    };
    requestAnimationFrame(loop);
    return api;
  }

  orb($("#orbA"), { spin: 0.0034, rows: innerWidth < 720 ? 18 : 24 });
  orb($("#orbB"), { spin: 0.003, rows: innerWidth < 720 ? 20 : 26 });
  /* Bola section produk: satu bola yang pindah dari tengah ke dalam kartu */
  globeAPI = orb($("#globeC"), {
    spin: 0.0018,
    rows: innerWidth < 720 ? 20 : 26,
    fixedTint: 0,
    warmTone: 0xf3ece2,
    warmTop: 0xfdfaf5,
    coreWarm: 0xf3ece2,
  });
  globeTone = "intro";
  globeAPI.setTone(0x2a4a86, 0x6a9ad8, 0x0a1f44);
  globeAPI.setTint(0);
  if (typeof layoutGlobe === "function") layoutGlobe();
}

/* Ladang titik WebGL bergelombang — shader sama seperti kivoagentic.ai ---- */
function initField() {
  const canvas = $("#fieldC");
  if (!canvas) return;
  const T = window.THREE;
  if (!T) return;
  let renderer;
  try {
    renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch (err) {
    console.warn("Ladang titik WebGL tidak tersedia.", err);
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(38, 1, 0.1, 120);
  /* sedikit menunduk supaya ufuk naik dan titik mengisi seluruh section */
  cam.position.set(0, 5, 17);
  cam.lookAt(0, 0, -4);

  const vertexShader = `
    uniform float uTime;
    uniform float uSize;
    uniform float uScale;
    uniform float uReach;
    varying float vNear;
    float wave(vec2 p, float t) {
      float h = 0.35 * sin(p.x * 0.25 + t * 0.8)
              + 0.25 * sin(p.y * 0.35 + t * 0.6)
              + 0.15 * sin((p.x + p.y) * 0.5 + t * 1.1);
      return h * (1.0 + max(-p.y, 0.0) * 0.160);
    }
    void main() {
      vec3 p = position;
      p.y += wave(p.xz, uTime);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = max(uSize * uScale / -mv.z, 1.0);
      vNear = clamp(1.0 - (-mv.z - 6.0 - uReach) / 50.0, 0.0, 1.0);
    }
  `;
  const fragmentShader = `
    uniform vec3 uColor;
    uniform float uAlpha;
    varying float vNear;
    void main() {
      float r = length(gl_PointCoord - 0.5);
      if (r > 0.5) discard;
      gl_FragColor = vec4(uColor, smoothstep(0.5, 0.3, r) * uAlpha * (0.2 + 0.8 * vNear));
    }
  `;

  const pts = [];
  for (let x = -40; x <= 40; x += 0.55)
    for (let z = -60; z <= 12; z += 0.55) pts.push(x, 0, z);
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(pts, 3));

  const uniforms = {
    uTime: { value: 0 },
    uSize: { value: 0.075 },
    uScale: { value: 1 },
    uReach: { value: 0 },
    uColor: { value: new T.Color("rgb(" + FIELD_FX.dot + ")") },
    uAlpha: { value: 0.55 },
  };
  const mat = new T.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
  scene.add(new T.Points(geo, mat));

  let w = 0;
  let h = 0;
  let vis = true;
  let px = 0;
  let tx = 0;
  let lastDot = FIELD_FX.dot;
  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    uniforms.uScale.value =
      (h * renderer.getPixelRatio()) /
      (2 * Math.tan(T.MathUtils.degToRad(cam.fov / 2)));
  };
  resize();
  new ResizeObserver(resize).observe(canvas);
  canvas.parentElement.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
    },
    { passive: true },
  );
  new IntersectionObserver((entries) => (vis = entries[0].isIntersecting), {
    rootMargin: "120px",
  }).observe(canvas);

  const t0 = performance.now();
  const loop = (now) => {
    requestAnimationFrame(loop);
    if (!vis || document.hidden || !w) return;
    uniforms.uTime.value = reduce ? 0 : (now - t0) / 1000;
    if (FIELD_FX.dot !== lastDot) {
      lastDot = FIELD_FX.dot;
      uniforms.uColor.value.set("rgb(" + FIELD_FX.dot + ")");
    }
    /* parallax halus mengikuti kursor */
    tx += (-px * 1.8 - tx) * 0.03;
    cam.position.x = tx;
    cam.lookAt(0, 0, -4);
    renderer.render(scene, cam);
  };
  requestAnimationFrame(loop);
}

/* three.js: jaringan hero yang mengikuti kursor ------------ */
function initHero() {
  const canvas = $("#scene");
  const T = window.THREE;
  if (!canvas) return;
  if (!T) {
    return console.warn("three.js tidak termuat; hero memakai latar gradien.");
  }
  try {
    const mob = innerWidth < 700;
    const N = mob ? 58 : 130;
    const R = mob ? 5.2 : 6.2;
    const MAXD = mob ? 2.1 : 2.3;
    const renderer = new T.WebGLRenderer({
      canvas,
      antialias: !mob,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, mob ? 1.5 : 2));
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(55, 1, 0.1, 100);
    cam.position.z = 9;

    const pos = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      const u = Math.random() * 6.283;
      const w = Math.acos(2 * Math.random() - 1);
      const k = R * (0.45 + Math.random() * 0.55);
      pos.set(
        [
          k * Math.sin(w) * Math.cos(u),
          k * Math.cos(w) * 0.8,
          k * Math.sin(w) * Math.sin(u),
        ],
        i * 3,
      );
      vel.push([
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.004,
      ]);
    }
    const pGeo = new T.BufferGeometry();
    pGeo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const points = new T.Points(
      pGeo,
      new T.PointsMaterial({
        color: 0x4a8eeb,
        size: mob ? 0.07 : 0.075,
        transparent: true,
        opacity: 0.75,
      }),
    );
    const MAXL = N * 8;
    const linePos = new Float32Array(MAXL * 6);
    const lGeo = new T.BufferGeometry();
    lGeo.setAttribute("position", new T.BufferAttribute(linePos, 3));
    const lines = new T.LineSegments(
      lGeo,
      new T.LineBasicMaterial({
        color: 0x0a1f44,
        transparent: true,
        opacity: 0.14,
      }),
    );
    const group = new T.Group();
    group.add(points, lines);
    scene.add(group);

    let baseX = innerWidth >= 960 ? 2.4 : 0;
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      baseX = innerWidth >= 960 ? 2.4 : 0;
    };
    resize();
    addEventListener("resize", resize);

    let mx = 0;
    let my = 0;
    let px = 0;
    let py = 0;
    let spin = 0;
    addEventListener(
      "pointermove",
      (e) => {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
      },
      { passive: true },
    );

    let visible = true;
    new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(
      canvas,
    );

    const loop = () => {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (!reduce) {
        for (let i = 0; i < N; i++) {
          for (let a = 0; a < 3; a++) {
            pos[i * 3 + a] += vel[i][a];
            if (Math.abs(pos[i * 3 + a]) > R) vel[i][a] *= -1;
          }
        }
        pGeo.attributes.position.needsUpdate = true;
        spin += 0.0014;
        px += (mx * 1.6 - px) * 0.06;
        py += (my * 1.2 - py) * 0.06;
        group.rotation.x += (py * -0.6 - group.rotation.x) * 0.05;
        group.rotation.y += (spin + px * 0.9 - group.rotation.y) * 0.05;
        group.position.x += (baseX + px * 0.9 - group.position.x) * 0.06;
        group.position.y += (py * -0.7 - group.position.y) * 0.06;
      }
      let s = 0;
      for (let i = 0; i < N && s < MAXL; i++)
        for (let j = i + 1; j < N && s < MAXL; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < MAXD * MAXD) {
            linePos.set(
              [
                pos[i * 3],
                pos[i * 3 + 1],
                pos[i * 3 + 2],
                pos[j * 3],
                pos[j * 3 + 1],
                pos[j * 3 + 2],
              ],
              s * 6,
            );
            s++;
          }
        }
      lGeo.setDrawRange(0, s * 2);
      lGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, cam);
    };
    loop();
  } catch (err) {
    console.warn("Hero gagal dirender, memakai latar gradien.", err);
  }
}

/* Busur timeline dengan garis penggaris */
function drawHistArc() {
  const svg = $(".hist-arc-svg");
  if (!svg) return;
  const w = svg.clientWidth || (svg.parentElement && svg.parentElement.clientWidth);
  if (!w) return;
  const h = 210;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const arcY = (x) => 24 + Math.pow((x - w / 2) / (w * 0.42), 2) * 96;
  let d = "";
  for (let x = 0; x <= w; x += 8)
    d += (x ? ` L${x} ${arcY(x).toFixed(1)}` : `M0 ${arcY(0).toFixed(1)}`);
  const path = $(".hist-arc-line", svg);
  if (path) path.setAttribute("d", d);
  const ticks = $(".hist-arc-ticks", svg);
  if (ticks) {
    let html = "";
    for (let x = 0; x <= w; x += 12)
      html += `<line x1="${x}" y1="${arcY(x).toFixed(1)}" x2="${x}" y2="${(arcY(x) + 13).toFixed(1)}"/>`;
    ticks.innerHTML = html;
  }
  const dot = $(".hist-arc-dot", svg);
  if (dot) {
    dot.setAttribute("cx", String(w / 2));
    dot.setAttribute("cy", arcY(w / 2).toFixed(1));
  }
}

/* Timeline digeser kiri-kanan (drag / tombol), tidak ikut gulir halaman */
let histIndex = 0;
function historyStep() {
  const items = $$(".hist-item", $(".history-arc") || document);
  return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 296;
}
function historyUpdate() {
  const track = $(".history-arc");
  if (!track) return;
  const items = $$(".hist-item", track);
  const row = $(".hist-arc-row", track);
  if (!items.length || !row) return;
  const step = historyStep();
  row.style.transform = `translate3d(${(-histIndex * step).toFixed(1)}px,0,0)`;
  items.forEach((it, i) => {
    const diff = i - histIndex;
    const ad = Math.abs(diff);
    /* konten tetap lurus, hanya ukuran dan kecerahan yang berubah */
    const sc = ad === 0 ? 1.12 : ad === 1 ? 0.94 : 0.78;
    it.style.transform = `scale(${sc})`;
    it.style.opacity = ad > 3 ? "0.16" : ad > 2 ? "0.42" : "1";
    it.classList.toggle("is-active", ad === 0);
    it.classList.toggle("is-done", diff < 0);
  });
  const stepEl = $("#histStep");
  if (stepEl) stepEl.textContent = String(histIndex + 1).padStart(2, "0");
}
function setHistIndex(i) {
  const n = $$(".hist-item", $(".history-arc") || document).length;
  histIndex = Math.max(0, Math.min(n - 1, i));
  historyUpdate();
}

const histArc = $(".history-arc");
const histRow = histArc && $(".hist-arc-row", histArc);
let hDrag = false;
let hStartX = 0;
let hStartOffset = 0;
let hOffset = 0;
let hStep = 296;
if (histArc && histRow) {
  histArc.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".hist-arrow")) return;
    hDrag = true;
    hStartX = e.clientX;
    hStep = historyStep();
    hStartOffset = -histIndex * hStep;
    hOffset = hStartOffset;
    histRow.classList.add("is-dragging");
    if (histArc.setPointerCapture) histArc.setPointerCapture(e.pointerId);
  });
  histArc.addEventListener("pointermove", (e) => {
    if (!hDrag) return;
    hOffset = hStartOffset + (e.clientX - hStartX);
    histRow.style.transform = `translate3d(${hOffset.toFixed(1)}px,0,0)`;
  });
  const endDrag = () => {
    if (!hDrag) return;
    hDrag = false;
    histRow.classList.remove("is-dragging");
    setHistIndex(Math.round(-hOffset / hStep));
  };
  histArc.addEventListener("pointerup", endDrag);
  histArc.addEventListener("pointercancel", endDrag);
  histArc.addEventListener("pointerleave", endDrag);
  $$(".hist-arrow", histArc).forEach((btn) =>
    btn.addEventListener("click", () =>
      setHistIndex(histIndex + (btn.classList.contains("next") ? 1 : -1)),
    ),
  );
  histArc.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.preventDefault();
        setHistIndex(histIndex + Math.sign(e.deltaX || e.deltaY));
      }
    },
    { passive: false },
  );
}

addEventListener("resize", () => {
  drawHistArc();
  historyUpdate();
}, { passive: true });
if (document.fonts && document.fonts.ready)
  document.fonts.ready.then(() => {
    drawHistArc();
    historyUpdate();
  }).catch(() => {});

/* Dua baris marquee klien: atas ke kiri, bawah ke kanan */
const clientMarquee = $(".client-marquee");
if (clientMarquee) {
  clientMarquee.classList.add("row-left");
  const second = clientMarquee.cloneNode(true);
  second.classList.remove("row-left");
  second.classList.add("row-right");
  second.setAttribute("aria-hidden", "true");
  second.classList.remove("rv", "in");
  clientMarquee.after(second);
}

function boot() {
  initHero();
  initOrbs();
  initField();
  drawHistArc();
  historyUpdate();
}
if (document.readyState === "loading") {
  addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
