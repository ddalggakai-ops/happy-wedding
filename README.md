# 모바일 청첩장 (Mobile Wedding Invitation)

순수 HTML / CSS / JavaScript로 만든 모바일 청첩장입니다.
빌드 과정 없이 파일만 올리면 어디서든 동작합니다.

## 미리보기

`index.html`을 브라우저에서 열면 바로 확인할 수 있습니다.
로컬 서버로 여는 것을 권장합니다 (폰트·이미지 로딩이 더 안정적):

```bash
# 프로젝트 폴더에서
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## 프로젝트 구조

```
wedding-invitation/
├── index.html          # 페이지 뼈대 (섹션 구조)
├── css/
│   └── style.css       # 전체 스타일 (색상 테마는 :root 변수에서 수정)
├── js/
│   ├── config.js       # ★ 청첩장 정보 — 이 파일만 고치면 됩니다
│   ├── storage.js      # 방명록·RSVP 저장 어댑터 (local / 구글시트)
│   └── main.js         # 렌더링 + 인터랙션 로직
└── assets/
    ├── images/         # 사진 (main.jpg, gallery_01~15.jpg, letter.jpg)
    └── audio/          # 배경음악 (bgm.mp3)
```

## 섹션 구성 (위 → 아래)

1. **BGM 플레이어** — 우측 상단 고정 재생 버튼
2. **인트로** — 날짜, 신랑·신부 이름, 아치형 메인 사진
3. **인사말** — 초대 문구 + 양가 가족 소개 + 연락하기 모달(전화/문자)
4. **러브레터** — 손글씨 편지 (손글씨 폰트 or 스캔 이미지, 아래 참고)
5. **갤러리** — 3열 그리드 + "더보기" + 라이트박스(스와이프/화살표 넘기기)
6. **달력** — 예식 월 달력 자동 생성, 예식일 하이라이트, D-day 카운트
7. **오시는 길** — 네이버지도·카카오맵·티맵 연동 버튼, 주소 복사, 교통편 안내
8. **마음 전하실 곳** — 신랑측/신부측 아코디언 + 계좌번호 복사
9. **참석 의사 전달 (RSVP)** — 참석 여부·인원·식사 여부 폼
10. **방명록** — 축하 메시지 작성/삭제(비밀번호)
11. **공유하기** — 카카오톡 공유 + 링크 복사

## 내 정보로 바꾸기

**`js/config.js` 하나만 수정하면 됩니다.**
이름, 날짜, 장소, 좌표, 인사말, 계좌번호, 사진 목록이 모두 이 파일에 있습니다.

### 사진 교체
- `assets/images/` 안의 플레이스홀더를 실제 사진으로 교체하세요.
  - `main.jpg` — 인트로 메인 사진 (세로형 권장, 3:4)
  - `gallery_01.jpg` ~ `gallery_15.jpg` — 갤러리 (정사각형 권장)
  - `letter.jpg` — 러브레터 섹션 사진 (가로형)
- 파일명을 바꾸거나 개수를 조절하려면 `config.js`의 `gallery.images` 배열을 수정하세요.
- 모바일 로딩 속도를 위해 사진은 **가로 1080px 이하, 장당 300KB 이하**로 압축하는 것을 권장합니다 (https://squoosh.app 활용).

### 손글씨 편지 (러브레터)
두 가지 방식 중 선택할 수 있습니다 (`config.js`의 `letters` 배열):
1. **텍스트 방식** — `text`에 편지 내용을 적으면 손글씨 폰트(나눔손글씨 펜)로 줄노트 편지지에 표시됩니다.
2. **이미지 방식** — 직접 손으로 쓴 편지를 사진 찍거나 스캔해서 `assets/images/`에 넣고 `image`에 경로를 적으면, 그 이미지가 편지지 카드 안에 그대로 표시됩니다 (원본 샘플과 같은 방식).

손글씨 폰트를 바꾸고 싶으면 `index.html`의 Google Fonts 링크와 `style.css`의 `--hand` 변수를 수정하세요.
추천 무료 한글 손글씨 폰트: Nanum Pen Script, Gaegu, Hi Melody, 나눔손글씨 시리즈(눈누 noonnu.cc)

### 배경음악
- `assets/audio/bgm.mp3` 파일을 넣으면 재생 버튼이 활성화됩니다.
- 파일이 없으면 버튼이 자동으로 숨겨집니다.
- 저작권 무료 음원: YouTube Audio Library, Pixabay Music 등

### 지도 좌표 얻기
1. 카카오맵(map.kakao.com)에서 예식장 검색
2. 장소 우클릭 → "여기가 어디인가요?" → 좌표 확인
3. `config.js`의 `venue.lat`, `venue.lng`에 입력

### 카카오톡 공유 설정 (선택)
1. https://developers.kakao.com → 애플리케이션 추가
2. [앱 설정 → 플랫폼 → Web]에 배포한 도메인 등록
3. JavaScript 키를 `config.js`의 `kakao.jsKey`에 입력
- 키가 없으면 공유 버튼이 자동으로 "링크 복사"로 동작합니다.

## 방명록 · RSVP 실제 운영 설정 (구글 시트 연동)

기본값(`storage.mode: "local"`)은 **내 브라우저에만 저장**되는 테스트 모드입니다.
하객들의 글이 모두에게 보이려면 구글 시트 연동을 설정하세요. 무료입니다.

### 1) 구글 스프레드시트 만들기
새 스프레드시트 생성 → 시트 2개 추가: `guestbook`, `rsvp`

### 2) Apps Script 작성
[확장 프로그램 → Apps Script]에서 아래 코드를 붙여넣기:

```javascript
const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  if (e.parameter.action === "list") {
    const sheet = SS.getSheetByName("guestbook");
    const rows = sheet.getDataRange().getValues();
    const entries = rows.map(r => ({
      id: String(r[0]), name: r[1], message: r[2], date: r[3], password: undefined
    })).reverse();
    return json({ entries });
  }
  return json({ ok: true });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.action === "guestbook") {
    SS.getSheetByName("guestbook")
      .appendRow([body.id, body.name, body.message, body.date, body.password]);
    return json({ ok: true });
  }
  if (body.action === "rsvp") {
    SS.getSheetByName("rsvp")
      .appendRow([body.date, body.side, body.attend, body.name, body.count, body.meal]);
    return json({ ok: true });
  }
  if (body.action === "delete") {
    const sheet = SS.getSheetByName("guestbook");
    const rows = sheet.getDataRange().getValues();
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(body.id)) {
        if (String(rows[i][4]) !== String(body.password)) return json({ ok: false });
        sheet.deleteRow(i + 1);
        return json({ ok: true });
      }
    }
    return json({ ok: false });
  }
  return json({ ok: false });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3) 웹앱으로 배포
[배포 → 새 배포 → 웹 앱] 선택
- 실행 계정: **나**
- 액세스 권한: **모든 사용자**
- 배포 후 발급되는 URL을 복사

### 4) config.js 수정
```javascript
storage: {
  mode: "apps-script",
  appsScriptUrl: "https://script.google.com/macros/s/XXXX/exec",
},
```

## 배포 방법

정적 파일이므로 무료 호스팅 어디든 가능합니다.

### GitHub Pages
```bash
git init && git add . && git commit -m "wedding invitation"
# GitHub에 저장소 생성 후
git remote add origin https://github.com/아이디/저장소.git
git push -u origin main
# 저장소 Settings → Pages → Branch: main 선택
```

### Netlify (가장 간단)
https://app.netlify.com/drop 에 프로젝트 폴더를 통째로 드래그하면 끝.

## 색상 테마 바꾸기

`css/style.css` 상단의 `:root` 변수만 수정하면 전체 톤이 바뀝니다:

```css
:root {
  --bg: #fdfaf6;        /* 배경 */
  --accent: #d99a84;    /* 포인트 색 (피치) */
  --accent-deep: #c07a62;
  ...
}
```
