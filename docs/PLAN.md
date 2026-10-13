# 아두이노 쇼핑몰 프로젝트 계획

## 1. 목표
아두이노 보드, 센서, 모듈, 부품, 입문 키트를 판매하는 온라인 쇼핑몰.

## 2. 기술 스택
| 영역 | 선택 | 이유 |
|---|---|---|
| 프론트엔드 | Next.js (App Router) + TypeScript | SEO에 유리, 라우팅 구조가 명확함 |
| 스타일 | Tailwind CSS | 빠른 UI 개발 |
| 백엔드/DB | Supabase (PostgreSQL, Auth, Storage) | `.mcp.json`에 이미 연결되어 있음 |
| 상태관리 | Zustand (장바구니) | 가볍고 단순함 |
| 결제 | 토스페이먼츠 (테스트 키로 시작) | 국내 결제수단 지원 |
| 배포 | Vercel | Next.js와 궁합이 좋음 |

## 3. 핵심 기능
### 사용자
- 상품 목록 / 카테고리 필터 (보드, 센서, 모듈, 부품, 키트)
- 상품 상세 (사양, 핀맵, 호환 보드, 재고)
- 검색
- 회원가입 / 로그인 (Supabase Auth)
- 장바구니
- 주문 / 결제
- 마이페이지: 주문 내역

### 관리자
- 상품 등록 / 수정 / 삭제, 이미지 업로드
- 재고 관리
- 주문 상태 변경 (결제완료 → 배송중 → 배송완료)

## 4. DB 설계 (초안)
- `categories` (id, name, slug)
- `products` (id, category_id, name, description, price, stock, image_url, specs jsonb, created_at)
- `profiles` (id = auth.users.id, name, phone, address, role)
- `cart_items` (id, user_id, product_id, quantity)
- `orders` (id, user_id, total_price, status, shipping_address, created_at)
- `order_items` (id, order_id, product_id, quantity, price)
- RLS: 본인 데이터만 조회/수정, 관리자(role = 'admin')는 전체 접근

## 5. 개발 단계
1. **세팅** – Next.js 프로젝트 생성, Tailwind, Supabase 연결, 환경변수
2. **DB** – 테이블/RLS 마이그레이션 작성, 샘플 상품 데이터 입력
3. **상품** – 메인, 목록, 상세, 검색 페이지
4. **회원** – 회원가입/로그인, 헤더 로그인 상태
5. **장바구니** – 담기/수량변경/삭제
6. **주문/결제** – 체크아웃, 토스페이먼츠 연동, 결제 검증 API
7. **마이페이지** – 주문 내역
8. **관리자** – 상품/주문 관리
9. **마무리** – 반응형 점검, 배포

## 6. 폴더 구조
```
AA/
├── docs/                    # 기획 문서 (이 파일)
├── public/images/products/  # 정적 이미지
├── supabase/migrations/     # DB 스키마 SQL
└── src/
    ├── app/                 # Next.js 라우트
    │   ├── (shop)/          # 쇼핑 페이지 그룹
    │   │   ├── products/[id]/  # 상품 상세
    │   │   ├── search/
    │   │   ├── cart/
    │   │   └── checkout/
    │   ├── (auth)/          # login, signup
    │   ├── mypage/orders/   # 주문 내역
    │   ├── admin/           # products, orders 관리
    │   └── api/payments/    # 결제 승인/검증 API
    ├── components/
    │   ├── ui/              # 버튼, 입력창 등 공통 UI
    │   ├── layout/          # Header, Footer
    │   ├── product/         # ProductCard, ProductGrid
    │   └── cart/            # CartItem, CartSummary
    ├── lib/supabase/        # Supabase 클라이언트 (client/server)
    ├── hooks/               # 커스텀 훅
    ├── store/               # Zustand 스토어 (장바구니)
    └── types/               # 공통 타입 (Product, Order 등)
```
