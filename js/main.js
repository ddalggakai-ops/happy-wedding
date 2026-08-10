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

    const guest = getGuestName();
    $("#splash-guest").textContent = guest ? `Dear. ${guest}` : "소중한 분을 초대합니다";
    $("#splash-names").textContent =
      `${C.groom.name} ${C.bride.name}의 결혼식에 초대합니다.`;
    $("#splash-date").textContent =
      `${C.wedding.year}. ${pad(C.wedding.month)}. ${pad(C.wedding.day)}`;

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

  /* ---------- 연락하기 모달 ---------- */
  function renderContacts() {
    const rows = [
      { role: "신랑", name: C.groom.name, phone: C.groom.phone },
      { role: "신부", name: C.bride.name, phone: C.bride.phone },
    ];
    $("#contact-list").innerHTML = rows.map((r) => `
      <div class="contact-row">
        <div>
          <div class="contact-row__role">${r.role}</div>
          <div>${r.name}</div>
        </div>
        <div class="contact-row__links">
          <a href="tel:${r.phone}" aria-label="${r.role}에게 전화">📞</a>
          <a href="sms:${r.phone}" aria-label="${r.role}에게 문자">✉️</a>
        </div>
      </div>`).join("");

    $("#contact-open").addEventListener("click", () => ($("#contact-modal").hidden = false));
    $("#contact-close").addEventListener("click", () => ($("#contact-modal").hidden = true));
    $("#contact-modal").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) e.currentTarget.hidden = true;
    });
  }

  /* ═══════════ 3.5 부모님의 편지 ═══════════ */
  function renderParents() {
    const sec = document.getElementById("parents-section");
    if (!sec) return;
    const P = C.parents || {};
    const has = (s) => s && (s.family || s.letterImage || (s.babies && s.babies.length));
    if (!has(P.groom) && !has(P.bride)) { sec.hidden = true; return; }

    const side = (s) => {
      if (!has(s)) return "";
      const babies = s.babies || [];
      return `
      <div class="parents__side reveal">
        <p class="parents__label">${s.label || ""}</p>
        <p class="parents__who">${s.who || ""}</p>
        ${s.family ? `
        <div class="parents__photo">
          <img src="${s.family}" alt="${s.who} 가족 사진" loading="lazy" />
          ${babies[0] ? `<img class="parents__sticker parents__sticker--1" src="${babies[0]}" alt="${s.who} 어린 시절" loading="lazy" />` : ""}
          ${babies[1] ? `<img class="parents__sticker parents__sticker--2" src="${babies[1]}" alt="${s.who} 어린 시절" loading="lazy" />` : ""}
        </div>` : ""}
        ${s.letterImage ? `
        <div class="parents__letter">
          <img src="${s.letterImage}" alt="${s.who} 부모님의 편지" loading="lazy" />
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
      const dear = isGroom ? `To. 나의 신부에게` : `To. 나의 신랑에게`;

      // 스캔한 손편지 이미지가 있으면 이미지로 표시 (원본 샘플 방식)
      if (l.image) {
        return `
          <div class="letter-card letter-card--image reveal">
            <img src="${l.image}" alt="${who}의 손편지" loading="lazy" />
          </div>`;
      }
      // 없으면 손글씨 폰트로 편지지에 표시
      return `
        <div class="letter-card reveal">
          <div class="letter-card__to">${dear}</div>
          <div class="letter-card__text">${escapeHtml(l.text)}</div>
          <div class="letter-card__from">- ${who} 올림 -</div>
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

    $("#copy-address").addEventListener("click", () =>
      copyText(v.address, "주소가 복사되었습니다"));

    const transit = [
      { icon: "🚇", label: "지하철", text: v.transit.subway },
      { icon: "🚌", label: "버스", text: v.transit.bus },
      { icon: "🚗", label: "주차", text: v.transit.parking },
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
  function initRsvp() {
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
      try {
        await Storage.addRsvp(entry);
        $("#rsvp-form").hidden = true;
        $("#rsvp-done").hidden = false;
      } catch (err) {
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

  function initGuestbook() {
    $("#gb-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const entry = {
        id: `gb_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
        name: $("#gb-name").value.trim(),
        password: $("#gb-pass").value,
        message: $("#gb-message").value.trim(),
        date: new Date().toISOString(),
      };
      if (!entry.name || !entry.message) return toast("이름과 메시지를 입력해주세요");
      try {
        await Storage.addGuestbook(entry);
        $("#gb-form").reset();
        toast("소중한 메시지가 등록되었습니다");
        renderGuestbook();
      } catch (err) {
        toast("등록에 실패했습니다. 잠시 후 다시 시도해주세요");
      }
    });
    renderGuestbook();
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

  /* ═══════════ 9.5 게스트 스냅 · 포토 빙고 (→ 구글 드라이브/시트) ═══════════ */

  // 3×3 빙고 라인 (가로 3 · 세로 3 · 대각선 2)
  const BINGO_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  /* 사진을 브라우저에서 미리 줄여 업로드 (원본 그대로 보내면 너무 느립니다) */
  function loadBitmap(file) {
    if (window.createImageBitmap) {
      try {
        return createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => loadImgEl(file));
      } catch (e) { /* 옵션 미지원 → 아래로 */ }
    }
    return loadImgEl(file);
  }
  function loadImgEl(file) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });
  }
  async function shrink(file, max, quality) {
    const src = await loadBitmap(file);
    let w = src.width, h = src.height;
    const scale = Math.min(1, max / Math.max(w, h));
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    cv.getContext("2d").drawImage(src, 0, 0, w, h);
    if (src.close) src.close();
    const blob = await new Promise((res) => cv.toBlob(res, "image/jpeg", quality));
    return blob || file;
  }
  function toBase64(blob) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(",")[1]);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  }
  /* 업로드 설정 — 여기 숫자만 바꾸면 화질/속도 조절이 됩니다 */
  const UP = {
    maxPx: 1280,        // 긴 변 최대 픽셀
    quality: 0.72,      // JPEG 품질
    parallel: 4,        // 동시에 올리는 장수
    maxFiles: 100,      // 자유 업로드 최대 장수
  };

  /* Apps Script 전송 — 응답을 실제로 확인해서 실패를 실패로 알립니다.
     (CORS가 막히는 환경에서만 no-cors로 재시도하고, 그 건은 '확인 불가'로 셉니다) */
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
      // fetch 자체가 막힌 경우(CORS 등)에만 no-cors로 한 번 더
      if (e instanceof TypeError) {
        await fetch(url, { method: "POST", mode: "no-cors", body: new URLSearchParams(params) });
        return { ok: true, unverified: true };
      }
      throw e;
    }
  }

  /* 여러 건을 동시에(최대 limit개) 처리 — 하나씩 올리면 너무 느립니다 */
  async function runPool(items, limit, fn) {
    const out = new Array(items.length);
    let next = 0;
    const worker = async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        try { out[i] = { ok: true, value: await fn(items[i], i) }; }
        catch (e) { out[i] = { ok: false, error: e }; }
      }
    };
    const n = Math.min(limit, items.length);
    await Promise.all(Array.from({ length: n }, worker));
    return out;
  }

  /* ── 완성한 빙고판을 한 장의 콜라주 이미지로 그립니다 ── */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function fitLines(ctx, text, maxW, maxLines) {
    const words = String(text).split(" ");
    const lines = [];
    let cur = "";
    for (let i = 0; i < words.length; i++) {
      const t = cur ? cur + " " + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = words[i]; }
      else cur = t;
      if (lines.length === maxLines - 1 && ctx.measureText(cur).width > maxW) break;
    }
    if (cur) lines.push(cur);
    return lines.slice(0, maxLines);
  }

  async function buildCollage(shots, CELLS, guest, lines) {
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { /* 무시 */ }

    const S = 380, GAP = 14, PAD = 44, HEAD = 248, FOOT = 108;
    const W = PAD * 2 + S * 3 + GAP * 2;
    const H = HEAD + S * 3 + GAP * 2 + FOOT;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const x = cv.getContext("2d");

    const KR = '"Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif';
    const EN = '"Cormorant Garamond", serif';
    const PINK = "#fa89a3";

    x.fillStyle = "#141011";
    x.fillRect(0, 0, W, H);

    // 상단 타이틀
    x.textAlign = "center";
    x.fillStyle = PINK;
    x.font = `400 30px ${EN}`;
    x.fillText("P H O T O   B I N G O", W / 2, 96);
    x.fillStyle = "#f6f1f2";
    x.font = `600 62px ${KR}`;
    x.fillText(`${C.groom.name}  ♥  ${C.bride.name}`, W / 2, 168);
    x.fillStyle = "#9d8f93";
    x.font = `400 27px ${KR}`;
    x.fillText(
      `${C.wedding.year}. ${pad(C.wedding.month)}. ${pad(C.wedding.day)}   ·   ${C.venue.name} ${C.venue.hall}`,
      W / 2, 212
    );

    const lit = {};
    lines.forEach((l) => l.forEach((i) => { lit[i] = true; }));

    for (let i = 0; i < 9; i++) {
      const cx = PAD + (i % 3) * (S + GAP);
      const cy = HEAD + Math.floor(i / 3) * (S + GAP);
      x.save();
      roundRect(x, cx, cy, S, S, 22);
      x.clip();

      if (shots[i]) {
        const img = await new Promise((res, rej) => {
          const im = new Image();
          im.onload = () => res(im); im.onerror = rej;
          im.src = shots[i].url;
        });
        const sc = Math.max(S / img.width, S / img.height);
        const dw = img.width * sc, dh = img.height * sc;
        x.drawImage(img, cx + (S - dw) / 2, cy + (S - dh) / 2, dw, dh);
        const g = x.createLinearGradient(0, cy + S * 0.5, 0, cy + S);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,.78)");
        x.fillStyle = g;
        x.fillRect(cx, cy + S * 0.5, S, S * 0.5);
        x.fillStyle = "#ffffff";
      } else {
        x.fillStyle = "#1f1a1c";
        x.fillRect(cx, cy, S, S);
        x.fillStyle = "#6b5f63";
      }

      x.font = `500 26px ${KR}`;
      x.textAlign = "center";
      const tx = cx + S / 2;
      if (shots[i]) {
        const ls = fitLines(x, CELLS[i].text, S - 40, 2);
        ls.forEach((t, k) => x.fillText(t, tx, cy + S - 32 - (ls.length - 1 - k) * 32));
      } else {
        const ls = fitLines(x, CELLS[i].text, S - 60, 3);
        ls.forEach((t, k) => x.fillText(t, tx, cy + S / 2 + 10 + (k - (ls.length - 1) / 2) * 34));
      }
      x.restore();

      // 완성된 줄에 포함된 칸은 핑크 테두리
      if (lit[i]) {
        x.strokeStyle = PINK;
        x.lineWidth = 5;
        roundRect(x, cx + 2.5, cy + 2.5, S - 5, S - 5, 22);
        x.stroke();
      }
    }

    // 하단
    const by = H - FOOT + 60;
    x.textAlign = "center";
    x.fillStyle = "#f6f1f2";
    x.font = `500 32px ${KR}`;
    x.fillText(`${guest}님의 ${lines.length}빙고`, W / 2, by);
    x.fillStyle = PINK;
    x.font = `400 26px ${KR}`;
    x.fillText("함께해 주셔서 고맙습니다 ♥", W / 2, by + 40);

    return await new Promise((res) => cv.toBlob(res, "image/jpeg", 0.9));
  }

  function initBingo() {
    const url = (C.snap && C.snap.appsScriptUrl || "").trim();
    if (!url) return;                       // URL이 없으면 섹션 숨김 유지
    $("#snap-section").hidden = false;

    const B = C.bingo || {};
    const CELLS = (B.cells || []).slice(0, 9);
    if (CELLS.length < 9) return;

    $("#bingo-title").textContent = B.title || "포토 빙고";
    $("#bingo-desc").innerHTML = String(B.desc || "").replace(/\n/g, "<br/>");
    $("#bingo-note").innerHTML =
      "사진은 신랑·신부의 구글 드라이브에만 저장되며, 연락처는 경품 안내 외에는 사용하지 않습니다."
      + (B.prize ? "<br/>" + B.prize : "");

    const grid = $("#bingo-grid");
    const status = $("#bingo-status");
    const form = $("#bingo-form");
    const btn = $("#bingo-submit");
    const done = $("#bingo-done");
    const cellInput = $("#bingo-input");
    const shots = new Array(9).fill(null);   // { blob, url }
    let pending = -1;
    let busy = false;

    /* --- 판 그리기 --- */
    grid.innerHTML = CELLS.map((c, i) => `
      <button type="button" class="bingo-cell" data-i="${i}" aria-label="${escapeHtml(c.text)}">
        <img class="bingo-cell__img" alt="" />
        <span class="bingo-cell__check">✓</span>
        <span class="bingo-cell__inner">
          <span class="bingo-cell__icon">${escapeHtml(c.icon || "📷")}</span>
          <span class="bingo-cell__text">${escapeHtml(c.text)}</span>
        </span>
      </button>`).join("");
    const cells = Array.prototype.slice.call(grid.children);

    function filledCount() { return shots.filter(Boolean).length; }
    function doneLines() { return BINGO_LINES.filter((l) => l.every((i) => shots[i])); }

    function refresh() {
      const lines = doneLines();
      const lit = {};
      lines.forEach((l) => l.forEach((i) => { lit[i] = true; }));
      cells.forEach((el, i) => {
        el.classList.toggle("is-filled", !!shots[i]);
        el.classList.toggle("is-line", !!lit[i]);
      });

      const n = filledCount();
      if (!n) {
        status.textContent = "칸을 눌러 미션 사진을 담아주세요.";
      } else if (!lines.length) {
        status.innerHTML = `${n}칸 채웠어요. 한 줄(가로·세로·대각선)을 완성하면 응모할 수 있어요!`;
      } else if (n < 9) {
        status.innerHTML = `<b>${lines.length}빙고</b> 완성! 칸을 더 채울수록 당첨 확률이 올라갑니다.`;
      } else {
        status.innerHTML = `<b>퍼펙트 빙고</b> — 아홉 칸을 모두 채우셨어요!`;
      }

      btn.disabled = busy || !lines.length;
      if (!busy) btn.textContent = lines.length ? "빙고 응모하기" : "한 줄을 먼저 완성해주세요";
    }

    /* --- 칸 선택 → 사진 담기 --- */
    grid.addEventListener("click", (e) => {
      const el = e.target.closest(".bingo-cell");
      if (!el || busy) return;
      pending = Number(el.dataset.i);
      cellInput.value = "";
      cellInput.click();
    });

    cellInput.addEventListener("change", async () => {
      const file = cellInput.files && cellInput.files[0];
      if (!file || pending < 0) return;
      const i = pending;
      pending = -1;
      try {
        const blob = await shrink(file, UP.maxPx, UP.quality);
        if (shots[i]) URL.revokeObjectURL(shots[i].url);
        const objUrl = URL.createObjectURL(blob);
        shots[i] = { blob: blob, url: objUrl };
        cells[i].querySelector(".bingo-cell__img").src = objUrl;
        refresh();
      } catch (err) {
        toast("사진을 불러오지 못했습니다. 다시 시도해주세요");
      }
      cellInput.value = "";
    });

    /* --- 응모 --- */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) return;
      const lines = doneLines();
      if (!lines.length) return;

      const guest = $("#bingo-name").value.trim();
      const phone = $("#bingo-phone").value.trim();
      const side = (document.querySelector('input[name="bingo-side"]:checked') || {}).value || "";
      if (!guest) { toast("성함을 입력해주세요"); return; }
      if (phone.replace(/\D/g, "").length < 9) { toast("연락처를 정확히 입력해주세요"); return; }

      busy = true;
      btn.disabled = true;
      const idx = [];
      shots.forEach((s, i) => { if (s) idx.push(i); });

      // 콜라주를 먼저 만들어 함께 올립니다
      btn.textContent = "콜라주 만드는 중...";
      let collage = null;
      try { collage = await buildCollage(shots, CELLS, guest, lines); } catch (err) { /* 없어도 진행 */ }

      let sent = 0;
      const total = idx.length + (collage ? 1 : 0);
      const bump = () => { btn.textContent = `사진 올리는 중... (${++sent}/${total})`; };
      bump(); sent = 0;

      const results = await runPool(idx, UP.parallel, async (i) => {
        const data = await toBase64(shots[i].blob);
        const r = await postScript(url, {
          kind: "bingo-photo",
          data: data,
          type: "image/jpeg",
          name: `${guest}_${String(i + 1).padStart(2, "0")}.jpg`,
          guest: guest, phone: phone, side: side,
          cell: String(i + 1),
          mission: CELLS[i].text,
        });
        bump();
        return r;
      });

      const ok = results.filter((r) => r && r.ok).length;
      const firstError = (results.find((r) => r && !r.ok) || {}).error;

      if (collage) {
        try {
          await postScript(url, {
            kind: "bingo-collage", data: await toBase64(collage),
            type: "image/jpeg", name: `${guest}_빙고판.jpg`,
            guest: guest, phone: phone, side: side, mission: "빙고 콜라주",
          });
          bump();
        } catch (err) { /* 콜라주는 실패해도 무시 */ }
      }

      try {
        await postScript(url, {
          kind: "bingo-entry",
          guest: guest, phone: phone, side: side,
          lines: String(lines.length),
          photos: String(ok),
          missions: idx.map((i) => CELLS[i].text).join(" / "),
        });
      } catch (err) { /* 기록 실패해도 사진은 올라갔습니다 */ }

      busy = false;
      if (!ok) {
        refresh();
        toast(firstError ? `업로드 실패: ${firstError.message}` : "업로드에 실패했습니다. 잠시 후 다시 시도해주세요");
        return;
      }
      try {
        localStorage.setItem("wedding-bingo-entry", JSON.stringify({ guest: guest, lines: lines.length }));
      } catch (err) { /* 사파리 프라이빗 모드 등 */ }
      showDone(guest, lines.length, collage);
      toast(`응모 완료! 사진 ${ok}장 감사합니다 ♥`);
    });

    function showDone(guest, lines, collage) {
      form.hidden = true;
      done.hidden = false;
      done.innerHTML =
        `${escapeHtml(guest)}님, <b>${lines}빙고</b>로 응모가 완료되었습니다 ♥<br/>`
        + `당첨되시면 남겨주신 연락처로 안내드릴게요.<br/>`
        + `<button type="button" class="bingo__again" id="bingo-again">다시 응모하기</button>`;
      const again = $("#bingo-again");
      if (again) {
        again.addEventListener("click", () => {
          done.hidden = true;
          form.hidden = false;
          refresh();
        });
      }
      if (collage) showCollage(collage, guest);
    }

    /* 완성한 빙고판 이미지 — 화면에 보여주고 저장할 수 있게 */
    function showCollage(blob, guest) {
      const wrap = $("#bingo-collage");
      const img = $("#collage-img");
      const save = $("#collage-save");
      const objUrl = URL.createObjectURL(blob);
      img.src = objUrl;
      wrap.hidden = false;
      const fileName = `포토빙고_${guest}.jpg`;

      save.onclick = async () => {
        // 모바일에서는 공유 시트로 바로 저장하는 편이 확실합니다
        try {
          const file = new File([blob], fileName, { type: "image/jpeg" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "포토 빙고" });
            return;
          }
        } catch (err) {
          if (err && err.name === "AbortError") return;   // 사용자가 취소
        }
        const a = document.createElement("a");
        a.href = objUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast("저장되지 않으면 이미지를 길게 눌러 저장해주세요");
      };
    }

    /* 이미 응모한 기록이 있으면 완료 화면부터 */
    try {
      const saved = JSON.parse(localStorage.getItem("wedding-bingo-entry") || "null");
      if (saved && saved.guest) showDone(saved.guest, saved.lines || 1);
    } catch (err) { /* 무시 */ }

    /* --- 빙고와 무관한 자유 업로드 --- */
    const freeInput = $("#snap-input");
    const freeStatus = $("#snap-status");
    let freeBusy = false;
    freeInput.addEventListener("change", async () => {
      if (freeBusy) return;
      const all = Array.prototype.slice.call(freeInput.files);
      const files = all.slice(0, UP.maxFiles);
      if (!files.length) return;
      freeBusy = true;
      if (all.length > files.length) toast(`한 번에 ${UP.maxFiles}장까지 올라갑니다`);

      const who = ($("#bingo-name").value || "").trim() || getGuestName() || "이름없음";
      let sent = 0;
      freeStatus.textContent = `업로드 중... (0/${files.length})`;

      const results = await runPool(files, UP.parallel, async (f) => {
        const blob = await shrink(f, UP.maxPx, UP.quality);
        const r = await postScript(url, {
          kind: "free-photo", data: await toBase64(blob), type: "image/jpeg",
          name: f.name.replace(/\.[^.]+$/, "") + ".jpg",
          // 이름을 적어둔 게 있으면 그 이름으로, 없으면 초대장 URL의 손님 이름으로 정리
          guest: who,
        });
        freeStatus.textContent = `업로드 중... (${++sent}/${files.length})`;
        return r;
      });

      const ok = results.filter((r) => r && r.ok).length;
      const firstError = (results.find((r) => r && !r.ok) || {}).error;
      freeStatus.textContent = "";
      freeInput.value = "";
      freeBusy = false;
      if (ok) toast(`사진 ${ok}장이 전달되었습니다. 감사합니다 ♥`);
      else toast(firstError ? `업로드 실패: ${firstError.message}` : "업로드에 실패했습니다");
    });

    refresh();
  }

  /* ═══════════ 초기화 ═══════════ */
  document.addEventListener("DOMContentLoaded", () => {
    document.title = `${C.groom.name} ♥ ${C.bride.name} 결혼합니다`;
    initSplash();
    renderIntro();
    renderGreeting();
    renderContacts();
    renderLetters();
    renderParents();
    renderGallery();
    renderCalendar();
    renderLocation();
    renderAccounts();
    initRsvp();
    initGuestbook();
    initShare();
    initBgm();
    initBingo();
    initReveal();   // 동적 요소 생성 후 마지막에 실행
    initEnvelopeScroll();
    initPetals();
  });
})();
