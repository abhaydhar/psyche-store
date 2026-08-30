# T-Shirt Customizer - Design Specification

**Date:** 2026-08-30  
**Project Type:** Validation/Hobby Project  
**Goal:** Build full-loop customizer with order management to validate business concept

---

## 1. Architecture Overview

### System Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├──────────────────────┬──────────────────────────────────────┤
│  Public Routes       │  Admin Routes (/admin)               │
│  - / (customizer)    │  - /admin/login                      │
│                      │  - /admin/orders                      │
└──────────────────────┴──────────────────────────────────────┘
         │                           │
         ├───────────────────────────┴──────────────────┐
         │                                               │
         ▼                                               ▼
┌─────────────────────────────────────┐    ┌──────────────────────┐
│         Supabase Backend            │    │  External Services   │
├─────────────────────────────────────┤    ├──────────────────────┤
│ • PostgreSQL Database               │    │ • Google Sheets      │
│   - admin_users                     │    │   Webhook (Apps      │
│   - products                        │    │   Script)            │
│   - orders                          │    └──────────────────────┘
│ • Storage Buckets                   │
│   - tshirt-designs (user uploads)   │
│   - product-blanks (t-shirt images) │
│   - order-mockups (canvas snapshots)│
└─────────────────────────────────────┘
```

### Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **Canvas Engine:** react-rnd (drag/resize/rotate) + html2canvas (snapshot generation)
- **Backend:** Supabase (PostgreSQL database, Storage, simple auth)
- **Deployment:** Vercel (optimized for Next.js)

### Design Philosophy for Validation

- **Speed over scalability:** Prioritize getting to working prototype quickly
- **Manual where possible:** Seed products via SQL instead of building CRUD UI
- **Simple auth:** Plain credential check instead of full auth system
- **Fire-and-forget integrations:** Webhook failures don't block order creation
- **Manual testing:** Skip automated test suites for validation phase

---

## 2. Database Schema

### Tables

#### admin_users
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Purpose: Store admin credentials for login. Seed one admin user in migration.

#### products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('Adults', 'Kids')),
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  base_image_url TEXT NOT NULL,
  available_sizes TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Purpose: Store t-shirt variants (colors/sizes per category). Seed 6 basic products (3 colors × 2 categories) in migration.

#### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  design_image_url TEXT NOT NULL,
  mockup_url TEXT NOT NULL,
  canvas_transform_json JSONB NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Verification' 
    CHECK (status IN ('Pending Verification', 'Confirmed', 'Dispatched')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

Purpose: Store customer orders with design files, mockups, and transformation metadata.

### Storage Buckets

All buckets configured with public read access:

1. **tshirt-designs** - User uploaded high-res design files (PNG/JPEG)
2. **product-blanks** - T-shirt blank images for each color
3. **order-mockups** - Generated canvas snapshots showing design on t-shirt

---

## 3. Component Structure & UI Layout

### Public Customizer Page (`/app/page.tsx`)

**Layout:** Split-screen design (desktop), stacked (mobile)

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Category Toggle (Adults/Kids)           │
├──────────────────────────┬──────────────────────────────┤
│                          │  Control Panel               │
│   Canvas Area            │  ┌────────────────────────┐  │
│   ┌──────────────────┐   │  │ Color Swatches         │  │
│   │                  │   │  └────────────────────────┘  │
│   │  T-shirt Preview │   │  ┌────────────────────────┐  │
│   │  (with printable │   │  │ Size Selector          │  │
│   │   area bounds)   │   │  └────────────────────────┘  │
│   │                  │   │  ┌────────────────────────┐  │
│   │  [Draggable      │   │  │ Upload Design Button   │  │
│   │   Design Area]   │   │  └────────────────────────┘  │
│   │                  │   │  ┌────────────────────────┐  │
│   └──────────────────┘   │  │ Save & Order Button    │  │
│                          │  └────────────────────────┘  │
└──────────────────────────┴──────────────────────────────┘
```

**Key Components:**

1. **TshirtCanvas** (`components/TshirtCanvas.tsx`)
   - Renders t-shirt blank image (updates when color changes)
   - Overlays dashed bounding box for printable area
   - Contains react-rnd draggable/resizable area for user design
   - Enforces boundary constraints (design cannot exceed printable bounds)
   - Handles rotation via react-rnd transform

