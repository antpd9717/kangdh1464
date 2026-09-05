# kangdh1464

부업 사이트 프로젝트. **니치는 확정됨**: 일본을 지역별(오사카/도쿄/후쿠오카/삿포로/오키나와/
세토내해·호쿠리쿠)로 나눠 각 지역의 **가볼만한 곳 + 맛집**을 소개하는 여행 정보 사이트입니다.
경쟁이 치열한 넓은 키워드 대신, 리서치로 확인한 좁은 롱테일 키워드(세부 동네·특정 테마·
계절/시간대 한정)부터 공략합니다. 자세한 니치 정의·리서치 근거·콘텐츠 캘린더는
`planning/content-plan.md`에 정리되어 있습니다.

## 구조

```
.
├── index.html                     # 홈: 히어로 + 지역 선택(지도/카드) + 지역별 대표 스팟 미리보기
├── region/                        # 지역 허브 페이지 (지역별 소지역/카테고리/음식 종류 필터 + 스팟 디렉토리)
│   ├── osaka/index.html
│   ├── tokyo/index.html
│   ├── fukuoka/index.html
│   ├── sapporo/index.html
│   ├── okinawa/index.html
│   └── setouchi-hokuriku/index.html
├── content/                       # 발행 글 (콘텐츠 캘린더 상위 우선순위 글부터 추가)
│   ├── README.md                  # 글 추가 규칙
│   ├── osaka-breakfast/index.html       # 구조만 완성, 본문은 "콘텐츠 작성 예정" placeholder
│   ├── naoshima-day-trip/index.html     # 위와 동일
│   └── ureshino-onsen/index.html        # 위와 동일
├── about/, contact/, privacy/     # 소개/문의/개인정보처리방침 페이지
├── assets/
│   ├── css/style.css              # 초록·파랑 톤 브랜드 스타일 (CSS 변수 기반)
│   ├── js/main.js                 # 지역 허브 필터, 뒤로가기 버튼, 스팟 구글맵 링크 등 최소 스크립트
│   └── img/                       # 지역 대표 이미지 등
├── planning/
│   ├── content-plan.md            # 니치 정의, 리서치 근거, 콘텐츠 캘린더 (기획팀)
│   └── spot-directory.md          # 소지역별 실제 스팟(가볼만한 곳/맛집) 리서치 원자료 (기획팀)
├── support/faq.md                 # 방문자 문의 대응용 FAQ (CS팀)
├── daily-tasks/                   # 일일 작업 보고 (master 총괄/검수)
├── robots.txt / sitemap.xml       # 검색엔진 노출 설정
├── netlify.toml                   # 정적 사이트 배포용 최소 설정 (git 연동 자동 배포 전제)
└── .claude/agents/                # 운영 에이전트(팀) 설정
```

## 디자인 톤

`assets/css/style.css`는 초록·파랑(딥틸그린·딥블루) 톤의 여행 매거진 스타일 디자인입니다.
제목은 세리프(Noto Serif KR), 본문은 산세리프(Noto Sans KR)로 위계를 구분하고, 히어로·배지·
푸터는 초록→파랑 그라디언트로 브랜드를 강조합니다. 라이트/다크 모드 모두 지원하며, 색상은
파일 상단 CSS 변수(`:root`)로만 관리합니다.

## 배포

이 저장소는 Git 저장소 연동 기반 자동 배포(예: Netlify/Vercel)를 전제로 합니다.
빌드 과정 없이 정적 파일을 그대로 배포(publish)하도록 구성되어 있습니다.
**CLI로 직접 배포하지 않고, `git push origin main`을 통해서만 배포합니다.**

## 다음 단계

- `planning/content-plan.md`의 콘텐츠 캘린더 우선순위에 따라, `content/osaka-breakfast`,
  `content/naoshima-day-trip`, `content/ureshino-onsen`의 placeholder 본문을 실제 콘텐츠로
  채웁니다 (구조 뼈대는 이미 완성됨).
- 캘린더의 나머지 글들도 순서대로 `content/<slug>/index.html`로 추가합니다.
- `planning/spot-directory.md`의 스팟은 리서치 원자료이므로, 실제 페이지에 반영할 때 주소·
  영업시간 등 세부 정보를 별도로 검증해야 합니다.
