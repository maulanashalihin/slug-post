import AuthController from "../app/controllers/AuthController"; 
import Auth from "../app/middlewares/auth"
import OptionalAuth from "../app/middlewares/optionalAuth"
import HomeController from "../app/controllers/HomeController";
import PostController from "../app/controllers/PostController";
import AssetController from "../app/controllers/AssetController";
import S3Controller from "../app/controllers/S3Controller";
import SitemapController from "../app/controllers/SitemapController";
import HyperExpress from 'hyper-express';

const Route = new HyperExpress.Router();

/**
 * SEO Routes
 * Routes for search engine optimization
 * ------------------------------------------------
 * GET  /sitemap.xml - XML sitemap
 * GET  /robots.txt - Robots.txt file
 */
Route.get("/sitemap.xml", SitemapController.sitemap);
Route.get("/robots.txt", SitemapController.robots);

/**
 * Public Routes
 * These routes are accessible without authentication
 * ------------------------------------------------
 * GET  / - Home page
 * GET  /about - About page
 * GET  /docs - Documentation page
 * GET  /tos - Terms of Service page
 * GET  /privacy - Privacy Policy page
 */
Route.get("/", HomeController.index);
Route.get("/about", HomeController.about);
Route.get("/docs", HomeController.docs);
Route.get("/tos", HomeController.tos);
Route.get("/privacy", HomeController.privacy);

/**
 * Post Routes
 * Routes for handling markdown posts
 * ------------------------------------------------
 * GET  /api/check-slug/:slug - Check slug availability
 * POST /api/preview - Preview markdown content
 * POST /publish - Create new post
 * GET  /success - Success page after publishing
 * GET  /:slug - View post
 * GET  /:slug/edit/:token - Edit post form
 * POST /:slug/edit/:token - Update post
 */
Route.get("/api/check-slug/:slug", PostController.checkSlug);
Route.post("/api/preview", PostController.preview);
Route.post("/publish", [OptionalAuth], PostController.store);
Route.get("/success", [OptionalAuth], PostController.success);

/**
 * S3 Routes
 * Routes for handling S3 operations
 * ------------------------------------------------
 * POST /api/s3/signed-url - Generate signed URL for file upload
 * POST /api/s3/product-image-url - Generate signed URL for product images
 * GET  /api/s3/public-url/:fileKey - Get public URL for existing file
 * GET  /api/s3/health - S3 service health check
 * POST /api/upload-thumbnail - Upload post thumbnail
 */
Route.post("/api/s3/signed-url", [Auth], S3Controller.getSignedUrl); 
Route.get("/api/s3/public-url/:fileKey", S3Controller.getPublicUrl);
Route.get("/api/s3/health", S3Controller.health);
Route.post("/api/upload-thumbnail", AssetController.uploadThumbnail);
Route.get("/api/assets", [Auth], AssetController.listAssets);
Route.post("/api/assets/upload", [Auth], AssetController.uploadAsset);
Route.delete("/api/assets/:id", [Auth], AssetController.deleteAsset);
/**
 * Authentication Routes
 * Routes for handling user authentication
 * ------------------------------------------------
 * GET   /login - Login page
 * POST  /login - Process login
 * GET   /register - Registration page
 * POST  /register - Process registration
 * POST  /logout - Logout user
 * GET   /google/redirect - Google OAuth redirect
 * GET   /google/callback - Google OAuth callback
 */
Route.get("/login", AuthController.loginPage);
Route.post("/login", AuthController.processLogin);
Route.get("/register", AuthController.registerPage);
Route.post("/register", AuthController.processRegister);
Route.post("/logout", AuthController.logout);
Route.get("/google/redirect", AuthController.redirect);
Route.get("/google/callback", AuthController.googleCallback);

/**
 * Password Reset Routes
 * Routes for handling password reset
 * ------------------------------------------------
 * GET   /forgot-password - Forgot password page
 * POST  /forgot-password - Send reset password link
 * GET   /reset-password/:id - Reset password page
 * POST  /reset-password - Process password reset
 */
Route.get("/forgot-password", AuthController.forgotPasswordPage);
Route.post("/forgot-password", AuthController.sendResetPassword);
Route.get("/reset-password/:id", AuthController.resetPasswordPage);
Route.post("/reset-password", AuthController.resetPassword);

/**
 * Protected Routes
 * These routes require authentication
 * ------------------------------------------------
 * GET   /home - User dashboard
 * GET   /profile - User profile
 * POST  /change-profile - Update profile
 * POST  /change-password - Change password
 * DELETE /users - Delete users (admin only)
 */
Route.get("/home", [Auth], AuthController.homePage);
Route.get("/assets", [Auth], AssetController.assetsPage);
Route.get("/profile", [Auth], AuthController.profilePage);
Route.post("/change-profile", [Auth], AuthController.changeProfile);
Route.post("/change-password", [Auth], AuthController.changePassword);
Route.delete("/users", [Auth], AuthController.deleteUsers);

/**
 * Static Asset Handling Routes
 * 
 * 1. Dist Assets (/assets/:file)
 * Serves compiled and bundled assets from the dist/assets directory
 * - Handles JavaScript files (*.js) with proper content type
 * - Handles CSS files (*.css) with proper content type
 * - Implements in-memory caching for better performance
 * - Sets long-term browser cache headers (1 year)
 * Example URLs:
 * - /assets/app.1234abc.js
 * - /assets/main.5678def.css
 */
Route.get("/assets/:file", AssetController.distFolder);

/**
 * Post Dynamic Routes
 * These must come BEFORE the public assets catch-all
 * ------------------------------------------------
 * GET  /claim/:slug - Claim post (requires login)
 * GET  /:slug - View post (Renders Markdown or HTML based on post format)
 * GET  /:slug/edit/:token - Edit post form
 * POST /:slug/edit/:token - Update post
 * GET  /:slug/settings/:token - Post settings page
 * POST /:slug/settings/:token - Update post settings
 */
Route.get("/claim/:slug", PostController.claim);
Route.get("/:slug/settings/:token", PostController.settings);
Route.post("/:slug/settings/:token", PostController.updateSettings);
Route.get("/:slug/visual/:token", PostController.visualBuilder);
Route.get("/:slug/edit/:token", PostController.edit);
Route.post("/:slug/edit/:token", PostController.update);
Route.get("/:slug", PostController.show);

/**
 * 2. Public Assets (/*) - Catch-all Route
 * Serves static files from the public directory
 * - Must be the LAST route in the file
 * - Only serves files with allowed extensions
 * - Returns 404 for paths without extensions
 * - Implements security checks against unauthorized access
 * 
 * Allowed file types:
 * - Images: .ico, .png, .jpeg, .jpg, .gif, .svg
 * - Documents: .txt, .pdf
 * - Fonts: .woff, .woff2, .ttf, .eot
 * - Media: .mp4, .webm, .mp3, .wav
 * - Web: .css, .js
 * 
 * Example URLs:
 * - /images/logo.png
 * - /documents/terms.pdf
 * - /fonts/roboto.woff2
 */
Route.get("/public/*", AssetController.publicFolder);

export default Route;