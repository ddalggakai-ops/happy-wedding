/* =========================================================
 * 포토 빙고 — 독립 페이지 (bingo.html) 전용 스크립트
 * QR로 접속하는 하객용 화면입니다. config.js 만 있으면 동작합니다.
 * ========================================================= */

(() => {
  const C = WEDDING_CONFIG;
  const $ = (sel) => document.querySelector(sel);

  function pad(n) { return String(n).padStart(2, "0"); }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 2400);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  }

  // 초대장 URL의 손님 이름(?to=홍길동)을 그대로 이어받습니다
  function getGuestName() {
    try {
      const q = new URLSearchParams(location.search).get("to");
      if (q && q.trim()) return q.trim();
      const h = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
      if (h) return h;
    } catch (e) { /* 잘못된 인코딩은 무시 */ }
    return "";
  }

  /* 스크롤 등장 애니메이션 */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  function renderHead() {
    document.title = `포토 빙고 · ${C.groom.name} ♥ ${C.bride.name}`;
    const names = $("#page-names");
    const date = $("#page-date");
    if (names) names.textContent = `${C.groom.name} ♥ ${C.bride.name}`;
    if (date) {
      date.textContent =
        `${C.wedding.year}. ${pad(C.wedding.month)}. ${pad(C.wedding.day)}  ·  ${C.venue.name} ${C.venue.hall}`;
    }
    const back = $("#page-back");
    if (back) back.href = "index.html" + location.search;
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
    const B = C.bingo || {};
    const CELLS = (B.cells || []).slice(0, 9);
    const notice = $("#bingo-notice");

    if (!url || CELLS.length < 9) {
      // 아직 연동 전이면 판만 보여주고 업로드는 막아둡니다
      if (notice) {
        notice.hidden = false;
        notice.textContent = "포토 빙고는 예식 당일에 열립니다. 조금만 기다려주세요!";
      }
      const f = $("#bingo-form"); if (f) f.hidden = true;
      const x = $("#bingo-extra"); if (x) x.hidden = true;
      if (CELLS.length === 9) {
        $("#bingo-title").textContent = B.title || "포토 빙고";
        $("#bingo-grid").innerHTML = CELLS.map((c) => `
          <div class="bingo-cell">
            <span class="bingo-cell__inner">
              <span class="bingo-cell__icon">${escapeHtml(c.icon || "📷")}</span>
              <span class="bingo-cell__text">${escapeHtml(c.text)}</span>
            </span>
          </div>`).join("");
      }
      return;
    }
    const section = $("#snap-section");
    if (section) section.hidden = false;

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


  document.addEventListener("DOMContentLoaded", () => {
    renderHead();
    initBingo();
    initReveal();
  });
})();
