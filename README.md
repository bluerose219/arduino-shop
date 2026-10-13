# 아두마켓 — 아두이노 부품 쇼핑몰

아두이노 보드, 센서, 모듈, 부품, 키트를 판매하는 쇼핑몰 데모입니다. 상품 정보와 가격은 디바이스마트 기준이고, 결제는 토스페이먼츠 **테스트 모드**로 동작합니다.

## 기술 스택
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Zustand (장바구니, localStorage 저장)
- 토스페이먼츠 결제위젯 SDK v2

## 주요 기능
- 상품 목록, 카테고리 필터, 정렬, 검색, 상세(사양표)
- 회원가입과 로그인 (Supabase Auth)
- 장바구니, 주문서, 토스 결제, 결제 승인 검증
- 마이페이지: 내 정보, 주문 내역, 주문 상세
- 관리자: 대시보드(매출, 재고 부족), 상품 등록·수정·삭제(이미지 업로드), 주문 상태 변경

## 보안 설계
- 주문 금액은 클라이언트가 아닌 DB 함수(`create_order`)가 상품 가격으로 직접 계산합니다.
- 결제 승인 API는 금액을 대조한 뒤 토스 승인 API를 호출합니다. 주문 상태 변경(`mark_order_paid`)은 서버 비밀값이 있어야만 가능합니다.
- 모든 테이블에 RLS를 적용했습니다. 일반 회원은 자기 주문과 프로필만 조회할 수 있고, `role` 컬럼은 수정할 수 없습니다.

## 로컬 실행
```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```
DB는 `supabase/migrations/*.sql`을 차례로 실행한 다음 `supabase/seed.sql`을 실행해 만듭니다. 그다음 `private.app_config`에 `order_confirm_secret`을 넣고, 같은 값을 `ORDER_CONFIRM_SECRET`에 넣어 주세요.

관리자 지정 SQL:
```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = '내이메일');
```

## 폴더 구조
```
src/
├── app/
│   ├── (shop)/        # 메인, products, search, cart, checkout
│   ├── (auth)/        # login, signup
│   ├── mypage/        # 내 정보, 주문 내역
│   ├── admin/         # 관리자
│   ├── api/payments/  # 결제 승인
│   └── credits/       # 이미지 출처
├── components/        # ui, layout, product, cart
├── lib/supabase/      # 브라우저, 서버, 프록시용 클라이언트
├── store/             # 장바구니 (Zustand)
└── types/
supabase/              # 마이그레이션, 시드
docs/                  # 기획, 상품 데이터, 이미지 출처
```

## 이미지 출처
모든 사진은 Wikimedia Commons와 Flickr의 CC0, CC BY, CC BY-SA 사진입니다. 자세한 내용은 [docs/IMAGE_CREDITS.md](docs/IMAGE_CREDITS.md)와 사이트의 `/credits` 페이지를 참고하세요.
