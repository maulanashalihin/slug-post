# 📋 SlugPost - Development Checklist

> Tracking perkembangan pembuatan aplikasi SlugPost

---

## 🎨 Design System & Branding

### Color Palette (Minimal & Professional)
- [x] **Primary Blue** - `#3B82F6` (blue-600) - Main branding, primary CTAs, links
- [x] **Slate Gray** - `#334155` - `#F8FAFC` - Text, secondary buttons, borders (90% of UI)
- [x] **Orange Accent** - `#F59E0B` (orange-500) - Warnings and critical notices only

### Design Philosophy
- **Less is More** - Limit color palette for professional aesthetic
- **Primary Blue** - Used sparingly for main actions
- **Slate Neutrals** - Workhorse colors for most UI elements
- **Orange** - Reserved exclusively for warnings
- **Theme Support** - Dark Mode & Light Mode support (in progress)
- **Mobile-First** - All pages responsive and optimized for mobile devices

### TailwindCSS Setup
- [x] Configure minimal color palette in `tailwind.config.js`
- [x] Setup typography plugin for markdown rendering
- [x] Configure responsive breakpoints
- [x] Setup custom animations and transitions

---

## 🎯 Project Setup

- [ ] Initialize project structure
- [ ] Setup environment configuration (.env)
- [ ] Configure TypeScript
- [ ] Setup Vite build system
- [ ] Configure TailwindCSS
- [ ] Setup Inertia.js with Svelte 5
- [ ] Configure HyperExpress server
- [ ] Setup BetterSQLite3 database
- [ ] Create initial migrations

---

## 🗄️ Database & Migrations

### Users Table
- [x] Create migration for users table
  - [x] id (UUID, PRIMARY KEY)
  - [x] name (VARCHAR)
  - [x] email (VARCHAR, UNIQUE, INDEXED)
  - [x] phone (VARCHAR)
  - [x] password (VARCHAR)
  - [x] is_verified (BOOLEAN)
  - [x] is_admin (BOOLEAN)
  - [x] membership_date (TIMESTAMP)
  - [x] remember_me_token (VARCHAR)
  - [x] created_at (TIMESTAMP)
  - [x] updated_at (TIMESTAMP)

### Posts Table
- [x] Create migration for posts table
  - [x] id (PRIMARY KEY)
  - [x] slug (VARCHAR, UNIQUE, INDEXED)
  - [x] content (TEXT)
  - [x] title (VARCHAR)
  - [x] edit_token (VARCHAR, UNIQUE, INDEXED)
  - [x] author_id (UUID, FOREIGN KEY to users, NULLABLE)
  - [x] view_count (INTEGER, DEFAULT 0)
  - [x] created_at (TIMESTAMP)
  - [x] updated_at (TIMESTAMP)
  - [x] last_viewed_at (TIMESTAMP)

### Post Analytics Table (Optional)
- [ ] Create migration for post_analytics table
  - [ ] id (PRIMARY KEY)
  - [ ] post_id (FOREIGN KEY)
  - [ ] ip_address (VARCHAR)
  - [ ] user_agent (VARCHAR)
  - [ ] referer (VARCHAR)
  - [ ] country (VARCHAR)
  - [ ] viewed_at (TIMESTAMP)

---

## 🎨 Frontend Pages 

### Core Pages
- [x] **Homepage** (`/`)
  - [x] Landing page dengan hero section
  - [x] Form untuk upload file markdown
  - [x] Textarea untuk paste markdown content
  - [x] Input custom slug
  - [x] Publish button 

- [x] **Success Page** (`/success`) - **Svelte/Inertia**
  - [x] Display public URL
  - [x] Display edit URL dengan warning ⚠️
  - [x] Copy to clipboard buttons
  - [x] Warning message: "Save edit link - shown only once!"
  - [x] Claim button (replaces Register)
  - [x] Conditional UI based on claim status
  - [x] Dynamic header (login/logout)
  - [x] Mobile responsive design
  - [ ] Social share buttons (optional)

- [x] **View Post** (`/:slug`)
  - [x] Display rendered markdown dengan @tailwindcss/typography
  - [x] Responsive design
  - [x] View counter
  - [x] Meta tags untuk SEO
  - [x] Share buttons (optional)
  - [x] Print-friendly layout

