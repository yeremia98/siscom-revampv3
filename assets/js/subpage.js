/* =========================================================
   SISCOM ERP — interaksi faq.html & blog.html + latar demo
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* Header & menu ------------------------------------------ */
  const drawer = $("#drawer");
  const burger = $("#burger");
  const close = $("#close");
  if (drawer && burger && close) {
    const setDrawer = (open) => {
      drawer.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", !open);
      burger.setAttribute("aria-expanded", open);
      document.body.classList.toggle("lock", open);
    };
    burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));
    close.addEventListener("click", () => setDrawer(false));
    $$("a", drawer).forEach((a) => a.addEventListener("click", () => setDrawer(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && setDrawer(false));
  }
  /* Dropdown produk */
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
    dropBtn.addEventListener("pointerenter", () => {
      const ink = $(".nav-ink");
      if (ink) ink.style.opacity = "0";
    });
  }

  const head = $("#top");
  const wa = $("#wa");
  const onScroll = () => {
    if (head) head.classList.toggle("scrolled", scrollY > 20);
    if (wa) wa.classList.toggle("on", scrollY > innerHeight * 0.5);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }),
    { threshold: 0.12 },
  );
  $$(".rv").forEach((el) => (reduce ? el.classList.add("in") : io.observe(el)));

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
  $$("[data-wa]").forEach((a) => {
    a.href = `https://wa.me/6281299817515?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* Tabel artikel: beri label kolom untuk tampilan kartu di mobile */
  $$(".article-table").forEach((table) => {
    const heads = $$("thead th", table).map((h) => h.textContent.trim());
    $$("tbody tr", table).forEach((tr) =>
      $$("td", tr).forEach((td, i) => {
        td.dataset.label = heads[i] || "";
      }),
    );
  });

  /* Form komentar artikel ------------------------------- */
  const commentForm = $("#commentForm");
  if (commentForm) {
    const name = $("#cmName");
    const email = $("#cmEmail");
    const remember = $("#cmRemember");
    try {
      const saved = JSON.parse(localStorage.getItem("siscomComment") || "null");
      if (saved) {
        if (name) name.value = saved.nama || "";
        if (email) email.value = saved.email || "";
        if (remember) remember.checked = true;
      }
    } catch (err) {
      /* abaikan penyimpanan lokal yang rusak */
    }
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$(".f", commentForm).forEach((f) => {
        const input = $("input,textarea", f);
        if (!input) return;
        let good = !!input.value.trim();
        if (input.type === "email")
          good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        f.classList.toggle("bad", !good);
        if (!good) ok = false;
      });
      const answer = $("#cmAnswer");
      const verify = answer && answer.closest(".cm-verify");
      const answerOk = !!answer && answer.value.trim() === "16";
      if (verify) verify.classList.toggle("bad", !answerOk);
      if (!answerOk) ok = false;
      if (!ok) return;
      if (remember && remember.checked) {
        try {
          localStorage.setItem(
            "siscomComment",
            JSON.stringify({ nama: name.value.trim(), email: email.value.trim() }),
          );
        } catch (err) {
          /* abaikan */
        }
      } else {
        try {
          localStorage.removeItem("siscomComment");
        } catch (err) {
          /* abaikan */
        }
      }
      const status = $("#cmStatus");
      if (status) status.textContent = "Komentar Anda dikirim dan akan ditinjau admin terlebih dahulu.";
      $("#cmText").value = "";
      if (answer) answer.value = "";
    });
  }

  /* Ladang titik di hero faq/blog -------------------------- */
  const field = $("#pgField");
  if (field) {
    const ctx = field.getContext("2d");
    let w = 0, h = 0, px = 0, tx = 0, vis = true;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = field.clientWidth; h = field.clientHeight;
      if (!w || !h) return;
      field.width = Math.round(w * dpr); field.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    new ResizeObserver(resize).observe(field);
    field.parentElement.addEventListener("pointermove", (e) => {
      const r = field.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
    }, { passive: true });
    new IntersectionObserver((e) => (vis = e[0].isIntersecting)).observe(field);
    const t0 = performance.now();
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (!vis || document.hidden || !w) return;
      const t = (now - t0) / 1000;
      tx += (-px * 34 - tx) * 0.04;
      ctx.clearRect(0, 0, w, h);
      /* Di layar sempit titik diperjarang supaya tidak tampak seperti garis */
      const rows = w < 600 ? 20 : 26;
      const cols = Math.max(48, Math.min(150, Math.round(w / 6)));
      for (let r = 0; r < rows; r++) {
        const q = r / (rows - 1);
        const y0 = h * 0.24 + h * 0.8 * Math.pow(q, 1.4);
        const spread = w * (0.12 + q);
        const amp = 3 + 28 * Math.sin(Math.PI * (0.1 + 0.85 * q));
        ctx.fillStyle = `rgba(116,124,136,${(0.1 + 0.3 * q).toFixed(3)})`;
        for (let i = 0; i < cols; i++) {
          const u = (i / (cols - 1)) * 2 - 1;
          const x = w / 2 + tx + u * spread * 0.5;
          if (x < -8 || x > w + 8) continue;
          const y = y0 + Math.sin(u * 3.4 + t * 0.6 + q * 2.4) * amp * 0.62
            + Math.sin(u * 1.4 - t * 0.38 + q * 4) * amp * 0.5;
          if (y < -20 || y > h + 20) continue;
          const rad = 0.45 + 0.9 * q;
          ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
      }
    };
    requestAnimationFrame(draw);
  }

  /* FAQ: pencarian + filter kategori ----------------------- */
  const faqSearch = $("#faqSearch");
  const faqCount = $("#faqCount");
  const faqEmpty = $("#faqEmpty");
  const faqItems = $$(".faq-item");
  let faqCat = "Semua";
  function filterFaq() {
    const q = (faqSearch && faqSearch.value.trim().toLowerCase()) || "";
    let shown = 0;
    faqItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const cat = item.dataset.cat || "";
      const ok = (!q || text.includes(q)) && (faqCat === "Semua" || cat === faqCat);
      item.hidden = !ok;
      if (ok) shown++;
    });
    if (faqCount) faqCount.textContent = `${shown} pertanyaan`;
    if (faqEmpty) faqEmpty.hidden = shown !== 0;
  }
  if (faqSearch) faqSearch.addEventListener("input", filterFaq);
  $$(".pg-cat").forEach((btn) =>
    btn.addEventListener("click", () => {
      faqCat = btn.dataset.cat;
      $$(".pg-cat").forEach((b) => b.classList.toggle("is-active", b === btn));
      filterFaq();
    }),
  );
  if (faqItems.length) filterFaq();

  /* Blog: pencarian + filter topik ------------------------- */
  const blogSearch = $("#blogSearch");
  const blogCards = $$(".blog-card, .blog-feature");
  function filterBlog() {
    const q = (blogSearch && blogSearch.value.trim().toLowerCase()) || "";
    blogCards.forEach((card) => {
      card.hidden = !!q && !card.textContent.toLowerCase().includes(q);
    });
  }
  if (blogSearch) blogSearch.addEventListener("input", filterBlog);

  /* Garis kontur bergerak di hero demo (ala Kivo contact) -- */
  $$(".demo-lines").forEach((lines) => {
    const host = lines.parentElement;
    const light = host.classList.contains("contact-hero");
    const ctx = lines.getContext("2d");
    let w = 0, h = 0, vis = true;
    const resize = () => {
      w = host.clientWidth; h = host.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      lines.width = Math.round(w * dpr); lines.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    new ResizeObserver(resize).observe(host);
    new IntersectionObserver((e) => (vis = e[0].isIntersecting), { rootMargin: "120px" }).observe(lines);
    const N = 32;
    const draw = (time) => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < N; i++) {
        const base = ((i + 0.4) / N) * h;
        const a1 = 9 + 7 * Math.sin(i * 0.37 + 1.1);
        const a2 = 15 + 10 * Math.cos(i * 0.23);
        const alpha =
          (0.05 + 0.1 * Math.pow(Math.sin(i * 0.5 + 0.7), 2)) * (light ? 2.2 : 1);
        ctx.beginPath();
        for (let x = -10; x <= w + 10; x += 7) {
          const u = x / w;
          const y = base
            + Math.sin(u * 4.4 - time * 0.55 + i * 0.34) * a1
            + Math.sin(u * 1.8 + time * 0.32 - i * 0.17) * a2;
          if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${light ? "22,48,92" : "160,200,255"},${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };
    const t0 = performance.now();
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!vis || document.hidden) return;
      draw((now - t0) / 1000);
    };
    if (reduce) draw(0); else requestAnimationFrame(loop);
  });
})();
