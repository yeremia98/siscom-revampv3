/* =========================================================
   SISCOM ERP — interaksi halaman produk (tanpa framework)
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* Menu mobile -------------------------------------------- */
  const drawer = $("#drawer");
  const burger = $("#burger");
  const closeBtn = $("#close");
  if (drawer && burger && closeBtn) {
    const setDrawer = (open) => {
      drawer.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", !open);
      burger.setAttribute("aria-expanded", open);
      document.body.classList.toggle("lock", open);
    };
    burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));
    closeBtn.addEventListener("click", () => setDrawer(false));
    $$("a", drawer).forEach((a) => a.addEventListener("click", () => setDrawer(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && setDrawer(false));
  }

  /* Dropdown produk ---------------------------------------- */
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

  /* Reveal -------------------------------------------------- */
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

  /* Header saat digulir ------------------------------------ */
  const head = $("#top");
  const waFloat = $("#wa");
  const onScroll = () => {
    if (head) head.classList.toggle("scrolled", scrollY > 20);
    if (waFloat) waFloat.classList.toggle("on", scrollY > innerHeight * 0.5);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Form demo -> WhatsApp ---------------------------------- */
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
      const msg = `Halo Tim SISCOM, saya ingin demo SIS Construction One.\nNama: ${d.nama}\nPerusahaan: ${d.perusahaan}\nWhatsApp: ${d.wa}\nSektor: ${d.industri}`;
      const st = $("#st");
      if (st) st.textContent = "Permintaan siap dikirim. Jika WhatsApp tidak terbuka, klik tombol Chat WhatsApp.";
      open(`https://wa.me/6281299817515?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    });

  /* Ladang titik di hero ----------------------------------- */
  const field = $("#pField");
  if (field) {
    const ctx = field.getContext("2d");
    let w = 0;
    let h = 0;
    let px = 0;
    let tx = 0;
    let vis = true;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = field.clientWidth;
      h = field.clientHeight;
      if (!w || !h) return;
      field.width = Math.round(w * dpr);
      field.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    new ResizeObserver(resize).observe(field);
    field.parentElement.addEventListener(
      "pointermove",
      (e) => {
        const r = field.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - 0.5;
      },
      { passive: true },
    );
    new IntersectionObserver((e) => (vis = e[0].isIntersecting), {
      rootMargin: "120px",
    }).observe(field);
    const t0 = performance.now();
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (!vis || document.hidden || !w) return;
      const t = (now - t0) / 1000;
      tx += (-px * 40 - tx) * 0.04;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2 + tx;
      const rows = 30;
      const cols = 150;
      for (let r = 0; r < rows; r++) {
        const q = r / (rows - 1);
        const y0 = h * 0.18 + h * 0.95 * Math.pow(q, 1.45);
        const spread = w * (0.1 + 1.05 * q);
        const amp = 4 + 38 * Math.sin(Math.PI * (0.1 + 0.85 * q));
        const rad = 0.45 + 1.1 * q;
        ctx.fillStyle = `rgba(116,124,136,${(0.1 + 0.38 * q).toFixed(3)})`;
        for (let i = 0; i < cols; i++) {
          const u = (i / (cols - 1)) * 2 - 1;
          const x = cx + u * spread * 0.5;
          if (x < -8 || x > w + 8) continue;
          const y =
            y0 +
            Math.sin(u * 3.4 + t * 0.6 + q * 2.4) * amp * 0.62 +
            Math.sin(u * 1.4 - t * 0.38 + q * 4) * amp * 0.5;
          if (y < -20 || y > h + 20) continue;
          ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
      }
    };
    requestAnimationFrame(draw);
  }

  /* Data modul --------------------------------------------- */
  const modules = [
    {
      title: "Manajemen Kontrak Proyek",
      desc: "Kelola berbagai kontrak proyek dalam satu platform terpusat, tanpa risiko duplikasi atau kehilangan dokumen.",
      points: [
        "Contract Creation and Registration",
        "Contract Value Control (Addendum & Deduction)",
        "Document and Archive Management",
        "Contract Status Monitoring",
      ],
    },
    {
      title: "Anggaran Proyek (RAB & RAP)",
      desc: "Pantau dan kendalikan anggaran proyek secara real-time melalui analisis RAB dan RAP serta monitoring material.",
      points: [
        "RAP — Execution Budget Planning",
        "RAB — Budget Planning",
        "Budget Realization & Monitoring",
        "Budget Change Control (Revision)",
      ],
    },
    {
      title: "Kurva-S & Progress Proyek",
      desc: "Pantau progress rencana dan aktual secara real-time lewat analisis S-Curve untuk kendali proyek yang optimal.",
      points: [
        "Time Schedule Planning",
        "Visualisasi Kurva S Otomatis",
        "Monitoring Progress Proyek",
        "Analisis Kerja dan Evaluasi Proyek",
      ],
    },
    {
      title: "Manajemen Subkontraktor",
      desc: "Satu sistem terintegrasi untuk memantau kontrak, progres, dan pembayaran subkontraktor secara efisien.",
      points: [
        "SPK Creation & Approval",
        "SPK sesuai RAP & Kontrak Proyek",
        "COP (Certificate of Payment) Subcon",
        "Kontrol Termin dan Retensi",
      ],
    },
    {
      title: "Opname & Pelaporan Progres",
      desc: "Efisiensi maksimal dalam pencatatan progres dan pelaporan, lengkap dengan dokumentasi historikal.",
      points: [
        "Opname Prestasi Subcon",
        "Opname Prestasi Owner",
        "Dokumentasi Historikal Progress",
        "Laporan Progres Real-Time",
      ],
    },
    {
      title: "Owner Management",
      desc: "Optimalkan pendapatan dan termin tagihan ke Owner dengan data yang transparan sesuai progres proyek.",
      points: [
        "Creation COP (Certificate of Payment) Owner",
        "Reminder Jaminan Pelaksanaan & Uang Muka",
        "Monitoring SPK Owner",
        "Tracking Piutang Semua Proyek",
      ],
    },
    {
      title: "Pengadaan & Inventory",
      desc: "Optimalkan pengadaan, inventaris, dan distribusi secara efisien sesuai budgeting proyek.",
      points: [
        "Vendor Comparison",
        "Purchase Requisition",
        "Material Usage",
        "Goods Receipt Note",
      ],
    },
    {
      title: "Asset Management",
      desc: "Kontrol dan lacak setiap pergerakan aset untuk memastikan akurasi dan akuntabilitas di lapangan.",
      points: [
        "Monitoring Permintaan Aset",
        "Analisis Efisiensi Penggunaan Aset",
        "Pencatatan Pinjam & Pengembalian",
        "Laporan Histori Aset",
      ],
    },
    {
      title: "Accounting & Finance",
      desc: "Dukung pengambilan keputusan strategis berbasis data keuangan yang akurat dan real-time.",
      points: [
        "Monitoring Anggaran & Realisasi Biaya",
        "Analisis Profitabilitas Proyek",
        "Invoicing Subcon dan Owner",
        "Payables & Receivables Payment",
      ],
    },
  ];

  const shortNames = [
    "Contract Management",
    "Budget Management",
    "S-Curve Management",
    "Subcon Management",
    "Progress Management",
    "Owner Management",
    "Procurement",
    "Asset Management",
    "Accounting",
  ];
  const icons = [
    '<path d="M6 3h9l3 3v15H6zM9 8h6M9 12h6M9 16h4"/>',
    '<path d="M5 19h14M7 16V9M12 16V5M17 16v-5"/>',
    '<path d="M3 18c4-9 8-9 11-4s5 3 7-2"/>',
    '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/>',
    '<path d="M3 17l5-5 4 3 8-9"/><path d="M15 6h5v5"/>',
    '<path d="M4 20h16M6 16h12M8 12h8"/>',
    '<path d="M3 7h12v10H3zM15 10h3l3 3v4h-6z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
    '<path d="M4 8h16v12H4zM8 8V5h8v3M4 13h16"/>',
    '<path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4"/>',
  ];

  const list = $("#pModList");
  const card = $("#pModCard");
  const screen = $("#pScreen");
  const segments = $("#pSegments");
  const count = $("#pCount");
  const playBtn = $("#pPlay");
  let currentSlide = 0;
  let playing = !reduce;
  let inView = true;
  let slideTimer = 0;
  let activeModule = 0;
  /* durasi tiap slide mengikuti panjang konten/aset yang ditampilkan */
  const slideTimes = [3400, 2800, 3200, 2600];

  /* Setelah slide terakhir selesai, lanjut ke modul berikutnya */
  function nextModule() {
    const btns = list ? $$(".p-mod-btn", list) : [];
    if (!btns.length) return;
    btns[(activeModule + 1) % btns.length].click();
  }
  function startSlides() {
    clearTimeout(slideTimer);
    if (!playing || !inView || reduce) return;
    slideTimer = setTimeout(() => {
      if (currentSlide >= 3) nextModule();
      else setSlide(currentSlide + 1);
    }, slideTimes[currentSlide]);
  }
  function setSlide(j) {
    currentSlide = j;
    if (screen) $$(".p-slide", screen).forEach((s, i) => s.classList.toggle("is-active", i === j));
    if (segments)
      $$("i", segments).forEach((s, i) => {
        s.style.setProperty("--dur", slideTimes[i] + "ms");
        s.classList.toggle("is-active", i === j);
        s.classList.toggle("is-done", i < j);
      });
    if (count) count.textContent = `${j + 1} / 4`;
    /* poin di kartu ikut berjalan bersama preview, lengkap dengan progress bar */
    $$("#pModPoints li").forEach((li, i) => {
      if (i === j) {
        li.style.setProperty("--dur", slideTimes[j] + "ms");
        li.classList.remove("is-active", "is-done");
        void li.offsetWidth;
        li.classList.add("is-active");
      } else {
        li.classList.remove("is-active");
        li.classList.toggle("is-done", i < j);
      }
    });
    startSlides();
  }
  function renderSlides(points) {
    if (!screen || !segments) return;
    screen.innerHTML = points
      .map(
        (p, j) => `
      <div class="p-slide${j === 0 ? " is-active" : ""}">
        <div class="p-thumb">
          <div class="p-thumb-top">
            <span class="p-thumb-logo">SIS</span>
            <div>
              <b>SISCOM ERP Kontraktor: Kendalikan Proyek, ${p}</b>
              <small>SIS-Commercial</small>
            </div>
          </div>
          <span class="p-bubble one">${p}</span>
          <span class="p-bubble two">Purchasing &amp; Procurement</span>
          <span class="p-yt">▶ YouTube</span>
          <button class="p-thumb-play" type="button" aria-label="Putar atau jeda">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </button>
        </div>
      </div>`,
      )
      .join("");
    segments.innerHTML = points
      .map((_, j) => `<i class="${j === 0 ? "is-active" : ""}" data-i="${j}"></i>`)
      .join("");
    $$("i", segments).forEach((s) =>
      s.addEventListener("click", () => {
        setSlide(+s.dataset.i);
        startSlides();
      }),
    );
    setSlide(0);
    startSlides();
  }

  const preview = $(".p-preview");
  if (playBtn)
    playBtn.addEventListener("click", () => {
      playing = !playing;
      playBtn.classList.toggle("is-paused", !playing);
      playBtn.innerHTML = playing
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
      playBtn.setAttribute("aria-label", playing ? "Jeda animasi" : "Putar animasi");
      if (preview) preview.classList.toggle("is-paused", !playing);
      if (card) card.classList.toggle("is-paused", !playing);
      startSlides();
    });

  /* Tombol suara dan zoom */
  const soundBtn = $("#pSound");
  if (soundBtn)
    soundBtn.addEventListener("click", () => {
      const muted = soundBtn.classList.toggle("is-muted");
      soundBtn.innerHTML = muted
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4ZM17 9l4 6M21 9l-4 6"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4ZM17 9a4 4 0 0 1 0 6"/></svg>';
      soundBtn.setAttribute("aria-label", muted ? "Aktifkan suara" : "Suara");
    });
  const zoomBtn = $("#pZoom");
  if (zoomBtn && preview)
    zoomBtn.addEventListener("click", () => {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        preview.classList.remove("is-zoomed");
        zoomBtn.setAttribute("aria-label", "Layar penuh");
        return;
      }
      if (preview.requestFullscreen) {
        preview.requestFullscreen().catch(() => preview.classList.add("is-zoomed"));
      } else {
        preview.classList.add("is-zoomed");
      }
      zoomBtn.setAttribute("aria-label", "Keluar layar penuh");
    });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && !preview.classList.contains("is-zoomed"))
      zoomBtn.setAttribute("aria-label", "Layar penuh");
  });

  /* Tombol putar pada thumbnail ikut mengontrol animasi */
  if (screen)
    screen.addEventListener("click", (e) => {
      if (!e.target.closest(".p-thumb-play") && !e.target.closest(".p-thumb-play svg")) return;
      if (playBtn) playBtn.click();
    });
  if (screen)
    new IntersectionObserver((e) => {
      inView = e[0].isIntersecting;
      startSlides();
    }, { threshold: 0.3 }).observe(screen);

  if (list && card) {
    modules.forEach((m, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "p-mod-btn" + (i === 0 ? " is-active" : "");
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[i]}</svg><span>${shortNames[i]}</span>`;
      b.addEventListener("click", () => {
        $$(".p-mod-btn", list).forEach((x) => x.classList.toggle("is-active", x === b));
        paintModule(i);
      });
      list.append(b);
    });

    function paintModule(i) {
      const m = modules[i];
      activeModule = i;
      const paint = () => {
        $("#pModNo").textContent = `Modul ${String(i + 1).padStart(2, "0")} dari 09 · ${shortNames[i]}`;
        $("#pModTitle").textContent = m.title;
        $("#pModDesc").textContent = m.desc;
        $("#pModPoints").innerHTML = m.points
          .map(
            (p, j) =>
              `<li class="${j === 0 ? "is-active" : ""}" data-i="${j}"><b>${j + 1}</b><span>${p}</span></li>`,
          )
          .join("");
        $$("#pModPoints li").forEach((li) =>
          li.addEventListener("click", () => {
            $$("#pModPoints li").forEach((x) => x.classList.toggle("is-active", x === li));
            setSlide(+li.dataset.i);
            startSlides();
          }),
        );
        renderSlides(m.points);
        card.classList.remove("is-switching");
      };
      card.classList.add("is-switching");
      setTimeout(paint, reduce ? 0 : 200);
    }
    paintModule(0);
  }

  /* Tab fitur ---------------------------------------------- */
  const tabs = $$(".p-tab");
  if (tabs.length) {
    tabs.forEach((tab) =>
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
        $$(".p-feature-panel").forEach((p) =>
          p.classList.toggle("is-active", p.id === tab.dataset.panel),
        );
      }),
    );
  }

  /* Tahun footer ------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* WhatsApp ----------------------------------------------- */
  const WA = "6281299817515";
  $$("[data-wa]").forEach((a) => {
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* Globe kubus WebGL — tekstur sama seperti di halaman utama */
  function initProductOrb() {
    const canvas = $("#pOrb");
    const T = window.THREE;
    if (!canvas || !T) return;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (err) {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
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
    const warm = new T.PointLight(0x4a8eeb, 0.55, 16);
    warm.position.set(-3.2, -2.2, 3);
    scene.add(warm);
    const cool = new T.PointLight(0x4a8eeb, 0.6, 18);
    cool.position.set(2.8, 2.6, -3.6);
    scene.add(cool);

    const rows = innerWidth < 720 ? 20 : 26;
    const count = Math.round(rows * 86);
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - ((i + 0.5) / count) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * golden;
      pts.push(new T.Vector3(Math.cos(th) * ring, y, Math.sin(th) * ring));
    }
    const coreMat = new T.MeshStandardMaterial({ color: 0xf1eade, roughness: 0.96, metalness: 0 });
    const core = new T.Mesh(new T.SphereGeometry(0.988, 64, 48), coreMat);
    const tile = Math.sqrt((4 * Math.PI) / count) * 1.06;
    const geo = new T.BoxGeometry(tile, tile, tile * 0.34);
    const mat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62, metalness: 0.08 });
    const mesh = new T.InstancedMesh(geo, mat, count);
    const dummy = new T.Object3D();
    const zAxis = new T.Vector3(0, 0, 1);
    const roll = new T.Quaternion();
    const tmp = new T.Color();
    const baseWarm = [];
    const baseCold = [];
    const warmC = new T.Color(0xf3ece2);
    const warmTop = new T.Color(0xfdfaf5);
    const blackC = new T.Color(0x06070a);
    const blueC = new T.Color(0x4a8eeb);
    const smooth = (v) => v * v * (3 - 2 * v);
    let lastTint = -1;
    function tint(k) {
      if (Math.abs(k - lastTint) < 0.008) return;
      lastTint = k;
      for (let i = 0; i < count; i++) {
        tmp.copy(baseWarm[i]).lerp(baseCold[i], k);
        mesh.setColorAt(i, tmp);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      coreMat.color.copy(warmC).lerp(new T.Color(0x0c1220), k);
      hemi.intensity = 0.85 - k * 0.42;
      key.intensity = 1.2 - k * 0.62;
      warm.intensity = 0.55 - k * 0.42;
      cool.intensity = 0.6 + k * 1.05;
    }
    function orbPhase(t) {
      const p = (t % 18) / 18;
      if (p < 0.12) return 0;
      if (p < 0.28) return smooth((p - 0.12) / 0.16);
      if (p < 0.55) return 1;
      if (p < 0.71) return 1 - smooth((p - 0.55) / 0.16);
      return 0;
    }
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
    tint(0);
    const group = new T.Group();
    group.add(core, mesh);
    group.rotation.z = -0.06;
    scene.add(group);

    /* Bola bisa diputar dengan mouse / jari */
    let held = false;
    let lastX = 0;
    let lastY = 0;
    let dragX = 0;
    let dragY = 0;
    let velX = 0;
    let velY = 0;
    let rotY = 0;
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("pointerdown", (e) => {
      held = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
      canvas.style.cursor = "grabbing";
      if (canvas.setPointerCapture)
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (err) {
          /* kursor sintetis tidak punya pointer aktif */
        }
    });
    canvas.addEventListener(
      "pointermove",
      (e) => {
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
    canvas.addEventListener("pointerleave", release);

    const resize = () => {
      const w = canvas.clientWidth || 260;
      const h = canvas.clientHeight || w;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    resize();
    new ResizeObserver(resize).observe(canvas);
    let vis = true;
    new IntersectionObserver((e) => (vis = e[0].isIntersecting)).observe(canvas);
    const t0 = performance.now();
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!vis || document.hidden) return;
      const t = (now - t0) / 1000;
      if (!reduce) {
        if (held) {
          velX *= 0.5;
          velY *= 0.5;
        } else {
          dragX += velX;
          dragY = Math.max(-0.75, Math.min(0.75, dragY + velY));
          velX *= 0.94;
          velY *= 0.92;
          rotY += 0.0035;
        }
        group.rotation.y = rotY + dragX;
        group.rotation.x = dragY + Math.sin(t * 0.24) * 0.035;
        group.rotation.z = -0.06 + Math.sin(t * 0.18) * 0.025;
        group.position.y = Math.sin(t * 0.7) * 0.025;
        tint(orbPhase(t));
      }
      renderer.render(scene, cam);
    };
    requestAnimationFrame(loop);
  }
  initProductOrb();
})();
