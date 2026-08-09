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
    $("#splash-names").textContent = `${C.groom.name}  ·  ${C.bride.name}`;
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
      // 손글씨 이미지 편지
      $("#greeting-message").innerHTML =
        `<img class="greeting__hand" src="${C.greeting.image}" alt="손글씨 인사말" />`;
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
    $("#calendar-month").textContent = `${C.wedding.year}. ${pad(C.wedding.month)}`;

    const first = new Date(C.wedding.year, C.wedding.month - 1, 1);
    const lastDate = new Date(C.wedding.year, C.wedding.month, 0).getDate();
    const startDow = first.getDay();

    let html = "<thead><tr>" +
      DAY_KO.map((d, i) => `<th class="${i === 0 ? "sun" : ""}">${d}</th>`).join("") +
      "</tr></thead><tbody><tr>";

    for (let i = 0; i < startDow; i++) html += "<td></td>";
    for (let d = 1; d <= lastDate; d++) {
      const dow = (startDow + d - 1) % 7;
      if (dow === 0 && d !== 1) html += "</tr><tr>";
      const cls = [dow === 0 ? "sun" : "", d === C.wedding.day ? "wedding-day" : ""]
        .filter(Boolean).join(" ");
      html += `<td class="${cls}">${d}</td>`;
    }
    html += "</tr></tbody>";
    $("#calendar-table").innerHTML = html;

    // D-day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(C.wedding.year, C.wedding.month - 1, C.wedding.day);
    const diff = Math.round((target - today) / 86400000);
    const names = `${C.groom.name} ♥ ${C.bride.name}`;
    let text;
    if (diff > 0) text = `${names}의 결혼식이 <b>${diff}일</b> 남았습니다.`;
    else if (diff === 0) text = `오늘, ${names} 결혼합니다!`;
    else text = `${names} 결혼식이 ${Math.abs(diff)}일 지났습니다.`;
    $("#dday").innerHTML = text;
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

    $("#share-kakao").addEventListener("click", () => {
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

  /* ═══════════ 9.5 게스트 스냅 (하객 사진 → 구글 드라이브) ═══════════ */
  function initSnap() {
    const url = (C.snap && C.snap.appsScriptUrl || "").trim();
    if (!url) return;                       // URL이 없으면 섹션 숨김 유지
    $("#snap-section").hidden = false;

    const input = $("#snap-input");
    const status = $("#snap-status");
    const MAX_FILES = 10;
    const MAX_SIZE = 20 * 1024 * 1024;      // 파일당 20MB

    input.addEventListener("change", async () => {
      const files = Array.from(input.files).slice(0, MAX_FILES);
      if (!files.length) return;
      let ok = 0;
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        status.textContent = `업로드 중... (${i + 1}/${files.length})`;
        if (f.size > MAX_SIZE) continue;
        try {
          const base64 = await new Promise((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(String(fr.result).split(",")[1]);
            fr.onerror = rej;
            fr.readAsDataURL(f);
          });
          const body = new URLSearchParams({ data: base64, name: f.name, type: f.type });
          // Apps Script 웹앱은 CORS 응답이 없어 no-cors로 전송 (성공 여부는 낙관적으로 처리)
          await fetch(url, { method: "POST", mode: "no-cors", body });
          ok++;
        } catch (e) { /* 다음 파일 계속 */ }
      }
      status.textContent = "";
      input.value = "";
      toast(ok > 0 ? `사진 ${ok}장이 전달되었습니다. 감사합니다 ♥` : "업로드에 실패했습니다. 다시 시도해주세요");
    });
  }

  /* ═══════════ 초기화 ═══════════ */
  document.addEventListener("DOMContentLoaded", () => {
    document.title = `${C.groom.name} ♥ ${C.bride.name} 결혼합니다`;
    initSplash();
    renderIntro();
    renderGreeting();
    renderContacts();
    renderLetters();
    renderGallery();
    renderCalendar();
    renderLocation();
    renderAccounts();
    initRsvp();
    initGuestbook();
    initShare();
    initBgm();
    initSnap();
    initReveal();   // 동적 요소 생성 후 마지막에 실행
    initEnvelopeScroll();
    initPetals();
  });
})();
