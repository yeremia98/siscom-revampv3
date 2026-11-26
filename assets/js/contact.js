/* =========================================================
   SISCOM — contact.js
   Skrip khusus halaman demo.html: header, menu, form, WhatsApp.
   ========================================================= */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const WA = "6281299817515"; // ISI: nomor WhatsApp sales resmi (format 628xxx)
const waUrl = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;

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
const navLinks = $$("a", nav);
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
navLinks.forEach((a) => a.addEventListener("pointerenter", () => moveInk(a)));
nav.addEventListener("pointerleave", () => moveInk(activeLink));

let ticking = false;
addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      head.classList.toggle("scrolled", scrollY > 20);
      $("#wa").classList.toggle("on", scrollY > innerHeight * 0.5);
      ticking = false;
    });
  },
  { passive: true },
);
addEventListener("resize", () => moveInk(activeLink));

/* Drawer ---------------------------------------------------- */
const drawer = $("#drawer");
function setDrawer(open) {
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", !open);
  $("#burger").setAttribute("aria-expanded", open);
  document.body.classList.toggle("lock", open);
}
$("#burger").addEventListener("click", () => setDrawer(true));
$("#close").addEventListener("click", () => setDrawer(false));
$$("a", drawer).forEach((a) =>
  a.addEventListener("click", () => setDrawer(false)),
);
addEventListener("keydown", (e) => e.key === "Escape" && setDrawer(false));

/* Reveal ---------------------------------------------------- */
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

/* Form -> WhatsApp ----------------------------------------- */
const form = $("#demoform");
if (form)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$(".f", form).forEach((f) => {
      const input = $("input,select,textarea", f);
      if (!input) return;
      let good = true;
      if (input.type === "checkbox")
        good = $$("input[name=produk]:checked", form).length > 0;
      else good = !!input.value.trim();
      if (input.type === "email")
        good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (input.type === "tel")
        good = input.value.replace(/\D/g, "").length >= 9;
      f.classList.toggle("bad", !good);
      if (!good) ok = false;
    });
    const verify = $("#ver");
    if (verify) {
      const row = verify.closest(".verify-row");
      if (row) row.classList.toggle("bad", !verify.checked);
      if (!verify.checked) ok = false;
    }
    if (!ok) {
      const bad = $(".bad input,.bad select,.bad textarea", form);
      if (bad) bad.focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const produk = $$("input[name=produk]:checked", form)
      .map((x) => x.value)
      .join(", ");
    const msg = `Halo Tim SISCOM, saya ingin menjadwalkan demo ERP.\nProduk: ${produk}\nTanggal: ${d.tanggal}\nJam: ${d.jam} WIB\nNama: ${d.nama}\nEmail: ${d.email}\nWhatsApp: ${d.wa}\nPerusahaan: ${d.perusahaan}\nJabatan: ${d.jabatan}\nCatatan: ${d.catatan || "-"}`;
    $("#st").textContent =
      "Permintaan siap dikirim. Jika WhatsApp tidak terbuka, klik tombol Chat WhatsApp.";
    open(waUrl(msg), "_blank", "noopener");
  });

$("#year").textContent = new Date().getFullYear();
