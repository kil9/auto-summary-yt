# PLAN.md

이 파일은 프로젝트의 명세, 현재 상태, 다음 할 일을 한 곳에서 파악할 수 있도록 유지합니다. 커밋마다 갱신합니다.

---

## 프로젝트 목표 (명세)

유튜브 시청 중 버튼 또는 단축키로 Gemini 웹을 열고, 현재 유튜브 URL을 자동 입력·전송하는 크롬 확장.

### 비목표

- Gemini API 또는 YouTube Data API 사용
- 요약 결과를 확장 자체에서 표시하는 UI
- Firefox 등 비크롬 브라우저 지원

### 제약

- Manifest V3
- 빌드 도구 없음 (소스 직접 로드)
- host_permissions: `youtube.com`, `gemini.google.com` 에 한정

---

## 구현 명세

### 기능 목록

| 기능 | 상태 |
|---|---|
| 유튜브 영상 제목 옆 Gemini 버튼 표시 | 완료 |
| 단축키 `Ctrl+Shift+U` / `Command+Shift+U` 지원 | 완료 |
| Gemini를 백그라운드 탭으로 열기 | 완료 |
| Gemini를 분할 창(팝업)으로 열기 | 완료 |
| Gemini 입력창에 URL 자동 입력 및 전송 | 완료 |
| 옵션 페이지 (버튼 표시 / URL 자동 입력 / 탭 방식) | 완료 |
| SPA 내비게이션 후 버튼 재삽입 (`yt-navigate-finish`) | 완료 |
| MutationObserver로 버튼 유지 | 완료 |

### 파일별 역할 요약

- `manifest.json`: 권한(`tabs`, `scripting`, `windows`, `storage`), 단축키, 콘텐츠 스크립트 등록
- `src/background/index.js`: 단축키·메시지 수신 → Gemini 탭/창 생성 → URL 주입
- `src/content/index.js`: 유튜브 페이지에 Gemini 버튼 삽입, 옵션 변경 반응, SPA 대응
- `src/options/`: 세 가지 옵션을 `chrome.storage.sync`로 읽고 저장하는 UI

---

## 현재 상태 (2026-03-26 기준)

- 초기 MV3 구현 완료 (`11498af`)
- Gemini 전송 흐름 및 버튼 위치 개선 (`bb6ea60`)
- 백그라운드 탭 옵션 추가 (`34ba2ce`)
- 문서(README) 정비 완료 (`b04a080`)
- SPEC.md 제거, PLAN.md로 통합 예정

---

## 알려진 이슈 / 한계

- Gemini UI가 업데이트되면 `injectUrlIntoGemini()`의 selector가 깨질 수 있음
  - `textarea`, `[contenteditable='true']` 순으로 시도하지만 DOM 구조 변경에 취약
- 전송 버튼 감지도 `aria-label` 기반으로 UI 변경 시 재검토 필요
- 자동화 테스트 없음 — 기능 변경 시 수동 확인 필수

---

## 다음 할 일

- [ ] SPEC.md 삭제 (PLAN.md로 통합)
- [ ] Gemini selector 안정성 개선 방안 검토
- [ ] 자동화 테스트 도입 여부 결정 (수동 QA 체크리스트라도 작성)
- [ ] 릴리즈 자동화 (zip 패키징 스크립트 또는 GitHub Actions)
