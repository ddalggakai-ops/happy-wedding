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
      subway: "4호선 명동역 8번 출구 도보 5분 \n2호선 을지로입구역 5번 출구 도보 7분",
      bus: "명동성당, 롯데영프라자 정류장 하차 \n(구체 노선은 지도 앱 확인)",
      parking: "파인애비뉴 빌딩 (서울 중구 을지로 100, 도보 10분, 2시간 주차권 제공)\n* 명동성당 지하주차장 이용 시 주차권 제공이 어렵습니다.\n* SK 사원증/패밀리카드 소지 시, 을지로 SKT타워 무료 이용 가능해요.",
    },
  },

  /* ---------- 인사말 ---------- */
  greeting: {
    title: "소중한 분들을 초대합니다",
    // 카드 위쪽 타원 안에 들어갈 사진
    photo: "assets/gallery/20.jpg",
    // 타원 안에서 사진의 어느 부분을 보여줄지 — 위/아래 값을 줄이면 사진 위쪽이 더 보입니다
    photoPosition: "50% 10%",
    // 손글씨 이미지를 넣으면 카드에 글 대신 이미지가 표시됩니다. 비우면 아래 message 사용.
    image: "assets/greeting-hand.png",
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
      photo: "assets/letter-groom.jpg",   // 손글씨가 올라갈 배경 사진
      tag: "현진이에게, 형규가",           // 사진 위 작은 머리말
      image: "",               // 실제 손편지를 스캔했다면 여기에 (넣으면 photo/text 대신 이미지만 표시)
      // 사진은 그대로 두고 글씨만 손글씨 이미지로 바꾸고 싶을 때 (아래 text 대신 표시됩니다)
      handImage: "assets/letter-groom-hand.png",
      text: `현진아, 처음 만난 날의 떨림을
아직도 기억해.
앞으로도 그 마음 그대로
너의 가장 든든한 편이 될게.

평생 웃게 해줄게. 고마워, 사랑해.`,
    },
    {
      from: "bride",
      photo: "assets/letter-bride.jpg",
      tag: "형규에게, 현진이가",
      image: "",
      handImage: "assets/letter-bride-hand.png",
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
      letterImage: "assets/parents/bride-letter.jpg",
      // 손편지를 문장 단위로 오려 붙인 조각들 (있으면 letterImage 대신 사용)
      letterLines: [
        "assets/parents/bride-letter/1.png",
        "assets/parents/bride-letter/2.png",
        "assets/parents/bride-letter/3.png",
        "assets/parents/bride-letter/4.png",
        "assets/parents/bride-letter/5.png",
      ],
      babies: ["assets/parents/bride-baby1.png", "assets/parents/bride-baby2.png"],
    },
    groom: {
      label: "김정수 & 정인선의 아들",
      who: "형규",
      family: "assets/parents/groom-family.jpg",
      letterImage: "assets/parents/groom-letter.jpg",
      // 손편지를 한 줄씩 오려 붙이려면 아래에 줄 이미지들을 넣으세요 (있으면 letterImage 대신 사용)
      letterLines: [
        "assets/parents/groom-letter/1.png",
        "assets/parents/groom-letter/2.png",
        "assets/parents/groom-letter/3.png",
        "assets/parents/groom-letter/4.png",
        "assets/parents/groom-letter/5.png",
        "assets/parents/groom-letter/6.png",
      ],
      babies: ["assets/parents/groom-baby1.png", "assets/parents/groom-baby2.png"],
    },
  },

  /* ---------- 영상 ---------- */
  // 신부의 편지 다음에 나오는 영상 섹션입니다.
  // src를 비우면 섹션이 통째로 숨겨집니다. poster는 재생 전에 보이는 사진입니다.
  film: {
    src: "assets/video/letter.mp4",
    poster: "assets/video/letter-poster.jpg",
    caption: "재생 버튼을 누르면 소리와 함께 재생됩니다",
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
      "assets/gallery/19.jpg",
      "assets/gallery/20.jpg",
      "assets/gallery/21.jpg",
      "assets/gallery/22.jpg",
      "assets/gallery/23.jpg",
      "assets/gallery/24.jpg",
      "assets/gallery/25.jpg",
      "assets/gallery/26.jpg",
      "assets/gallery/27.jpg",
      "assets/gallery/28.jpg",
      "assets/gallery/29.jpg",
      "assets/gallery/30.jpg",
      "assets/gallery/31.jpg",
      "assets/gallery/32.jpg",
      "assets/gallery/33.jpg",
    ],
  },

  /* ---------- 안내사항 ---------- */
  // 탭을 눌러 보는 안내 섹션입니다.
  //  label : 탭에 보이는 짧은 이름   /  title : 내용 위 제목
  //  text  : 본문 (줄바꿈 그대로 표시)
  //  note  : 아래에 강조되는 한 줄 (없으면 비워두세요)
  //  stops : 시간표가 필요한 탭에만 (출발지·경유지 목록)
  //  탭을 추가·삭제하려면 아래 배열에서 항목을 넣고 빼면 됩니다.
  info: {
    headline: `귀한 걸음 해주시는 모든 분들께
기쁘고 편안한 하루로 남기를 바랍니다`,
    tabs: [
      {
        label: "장소",
        icon: "⛪",
        title: "대성당이 아닌 '파밀리아 채플'이에요",
        text: `예식은 명동성당 안에 자리한 작은 예식 공간, 파밀리아 채플에서 올립니다.

큰 성당 건물로 들어가시면 저희를 찾기 어려우실 수 있어요. 성당 마당으로 들어오셔서 '파밀리아 채플' 안내를 따라와 주시면, 반갑게 맞이하겠습니다.`,
        note: "지도 앱에 '명동성당 파밀리아채플'로 검색하시면 한 번에 나와요",
      },
      {
        label: "주차",
        icon: "🅿️",
        title: "파인애비뉴 빌딩 주차장을 이용해주세요",
        text: `하객분들께서는 파인애비뉴 빌딩 주차장을 이용해주시기 바랍니다.
(서울 중구 을지로 100, 도보 10분)

※ 명동성당 지하 주차장 이용 시 주차권 제공이 어렵습니다.
※ **SK 사원증/패밀리카드 소지**하신 분은, 을지로 SKT타워 주차장 무료 이용 가능합니다.`,
        note: "파인애비뉴 빌딩 주차장 이용 시 2시간 주차권을 제공해 드립니다",
      },
      {
        label: "혼배미사",
        icon: "💒",
        title: "혼배미사 형식으로 예식을 올립니다",
        text: `성당에서 올리는 예식으로, 한 시간 가량의 혼배미사로 진행됩니다.

종교와 관계없이 편안히 참석해주시면 되고, 저희 두 사람이 서약하는 순간을 따뜻하게 지켜봐주시면 감사하겠습니다.`,
        note: "화환은 정중히 사양합니다. 축하해 주시는 마음만 감사히 받겠습니다",
      },
      {
        label: "대절버스",
        icon: "🚌",
        title: "제천 출발 버스를 운행합니다",
        text: `먼 길 오시는 걸음이 조금이나마 편안하시도록, 제천 출발/원주 경유 버스를 준비했습니다.`,
        stops: [
          { time: "07:20", place: "에덴알뜰주유소", desc: "출발" },
          { time: "07:50", place: "원주 따뚜공연장", desc: "경유" },
        ],
        note: "",
      },
    ],
  },

  /* ---------- 마음 전하실 곳 (계좌번호) ---------- */
  // phone    : 넣으면 이름 옆에 전화 아이콘이 생깁니다 (비우면 숨김)
  // kakaopay : 카카오페이 송금 링크(https://qr.kakaopay.com/...)를 넣으면 pay 버튼이 생깁니다
  //            (카카오페이 앱 → 송금·이체 → 내 송금코드/QR → 링크 복사)
  accounts: {
    groomSide: [
      { holder: "김형규", relation: "신랑", bank: "새마을금고", number: "9003-2601-7176-1", phone: "010-6383-1547", kakaopay: "" },
      { holder: "김정수", relation: "혼주", bank: "농협", number: "421034-52-064544", phone: "010-5459-1547", kakaopay: "" },
      { holder: "정인선", relation: "혼주", bank: "농협", number: "211-02-185444", phone: "010-4078-9153", kakaopay: "" },
    ],
    brideSide: [
      { holder: "방현진", relation: "신부", bank: "국민", number: "026402-04-147985", phone: "010-3198-2090", kakaopay: "" },
      { holder: "방제연", relation: "혼주", bank: "기업", number: "055-082229-01-014", phone: "010-7309-2468", kakaopay: "" },
      { holder: "곽명임", relation: "혼주", bank: "국민", number: "093602-04-075617", phone: "010-5173-1170", kakaopay: "" },
    ],
  },

  /* ---------- 게스트 스냅 · 포토 빙고 ---------- */
  // 하객이 미션 사진을 찍어 3×3 빙고를 채우고, 한 줄 이상 완성하면 응모하는 이벤트입니다.
  // 사진은 구글 드라이브에, 응모 내역은 구글 시트에 쌓입니다.
  // 연동 방법은 저장소의 게스트스냅-연동방법.md 참고.
  // appsScriptUrl을 채우면 "포토 빙고" 섹션이 나타납니다.
  snap: {
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbxf0Alfd9tSV5dcbEfQ6qh4k4l0gl9aG9GtXjw7HaUtL_bjo4e63AFSwajj5-3rnN2zng/exec",
  },
  bingo: {
    title: "포토 빙고",
    desc: `아홉 개의 미션 중 한 줄(가로·세로·대각선)을 채우면 응모가 완료됩니다.
추첨을 통해 소정의 경품을 보내드릴게요!`,
    prize: "추첨 후 개별 연락드립니다",
    // 9칸 미션 — 순서대로 왼쪽 위 → 오른쪽 아래입니다. 문구는 자유롭게 바꾸세요.
    cells: [
      { icon: "🤵", text: "신랑 형규와 한 컷" },
      { icon: "⛪", text: "명동성당 앞에서" },
      { icon: "👰", text: "신부 현진과 한 컷" },
      { icon: "💐", text: "신랑·신부의 행진 순간" },
      { icon: "💍", text: "신랑·신부와 셋이서" },
      { icon: "🙇", text: "부모님께 인사하는 신랑·신부" },
      { icon: "😄", text: "활짝 웃는 신랑·신부" },
      { icon: "🫶", text: "함께 온 일행과 단체샷" },
      { icon: "🍰", text: "오늘의 식사 또는 디저트" },
    ],
  },

  /* ---------- 방문·클릭 통계 ---------- */
  // snap.appsScriptUrl 로 방문수·버튼 클릭을 보내 구글 시트에 쌓습니다.
  // 끄고 싶으면 enabled를 false로 바꾸세요.
  stats: {
    enabled: true,
    // 결혼식 당일에도 통계를 남길지 (기본 false).
    // 당일에는 하객이 한꺼번에 몰려 구글 스크립트의 하루 실행 시간을 다 쓸 수 있어서,
    // 사진 업로드와 참석 확인에 양보하도록 꺼둡니다.
    onWeddingDay: false,
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
    shareImage: "https://hyeongkyu-and-hyunjin.life/assets/cover.jpg",
  },

  /* ---------- 방명록 · RSVP 저장 방식 ---------- */
  // "local"  : 브라우저에만 저장 (테스트용 — 다른 사람에게는 안 보임)
  // "apps-script" : 구글 시트 연동 (README 참고 — 실제 운영 시 권장)
  storage: {
    mode: "local",
    appsScriptUrl: "",   // mode가 "apps-script"일 때 배포된 웹앱 URL 입력
  },
};
