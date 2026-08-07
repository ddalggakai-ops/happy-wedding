/* =========================================================
 * 방명록 · RSVP 저장 어댑터
 *
 * config.js 의 storage.mode 값에 따라 동작합니다.
 *  - "local"       : 브라우저(localStorage)에만 저장. 테스트용.
 *                    ※ 내 브라우저에만 보이고 다른 하객에게는 안 보입니다.
 *  - "apps-script" : 구글 스프레드시트 연동 (README.md 설정 방법 참고).
 *                    실제 운영 시 권장 — 모든 하객의 글이 공유됩니다.
 * ========================================================= */

const Storage = (() => {
  const mode = WEDDING_CONFIG.storage.mode;
  const scriptUrl = WEDDING_CONFIG.storage.appsScriptUrl;

  /* ---- localStorage 사용이 불가능한 환경(일부 미리보기 등) 대비 ---- */
  const memory = {};
  function lsGet(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch (e) { return memory[key] || []; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { memory[key] = value; }
  }

  /* ---------- local 모드 ---------- */
  const localAdapter = {
    async listGuestbook() {
      return lsGet("wedding_guestbook");
    },
    async addGuestbook(entry) {
      const list = lsGet("wedding_guestbook");
      list.unshift(entry);
      lsSet("wedding_guestbook", list);
      return true;
    },
    async deleteGuestbook(id, password) {
      const list = lsGet("wedding_guestbook");
      const target = list.find((e) => e.id === id);
      if (!target) return false;
      if (target.password !== password) return false;
      lsSet("wedding_guestbook", list.filter((e) => e.id !== id));
      return true;
    },
    async addRsvp(entry) {
      const list = lsGet("wedding_rsvp");
      list.push(entry);
      lsSet("wedding_rsvp", list);
      return true;
    },
  };

  /* ---------- 구글 Apps Script 모드 ---------- */
  const appsScriptAdapter = {
    async listGuestbook() {
      const res = await fetch(`${scriptUrl}?action=list`);
      const data = await res.json();
      return data.entries || [];
    },
    async addGuestbook(entry) {
      await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({ action: "guestbook", ...entry }),
      });
      return true;
    },
    async deleteGuestbook(id, password) {
      const res = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({ action: "delete", id, password }),
      });
      const data = await res.json();
      return !!data.ok;
    },
    async addRsvp(entry) {
      await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({ action: "rsvp", ...entry }),
      });
      return true;
    },
  };

  return mode === "apps-script" && scriptUrl ? appsScriptAdapter : localAdapter;
})();