2. **ColorSwatchSelector** (`components/ColorSwatchSelector.tsx`)
   - Fetches products from Supabase filtered by selected category
   - Renders grid of circular color swatches
   - Shows color name on hover
   - Updates available sizes when color selected

3. **SizeSelector** (`components/SizeSelector.tsx`)
   - Dropdown or button group showing available sizes for selected color
   - Disables unavailable sizes

4. **DesignUploader** (`components/DesignUploader.tsx`)
   - File input accepting PNG/JPEG only
   - Client-side validation (max 10MB)
   - Preview thumbnail after upload
   - Stores File object in state for later upload

5. **CheckoutModal** (`components/CheckoutModal.tsx`)
   - Multi-step dialog modal
   - Step 1: Show payment QR code image + "Continue" button
   - Step 2: Customer info form (name, phone, address) with validation
   - Step 3: "Payment Done" button triggers order creation
   - Shows loading spinner during submission
   - Success confirmation with order number

### Admin Panel

#### Login Page (`/app/admin/login/page.tsx`)

- Simple email/password form (shadcn/ui Input, Button)
- Client-side validation
- Calls `/api/admin/login` endpoint
- Sets session cookie on success
- Redirects to `/admin/orders`

#### Orders Dashboard (`/app/admin/orders/page.tsx`)

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header: "Orders Dashboard" | Logout Button             │
├─────────────────────────────────────────────────────────┤
│  Filter Tabs: [All] [Pending] [Confirmed] [Dispatched]  │
├─────────────────────────────────────────────────────────┤
│  Order# | Customer | Category | Color | Size | Status   │
│  ORD-001| John Doe | Adults   | Black | L    | [Pending]│
│  ORD-002| Jane     | Kids     | White | M    | Confirmed│
└─────────────────────────────────────────────────────────┘
```

**Key Components:**

1. **OrdersTable** (`components/admin/OrdersTable.tsx`)
   - shadcn/ui Table component
   - Fetches orders from `/api/admin/orders?status={filter}`
   - Click row to open details dialog
   - Shows status badge with color coding

2. **OrderDetailsDialog** (`components/admin/OrderDetailsDialog.tsx`)
   - Full order information display
   - Preview mockup image
   - Download buttons for high-res design and mockup
   - Status dropdown (Pending → Confirmed → Dispatched)
   - Updates via `/api/admin/orders/[id]` PATCH

---

## 4. Data Flow & API Routes

### Public Customizer Flow

1. **Page Load:**
   - Fetch products from Supabase via `supabase.from('products').select('*').eq('category', 'Adults')`
   - Display color swatches and sizes

2. **User Interaction:**
   - Select category → Re-fetch products for new category
   - Select color → Update t-shirt blank image, update available sizes
   - Upload design → Store File in state, display in react-rnd area
   - Manipulate design → Drag, resize, rotate (constrained to printable bounds)

3. **Checkout:**
   - Click "Save & Order" → Open CheckoutModal
   - Step through payment QR → customer form → submit

### Order Creation Flow

**Triggered by:** User clicks "Payment Done" in CheckoutModal

**Steps:**

1. Create FormData with design file + order details JSON
2. POST to `/api/orders/create`
3. API route:
   - Upload design file to `tshirt-designs` bucket
   - Generate canvas snapshot via html2canvas
   - Upload snapshot to `order-mockups` bucket
   - Generate unique order_number (format: `ORD-YYYYMMDD-###`)
   - Insert order into database
   - Fire webhook to Google Sheets (fire-and-forget)
   - Return order ID and number
4. Show success dialog with order number

### API Routes

#### `/api/orders/create` (POST)

**Purpose:** Create new order with design uploads

**Request:**
```typescript
FormData {
  designFile: File,
  orderData: JSON.stringify({
    category: string,
    color: string,
    size: string,
    canvasTransform: { x, y, width, height, rotation },
    customerName: string,
    customerPhone: string,
    customerAddress: string
  })
}
```

