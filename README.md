# 아두마켓 — 아두이노 부품 쇼핑몰

아두이노 보드, 센서, 모듈, 부품, 키트를 판매하는 쇼핑몰 데모입니다. 상품 정보와 가격은 디바이스마트 기준이고, 결제는 토스페이먼츠 **테스트 모드**로 동작합니다.

- 배포 사이트: https://arduino-shop-jet.vercel.app
- 이 문서의 [강의 노트](#강의-노트--ai와-함께-쇼핑몰-만들기)에서 처음부터 배포까지 따라 할 수 있습니다.

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

---

## 강의 노트 — AI와 함께 쇼핑몰 만들기

Claude Code에 자연어로 요청해서 기획, 개발, DB 구축, 배포까지 진행한 과정을 단계별로 정리했습니다. 각 단계에 **요청 예시**, **한 일**, **핵심 개념**을 적었습니다.

### 0단계. 준비물
| 도구 | 용도 |
|---|---|
| Node.js (v20 이상) | Next.js 실행 |
| Git, GitHub CLI(`gh`) | 코드 관리, 저장소 생성 |
| Supabase 계정과 프로젝트 | DB, 로그인, 이미지 저장소 |
| Supabase MCP (`.mcp.json`) | AI가 Supabase를 직접 조작하는 통로 |
| Vercel 계정 | 사이트 호스팅 |

`.mcp.json`에 Supabase MCP 서버를 등록해 두면, AI가 테이블 생성이나 SQL 실행 같은 DB 작업을 대신할 수 있습니다. 처음 한 번은 브라우저에서 OAuth 승인을 해야 합니다.

### 1단계. 기획과 폴더 구조
> 요청: "아두이노 쇼핑몰 사이트 만들고 싶다. 계획을 먼저 짜자. 그리고 폴더 구조 정리해줘"

- 기획서를 [docs/PLAN.md](docs/PLAN.md)에 작성했습니다. 목표, 기술 스택, 기능 목록, DB 설계 초안, 개발 순서를 담았습니다.
- Next.js App Router 규칙에 맞게 폴더를 만들었습니다.

**핵심 개념**
- **라우트 그룹 `(shop)`, `(auth)`:** 괄호로 묶은 폴더는 URL에 나타나지 않습니다. 페이지를 성격별로 정리할 때 씁니다.
- **동적 라우트 `[slug]`:** `/products/hc-sr04`처럼 주소의 일부를 변수로 받습니다.
- **기능별 폴더 분리:** `components/`(화면 조각), `lib/`(외부 서비스 연결), `store/`(상태), `types/`(타입).

### 2단계. 상품 데이터와 이미지 수집
> 요청: "이미지는 공짜 이미지 활용해줘. 도형으로 그리지마. 가격이나 상품정보는 디바이스마트 기준으로 최소한만 정리해줘"

- 디바이스마트에서 16개 상품의 판매가, 한 줄 설명, 핵심 사양을 조사해 [docs/products.json](docs/products.json)으로 정리했습니다.
- 사진은 Wikimedia Commons와 Flickr의 **자유 라이선스 사진**만 썼습니다. 쇼핑몰 원본 사진은 저작권이 있어 쓰지 않았습니다.
- CC BY와 CC BY-SA 사진은 **출처 표시 의무**가 있습니다. 그래서 [docs/IMAGE_CREDITS.md](docs/IMAGE_CREDITS.md)와 사이트의 `/credits` 페이지에 저작자와 라이선스를 적었습니다.

**핵심 개념:** 라이선스 종류
- CC0: 조건 없이 사용 가능
- CC BY: 출처를 표시하면 사용 가능
- CC BY-SA: 출처를 표시하고, 수정한 결과물도 같은 라이선스로 공개해야 함

### 3단계. 프로젝트 세팅
`create-next-app`은 이미 파일이 있는 폴더에서 충돌이 나기 때문에 설정 파일을 직접 만들었습니다.

```bash
npm install next react react-dom @supabase/ssr @supabase/supabase-js zustand @tosspayments/tosspayments-sdk
npm install -D typescript @types/react @types/node tailwindcss @tailwindcss/postcss
```

- `tsconfig.json`의 `"paths": { "@/*": ["./src/*"] }`로 `@/components/...` 같은 짧은 import를 씁니다.
- Tailwind CSS 4는 설정 파일 없이 `globals.css`의 `@import "tailwindcss"`와 `@theme`으로 브랜드 색을 정의합니다.

**Next.js 16에서 바뀐 점**
- `middleware.ts`의 이름이 **`proxy.ts`** 로 바뀌었습니다.
- 페이지의 `params`와 `searchParams`는 **Promise**라서 `await`가 필요합니다.
- `cookies()`도 `await cookies()`로 씁니다.

### 4단계. 데이터베이스 설계 (Supabase MCP)
> 요청: "supabase mcp 활용해서 사이트 끝까지 다 만들어줘"

AI가 MCP로 [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)을 적용하고, [supabase/seed.sql](supabase/seed.sql)로 상품 16개를 넣었습니다.

| 테이블 | 내용 |
|---|---|
| `categories` | 보드, 센서, 모듈, 부품, 키트 |
| `products` | 상품명, 가격, 재고, 이미지, 사양(`jsonb`) |
| `profiles` | 회원 정보, 권한(`user`/`admin`). 가입 시 트리거로 자동 생성 |
| `orders` / `order_items` | 주문과 주문 상품. 주문 당시의 이름과 가격을 따로 저장 |

**핵심 개념 1: RLS (Row Level Security)**
Supabase는 브라우저가 DB에 직접 접근하는 구조라서, "누가 어떤 행을 볼 수 있는지"를 DB 규칙으로 정해야 합니다.
```sql
alter table public.orders enable row level security;
create policy "본인 주문 조회" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
```

**핵심 개념 2: 금액은 서버(DB)가 계산한다**
브라우저가 "총액 100원"이라고 보내면 그대로 믿으면 안 됩니다. 주문 생성 함수 `create_order`는 상품 ID와 수량만 받고, 가격은 DB의 `products` 테이블에서 읽어 계산합니다. 배송비 3,000원(3만 원 이상 무료)도 이 함수가 계산합니다.

**핵심 개념 3: 보안 점검 (Advisors)**
DDL 적용 후 `get_advisors`로 보안 경고를 확인했습니다. 그 결과 비로그인 사용자가 실행할 필요가 없는 함수의 권한을 회수했습니다([0002_tighten_function_grants.sql](supabase/migrations/0002_tighten_function_grants.sql)).

### 5단계. 화면 구현
| 화면 | 파일 | 포인트 |
|---|---|---|
| 메인 | `app/(shop)/page.tsx` | 서버 컴포넌트에서 DB를 바로 조회 |
| 상품 목록 | `app/(shop)/products/page.tsx` | `?category=`, `?sort=` 쿼리로 필터와 정렬 |
| 상품 상세 | `app/(shop)/products/[slug]/page.tsx` | `generateMetadata`로 페이지 제목 설정 |
| 장바구니 | `app/(shop)/cart/page.tsx` + `store/cart.ts` | Zustand `persist`로 localStorage에 저장 |
| 로그인, 회원가입 | `app/(auth)/*`, `app/actions/auth.ts` | 서버 액션과 `useActionState` |
| 관리자 | `app/admin/*` | `layout.tsx`에서 관리자 권한 확인 |

**핵심 개념**
- **서버 컴포넌트와 클라이언트 컴포넌트:** 데이터 조회는 서버에서 합니다. 클릭, 입력, 장바구니처럼 상호작용이 필요한 부분만 `"use client"`를 붙입니다.
- **서버 액션 (`"use server"`):** API 라우트를 따로 만들지 않고도 폼 제출을 서버 함수로 처리합니다.
- **Hydration 불일치 방지:** localStorage에 있는 장바구니는 서버가 알 수 없습니다. 그래서 `useHydrated` 훅으로 브라우저에서만 그립니다.

### 6단계. 결제 (토스페이먼츠 테스트 모드)
```
주문서 작성 → create_order(DB가 금액 계산) → 결제위젯 표시
→ 토스 결제창 → /api/payments/confirm
   ① DB 주문 금액과 결제 금액 대조
   ② 토스 승인 API 호출 (시크릿 키는 서버에만 있음)
   ③ mark_order_paid(서버 비밀값 확인) → 결제완료 처리, 재고 차감
→ 주문 상세 페이지 (장바구니 비우기)
```
- 클라이언트 키(`NEXT_PUBLIC_`)는 공개되어도 되는 값입니다. **시크릿 키는 절대 브라우저로 보내면 안 됩니다.**
- 토스 공식 문서의 공개 테스트 키를 쓰기 때문에 실제로 결제되지 않습니다.

### 7단계. 테스트
- `npm run build`로 타입 오류와 빌드 오류를 확인합니다.
- supabase-js로 권한을 시험하는 스크립트를 만들어 확인했습니다.
  - 비로그인 사용자는 상품을 등록할 수 없음
  - 일반 회원은 가격을 바꾸거나 자기 권한을 관리자로 올릴 수 없음
  - 재고보다 많이 주문하면 거부됨
  - 비밀값 없이 결제완료 처리를 할 수 없음
  - 3만 원 이상이면 배송비가 무료가 됨

### 8단계. 배포 (GitHub CLI + Vercel)
> 요청: "Github cli로 배포해줘"

```bash
# 1) GitHub 공개 저장소 만들고 푸시
git init && git add -A && git commit -m "초기 구현"
gh repo create arduino-shop --public --source=. --remote=origin --push

# 2) Vercel 로그인, 프로젝트 연결, 환경변수 등록
npx vercel login
npx vercel link --yes --project arduino-shop
npx vercel env add TOSS_SECRET_KEY production
npx vercel env add NEXT_PUBLIC_TOSS_CLIENT_KEY production --type config   # 공개용 값임을 명시

# 3) 프로덕션 배포
npx vercel deploy --prod
```
- GitHub Pages는 정적 사이트만 올릴 수 있어서, 서버 기능(로그인, 결제 승인)이 있는 Next.js는 **Vercel**에 배포했습니다.
- `.env.local`은 `.gitignore`에 넣어 저장소에 올라가지 않게 했습니다. 비밀값은 Vercel 환경변수로만 관리합니다.
- 배포 후 Supabase 대시보드 → Authentication → URL Configuration에서 **Site URL**을 배포 주소로 바꿔야 회원가입 인증 메일 링크가 제대로 동작합니다.

### 정리: 배운 것
1. **기획부터** 하면 AI에게 맡길 범위가 명확해진다.
2. **MCP**를 쓰면 AI가 외부 서비스(DB)까지 직접 다룰 수 있다. 처음 연결할 때 권한 승인은 사람이 한다.
3. 쇼핑몰 보안의 핵심은 **"클라이언트를 믿지 않기"** 다. 금액은 DB가 계산하고, 권한은 RLS로 막고, 시크릿 키는 서버에만 둔다.
4. 이미지는 **라이선스를 확인**하고 출처를 표시한다.
5. 배포는 **코드(GitHub)와 실행 환경(Vercel)** 이 분리되어 있고, 비밀값은 환경변수로 따로 관리한다.

---

## 이미지 출처
모든 사진은 Wikimedia Commons와 Flickr의 CC0, CC BY, CC BY-SA 사진입니다. 자세한 내용은 [docs/IMAGE_CREDITS.md](docs/IMAGE_CREDITS.md)와 사이트의 `/credits` 페이지를 참고하세요.
