/* =========================================================
 * 청첩장 설정 파일
 * 이 파일만 수정하면 청첩장의 모든 내용이 바뀝니다.
 * ========================================================= */

const WEDDING_CONFIG = {
  /* ---------- 신랑 · 신부 정보 ---------- */
  groom: {
    name: "김형규",
    english: "Kim Hyeong Kyu",
    firstName: "형규",          // 부모님 소개란에 "아들 형규" 처럼 표기
    order: "차남",              // 장남 / 차남 / 아들 등으로 수정 가능
    father: "김정수",
    mother: "정인선",
    phone: "010-6383-1547",
  },
  bride: {
    name: "방현진",
    english: "Bang Hyun Jin",
    firstName: "현진",
    order: "차녀",                // 장녀 / 차녀 / 딸 등으로 수정 가능
    father: "방제연",
    mother: "곽명임",
    phone: "010-3198-2090",
  },

  /* ---------- 예식 일시 ---------- */
  // 월은 1~12 그대로 적으면 됩니다.
  wedding: {
    year: 2026,
    month: 11,
    day: 15,
    hour: 11,        // 24시간제 (오전 11시)
    minute: 0,
  },

  /* ---------- 예식장 정보 ---------- */
  venue: {
    name: "명동성당",
    hall: "파밀리아 채플",
    english: "MYEONGDONG CATHEDRAL, FAMILIA CHAPEL",   // (현재 미사용 — 커버는 한글 장소 표기)
    address: "서울특별시 중구 명동길 74",
    // 명동대성당 좌표 (지도 앱 연동용)
    lat: 37.563646,
    lng: 126.987120,
    transit: {
      subway: "4호선 명동역 8번 출구 도보 5분 / 2호선 을지로입구역 5번 출구 도보 7분",
      bus: "명동성당, 롯데영프라자 정류장 하차 (구체 노선은 지도 앱 확인)",
      parking: "성당 내 주차 공간이 혼잡할 수 있어 대중교통 이용을 권장드립니다",
    },
  },

  /* ---------- 인사말 ---------- */
  greeting: {
    title: "소중한 분들을 초대합니다",
    // 손글씨 이미지를 넣으면 편지지에 글 대신 이미지가 표시됩니다. 비우면 아래 message 사용.
    image: "",
    message: `서로가 마주 보며 다져온 사랑을
이제 함께 한 곳을 바라보며
걸어갈 수 있는 큰 사랑으로 키우고자 합니다.

저희 두 사람이 사랑의 이름으로
지켜나갈 수 있도록
앞날을 축복해 주시면 감사하겠습니다.`,
  },

  /* ---------- 러브레터 (손글씨 편지) ---------- */
  // 원본 샘플처럼 "직접 쓴 손편지"를 보여주는 섹션입니다. 두 가지 방식 지원:
  //  1) text 방식  : 아래에 글을 적으면 손글씨 폰트(나눔손글씨 펜)로 편지지에 표시
  //  2) image 방식 : 실제 손으로 쓴 편지를 사진/스캔해서 image에 경로를 넣으면
  //                  편지지 카드 안에 그 이미지가 그대로 표시 (text는 무시됨)
  letters: [
    {
      from: "groom",           // groom | bride
      image: "",               // 예: "assets/images/loveletter1.jpg"
      text: `현진아, 처음 만난 날의 떨림을
아직도 기억해.
앞으로도 그 마음 그대로
너의 가장 든든한 편이 될게.

평생 웃게 해줄게. 고마워, 사랑해.`,
    },
    {
      from: "bride",
      image: "",               // 예: "assets/images/loveletter2.jpg"
      text: `함께한 모든 계절이
참 따뜻했어.
이제 매일의 아침을 같이 맞이하자.

좋은 날도 힘든 날도
손 꼭 잡고 걸어갈게. 사랑해.`,
    },
  ],

  /* ---------- 부모님의 편지 ---------- */
  // family: 가족사진 / letterImage: 손편지 사진 / baby: 어린 시절 사진 (스티커처럼 표시)
  // 파일이 없는 항목은 비워두면 표시되지 않고, 양쪽 다 비면 섹션 전체가 숨겨집니다.
  parents: {
    bride: {
      label: "방제연 & 곽명임의 딸",
      who: "현진",
      family: "assets/parents/bride-family.jpg",
      letterImage: "assets/parents/bride-letter.jpg",   // ★ 임시 — 실제 편지로 교체 예정
      babies: ["assets/parents/bride-baby1.jpg", "assets/parents/bride-baby2.jpg"],
    },
    groom: {
      label: "김정수 & 정인선의 아들",
      who: "형규",
      family: "assets/parents/groom-family.jpg",
      letterImage: "assets/parents/groom-letter.jpg",
      babies: ["assets/parents/groom-baby1.png", "assets/parents/groom-baby2.png"],
    },
  },

  /* ---------- 갤러리 이미지 ---------- */
  // assets/images 폴더에 사진을 넣고 파일명을 맞춰주세요.
  // firstVisible: 처음에 보여줄 개수 (나머지는 "더보기"로 펼침)
  gallery: {
    firstVisible: 9,
    images: [
      "assets/gallery/01.jpg",
      "assets/gallery/02.jpg",
      "assets/gallery/03.jpg",
      "assets/gallery/04.jpg",
      "assets/gallery/05.jpg",
      "assets/gallery/06.jpg",
      "assets/gallery/07.jpg",
      "assets/gallery/08.jpg",
      "assets/gallery/09.jpg",
      "assets/gallery/10.jpg",
      "assets/gallery/11.jpg",
      "assets/gallery/12.jpg",
      "assets/gallery/13.jpg",
      "assets/gallery/14.jpg",
      "assets/gallery/15.jpg",
      "assets/gallery/16.jpg",
      "assets/gallery/17.jpg",
      "assets/gallery/18.jpg",
    ],
  },

  /* ---------- 마음 전하실 곳 (계좌번호) ---------- */
  // ★ 계좌번호는 아직 전달받지 못해 예시입니다. 은행명과 번호를 채워주세요.
  // phone    : 넣으면 이름 옆에 전화 아이콘이 생깁니다 (비우면 숨김)
  // kakaopay : 카카오페이 송금 링크(https://qr.kakaopay.com/...)를 넣으면 pay 버튼이 생깁니다
  //            (카카오페이 앱 → 송금·이체 → 내 송금코드/QR → 링크 복사)
  accounts: {
    groomSide: [
      { holder: "김형규", relation: "신랑", bank: "은행명", number: "계좌번호 입력", phone: "010-6383-1547", kakaopay: "" },
      { holder: "김정수", relation: "혼주", bank: "은행명", number: "계좌번호 입력", phone: "", kakaopay: "" },
      { holder: "정인선", relation: "혼주", bank: "은행명", number: "계좌번호 입력", phone: "", kakaopay: "" },
    ],
    brideSide: [
      { holder: "방현진", relation: "신부", bank: "은행명", number: "계좌번호 입력", phone: "010-3198-2090", kakaopay: "" },
      { holder: "방제연", relation: "혼주", bank: "은행명", number: "계좌번호 입력", phone: "", kakaopay: "" },
      { holder: "곽명임", relation: "혼주", bank: "은행명", number: "계좌번호 입력", phone: "", kakaopay: "" },
    ],
  },

  /* ---------- 게스트 스냅 (하객 사진 업로드) ---------- */
  // 구글 드라이브 연동 방법은 저장소의 게스트스냅-연동방법.md 참고.
  // appsScriptUrl을 채우면 "게스트 스냅" 섹션이 나타납니다.
  snap: {
    appsScriptUrl: "",
  },

  /* ---------- 인트로 스플래시 ---------- */
  // 접속 시 처음 보이는 베일 봉투 화면. false로 바꾸면 바로 청첩장이 보입니다.
  splash: {
    enabled: true,
  },

  /* ---------- 지도 ---------- */
  // 네이버클라우드에서 발급받은 Maps Client ID(ncpKeyId)를 넣으면
  // "오시는 길"의 지도가 네이버 지도로 바뀝니다. 비워두면 구글 지도로 표시됩니다.
  map: {
    naverClientId: "ghcz3edbu0",
  },

  /* ---------- 배경음악 ---------- */
  // assets/audio/bgm.mp3 파일을 넣으면 재생 버튼이 활성화됩니다.
  bgm: {
    src: "assets/audio/bgm.mp3",
    autoplay: true,    // 접속(첫 터치) 시 바로 재생 — 스플래시의 "초대장 열기"를 누르는 순간 시작됩니다
  },

  /* ---------- 카카오톡 공유 ---------- */
  // https://developers.kakao.com 에서 앱 생성 후 JavaScript 키를 넣어주세요.
  // 비워두면 카카오 공유 버튼 대신 "링크 복사"만 동작합니다.
  kakao: {
    jsKey: "4d89d33c46e6f706c39a969d9eab68fe",
    shareTitle: "김형규 ♥ 방현진 결혼합니다",
    shareDescription: "2026년 11월 15일 일요일 오전 11시\n명동성당 파밀리아 채플",
    shareImage: "https://ddalggakai-ops.github.io/happy-wedding/assets/cover.jpg",
  },

  /* ---------- 방명록 · RSVP 저장 방식 ---------- */
  // "local"  : 브라우저에만 저장 (테스트용 — 다른 사람에게는 안 보임)
  // "apps-script" : 구글 시트 연동 (README 참고 — 실제 운영 시 권장)
  storage: {
    mode: "local",
    appsScriptUrl: "",   // mode가 "apps-script"일 때 배포된 웹앱 URL 입력
  },
};
