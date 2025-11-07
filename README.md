# 📝 SlugPost

> Publish and share your markdown files instantly with beautiful web previews - no registration required!

**🌐 Try it now at [slugpost.com](https://slugpost.com)**

> Built with [Laju.dev](https://laju.dev) - A modern full-stack TypeScript framework

## 💡 Why SlugPost?

### The Story Behind It

I built this because I honestly felt the need. You know how it is—after using AI tools (ChatGPT/Gemini/etc.), you get markdown text output, but then you're stuck when trying to share the results...

**The Problems:**
- 📄 Send a .md file → people are too lazy to download it
- 📋 Copy-paste directly to chat/email → formatting gets destroyed 😭
- 🔄 Manual conversion → tedious and time-consuming

**The Solution: SlugPost**

Just paste your markdown text here, click publish, and it instantly becomes a clean, beautiful, and responsive web page.

✅ **No registration required** to publish  
✅ **Instant & free** with no limits  
✅ **Get a shareable link** that's easy to distribute  

Perfect for sharing AI outputs, notes, or draft writings in a readable format.

## ✨ Features

- **🚀 Instant Publishing** - Upload markdown files or paste content directly
- **🔗 Custom URLs** - Choose your own slug for easy sharing
- **👤 No Registration** - Start publishing immediately without creating an account
- **🔐 Secure Edit Links** - Get a unique, one-time-shown edit link after publishing
- **👑 Claim Ownership** - Register/login to claim anonymous posts and manage them
- **📱 Responsive Design** - Beautiful reading experience on any device
- **⚡ Lightning Fast** - Built on high-performance HyperExpress framework
- **🎨 Clean UI** - Modern interface with TailwindCSS and Svelte 5

## 🎨 Color Branding

SlugPost uses a clean, minimal color palette focused on professionalism and clarity:

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Primary Blue** | `#3B82F6` (blue-600) | Main branding, primary CTAs, links |
| **Slate Gray** | `#334155` - `#F8FAFC` | Text, secondary buttons, borders |
| **Orange Accent** | `#F59E0B` (orange-500) | Warnings, important notices only |

### Design Philosophy

**Less is More**: We intentionally limit our color palette to maintain a professional, clean aesthetic:
- **Primary Blue** - Used sparingly for main actions and branding
- **Slate Neutrals** - The workhorse colors for 90% of the UI
- **Orange** - Reserved exclusively for warnings and critical information

This approach prevents "color fatigue" and ensures important elements stand out.

### TailwindCSS Configuration

```js
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

## 🛠️ Tech Stack

### Framework

SlugPost is built on top of **[Laju.dev](https://laju.dev)**, a modern full-stack TypeScript framework created by Maulana Shalihin. Laju provides:

- **⚡ High Performance** - Built on HyperExpress for blazing-fast response times
- **📦 Modern Architecture** - Combines the best of MVC patterns with modern tooling
- **🔧 Developer Experience** - Type-safe development with TypeScript throughout
- **🎨 Full-Stack Integration** - Seamless integration between backend and frontend with Inertia.js
- **🚀 Production Ready** - Battle-tested architecture with built-in best practices

Learn more at [laju.dev](https://laju.dev)

### Backend
- **[HyperExpress](https://github.com/kartikk221/hyper-express)** - High-performance web server
- **[Knex.js](https://knexjs.org)** - SQL query builder
- **[BetterSQLite3](https://github.com/WiseLibs/better-sqlite3)** - Fast, embedded database
- **[Squirrelly](https://squirrelly.js.org/)** - Lightweight template engine
- **TypeScript** - Type-safe development

### Frontend
- **[Svelte 5](https://svelte.dev)** - Reactive UI framework
- **[Inertia.js](https://inertiajs.com)** - Modern monolith architecture
- **[TailwindCSS](https://tailwindcss.com)** - Utility-first CSS
- **[@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)** - Beautiful markdown styling
- **[Vite](https://vitejs.dev)** - Fast build tool

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Quick Start

### Try Online

**No installation needed!** Visit [https://slugpost.com](https://slugpost.com) to start publishing markdown instantly.

### Local Installation

```bash
# Clone the repository
git clone https://github.com/maulanashalihin/slug-post.git
cd slug-post

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run database migrations
npx knex migrate:latest

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DB_CONNECTION=sqlite3
DB_FILENAME=./dev.sqlite3

# Application
APP_NAME="SlugPost"
APP_URL=http://localhost:3000
 
```

## 📖 Usage

### Publishing Markdown

1. **Visit Homepage** - Navigate to the application homepage
2. **Choose Input Method**:
   - Upload a `.md` file, or
   - Paste markdown content directly
3. **Customize Slug** - Enter your desired URL slug (e.g., `my-awesome-post`)
4. **Publish** - Click publish to generate your URLs
5. **Save Your Edit Link** - ⚠️ **IMPORTANT**: You'll receive a unique edit link that's shown **only once**. Save it securely!
   - Public URL: `https://slugpost.com/my-awesome-post`
   - Edit URL: `https://slugpost.com/my-awesome-post/edit/abc123xyz` (unique token)
6. **Share** - Share the public URL with anyone

### Editing Published Content

- **No Login Required** - Edit your content using the unique edit link
- **Secure Access** - Only those with the edit link can modify the content
- **One-Time Display** - The edit link is shown only once after publishing, so save it immediately
- **Lost Edit Link?** - Without the edit link, content cannot be edited (security by design)

### Claiming Anonymous Posts

- **Register/Login** - Create an account or login to claim posts
- **Claim Ownership** - When editing an unclaimed post (no author), you can claim it
- **Manage Your Posts** - View and manage all your claimed posts from your dashboard
- **Permanent Access** - Once claimed, you don't need the edit link anymore
- **Author Attribution** - Claimed posts show your name as the author

### Example Workflow

**Step 1: Publish**
```markdown
# My Awesome Post

This is **bold** and this is *italic*.

- List item 1
- List item 2

[Link to something](https://example.com)
```

**Step 2: Receive URLs**
- Public URL: `https://slugpost.com/my-awesome-post`
- Edit URL: `https://slugpost.com/my-awesome-post/edit/7f3a9b2c1d` ⚠️ Save this!

**Step 3: Share**
- Share the public URL with anyone
- Keep the edit URL private for future updates

### Claiming Posts Workflow

**Scenario: You want to claim an anonymous post**

**Step 1: Edit Anonymous Post**
- Visit your edit URL: `https://slugpost.com/my-awesome-post/edit/7f3a9b2c1d`
- Notice the post has no author (anonymous)

**Step 2: See Claim Option**
- On the edit page, you'll see a "Claim This Post" button
- Click to proceed with claiming

**Step 3: Login or Register**
- If not logged in, you'll be redirected to login/register
- Create an account or login with existing credentials

**Step 4: Claim Completed**
- After authentication, the post is automatically claimed
- The post's `author_id` is set to your user ID
- You can now access this post from your dashboard

**Step 5: Manage Your Posts**
- Visit your dashboard to see all claimed posts
- Edit posts without needing the edit link
- View statistics and manage content

**Note:** Once a post is claimed by a user, it cannot be claimed by others. Only the owner can edit it.

## 🏗️ Project Structure

```
slugpost/
├── app/
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Custom middleware
│   └── services/         # Business logic
├── resources/
│   ├── js/
│   │   ├── Pages/        # Svelte pages
│   │   ├── Components/   # Reusable components
│   │   └── app.js        # Frontend entry point
│   └── views/            # Server-side templates
├── routes/               # Route definitions
├── migrations/           # Database migrations
├── public/               # Static assets
└── server.ts             # Application entry point
```

## 🗄️ Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | User's full name |
| `email` | VARCHAR(255) | Unique email (indexed) |
| `phone` | VARCHAR(255) | Phone number |
| `password` | VARCHAR(180) | Hashed password |
| `is_verified` | BOOLEAN | Email verification status |
| `is_admin` | BOOLEAN | Admin privileges |
| `membership_date` | TIMESTAMP | Membership start date |
| `remember_me_token` | VARCHAR | Remember me token |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Posts Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `slug` | VARCHAR(255) | Unique URL slug (indexed) |
| `content` | TEXT | Markdown content |
| `title` | VARCHAR(500) | Extracted title from markdown |
| `edit_token` | VARCHAR(100) | Unique edit token (indexed) |
| `author_id` | UUID | Foreign key to users (nullable) |
| `view_count` | INTEGER | Number of views |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `last_viewed_at` | TIMESTAMP | Last view timestamp |

### Post Analytics Table (Optional)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `post_id` | INTEGER | Foreign key to posts |
| `ip_address` | VARCHAR(45) | Visitor IP (IPv6 support) |
| `user_agent` | VARCHAR(500) | Browser user agent |
| `referer` | VARCHAR(500) | Referrer URL |
| `country` | VARCHAR(2) | Country code |
| `viewed_at` | TIMESTAMP | View timestamp |

## 🔧 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run database migrations
npx knex migrate:latest

# Rollback last migration
npx knex migrate:rollback

# Create new migration
npx knex migrate:make migration_name

# Seed database with sample data
npx knex seed:run
```

### Creating a New Page

1. Create controller in `app/controllers/`
2. Add route in `routes/web.ts`
3. Create Svelte page in `resources/js/Pages/`

Example:

```typescript
// app/controllers/MarkdownController.ts
import { Request, Response } from "../../type";

class MarkdownController {
  public async index(request: Request, response: Response) {
    return response.inertia("markdown/index");
  }
}

export default new MarkdownController();
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Using Docker

```bash
# Build image
docker build -t slugpost .

# Run container
docker run -p 3000:3000 slugpost
```

### Environment Setup

Ensure production environment variables are set:

```env
NODE_ENV=production
APP_URL=https://slugpost.com
```

## 🤝 Contributing

This is an open-source project! Contributions are welcome and appreciated. Please feel free to submit a Pull Request.

1. Fork the repository at [https://github.com/maulanashalihin/slug-post](https://github.com/maulanashalihin/slug-post)
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🔗 Links

- **🌐 Live App**: [https://slugpost.com](https://slugpost.com) - Try it now!
- **📦 GitHub Repository**: [https://github.com/maulanashalihin/slug-post](https://github.com/maulanashalihin/slug-post)
- **🐛 Issues & Bug Reports**: [https://github.com/maulanashalihin/slug-post/issues](https://github.com/maulanashalihin/slug-post/issues)

## 👨‍💻 Author

**Maulana Shalihin**

I'm very open to feedback! If you have suggestions, bug reports, or feature requests, feel free to:
- Open an issue on [GitHub](https://github.com/maulanashalihin/slug-post/issues)
- Or contribute directly via Pull Request

## 🙏 Acknowledgments

- Built with **[Laju.dev](https://laju.dev)** framework by Maulana Shalihin
- Powered by modern web technologies and best practices
- Inspired by the need for simple, fast markdown sharing
- Thanks to all open-source contributors and the community

## 📮 Support

If you have any questions or need help, please:
- Open an issue on [GitHub](https://github.com/maulanashalihin/slug-post/issues)
- Star the repository if you find it useful ⭐
- Share it with others who might benefit from it

---

Made with ❤️ for the markdown community
