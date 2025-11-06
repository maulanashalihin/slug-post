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
- [ ] Create migration for posts table
  - [ ] id (PRIMARY KEY)
  - [ ] slug (VARCHAR, UNIQUE, INDEXED)
  - [ ] content (TEXT)
  - [ ] title (VARCHAR)
  - [ ] edit_token (VARCHAR, UNIQUE, INDEXED)
  - [ ] author_id (UUID, FOREIGN KEY to users, NULLABLE)
  - [ ] view_count (INTEGER, DEFAULT 0)
  - [ ] created_at (TIMESTAMP)
  - [ ] updated_at (TIMESTAMP)
  - [ ] last_viewed_at (TIMESTAMP)

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

- [x] **Success Page** (`/success`)
  - [x] Display public URL
  - [x] Display edit URL dengan warning ⚠️
  - [x] Copy to clipboard buttons
  - [x] Warning message: "Save edit link - shown only once!"
  - [ ] Social share buttons (optional)

- [x] **View Post** (`/:slug`)
  - [x] Display rendered markdown dengan @tailwindcss/typography
  - [x] Responsive design
  - [x] View counter
  - [x] Meta tags untuk SEO
  - [x] Share buttons (optional)
  - [x] Print-friendly layout

- [x] **Edit Post** (`/:slug/edit/:token`)
  - [x] Validate edit token
  - [x] Load existing markdown content
  - [x] Check if post has author (claimed or not)
  - [x] Show "Claim This Post" button if no author
  - [x] Textarea untuk edit content
  - [x] Preview markdown
  - [x] Update button
  - [x] Cancel button
  - [x] Last updated timestamp

### Authentication Pages
- [ ] **Login Page** (`/login`)
  - [ ] Email input
  - [ ] Password input
  - [ ] Remember me checkbox
  - [ ] Login button
  - [ ] Link to register page
  - [ ] Forgot password link

- [ ] **Register Page** (`/register`)
  - [ ] Name input
  - [ ] Email input
  - [ ] Phone input (optional)
  - [ ] Password input
  - [ ] Confirm password input
  - [ ] Register button
  - [ ] Link to login page

- [ ] **Dashboard** (`/dashboard`)
  - [ ] List of user's claimed posts
  - [ ] Post statistics (views, created date)
  - [ ] Quick edit/delete actions
  - [ ] Create new post button
  - [ ] User profile section

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
    - [x] Set author_id if user is logged in
    - [x] Save to database
    - [x] Return success with URLs
  
  - [x] `show()` - Display post by slug
    - [x] Find post by slug
    - [x] Increment view counter
    - [x] Update last_viewed_at
    - [x] Load author info if exists
    - [ ] Render markdown to HTML
    - [ ] Return view
  
  - [x] `edit()` - Show edit form
    - [x] Validate edit token OR check if user owns post
    - [x] Find post by slug and token
    - [x] Check if post can be claimed (no author_id)
    - [ ] Return edit view with claim option
  
  - [x] `update()` - Update post
    - [x] Validate edit token OR check ownership
    - [x] Validate markdown content
    - [x] Extract new title
    - [x] Update database
    - [ ] Redirect to view post
  
  - [ ] `claim()` - Claim anonymous post
    - [ ] Check if user is authenticated
    - [ ] Validate edit token
    - [ ] Check if post has no author
    - [ ] Set author_id to current user
    - [ ] Redirect to dashboard with success message

- [ ] **DashboardController**
  - [ ] `index()` - Display user dashboard
    - [ ] Load all posts by user
    - [ ] Show statistics
    - [ ] Return dashboard view

---

## 🛠️ Services & Utilities

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

- [ ] **Auth** - Check if user is authenticated
- [ ] **Guest** - Redirect authenticated users away from login/register
- [ ] **ValidateEditToken** - Verify edit token before allowing edits
- [ ] **CheckPostOwnership** - Verify user owns the post or has edit token
- [ ] **RateLimiter** - Prevent spam publishing
- [ ] **ValidateMarkdown** - Ensure valid markdown content
- [ ] **CORS** - Configure CORS if needed

---

## 🌐 Routes

### Web Routes (`routes/web.ts`)

#### Public Routes
- [ ] `GET /` - Homepage
- [ ] `POST /publish` - Create new post
- [ ] `GET /success` - Success page with URLs
- [ ] `GET /p/:slug` - View post
- [ ] `GET /p/:slug/edit/:token` - Edit form
- [ ] `POST /p/:slug/edit/:token` - Update post

#### Authentication Routes
- [ ] `GET /login` - Login page
- [ ] `POST /login` - Process login
- [ ] `GET /register` - Register page
- [ ] `POST /register` - Process registration
- [ ] `POST /logout` - Logout

#### Protected Routes (Require Auth)
- [ ] `GET /dashboard` - User dashboard
- [ ] `POST /p/:slug/claim/:token` - Claim anonymous post
- [ ] `GET /my-posts` - List user's posts
- [ ] `DELETE /p/:slug` - Delete owned post

### API Routes (Optional)
- [ ] `POST /api/validate-slug` - Check slug availability
- [ ] `GET /api/posts/:slug/stats` - Get post statistics

---

## 🎨 UI Components (Svelte)

- [ ] **MarkdownEditor** - Textarea with preview
- [ ] **MarkdownPreview** - Rendered markdown display
- [ ] **CopyButton** - Copy to clipboard functionality
- [ ] **ShareButtons** - Social media sharing (optional)
- [ ] **Toast/Notification** - Success/error messages
- [ ] **LoadingSpinner** - Loading states
- [ ] **SlugInput** - Custom slug input with validation
- [ ] **FileUpload** - Drag & drop markdown file upload
- [ ] **ClaimButton** - Claim post button with confirmation
- [ ] **AuthForm** - Reusable login/register form components
- [ ] **PostCard** - Display post in dashboard/list
- [ ] **UserMenu** - User dropdown menu with logout

---

## 🎯 Features Implementation

### Core Features
- [ ] Instant markdown publishing
- [ ] Custom URL slugs
- [ ] No registration required
- [ ] Secure edit links with unique tokens
- [ ] One-time edit link display
- [ ] User authentication (login/register)
- [ ] Claim anonymous posts
- [ ] User dashboard with post management
- [ ] Author attribution on claimed posts
- [ ] Responsive design
- [ ] View counter

### Advanced Features (Optional)
- [ ] Markdown file upload
- [ ] Live markdown preview
- [ ] Syntax highlighting for code blocks
- [ ] Dark mode toggle
- [ ] Export to PDF
- [ ] Post analytics dashboard
- [ ] Custom themes
- [ ] Expiring posts (TTL)
- [ ] Password protection for posts
- [ ] Custom domains

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

**Last Updated:** 2025-01-06  
**Status:** 🚧 In Development  
**Version:** 0.2.0 (Added Authentication & Claim Features)