**Process:**
1. Parse FormData
2. Upload `designFile` to Supabase storage `tshirt-designs` bucket
3. Generate mockup snapshot (html2canvas on server-side or client passes it)
4. Upload mockup to `order-mockups` bucket
5. Generate order_number (check uniqueness, retry if collision)
6. Insert into orders table
7. POST to Google Sheets webhook (async, don't await)
8. Return success response

**Response:**
```typescript
{ 
  success: boolean, 
  orderId: string, 
  orderNumber: string,
  error?: string 
}
```

#### `/api/admin/login` (POST)

**Purpose:** Authenticate admin user

**Request:**
```typescript
{ email: string, password: string }
```

**Process:**
1. Query admin_users table for email
2. Compare password with password_hash (plain text for simplicity in validation phase)
3. If match, set HTTP-only session cookie
4. Return success

**Response:**
```typescript
{ success: boolean, error?: string }
```

#### `/api/admin/orders` (GET)

**Purpose:** Fetch orders for admin dashboard

**Protected:** Requires valid session cookie

**Query Params:**
- `status` (optional): Filter by status ('Pending Verification' | 'Confirmed' | 'Dispatched')

**Response:**
```typescript
{
  success: boolean,
  orders: Array<{
    id: string,
    order_number: string,
    category: string,
    color: string,
    size: string,
    design_image_url: string,
    mockup_url: string,
    canvas_transform_json: object,
    customer_name: string,
    customer_phone: string,
    customer_address: string,
    status: string,
    created_at: string
  }>,
  error?: string
}
```

#### `/api/admin/orders/[id]` (PATCH)

**Purpose:** Update order status

**Protected:** Requires valid session cookie

**Request:**
```typescript
{ status: 'Pending Verification' | 'Confirmed' | 'Dispatched' }
```

**Response:**
```typescript
{ success: boolean, error?: string }
```

### Google Sheets Webhook Integration

**Webhook URL:** Configured via `GOOGLE_SHEETS_WEBHOOK_URL` environment variable

**Payload:**
```json
{
  "orderId": "uuid",
  "orderNumber": "ORD-20260830-001",
  "category": "Adults",
  "color": "Black",
  "size": "L",
  "designImageUrl": "https://xxx.supabase.co/storage/v1/object/public/tshirt-designs/xxx.png",
  "mockupUrl": "https://xxx.supabase.co/storage/v1/object/public/order-mockups/xxx.png",
  "canvasTransform": {
    "x": 100,
    "y": 150,
    "width": 200,
    "height": 200,
    "rotation": 0
  },
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerAddress": "123 Main St, City, State",
  "status": "Pending Verification",
  "timestamp": "2026-08-30T12:34:56.789Z"
}
```

**Google Apps Script (`code.gs`):**
- Receives POST request
- Parses JSON payload
- Appends row to Google Sheet with all order details
- Returns success response (though we don't check it)

---

## 5. Error Handling & Testing

### Error Handling Strategy

#### Client-Side

1. **Toast Notifications:** Use shadcn/ui Toast for all user feedback
   - Success: Order created, status updated
   - Error: Upload failed, network error, validation error
   - Info: Loading states

2. **Form Validation:**
   - File upload: Check file type (PNG/JPEG only), max size (10MB)
   - Customer form: Required fields, phone number format
   - Show inline error messages

3. **Canvas Boundaries:**
   - react-rnd bounds prop enforces printable area
   - Prevent dragging/resizing outside bounds
   - Visual feedback (dashed border)

4. **Loading States:**
   - Disable buttons during async operations
   - Show spinners in modals
   - Prevent double-submission

#### Server-Side

1. **Try-Catch Blocks:** Wrap all async operations in API routes

2. **Supabase Error Handling:**
   - Network errors: Retry once, then fail gracefully
   - Storage quota: Return clear error message
   - Database constraints: Handle duplicate order_number

3. **Webhook Failures:**
   - Fire-and-forget: Don't block order creation
   - Log error to console
   - Consider retry queue for production (not validation phase)

4. **Structured Error Responses:**
```typescript
{ success: false, error: "Human-readable message" }
```

### Edge Cases

1. **Duplicate Order Numbers:**
   - Include timestamp in order_number generation
   - Retry with new timestamp if collision detected
   - Max 3 retries before failing

2. **Storage Upload Failures:**
   - Rollback database insert if storage upload fails
   - Clean up partially uploaded files
   - Return error to user to retry

3. **Missing Environment Variables:**
   - Fail fast at build time (Next.js env validation)
   - Show helpful error message in development

4. **Webhook Timeout:**
   - Set 5-second timeout on webhook POST
   - Don't block order creation on timeout
   - Order still saved in database

### Testing Strategy (Validation Phase)

**Manual Testing Checklist:**

- [ ] Upload design, customize position/size/rotation
- [ ] Select different colors and categories
- [ ] Place order → verify appears in admin panel
- [ ] Check Google Sheets for new row with correct data
- [ ] Download high-res design from admin panel
- [ ] Download mockup preview from admin panel
- [ ] Update order status → verify reflected in table
- [ ] Filter orders by status
- [ ] Test responsive layout on mobile (canvas stacks vertically)
- [ ] Test boundary enforcement (design can't escape printable area)

**Automated Testing (Minimal):**

- TypeScript type checking: `npm run type-check` (catches type errors at build time)
- ESLint: `npm run lint` (code quality)
- Build succeeds: `npm run build` (catches missing dependencies, env vars)

**No unit tests or E2E tests for validation phase** - focus on manual testing to validate concept quickly.

---

## 6. Deployment & Configuration

### Environment Variables

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Sheets Webhook
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Admin Session Secret
ADMIN_SESSION_SECRET=your-random-32-char-secret-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setup Steps

#### 1. Supabase Setup

**Create Project:**
1. Go to https://supabase.com/dashboard
2. Create new project
3. Wait for database to provision
4. Copy project URL and anon key to `.env.local`

**Run Migration:**
```bash
# Script will be provided: scripts/setup-supabase.sql
# Paste into Supabase SQL Editor and run
# Creates tables, indexes, seed data (1 admin user, 6 products)
```

**Create Storage Buckets:**
```bash
# Script will be provided: scripts/create-storage-buckets.sql
# Creates three public buckets with read access policies
```

**Upload Seed T-Shirt Images:**
- Upload 6 placeholder t-shirt blank images to `product-blanks` bucket
- Update product records with storage URLs

#### 2. Google Apps Script Setup

**Create Script:**
1. Go to https://script.google.com
2. Create new project: "T-Shirt Orders Webhook"
3. Paste provided `code.gs` script
4. Create new Google Sheet: "T-Shirt Orders"
5. Update `SHEET_ID` in script with your sheet ID
6. Deploy as web app (Execute as: Me, Access: Anyone)
7. Copy deployment URL to `.env.local` as `GOOGLE_SHEETS_WEBHOOK_URL`

**Provided Script Structure:**
```javascript
function doPost(e) {
  // Parse JSON payload
  // Append row to Google Sheet
  // Return success response
}
```

#### 3. Next.js App Setup

**Install Dependencies:**
```bash
npm install
# Installs: Next.js, React, TypeScript, Tailwind, shadcn/ui, 
# react-rnd, html2canvas, @supabase/supabase-js, lucide-react
```

**Initialize shadcn/ui:**
```bash
npx shadcn-ui@latest init
# Follow prompts for Tailwind configuration
```

**Add shadcn/ui Components:**
```bash
npx shadcn-ui@latest add button dialog input select card table badge tabs toast
```

**Run Development Server:**
```bash
npm run dev
# Opens at http://localhost:3000
```

#### 4. Initial Seed Data

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123` (change in production!)

**Products (seeded in migration):**
- Adults: Black, White, Navy (sizes: S, M, L, XL, XXL)
- Kids: Red, Blue, Yellow (sizes: XS, S, M, L)

**Printable Area Bounds:**
- Centered on t-shirt
- Width: 60% of t-shirt width
- Height: 40% of t-shirt height
- Rendered as dashed border on canvas

#### 5. Vercel Deployment (Optional)

**Deploy to Vercel:**
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Environment Variables in Vercel:**
- Add all variables from `.env.local`
- Update `NEXT_PUBLIC_APP_URL` to production URL

---

## 7. Project Structure

```
psychestore/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Public customizer page
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx              # Admin login page
│   │   └── orders/
│   │       └── page.tsx              # Admin orders dashboard
│   └── api/
│       ├── orders/
│       │   └── create/
│       │       └── route.ts          # Create order endpoint
│       └── admin/
│           ├── login/
│           │   └── route.ts          # Admin login endpoint
│           └── orders/
│               ├── route.ts          # Get orders endpoint
│               └── [id]/
│                   └── route.ts      # Update order status endpoint
├── components/
│   ├── TshirtCanvas.tsx              # Main canvas component
│   ├── ColorSwatchSelector.tsx       # Color picker
│   ├── SizeSelector.tsx              # Size dropdown
│   ├── DesignUploader.tsx            # File upload button
│   ├── CheckoutModal.tsx             # Multi-step checkout modal
│   └── admin/
│       ├── OrdersTable.tsx           # Orders table with filters
│       └── OrderDetailsDialog.tsx    # Order detail modal
├── lib/
│   ├── supabase.ts                   # Supabase client initialization
│   ├── utils.ts                      # Utility functions
│   └── types.ts                      # TypeScript types
├── scripts/
│   ├── setup-supabase.sql            # Database migration script
│   ├── create-storage-buckets.sql    # Storage bucket setup
│   └── code.gs                       # Google Apps Script
├── public/
│   └── payment-qr.png                # User provides QR code image
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-08-30-tshirt-customizer-design.md  # This file
├── .env.local                        # Environment variables (not committed)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 8. Implementation Notes

### Canvas Implementation Details

**react-rnd Configuration:**
```typescript
<Rnd
  size={{ width: designWidth, height: designHeight }}
  position={{ x: designX, y: designY }}
  onDragStop={(e, d) => setDesignPosition({ x: d.x, y: d.y })}
  onResizeStop={(e, direction, ref, delta, position) => {
    setDesignSize({ 
      width: ref.offsetWidth, 
      height: ref.offsetHeight 
    });
    setDesignPosition(position);
  }}
  bounds="parent"  // Constrains to printable area bounds
  lockAspectRatio={false}
  enableRotation={true}
>
  <img src={uploadedDesignUrl} alt="Design" />
</Rnd>
```

**Printable Area Bounds:**
- Calculate based on t-shirt image dimensions
- Center the bounds: `x = (tshirtWidth - boundsWidth) / 2`
- Position: `y = tshirtHeight * 0.25` (starts 25% down from top)

**Canvas Snapshot Generation:**
```typescript
import html2canvas from 'html2canvas';

const canvasElement = document.getElementById('tshirt-canvas');
const canvas = await html2canvas(canvasElement);
const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
// Upload blob to Supabase storage
```

### Order Number Generation

```typescript
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${randomSuffix}`;
}

// Check uniqueness and retry if collision
async function getUniqueOrderNumber(): Promise<string> {
  for (let i = 0; i < 3; i++) {
    const orderNumber = generateOrderNumber();
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single();
    
    if (!data) return orderNumber;
  }
  throw new Error('Could not generate unique order number');
}
```

### Admin Session Management

**Simple Cookie-Based Auth:**
```typescript
// lib/auth.ts
import { cookies } from 'next/headers';

export function setAdminSession(userId: string) {
  cookies().set('admin_session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function getAdminSession(): string | null {
  return cookies().get('admin_session')?.value || null;
}

export function clearAdminSession() {
  cookies().delete('admin_session');
}
```

**Middleware Protection:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    const session = request.cookies.get('admin_session');
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

---

## 9. Success Criteria for Validation

This project succeeds if:

1. **User Flow Works End-to-End:**
   - User can upload design, customize, and place order
   - Order appears in admin panel immediately
   - Google Sheets receives order data

2. **Admin Can Manage Orders:**
   - View all orders in table
   - Filter by status
   - Update order status
   - Download design files and mockups

3. **Core UX Is Smooth:**
   - Canvas manipulation feels responsive
   - Design stays within printable bounds
   - Mobile layout is usable (even if not perfect)
   - Loading states prevent confusion

4. **Business Concept Validation:**
   - Can test with real users (friends/family)
   - Collect feedback on pricing, colors, process
   - Decide whether to continue building

**Out of Scope for Validation:**
- Payment processing (using placeholder QR for now)
- Email notifications
- Product inventory management UI
- Order fulfillment tracking
- User accounts/order history
- Production-grade security hardening

---

## 10. Future Enhancements (Post-Validation)

If validation succeeds and project continues:

1. **Product Management UI:** Build admin CRUD for adding/editing t-shirt variants
2. **Real Payment Integration:** Stripe, Razorpay, or other payment gateway
3. **Email Notifications:** Order confirmations, status updates
4. **User Accounts:** Allow customers to view order history
5. **Advanced Canvas:** Snap-to-grid, multi-layer designs, filters
6. **Inventory Tracking:** Stock counts, out-of-stock warnings
7. **Analytics Dashboard:** Revenue, popular colors, conversion rates
8. **Better Auth:** Proper password hashing (bcrypt), session management
9. **Testing:** Unit tests, E2E tests with Playwright
10. **Performance:** Image optimization, caching, CDN

For now, focus on shipping the validation build quickly.