- [x] **Edit Post** (`/:slug/edit/:token`) - **Svelte/Inertia**
  - [x] Validate edit token
  - [x] Load existing markdown content
  - [x] Check if post has author (claimed or not)
  - [x] Show "Claim This Post" button if no author
  - [x] Textarea untuk edit content
  - [x] Preview markdown with syntax highlighting
  - [x] Update button with loading state
  - [x] View post button
  - [x] Last updated timestamp
  - [x] Keyboard shortcuts (Cmd/Ctrl+S, Cmd/Ctrl+P)
  - [x] Dynamic header (login/logout)
  - [x] Mobile responsive design
  - [x] Tab navigation (Edit, Preview, Info)

### Authentication Pages
- [x] **Login Page** (`/login`) - **Svelte/Inertia**
  - [x] Email input
  - [x] Password input
  - [x] Remember me checkbox
  - [x] Login button
  - [x] Link to register page
  - [x] Forgot password link
  - [x] Mobile responsive design

- [x] **Register Page** (`/register`) - **Svelte/Inertia**
  - [x] Name input
  - [x] Email input
  - [x] Phone input (optional)
  - [x] Password input
  - [x] Confirm password input
  - [x] Register button
  - [x] Link to login page
  - [x] Mobile responsive design

- [x] **Profile Page** (`/profile`) - **Svelte/Inertia**
  - [x] Edit profile form (name, email, phone)
  - [x] Avatar upload
  - [x] Change password form
  - [x] Dynamic header (login/logout)
  - [x] Mobile responsive design
  - [x] Updated to SlugPost branding colors

- [x] **Dashboard/Home** (`/home`) - **Svelte/Inertia**
  - [x] List of user's claimed posts
  - [x] Post statistics (views, created date)
  - [x] Quick edit actions
  - [x] Create new post button
  - [x] Dynamic header (login/logout)
  - [x] Mobile responsive design
  - [ ] Delete post functionality
  - [ ] Post filtering/search

### Error Pages
- [ ] **404 Page** - Post not found
- [ ] **403 Page** - Invalid edit token
- [ ] **500 Page** - Server error

---

## 🔧 Backend Controllers

- [ ] **HomeController**
  - [ ] `index()` - Display homepage

- [ ] **AuthController**
  - [ ] `showLogin()` - Display login page
  - [ ] `login()` - Process login
    - [ ] Validate credentials
    - [ ] Create session
    - [ ] Set remember me token if requested
    - [ ] Redirect to dashboard or intended page
  
  - [ ] `showRegister()` - Display register page
  - [ ] `register()` - Process registration
    - [ ] Validate input
    - [ ] Hash password
    - [ ] Create user account
    - [ ] Auto-login after registration
    - [ ] Redirect to dashboard
  
  - [ ] `logout()` - Process logout
    - [ ] Clear session
    - [ ] Redirect to homepage

- [x] **PostController**
  - [x] `store()` - Create new post
    - [x] Validate markdown content
    - [x] Generate unique slug
    - [x] Generate unique edit token (UUID)
    - [x] Extract title from markdown
    - [x] Set author_id if user is logged in (auto-claim)
    - [x] Save to database
    - [x] Return success with URLs
  
  - [x] `show()` - Display post by slug
    - [x] Find post by slug
    - [x] Increment view counter
    - [x] Update last_viewed_at
    - [x] Load author info if exists
    - [x] Render markdown to HTML with syntax highlighting
    - [x] Return Inertia view
  
  - [x] `edit()` - Show edit form
    - [x] Validate edit token OR check if user owns post
    - [x] Find post by slug and token
    - [x] Check if post can be claimed (no author_id)
    - [x] Return Inertia edit view with claim option
  
  - [x] `update()` - Update post
    - [x] Validate edit token OR check ownership
    - [x] Validate markdown content
    - [x] Extract new title
    - [x] Update database
    - [x] Return JSON success response
  
  - [x] `claim()` - Claim anonymous post
    - [x] Check if user is authenticated
    - [x] Validate edit token
    - [x] Check if post has no author
    - [x] Set author_id to current user
    - [x] Redirect to edit page with success
    - [x] Handle redirect after login/register
  
  - [x] `success()` - Success page after publish
    - [x] Check if post is claimed
    - [x] Return Inertia view with claim status
    - [x] Pass user data for dynamic header
  
  - [x] `checkSlug()` - Check slug availability
  - [x] `preview()` - Preview markdown content

- [ ] **DashboardController**
  - [ ] `index()` - Display user dashboard
    - [ ] Load all posts by user

---

## 🧩 Reusable Components

### Svelte Components
- [x] **Header Component** (`Header.svelte`)
  - [x] Dynamic navigation based on auth status
  - [x] User dropdown menu (Profile, My Posts, Logout)
  - [x] Login/Register buttons for guests
  - [x] Logo and branding
  - [x] Click outside handler
  - [x] Mobile responsive
  - [x] Used in: Success, EditPost, Home, Profile pages

