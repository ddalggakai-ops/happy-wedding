/* =========================================================
 * 모바일 청첩장 메인 스크립트
 * 섹션별 렌더링 + 인터랙션 (config.js 데이터 기반)
 * ========================================================= */

(() => {
  const C = WEDDING_CONFIG;
  const $ = (sel) => document.querySelector(sel);

  /* ---------- 유틸 ---------- */
  const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];
  const weddingDate = new Date(
    C.wedding.year, C.wedding.month - 1, C.wedding.day, C.wedding.hour, C.wedding.minute
  );

  function pad(n) { return String(n).padStart(2, "0"); }

  function formatKoreanDate() {
    const h = C.wedding.hour;
    const ampm = h < 12 ? "오전" : "오후";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const min = C.wedding.minute ? ` ${C.wedding.minute}분` : "";
    return `${C.wedding.year}년 ${C.wedding.month}월 ${C.wedding.day}일 ${DAY_KO[weddingDate.getDay()]}요일 ${ampm} ${h12}시${min}`;
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 2200);
  }

  async function copyText(text, doneMsg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(doneMsg);
    } catch (e) {
      // 클립보드 API 미지원 브라우저 대비
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast(doneMsg); }
      catch (e2) { toast("복사에 실패했습니다"); }
      document.body.removeChild(ta);
    }
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  }

  /* ═══════════ 1. 인트로 (풀블리드 커버) ═══════════ */
  const DAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function renderIntro() {
    const h = C.wedding.hour;
    const ampm = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    // 예: 2026. 11. 15. Sun. 11:00 AM
    $("#intro-date-en").textContent =
      `${C.wedding.year}. ${C.wedding.month}. ${C.wedding.day}. ` +
      `${DAY_EN[weddingDate.getDay()]}. ${h12}:${pad(C.wedding.minute)} ${ampm}`;
    $("#intro-groom").textContent = C.groom.name;
    $("#intro-bride").textContent = C.bride.name;
    $("#intro-venue-kr").textContent = `${C.venue.name} ${C.venue.hall}`;
    $("#footer-names").textContent = `${C.groom.name} ♥ ${C.bride.name}`;
  }

  /* ═══════════ 0. 인트로 스플래시 (베일 봉투) ═══════════ */
  function initSplash() {
    const el = document.getElementById("splash");
    if (!el) return;
    if (C.splash && C.splash.enabled === false) { el.remove(); return; }

    // 카드의 'Dear. ____ 님' 줄은 이미지에서 지웠고, 그 자리를 글자로 채웁니다.
    const guest = getGuestName();
    $("#splash-guest").innerHTML = guest
      ? `<span class="sg-en">Dear.</span><span class="sg-name">${escapeHtml(guest)}</span>`
        + `<span class="sg-suffix">님</span>`
      : `<span class="sg-line">소중한 분들을 초대합니다</span>`;

    document.body.classList.add("no-scroll");
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      el.classList.add("is-closed");
      document.body.classList.remove("no-scroll");
      setTimeout(() => el.remove(), 900);
    };
    el.addEventListener("click", close);   // 아무 곳이나 눌러도 열림
  }

  /* ═══════════ 1.5 커버 꽃잎 흩날리기 ═══════════ */
  function initPetals() {
    const stage = document.querySelector(".intro__stage");
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const COUNT = 10;   // 인앱 브라우저 부하를 고려해 개수 제한
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      const size = 8 + Math.random() * 11;              // 8~19px
      p.style.width = `${size.toFixed(1)}px`;
      p.style.height = `${(size * 0.85).toFixed(1)}px`;
      p.style.left = `${(Math.random() * 100).toFixed(1)}%`;
      p.style.opacity = (0.45 + Math.random() * 0.45).toFixed(2);
      p.style.setProperty("--fall", `${(8 + Math.random() * 8).toFixed(1)}s`);
      p.style.setProperty("--fall-delay", `${(-Math.random() * 16).toFixed(1)}s`);
      p.style.setProperty("--sway", `${(2.4 + Math.random() * 2.2).toFixed(1)}s`);
      p.style.setProperty("--sway-delay", `${(-Math.random() * 4).toFixed(1)}s`);
      stage.appendChild(p);
    }
  }

  /* ═══════════ 2. 인사말 · 가족 소개 ═══════════ */
  // URL로 받는 손님 이름:  ...?to=김철수  또는  ...#김철수
  // (GitHub Pages 같은 정적 호스팅은 /이름 형태의 경로를 지원하지 않아
  //  쿼리(?to=)와 해시(#) 두 가지를 지원합니다)
  function getGuestName() {
    try {
      const q = new URLSearchParams(location.search).get("to");
      if (q && q.trim()) return q.trim();
      const h = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
      if (h) return h;
    } catch (e) { /* 잘못된 인코딩은 무시 */ }
    return "";
  }

  function renderGreeting() {
    const guest = getGuestName();
    $("#greeting-title").textContent = guest ? `Dear. ${guest}` : C.greeting.title;
    if (C.greeting.image) {
      // 손글씨 이미지 편지 (파일이 없으면 자동으로 글 인사말로 대체)
      const img = document.createElement("img");
      img.className = "greeting__hand";
      img.src = C.greeting.image;
      img.alt = "손글씨 인사말";
      img.onerror = () => { $("#greeting-message").textContent = C.greeting.message; };
      const p = $("#greeting-message");
      p.innerHTML = "";
      p.appendChild(img);
    } else {
      $("#greeting-message").textContent = C.greeting.message;
    }

    $("#greeting-family").innerHTML = `
      <p class="family-row">
        <b>${C.bride.father}</b> · <b>${C.bride.mother}</b>
        <span class="family-rel">의 ${C.bride.order}</span><b>${C.bride.firstName}</b>
      </p>
      <p class="family-row">
        <b>${C.groom.father}</b> · <b>${C.groom.mother}</b>
        <span class="family-rel">의 ${C.groom.order}</span><b>${C.groom.firstName}</b>
      </p>`;
  }

  /* ═══════════ 3.5 부모님의 편지 ═══════════ */

  /* ── 아기 사진 옆 손그림 아이콘 (연필로 그려 스캔한 이미지) ── */
  const DOODLE_SPOTS = [
    { k: "flower",  cls: "d1", w: 42 },
    { k: "bike",    cls: "d2", w: 66 },
    { k: "star",    cls: "d3", w: 38 },
    { k: "balloon", cls: "d4", w: 32 },
    { k: "star",    cls: "d5", w: 22 },
    { k: "star",    cls: "d6", w: 16 },
    { k: "star",    cls: "d7", w: 26 },
  ];
  const DOODLE_SPOTS_ALT = [
    { k: "flower", cls: "d1", w: 40 },
    { k: "rattle", cls: "d2", w: 40 },
    { k: "star",   cls: "d3", w: 34 },
    { k: "cloud",  cls: "d4", w: 46 },
    { k: "star",   cls: "d5", w: 26 },
    { k: "star",   cls: "d6", w: 18 },
    { k: "star",   cls: "d7", w: 21 },
  ];
  function doodleHtml(alt) {
    return (alt ? DOODLE_SPOTS_ALT : DOODLE_SPOTS).map((d) =>
      `<img class="parents__doodle parents__doodle--${d.cls}" style="width:${d.w}px"`
      + ` src="assets/doodles/${d.k}.png" alt="" aria-hidden="true" loading="lazy" />`
    ).join("");
  }

  function renderParents() {
    const sec = document.getElementById("parents-section");
    if (!sec) return;
    const P = C.parents || {};
    const has = (s) => s && (s.family || s.letterImage || (s.babies && s.babies.length));
    if (!has(P.groom) && !has(P.bride)) { sec.hidden = true; return; }

    let idx = 0;
    const side = (s) => {
      if (!has(s)) return "";
      const babies = s.babies || [];
      const alt = (idx++) % 2 === 1;
      return `
      <div class="parents__side reveal">
        <p class="parents__label">${s.label || ""}</p>
        <p class="parents__who">${s.who || ""}</p>
        ${s.family ? `
        <div class="parents__photo">
          <img src="${s.family}" alt="${s.who} 가족 사진" loading="lazy" />
          ${babies[0] ? `<img class="parents__sticker parents__sticker--1" src="${babies[0]}" alt="${s.who} 어린 시절" loading="lazy" />` : ""}
          ${doodleHtml(alt)}
        </div>` : ""}
        ${(s.letterLines && s.letterLines.length) ? `
        <div class="parents__lines">
          ${s.letterLines.map((src, k) => `<img class="parents__line parents__line--${(k % 4) + 1}" src="${src}" alt="" loading="lazy" />`).join("")}
          ${babies[1] ? `<img class="parents__sticker parents__sticker--2" src="${babies[1]}" alt="${s.who} 어린 시절" loading="lazy" />` : ""}
        </div>`
        : s.letterImage ? `
        <div class="parents__letter">
          <img src="${s.letterImage}" alt="${s.who} 부모님의 편지" loading="lazy" />
          ${babies[1] ? `<img class="parents__sticker parents__sticker--2" src="${babies[1]}" alt="${s.who} 어린 시절" loading="lazy" />` : ""}
        </div>` : ""}
      </div>`;
    };
    // 표시 순서는 config.js의 parents 항목 순서를 그대로 따릅니다
    document.getElementById("parents-list").innerHTML =
      Object.values(P).map(side).join("");
  }

  /* ═══════════ 3. 러브레터 (손글씨 편지) ═══════════ */
  function renderLetters() {
    $("#letter-list").innerHTML = C.letters.map((l) => {
      const isGroom = l.from === "groom";
      const who = isGroom ? `신랑 ${C.groom.name}` : `신부 ${C.bride.name}`;

      if (l.image) {
        return `
          <div class="lt lt--scan reveal">
            <img src="${l.image}" alt="${who}의 손편지" loading="lazy" />
          </div>`;
      }

      // 신랑 머리말은 사진과 글 사이 오른쪽에, 신부 머리말은 사진 좌상단에
      const tag = l.tag
        ? `<span class="lt__tag lt__tag--${isGroom ? "br" : "tl"}">` + escapeHtml(l.tag) + "</span>"
        : "";
      const hand = `<p class="lt__hand">${escapeHtml(l.text).replace(/\n/g, "<br/>")}</p>`;
      // 머리말은 사진 안쪽에 (신랑=우하단 / 신부=좌상단)
      const frame = l.photo ? `
          <div class="lt__frame">
            <img class="lt__img" src="${l.photo}" alt="" loading="lazy" />
            <span class="lt__fade"></span>
            ${tag}
          </div>` : "";

      // 신랑 → 사진이 위, 아래로 흐려지며 그 아래에 손글씨
      // 신부 → 손글씨가 위, 사진 윗부분이 흐려지며 이어짐
      // 두 편지 모두 사진이 위, 아래로 흐려지며 그 자리에 손글씨가 앉습니다
      return `
        <div class="lt lt--${isGroom ? "groom" : "bride"} reveal">
          ${frame + hand}
        </div>`;
    }).join("");
  }
  /* ═══════════ 4. 갤러리 + 라이트박스 ═══════════ */
  let lightboxIndex = 0;

  function renderGallery() {
    const { images } = C.gallery;
    $("#gallery-grid").innerHTML = images.map((src, i) => `
      <a href="${src}" data-index="${i}">
        <img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy" />
      </a>`).join("");

    // 4줄(10장) 이상이면 3줄 반까지만 보여주고, 4번째 줄부터 그라데이션 + 펼침
    const wrap = $("#gallery-wrap");
    const rows = Math.ceil(images.length / 3);
    if (rows > 3.5) wrap.classList.add("is-collapsed");
    $("#gallery-more").addEventListener("click", () => {
      wrap.classList.remove("is-collapsed");
    });

    // 라이트박스 열기
    $("#gallery-grid").addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      e.preventDefault();
      openLightbox(Number(a.dataset.index));
    });

    // 핀치 줌 방지 (iOS 사파리는 viewport 설정만으로는 안 막힘)
    ["gesturestart", "gesturechange", "gestureend"].forEach((t) =>
      document.addEventListener(t, (e) => e.preventDefault(), { passive: false })
    );
    $("#lightbox-img").addEventListener("dblclick", (e) => e.preventDefault());

    $("#lightbox-close").addEventListener("click", closeLightbox);
    $("#lightbox-prev").addEventListener("click", () => moveLightbox(-1));
    $("#lightbox-next").addEventListener("click", () => moveLightbox(1));
    $("#lightbox").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeLightbox();
    });

    // 스와이프 지원
    let touchX = null;
    $("#lightbox").addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
    $("#lightbox").addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) moveLightbox(dx > 0 ? -1 : 1);
      touchX = null;
    }, { passive: true });

    document.addEventListener("keydown", (e) => {
      if ($("#lightbox").hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") moveLightbox(-1);
      if (e.key === "ArrowRight") moveLightbox(1);
    });
  }

  function openLightbox(i) {
    lightboxIndex = i;
    updateLightbox();
    $("#lightbox").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    $("#lightbox").hidden = true;
    document.body.style.overflow = "";
  }
  function moveLightbox(dir) {
    const n = C.gallery.images.length;
    lightboxIndex = (lightboxIndex + dir + n) % n;
    updateLightbox();
  }
  function updateLightbox() {
    $("#lightbox-img").src = C.gallery.images[lightboxIndex];
    $("#lightbox-counter").textContent = `${lightboxIndex + 1} / ${C.gallery.images.length}`;
  }

  /* ═══════════ 5. 달력 · D-day ═══════════ */
  function renderCalendar() {
    $("#calendar-title").textContent = formatKoreanDate();

    const names = `${C.groom.name} ♥ ${C.bride.name}`;
    const target = weddingDate.getTime();

    function tick() {
      const now = Date.now();
      let ms = target - now;

      if (ms <= 0) {
        // 예식 시각 이후
        const past = Math.abs(ms);
        const d = Math.floor(past / 86400000);
        $("#cd-d").textContent = d;
        $("#cd-h").textContent = Math.floor(past / 3600000) % 24;
        $("#cd-m").textContent = Math.floor(past / 60000) % 60;
        $("#cd-s").textContent = Math.floor(past / 1000) % 60;
        $("#cd-text").innerHTML = d === 0
          ? `오늘, ${names} 결혼합니다!`
          : `${names}의 결혼식이 <b>${d}일</b> 지났습니다.`;
        return;
      }

      $("#cd-d").textContent = Math.floor(ms / 86400000);
      $("#cd-h").textContent = Math.floor(ms / 3600000) % 24;
      $("#cd-m").textContent = Math.floor(ms / 60000) % 60;
      $("#cd-s").textContent = Math.floor(ms / 1000) % 60;

      // 남은 "일수"는 날짜 기준으로 계산 (0시 기준)
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const day0 = new Date(C.wedding.year, C.wedding.month - 1, C.wedding.day);
      const dayLeft = Math.round((day0 - today) / 86400000);
      $("#cd-text").innerHTML = `${names}의 결혼식이 <b>${dayLeft}일</b> 남았습니다.`;
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ═══════════ 6. 오시는 길 ═══════════ */
  function renderLocation() {
    const v = C.venue;
    $("#venue-name").textContent = `${v.name} ${v.hall}`;
    $("#venue-address").textContent = v.address;

    // 실제 지도: 네이버 Client ID가 있으면 네이버 지도, 없으면 구글 지도
    const naverKey = (C.map && C.map.naverClientId || "").trim();
    if (naverKey) {
      const box = document.querySelector(".location__map");
      box.innerHTML = '<div id="naver-map" style="width:100%;height:240px"></div>';
      const s = document.createElement("script");
      s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(naverKey)}`;
      s.onload = () => {
        const pos = new naver.maps.LatLng(v.lat, v.lng);
        const map = new naver.maps.Map("naver-map", {
          center: pos,
          zoom: 16,
          // 지도를 완전히 고정 (이동·확대 불가 — 자세히 보려면 아래 지도앱 버튼 이용)
          draggable: false,
          pinchZoom: false,
          scrollWheel: false,
          keyboardShortcuts: false,
          disableDoubleClickZoom: true,
          disableDoubleTapZoom: true,
          disableTwoFingerTapZoom: true,
          zoomControl: false,
        });
        const marker = new naver.maps.Marker({
          position: pos, map, title: "명동성당 파밀리아 채플",
        });
        // 핀 위에 "파밀리아 채플" 라벨 말풍선
        const iw = new naver.maps.InfoWindow({
          content: '<div style="padding:6px 12px;font-size:12.5px;font-weight:600;color:#333;">파밀리아 채플</div>',
          borderWidth: 1,
          borderColor: "#e5d7db",
          disableAnchor: false,
        });
        iw.open(map, marker);
      };
      s.onerror = () => {
        // 키 오류 등으로 네이버 지도를 못 불러오면 구글 지도로 대체
        box.innerHTML = '<iframe id="map-embed" title="예식장 지도" loading="lazy" style="display:block;width:100%;height:240px;border:0"></iframe>';
        $("#map-embed").src = `https://maps.google.com/maps?q=${v.lat},${v.lng}&z=16&hl=ko&output=embed`;
      };
      document.head.appendChild(s);
    } else {
      $("#map-embed").src =
        `https://maps.google.com/maps?q=${v.lat},${v.lng}&z=16&hl=ko&output=embed`;
    }

    const q = encodeURIComponent(v.name);
    // 지도 앱/웹 연동
    $("#map-naver").href = `https://map.naver.com/p/search/${q}`;
    $("#map-kakao").href = `https://map.kakao.com/link/map/${q},${v.lat},${v.lng}`;
    $("#map-tmap").href =
      `tmap://route?goalname=${q}&goaly=${v.lat}&goalx=${v.lng}`;
    $("#map-tmap").addEventListener("click", () => {
      // 티맵 미설치 시 안내
      setTimeout(() => toast("티맵 앱이 설치되어 있어야 합니다"), 1500);
    });

    const transit = [
      { icon: "🚇", label: "지하철", text: v.transit.subway },
      { icon: "🚌", label: "버스", text: v.transit.bus },
      { icon: "🅿️", label: "주차", text: v.transit.parking },
    ];
    $("#transit-list").innerHTML = transit.map((t) => `
      <div class="transit-item">
        <div class="transit-item__icon">${t.icon}</div>
        <div>
          <div class="transit-item__label">${t.label}</div>
          <div class="transit-item__text">${t.text}</div>
        </div>
      </div>`).join("");
  }

  /* ═══════════ 7. 마음 전하실 곳 ═══════════ */
  function renderAccounts() {
    const groups = [
      { title: "신랑측 마음 전하실 곳", rows: C.accounts.groomSide },
      { title: "신부측 마음 전하실 곳", rows: C.accounts.brideSide },
    ];
    const PHONE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02z"/></svg>`;
    const COPY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h9"/></svg>`;
    const PAY_SVG = `<svg viewBox="0 0 24 24" width="13" height="13"><path fill="#FEE500" d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.86 5.25 4.64 6.64-.2.75-.74 2.72-.85 3.14-.13.52.19.51.4.37.17-.11 2.62-1.78 3.68-2.5.68.1 1.39.15 2.13.15 5.52 0 10-3.54 10-7.9S17.52 3 12 3z"/></svg>`;

    $("#accounts-list").innerHTML = groups.map((g) => `
      <div class="acc-group">
        <button type="button" class="acc-group__head">${g.title}</button>
        <div class="acc-group__body">
          ${g.rows.map((r) => `
          <div class="acc-card">
            <div class="acc-card__top">
              <span class="acc-card__role">${r.relation}</span>
              <b class="acc-card__name">${r.holder}</b>
              ${r.phone ? `<a class="acc-card__tel" href="tel:${r.phone}" aria-label="${r.holder}에게 전화하기">${PHONE_SVG}</a>` : ""}
              ${r.kakaopay ? `<a class="acc-card__pay" href="${r.kakaopay}" target="_blank" rel="noopener">${PAY_SVG}pay</a>` : ""}
            </div>
            <button type="button" class="acc-card__num" data-copy="${r.bank} ${r.number}">
              <span>${r.bank} ${r.number}</span>
              ${COPY_SVG}
            </button>
          </div>`).join("")}
        </div>
      </div>`).join("");

    // 드롭다운 열고 닫기
    document.querySelectorAll(".acc-group__head").forEach((btn) =>
      btn.addEventListener("click", () => btn.parentElement.classList.toggle("is-open")));

    document.querySelectorAll(".acc-card__num").forEach((btn) =>
      btn.addEventListener("click", () =>
        copyText(btn.dataset.copy, "계좌번호가 복사되었습니다")));
  }

  /* ═══════════ 8. RSVP ═══════════ */
  /* Apps Script 전송 (참석 여부 → 구글 시트) */
  async function postScript(url, params) {
    try {
      const r = await fetch(url, { method: "POST", body: new URLSearchParams(params) });
      const text = await r.text();
      if (!r.ok) throw new Error(`서버 응답 ${r.status}`);
      try {
        const data = JSON.parse(text);
        if (data && data.ok === false) throw new Error(data.error || "스크립트 오류");
        return data;
      } catch (e) {
        if (e instanceof SyntaxError) throw new Error("스크립트가 오류 페이지를 반환했습니다");
        throw e;
      }
    } catch (e) {
      if (e instanceof TypeError) {
        await fetch(url, { method: "POST", mode: "no-cors", body: new URLSearchParams(params) });
        return { ok: true, unverified: true };
      }
      throw e;
    }
  }

  function initRsvp() {
    const modal = $("#rsvp-modal");
    const open = () => { if (modal) modal.hidden = false; };
    const close = () => { if (modal) modal.hidden = true; };
    if (modal) {
      $("#rsvp-x").addEventListener("click", close);
      modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
      // 이미 보냈으면 다시 띄우지 않습니다
      let sent = false;
      try { sent = localStorage.getItem("wedding-rsvp-sent") === "1"; } catch (e) {}
      const loc = document.querySelector(".location");
      if (!sent && loc) {
        // '오시는 길'을 완전히 지나쳐 스크롤하면 한 번만 띄웁니다
        const onScroll = () => {
          if (loc.getBoundingClientRect().bottom > 0) return;
          window.removeEventListener("scroll", onScroll);
          setTimeout(open, 350);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
      }
    }

    // 인원 스테퍼
    const countLabel = $("#rsvp-count-label");
    const countInput = $("#rsvp-count");
    const setCount = (n) => {
      n = Math.min(20, Math.max(1, n));
      countInput.value = String(n);
      countLabel.textContent = String(n);
      $("#rsvp-minus").disabled = n <= 1;
      $("#rsvp-plus").disabled = n >= 20;
    };
    if (countLabel) {
      $("#rsvp-minus").addEventListener("click", () => setCount(Number(countInput.value) - 1));
      $("#rsvp-plus").addEventListener("click", () => setCount(Number(countInput.value) + 1));
      setCount(1);
    }
    // 참석이 어려우면 인원·식사 질문은 감춥니다
    const onlyAttend = $("#rsvp-only-attend");
    document.querySelectorAll('input[name="rsvp-attend"]').forEach((r) =>
      r.addEventListener("change", () => {
        const going = document.querySelector('input[name="rsvp-attend"]:checked').value === "참석";
        if (onlyAttend) onlyAttend.hidden = !going;
      }));

    $("#rsvp-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#rsvp-name").value.trim();
      if (!name) return toast("성함을 입력해주세요");

      const entry = {
        side: document.querySelector('input[name="rsvp-side"]:checked').value,
        attend: document.querySelector('input[name="rsvp-attend"]:checked').value,
        meal: document.querySelector('input[name="rsvp-meal"]:checked').value,
        name,
        count: Number($("#rsvp-count").value) || 1,
        date: new Date().toISOString(),
      };
      const btn = $("#rsvp-form").querySelector('button[type="submit"]');
      btn.disabled = true;
      const prev = btn.textContent;
      btn.textContent = "보내는 중...";
      try {
        // 포토 빙고와 같은 Apps Script로 보내 구글 시트 '참석여부' 탭에 기록합니다
        const url = (C.snap && C.snap.appsScriptUrl || "").trim();
        if (url) {
          await postScript(url, {
            kind: "rsvp",
            guest: entry.name,
            side: entry.side,
            attend: entry.attend,
            meal: entry.attend === "참석" ? entry.meal : "",
            count: entry.attend === "참석" ? String(entry.count) : "0",
          });
        }
        await Storage.addRsvp(entry);          // 로컬 사본
        $("#rsvp-form").hidden = true;
        $("#rsvp-done").hidden = false;
        try { localStorage.setItem("wedding-rsvp-sent", "1"); } catch (err2) {}
        setTimeout(() => { if (modal) modal.hidden = true; }, 1800);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = prev;
        toast("전송에 실패했습니다. 잠시 후 다시 시도해주세요");
      }
    });
  }

  /* ═══════════ 9. 방명록 ═══════════ */
  async function renderGuestbook() {
    let entries = [];
    try { entries = await Storage.listGuestbook(); } catch (e) { /* 무시 */ }

    const list = $("#gb-list");
    if (!entries.length) {
      list.innerHTML = `<li class="gb-empty">아직 남겨진 메시지가 없습니다.<br/>첫 번째 축하 메시지를 남겨주세요!</li>`;
      return;
    }
    list.innerHTML = entries.map((en) => `
      <li class="gb-item" data-id="${en.id}">
        <div class="gb-item__head">
          <span class="gb-item__name">${escapeHtml(en.name)}</span>
          <span class="gb-item__date">${(en.date || "").slice(0, 10)}</span>
        </div>
        <p class="gb-item__msg">${escapeHtml(en.message)}</p>
        <button type="button" class="gb-item__del">삭제</button>
      </li>`).join("");

    list.querySelectorAll(".gb-item__del").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const id = btn.closest(".gb-item").dataset.id;
        const pw = prompt("작성 시 입력한 비밀번호를 입력해주세요");
        if (pw === null) return;
        const ok = await Storage.deleteGuestbook(id, pw);
        if (ok) { toast("삭제되었습니다"); renderGuestbook(); }
        else toast("비밀번호가 일치하지 않습니다");
      }));
  }

  /* ═══════════ 10. 공유하기 ═══════════ */
  function initShare() {
    const hasKakao = window.Kakao && C.kakao.jsKey;
    if (hasKakao && !Kakao.isInitialized()) Kakao.init(C.kakao.jsKey);

    // 네이티브 공유 시트 — 앱으로 넘어가지 않고 화면 하단에서 올라옴
    if (navigator.share) {
      const btn = $("#share-native");
      btn.hidden = false;
      btn.addEventListener("click", async () => {
        try {
          await navigator.share({
            title: C.kakao.shareTitle,
            text: C.kakao.shareDescription,
            url: location.href,
          });
        } catch (e) {
          // 사용자가 공유를 취소한 경우는 조용히 무시
        }
      });
    }

    const kakaoBtn = $("#share-kakao");
    if (kakaoBtn) kakaoBtn.addEventListener("click", () => {
      if (!hasKakao) {
        copyText(location.href, "카카오 키가 없어 링크를 복사했습니다");
        return;
      }
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: C.kakao.shareTitle,
          description: C.kakao.shareDescription,
          // 하위 경로 배포(예: github.io/저장소명)에서도 올바른 절대 URL이 되도록 처리
          imageUrl: C.kakao.shareImage ||
            new URL("assets/cover.jpg", location.href).href,
          link: { mobileWebUrl: location.href, webUrl: location.href },
        },
        buttons: [{
          title: "청첩장 보기",
          link: { mobileWebUrl: location.href, webUrl: location.href },
        }],
      });
    });

    $("#share-link").addEventListener("click", () =>
      copyText(location.href, "청첩장 주소가 복사되었습니다"));
  }

  /* ═══════════ BGM ═══════════ */
  function initBgm() {
    const audio = $("#bgm");
    const btn = $("#bgm-toggle");
    audio.src = C.bgm.src;

    // 파일이 없으면 버튼 숨김
    audio.addEventListener("error", () => btn.classList.add("is-unavailable"));

    btn.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
          btn.classList.add("is-playing");
        } catch (e) {
          toast("음악을 재생할 수 없습니다");
        }
      } else {
        audio.pause();
        btn.classList.remove("is-playing");
      }
    });

    if (C.bgm.autoplay) {
      // 자동재생 시도 (브라우저가 차단하면 무시됨)
      audio.play().then(() => btn.classList.add("is-playing")).catch(() => {});
      // 모바일은 소리 있는 자동재생을 차단하므로,
      // 첫 터치(스플래시의 "초대장 열기" 포함)에서 바로 재생 시작
      const kick = () => {
        if (!audio.paused) return cleanup();
        audio.play().then(() => { btn.classList.add("is-playing"); cleanup(); }).catch(() => {});
      };
      const cleanup = () => {
        ["pointerdown", "touchend", "click"].forEach((t) =>
          document.removeEventListener(t, kick, true));
      };
      ["pointerdown", "touchend", "click"].forEach((t) =>
        document.addEventListener(t, kick, true));
    }
  }

  /* ═══════════ 스크롤 등장 애니메이션 ═══════════ */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  /* ═══════════ 봉투에서 편지 꺼내기 (스크롤 연동 애니메이션) ═══════════ */
  function initEnvelopeScroll() {
    // 시작: 인사말 제목이 화면에 들어올 때 / 완료: 봉투가 화면 중앙쯤 올 때
    const sec = document.querySelector(".greeting");
    const img = document.querySelector(".envelope__img") || document.querySelector(".envelope");
    const letter = document.querySelector(".envelope__letter");
    if (!sec || !img || !letter) return;

    const HIDDEN = 76; // 편지가 봉투 속에 숨어 있을 때의 이동량(%)
    const REST = 19;   // 다 올라왔을 때 남는 이동량(%) — 편지가 3/4 정도만 나온 상태

    // 접근성: 모션 최소화 설정 시 애니메이션 없이 꺼내진 상태로 고정
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      letter.style.transform = `translate3d(0, ${REST}%, 0) rotate(var(--letter-tilt))`;
      return;
    }

    let ticking = false;
    function update() {
      ticking = false;
      const sr = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      // 섹션이 화면에서 멀면 아무 것도 안 함 (인앱 브라우저 스크롤 부하 절감)
      if (sr.bottom < -100 || sr.top > vh + 200) return;
      const ir = img.getBoundingClientRect();
      // 섹션 제목이 화면 하단(90%)에 들어오면 0 → 봉투가 화면 45% 지점에 오면 1
      const offset = ir.top - sr.top;               // 섹션 상단 ~ 봉투 사이 거리
      const startImgTop = vh * 0.9 + offset;        // 시작 시점의 봉투 위치
      const endImgTop = vh * 0.45;                  // 완료 시점의 봉투 위치
      let p = (startImgTop - ir.top) / Math.max(1, startImgTop - endImgTop);
      p = Math.max(0, Math.min(1, p));
      // 살짝 부드러운 가속 (ease-out)
      const eased = 1 - Math.pow(1 - p, 2);
      // translate3d: GPU 합성 강제 — 인앱 브라우저에서 스크롤 버벅임 완화
      letter.style.transform =
        `translate3d(0, ${(REST + (1 - eased) * (HIDDEN - REST)).toFixed(2)}%, 0) rotate(var(--letter-tilt))`;
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ═══════════ 9.5 포토 빙고 안내 (실제 참여는 bingo.html) ═══════════ */
  function renderBingoTeaser() {
    const sec = document.getElementById("snap-section");
    if (!sec) return;
    const url = (C.snap && C.snap.appsScriptUrl || "").trim();
    const B = C.bingo || {};
    const CELLS = (B.cells || []).slice(0, 9);
    if (!url || CELLS.length < 9) return;      // 연동 전에는 섹션 숨김 유지
    sec.hidden = false;

    $("#bingo-title").textContent = B.title || "포토 빙고";
    $("#bingo-desc").innerHTML = String(B.desc || "").replace(/\n/g, "<br/>");

    $("#bingo-preview").innerHTML = CELLS.map((c) => `
      <div class="bingo-cell">
        <span class="bingo-cell__inner">
          <span class="bingo-cell__icon">${escapeHtml(c.icon || "📷")}</span>
          <span class="bingo-cell__text">${escapeHtml(c.text)}</span>
        </span>
      </div>`).join("");

    // 손님 이름(?to=)을 빙고 페이지로 그대로 넘겨줍니다
    $("#bingo-go").href = "bingo.html" + location.search;
  }

  /* ═══════════ 초기화 ═══════════ */
  document.addEventListener("DOMContentLoaded", () => {
    document.title = `${C.groom.name} ♥ ${C.bride.name} 결혼합니다`;
    initSplash();
    renderIntro();
    renderGreeting();
    renderLetters();
    renderParents();
    renderGallery();
    renderCalendar();
    renderLocation();
    renderAccounts();
    initRsvp();
    initShare();
    initBgm();
    renderBingoTeaser();
    initReveal();   // 동적 요소 생성 후 마지막에 실행
    initEnvelopeScroll();
    initPetals();
  });
})();
