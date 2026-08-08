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

  /* ═══════════ 2. 인사말 · 가족 소개 ═══════════ */
  function renderGreeting() {
    $("#greeting-title").textContent = C.greeting.title;
    $("#greeting-message").textContent = C.greeting.message;

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
    const { images, firstVisible } = C.gallery;
    $("#gallery-grid").innerHTML = images.map((src, i) => `
      <a href="${src}" data-index="${i}" class="${i >= firstVisible ? "is-hidden" : ""}">
        <img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy" />
      </a>`).join("");

    // 더보기
    const moreBtn = $("#gallery-more");
    if (images.length <= firstVisible) moreBtn.style.display = "none";
    moreBtn.addEventListener("click", () => {
      document.querySelectorAll("#gallery-grid a.is-hidden")
        .forEach((a) => a.classList.remove("is-hidden"));
      moreBtn.style.display = "none";
    });

    // 라이트박스 열기
    $("#gallery-grid").addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      e.preventDefault();
      openLightbox(Number(a.dataset.index));
    });

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
      { title: "신랑측 계좌번호", rows: C.accounts.groomSide },
      { title: "신부측 계좌번호", rows: C.accounts.brideSide },
    ];
    $("#accounts-list").innerHTML = groups.map((g, gi) => `
      <div class="acc-group" data-group="${gi}">
        <button type="button" class="acc-group__head">${g.title}</button>
        <div class="acc-group__body">
          ${g.rows.map((r) => `
            <div class="acc-row">
              <div class="acc-row__info">
                <div class="acc-row__name">${r.holder} <span class="family-rel">(${r.relation})</span></div>
                <div class="acc-row__num">${r.bank} ${r.number}</div>
              </div>
              <button type="button" class="acc-row__copy"
                data-copy="${r.bank} ${r.number}">복사</button>
            </div>`).join("")}
        </div>
      </div>`).join("");

    document.querySelectorAll(".acc-group__head").forEach((btn) =>
      btn.addEventListener("click", () => btn.parentElement.classList.toggle("is-open")));

    document.querySelectorAll(".acc-row__copy").forEach((btn) =>
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
    const env = document.querySelector(".envelope__img") || document.querySelector(".envelope");
    const letter = document.querySelector(".envelope__letter");
    if (!env || !letter) return;

    const HIDDEN = 76; // 편지가 봉투 속에 숨어 있을 때의 이동량(%)

    // 접근성: 모션 최소화 설정 시 애니메이션 없이 꺼내진 상태로 고정
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      letter.style.transform = "translateY(0) rotate(var(--letter-tilt))";
      return;
    }

    let ticking = false;
    function update() {
      ticking = false;
      const r = env.getBoundingClientRect();
      const vh = window.innerHeight;
      // 봉투가 화면 아래쪽에 나타나기 시작하면 0, 화면 가운데쯤 도달하면 1
      let p = (vh * 0.92 - r.top) / (vh * 0.45);
      p = Math.max(0, Math.min(1, p));
      // 살짝 부드러운 가속 (ease-out)
      const eased = 1 - Math.pow(1 - p, 2);
      letter.style.transform =
        `translateY(${((1 - eased) * HIDDEN).toFixed(2)}%) rotate(var(--letter-tilt))`;
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ═══════════ 초기화 ═══════════ */
  document.addEventListener("DOMContentLoaded", () => {
    document.title = `${C.groom.name} ♥ ${C.bride.name} 결혼합니다`;
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
    initReveal();   // 동적 요소 생성 후 마지막에 실행
    initEnvelopeScroll();
  });
})();