- [ ] **Footer Component** (`Footer.svelte`)
  - [ ] Copyright info
  - [ ] Links (About, GitHub, Docs)
  - [ ] Mobile responsive

- [x] **Toast/Notification Component** (`helper.js`)
  - [x] Success notifications
  - [x] Error notifications
  - [ ] Warning notifications
  - [ ] Info notifications

---

## 🔧 Services & Utilities

- [ ] **MarkdownService**
  - [ ] `parseMarkdown()` - Convert markdown to HTML
  - [ ] `extractTitle()` - Extract H1 from markdown
  - [ ] `sanitizeContent()` - Sanitize HTML output

- [ ] **SlugService**
  - [ ] `generateSlug()` - Create URL-friendly slug
  - [ ] `isSlugAvailable()` - Check slug uniqueness
  - [ ] `generateUniqueSlug()` - Auto-generate if taken

- [ ] **TokenService**
  - [ ] `generateEditToken()` - Create unique UUID token
  - [ ] `validateToken()` - Verify token validity

- [ ] **AuthService**
  - [ ] `hashPassword()` - Hash user password
  - [ ] `verifyPassword()` - Verify password against hash
  - [ ] `generateRememberToken()` - Create remember me token
  - [ ] `createSession()` - Create user session
  - [ ] `destroySession()` - Destroy user session

- [ ] **AnalyticsService** (Optional)
  - [ ] `trackView()` - Record post view
  - [ ] `getPostStats()` - Get analytics data

---

## 🔐 Middlewares

- [x] **Auth** (`auth.ts`) - Check if user is authenticated
  - [x] Verify session cookie
  - [x] Load user data
  - [x] Redirect to login if not authenticated
  
- [x] **OptionalAuth** (`optionalAuth.ts`) - Load user if authenticated
  - [x] Check session without redirect
  - [x] Used for pages that work for both guests and users
  
- [ ] **Guest** - Redirect authenticated users away from login/register
- [ ] **ValidateEditToken** - Verify edit token before allowing edits
- [ ] **CheckPostOwnership** - Verify user owns the post or has edit token
- [ ] **RateLimiter** - Prevent spam publishing
- [ ] **ValidateMarkdown** - Ensure valid markdown content
- [x] **Inertia** (`inertia.ts`) - Handle Inertia.js requests

---

## 🌐 Routes

### Web Routes (`routes/web.ts`)

#### Public Routes
- [x] `GET /` - Homepage
- [x] `POST /publish` - Create new post (with OptionalAuth)
- [x] `GET /success` - Success page with URLs (with OptionalAuth)
- [x] `GET /:slug` - View post
- [x] `GET /:slug/edit/:token` - Edit form
- [x] `POST /:slug/edit/:token` - Update post

#### Authentication Routes
- [x] `GET /login` - Login page
- [x] `POST /login` - Process login
- [x] `GET /register` - Register page
- [x] `POST /register` - Process registration
- [x] `POST /logout` - Logout
- [x] `GET /google/redirect` - Google OAuth redirect
- [x] `GET /google/callback` - Google OAuth callback
- [x] `GET /forgot-password` - Forgot password page
- [x] `POST /forgot-password` - Send reset link
- [x] `GET /reset-password/:id` - Reset password page
- [x] `POST /reset-password` - Process password reset

#### Protected Routes (Require Auth)
- [x] `GET /home` - User dashboard/my posts
- [x] `GET /profile` - User profile page
- [x] `POST /change-profile` - Update profile
- [x] `POST /change-password` - Change password
- [x] `GET /claim/:slug` - Claim anonymous post (with token query)
- [ ] `DELETE /users` - Delete users (admin only)

### API Routes
- [x] `GET /api/check-slug/:slug` - Check slug availability
- [x] `POST /api/preview` - Preview markdown content
- [x] `POST /api/s3/signed-url` - S3 upload URL
- [x] `GET /api/s3/public-url/:fileKey` - Get S3 public URL
- [x] `GET /api/s3/health` - S3 health check
- [ ] `GET /api/posts/:slug/stats` - Get post statistics

--- 

## 🎯 Features Implementation

### Core Features
- [x] Instant markdown publishing
- [x] Custom URL slugs with validation
- [x] No registration required (anonymous posting)
- [x] Secure edit links with unique tokens (UUID)
- [x] One-time edit link display with warning
- [x] User authentication (login/register)
- [x] Claim anonymous posts
- [x] Auto-claim when logged in during publish
- [x] User dashboard with post management
- [x] Author attribution on claimed posts
- [x] Responsive design (mobile-first)
- [x] View counter with last viewed timestamp
- [x] Dynamic header based on auth status
- [x] Reusable Header component
- [x] Google OAuth integration
- [x] Password reset functionality
- [x] Avatar upload (S3/Wasabi)

