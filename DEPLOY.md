# 배포 가이드

청첩장은 빌드가 필요 없는 정적 사이트라서, 파일만 올리면 바로 주소가 생깁니다.
아래 두 방법 중 편한 것을 고르세요.

---

## 방법 1. GitHub Pages (무료 · 주소 영구 유지)

### 1) 저장소 만들기
GitHub에서 새 저장소를 만듭니다. 예: `wedding-invitation`
- **Public**으로 만들어야 무료 계정에서 Pages를 쓸 수 있습니다.
- README 추가 옵션은 체크 해제 (빈 저장소로 만들기)

### 2) 코드 올리기
```bash
cd wedding-invitation
git init
git add .
git commit -m "모바일 청첩장"
git branch -M main
git remote add origin https://github.com/<아이디>/<저장소명>.git
git push -u origin main
```

### 3) Pages 켜기
저장소 → **Settings** → 왼쪽 메뉴 **Pages**
- Source: `Deploy from a branch`
- Branch: `main` / `/ (root)` → **Save**

1~2분 뒤 아래 주소로 접속됩니다:
```
https://<아이디>.github.io/<저장소명>/
```

### 4) 수정할 때
```bash
git add .
git commit -m "사진 교체"
git push
```
푸시하면 1분 내로 사이트에 자동 반영됩니다.

---

## 방법 2. Netlify (가장 빠름 · 드래그 한 번)

1. https://app.netlify.com/drop 접속
2. `wedding-invitation` 폴더를 통째로 드래그 & 드롭
3. 끝. 바로 `https://랜덤이름.netlify.app` 주소가 생깁니다.

[Site settings → Change site name]에서 주소를 원하는 이름으로 바꿀 수 있습니다.
예: `https://hyeonkyu-hyunjin.netlify.app`

---

## 배포 후 꼭 해야 할 것

### 1) 카카오톡 공유 썸네일 설정
배포된 주소가 확정되면 `js/config.js`를 수정하세요:

```javascript
kakao: {
  jsKey: "카카오 JavaScript 키",
  shareImage: "https://<배포주소>/assets/images/main.jpg",  // 반드시 전체 URL
},
```

그리고 `index.html`의 og:image도 전체 URL로 바꿔주세요:
```html
<meta property="og:image" content="https://<배포주소>/assets/images/main.jpg" />
```
> 카카오톡 미리보기 이미지는 캐시가 오래 남습니다.
> 바꿔도 반영이 안 되면 [카카오 개발자 → 도구 → 캐시 초기화]에서 URL을 초기화하세요.

### 2) 카카오 개발자 사이트에 도메인 등록
https://developers.kakao.com → 내 애플리케이션 → 앱 설정 → 플랫폼 → Web
→ 사이트 도메인에 배포 주소 등록 (예: `https://아이디.github.io`)

### 3) 방명록 · RSVP 실제 연동
기본값은 테스트 모드(내 브라우저에만 저장)입니다.
하객들의 글이 서로 보이게 하려면 README.md의 "구글 시트 연동" 항목을 따라 설정하세요.

### 4) 휴대폰에서 최종 확인
- 사진이 잘 뜨는지 (특히 로딩 속도)
- 지도 버튼이 앱으로 연결되는지
- 계좌번호 복사가 되는지
- 카톡으로 링크를 보내 미리보기가 제대로 나오는지

---

## 사진 최적화 (중요)

하객 대부분이 모바일 데이터로 접속하므로 사진 용량이 크면 잘 안 열립니다.

- 갤러리 사진: 가로 **1080px 이하**, 장당 **300KB 이하**
- 메인 사진: 가로 1200px 이하

무료 압축 도구: https://squoosh.app (WebP 또는 품질 75~80 JPEG 권장)

---

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
|---|---|
| 사진이 안 보임 | 파일명 대소문자 확인 (`IMG_01.JPG` ≠ `img_01.jpg`). GitHub Pages는 대소문자를 구분합니다. |
| 폰트가 기본체로 나옴 | 인터넷 연결 문제이거나 구글 폰트 차단 환경. 잠시 후 재접속. |
| 카톡 미리보기가 옛날 것 | 카카오 캐시. 위의 "캐시 초기화" 참고. |
| 페이지가 404 | Pages 설정에서 브랜치가 `main`/`root`인지, 파일이 저장소 최상위에 있는지 확인. |
| 방명록 글이 다른 사람에게 안 보임 | `storage.mode`가 `"local"`이면 정상입니다. 구글 시트 연동 필요. |