### Advanced Features (Optional)
- [x] Markdown file upload
- [x] Live markdown preview
- [x] Syntax highlighting for code blocks (highlight.js)
- [x] Markdown-it with plugins (anchor, typographer)
- [ ] Dark mode toggle (in progress)
- [ ] Export to PDF
- [ ] Post analytics dashboard
- [ ] Custom themes
- [ ] Expiring posts (TTL)
- [ ] Password protection for posts
- [ ] Custom domains
- [ ] Social share buttons
- [ ] Post search/filtering
- [ ] Post categories/tags

---

## 🧪 Testing

- [ ] Unit tests for services
- [ ] Integration tests for controllers
- [ ] E2E tests for critical flows
  - [ ] Publish flow (anonymous)
  - [ ] Publish flow (authenticated)
  - [ ] Edit flow with token
  - [ ] Edit flow as owner
  - [ ] View flow
  - [ ] Claim flow
  - [ ] Login/register flow
- [ ] Test edit token security
- [ ] Test post ownership validation
- [ ] Test claim restrictions (already claimed posts)
- [ ] Test slug uniqueness
- [ ] Test markdown rendering
- [ ] Test authentication middleware

---

## 📦 Deployment Preparation

- [ ] Create Dockerfile
- [ ] Setup production environment variables
- [ ] Configure production database
- [ ] Setup Redis for caching (optional)
- [ ] Configure CDN for static assets
- [ ] Setup domain (slugpost.com)
- [ ] SSL certificate configuration
- [ ] Setup monitoring & logging
- [ ] Create backup strategy
- [ ] Performance optimization

---

## 📚 Documentation

- [x] README.md
- [ ] API documentation
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Code of conduct
- [ ] Changelog

---

## 🐛 Bug Fixes & Improvements

- [ ] Handle duplicate slugs gracefully
- [ ] Validate markdown file size limits
- [ ] Sanitize user input
- [ ] Handle long markdown content
- [ ] Optimize database queries
- [ ] Add proper error handling
- [ ] Implement logging system

---

## 🎯 New Features - Auto Claim & Success Page Enhancement

### Success Page Improvements
- [x] **Replace Register button with Claim button** on success page
  - [x] Show "Claim This Post" button instead of "Register" 
  - [x] Button should claim the post if user is logged in
  - [x] If not logged in, redirect to login page
  - [x] After login, auto-redirect back to claim the post

### Auto-Claim on Publish
- [x] **Auto-claim post when user is logged in during publish**
  - [x] Check if `request.cookies.auth_id` exists in `PostController.store()`
  - [x] Get user ID from session (similar to auth middleware logic):
    - [x] Query sessions table with auth_id cookie
    - [x] Get user_id from session
    - [x] Set `author_id` to user_id when creating post
  - [x] If user is logged in, automatically set author_id
  - [x] If not logged in, leave author_id as null (anonymous post)

### Implementation Details
- [x] Update `PostController.store()` to check authentication
- [x] Add session lookup logic (reuse pattern from `auth.ts` middleware)
- [x] Update success page to conditionally show Claim button
- [x] Create claim endpoint for success page button
- [x] Handle claim flow with proper validation
- [x] Migrate success page from HTML to Svelte/Inertia
  - [x] Create `Success.svelte` component
  - [x] Update `PostController.success()` to use Inertia
  - [x] Add user authentication detection in header
  - [x] Show user dropdown when logged in
  - [x] Show login/register buttons when not logged in

---

## 🚀 Launch Checklist

- [ ] All core features implemented
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Documentation complete
- [ ] Production environment ready
- [ ] Domain configured
- [ ] SSL active
- [ ] Monitoring setup
- [ ] Backup system active

---

**Last Updated:** 2025-01-11  
**Status:** 🚧 In Development  
**Version:** 0.5.0 (Svelte/Inertia Migration, Auto-Claim, Reusable Components)

### Recent Updates (v0.5.0)
- ✅ Migrated Success page to Svelte/Inertia
- ✅ Migrated EditPost page to Svelte/Inertia  
- ✅ Migrated Home page to Svelte/Inertia
- ✅ Updated Profile page to SlugPost branding
- ✅ Created reusable Header component
- ✅ Implemented auto-claim feature
- ✅ Added conditional claim button based on status
- ✅ Mobile-first responsive design across all pages
- ✅ OptionalAuth middleware for hybrid pages
