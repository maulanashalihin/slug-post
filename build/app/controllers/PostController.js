"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const View_1 = require("../services/View");
const DB_1 = __importDefault(require("../services/DB"));
const crypto_1 = require("crypto");
const markdown_it_1 = __importDefault(require("markdown-it"));
const highlight_js_1 = __importDefault(require("highlight.js"));
const markdown_it_anchor_1 = __importDefault(require("markdown-it-anchor"));
const md = new markdown_it_1.default({
    html: false,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight: function (str, lang) {
        if (lang && highlight_js_1.default.getLanguage(lang)) {
            try {
                return highlight_js_1.default.highlight(str, { language: lang }).value;
            }
            catch (__) { }
        }
        return '';
    }
});
md.use(markdown_it_anchor_1.default, {
    permalink: false,
    slugify: (s) => {
        return s
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});
class PostController {
    async checkSlug(request, response) {
        try {
            const { slug } = request.params;
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                return response.json({
                    available: false,
                    message: "Slug must contain only lowercase letters, numbers, and hyphens"
                });
            }
            const existingPost = await DB_1.default.from("posts").where("slug", slug).first();
            if (existingPost) {
                return response.json({
                    available: false,
                    message: "This slug is already taken"
                });
            }
            return response.json({
                available: true,
                message: "This slug is available"
            });
        }
        catch (error) {
            console.error("Error checking slug:", error);
            return response.status(500).json({
                available: false,
                message: "Error checking slug availability"
            });
        }
    }
    async store(request, response) {
        try {
            const body = await request.json();
            const { content, slug } = body;
            let { format } = body;
            if (!format) {
                format = 'markdown';
            }
            if (format !== 'markdown' && format !== 'html') {
                return response.status(400).json({
                    error: "Invalid format. Must be 'markdown' or 'html'"
                });
            }
            if (!content || !slug) {
                return response.status(400).json({
                    error: "Content and slug are required"
                });
            }
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                return response.status(400).json({
                    error: "Slug must contain only lowercase letters, numbers, and hyphens"
                });
            }
            const existingPost = await DB_1.default.from("posts").where("slug", slug).first();
            if (existingPost) {
                return response.status(409).json({
                    error: "This slug is already taken. Please choose another one."
                });
            }
            let title = slug;
            if (format === 'markdown') {
                const titleMatch = content.match(/^#\s+(.+)$/m);
                if (titleMatch) {
                    title = titleMatch[1].trim();
                }
            }
            else if (format === 'html') {
                const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
                if (h1Match) {
                    title = h1Match[1].replace(/<[^>]*>?/gm, '').trim();
                }
            }
            const editToken = (0, crypto_1.randomUUID)();
            const authorId = request?.user?.id || null;
            const postId = await DB_1.default.table("posts").insert({
                slug,
                content,
                title,
                format,
                edit_token: editToken,
                author_id: authorId,
                view_count: 0,
                created_at: DB_1.default.fn.now(),
                updated_at: DB_1.default.fn.now(),
            });
            return response.json({
                success: true,
                post_id: postId[0],
                slug,
                public_url: `/${slug}`,
                edit_url: `/${slug}/edit/${editToken}`,
                edit_token: editToken,
            });
        }
        catch (error) {
            console.error("Error creating post:", error);
            return response.status(500).json({
                error: "Failed to create post. Please try again."
            });
        }
    }
    async success(request, response) {
        const { slug, token } = request.query;
        if (!slug || !token) {
            return response.redirect("/");
        }
        const post = await DB_1.default.from("posts")
            .where("slug", slug)
            .where("edit_token", token)
            .first();
        const isClaimed = post?.author_id ? true : false;
        return response.inertia("Success", {
            slug,
            edit_token: token,
            user: request?.user || null,
            is_claimed: isClaimed
        });
    }
    async show(request, response) {
        try {
            const { slug } = request.params;
            const post = await DB_1.default.from("posts").where("slug", slug).first();
            if (!post) {
                return response.status(404).type("html").send("<h1>Post not found</h1>");
            }
            await DB_1.default.table("posts")
                .where("id", post.id)
                .increment("view_count", 1)
                .update({
                last_viewed_at: DB_1.default.fn.now()
            });
            if (post.format === 'html') {
                return response.type("html").send(post.content);
            }
            let author = null;
            if (post.author_id) {
                author = await DB_1.default.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }
            let htmlContent = md.render(post.content);
            const descriptionMatch = post.content.match(/^(?!#)(.+)$/m);
            const description = descriptionMatch
                ? descriptionMatch[1].trim().substring(0, 160)
                : post.title;
            const formatDate = (timestamp) => {
                return new Date(timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };
            const html = (0, View_1.view)("post.html", {
                title: post.title,
                description,
                content: htmlContent,
                view_count: post.view_count,
                created_at: formatDate(post.created_at),
                updated_at: formatDate(post.updated_at),
                author: author ? { name: author.name } : null
            });
            return response.type("html").send(html);
        }
        catch (error) {
            console.error("Error showing post:", error);
            return response.status(500).type("html").send("<h1>Error loading post</h1>");
        }
    }
    async edit(request, response) {
        try {
            const { slug, token } = request.params;
            const post = await DB_1.default.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();
            if (!post) {
                return response.status(404).type("html").send("<h1>Invalid edit link</h1>");
            }
            let author = null;
            if (post.author_id) {
                author = await DB_1.default.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }
            let user = null;
            if (request.cookies.auth_id) {
                const session = await DB_1.default.from("sessions").where("id", request.cookies.auth_id).first();
                if (session) {
                    user = await DB_1.default.from("users").where("id", session.user_id).select(["id", "name", "email", "phone", "is_admin", "is_verified"]).first();
                }
            }
            const editorPage = post.format === 'html' ? 'HtmlEditor' : 'EditPost';
            return response.inertia(editorPage, {
                post: {
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    content: post.content,
                    format: post.format || 'markdown',
                    view_count: post.view_count,
                    created_at: post.created_at,
                    updated_at: post.updated_at
                },
                user,
                author: author ? { name: author.name, email: author.email } : null,
                edit_token: token
            });
        }
        catch (error) {
            console.error("Error loading edit page:", error);
            return response.status(500).type("html").send("<h1>Error loading edit page</h1>");
        }
    }
    async update(request, response) {
        try {
            const { slug, token } = request.params;
            const body = await request.json();
            const { content } = body;
            let { format } = body;
            if (!content) {
                return response.status(400).json({
                    error: "Content is required"
                });
            }
            const post = await DB_1.default.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();
            if (!post) {
                return response.status(404).json({
                    error: "Invalid edit link"
                });
            }
            if (!format) {
                format = post.format || 'markdown';
            }
            let title = post.title;
            if (format === 'markdown') {
                const titleMatch = content.match(/^#\s+(.+)$/m);
                if (titleMatch) {
                    title = titleMatch[1].trim();
                }
            }
            else if (format === 'html') {
                const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
                if (h1Match) {
                    title = h1Match[1].replace(/<[^>]*>?/gm, '').trim();
                }
            }
            await DB_1.default.table("posts")
                .where("id", post.id)
                .update({
                content,
                title,
                format,
                updated_at: DB_1.default.fn.now()
            });
            return response.json({
                success: true,
                message: "Post updated successfully",
                updated_at: new Date().toISOString()
            });
        }
        catch (error) {
            console.error("Error updating post:", error);
            return response.status(500).json({
                error: "Failed to update post"
            });
        }
    }
    async preview(request, response) {
        try {
            const body = await request.json();
            const { content, format } = body;
            if (!content) {
                return response.status(400).json({
                    error: "Content is required"
                });
            }
            let htmlContent;
            if (format === 'html') {
                htmlContent = content;
            }
            else {
                htmlContent = md.render(content);
            }
            return response.json({
                success: true,
                html: htmlContent
            });
        }
        catch (error) {
            console.error("Error previewing markdown:", error);
            return response.status(500).json({
                error: "Failed to preview markdown"
            });
        }
    }
    async claim(request, response) {
        try {
            const { slug } = request.params;
            const { token } = request.query;
            if (!token) {
                return response.status(400).type("html").send("<h1>Invalid claim link</h1>");
            }
            const post = await DB_1.default.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();
            if (!post) {
                return response.status(404).type("html").send("<h1>Invalid claim link</h1>");
            }
            if (post.author_id) {
                return response.redirect(`/${slug}/edit/${token}`);
            }
            if (request.cookies.auth_id) {
                const session = await DB_1.default.from("sessions").where("id", request.cookies.auth_id).first();
                if (session) {
                    const user = await DB_1.default.from("users").where("id", session.user_id).select(["id", "name", "email", "phone", "is_admin", "is_verified"]).first();
                    await DB_1.default.table("posts")
                        .where("id", post.id)
                        .update({
                        author_id: user.id,
                        updated_at: DB_1.default.fn.now()
                    });
                    response.clearCookie("redirect_after_auth");
                    return response.redirect(`/${slug}/edit/${token}`);
                }
            }
            console.log("masuk sini");
            const returnUrl = `/claim/${slug}?token=${token}`;
            return response
                .cookie("redirect_after_auth", returnUrl, 1000 * 60 * 15)
                .redirect("/register");
        }
        catch (error) {
            console.error("Error claiming post:", error);
            return response.status(500).type("html").send("<h1>Error claiming post</h1>");
        }
    }
    async settings(request, response) {
        try {
            const { slug, token } = request.params;
            const post = await DB_1.default.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();
            if (!post) {
                return response.status(404).type("html").send("<h1>Invalid settings link</h1>");
            }
            let author = null;
            if (post.author_id) {
                author = await DB_1.default.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }
            let user = null;
            if (request.cookies.auth_id) {
                const session = await DB_1.default.from("sessions").where("id", request.cookies.auth_id).first();
                if (session) {
                    user = await DB_1.default.from("users").where("id", session.user_id).select(["id", "name", "email"]).first();
                }
            }
            return response.inertia("PostSettings", {
                post: {
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    description: post.description || '',
                    thumbnail: post.thumbnail || '',
                    format: post.format || 'markdown',
                    view_count: post.view_count,
                    created_at: post.created_at,
                    updated_at: post.updated_at
                },
                user,
                author: author ? { name: author.name, email: author.email } : null,
                edit_token: token
            });
        }
        catch (error) {
            console.error("Error loading settings page:", error);
            return response.status(500).type("html").send("<h1>Error loading settings page</h1>");
        }
    }
    async updateSettings(request, response) {
        try {
            const { slug, token } = request.params;
            const body = await request.json();
            const { slug: newSlug, title, description, thumbnail } = body;
            const post = await DB_1.default.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();
            if (!post) {
                return response.status(404).json({ error: "Invalid settings link" });
            }
            if (newSlug && newSlug !== slug) {
                const slugRegex = /^[a-z0-9-]+$/;
                if (!slugRegex.test(newSlug)) {
                    return response.status(400).json({ error: "Invalid slug format" });
                }
                const existingPost = await DB_1.default.from("posts").where("slug", newSlug).first();
                if (existingPost) {
                    return response.status(409).json({ error: "Slug already taken" });
                }
            }
            await DB_1.default.table("posts")
                .where("id", post.id)
                .update({
                slug: newSlug || slug,
                title: title || post.title,
                description: description || null,
                thumbnail: thumbnail || null,
                updated_at: DB_1.default.fn.now()
            });
            return response.json({
                success: true,
                message: "Settings updated successfully",
                newSlug: newSlug || slug
            });
        }
        catch (error) {
            console.error("Error updating settings:", error);
            return response.status(500).json({ error: "Failed to update settings" });
        }
    }
    async visualBuilder(request, response) {
        try {
            const { slug, token } = request.params;
            const post = await DB_1.default.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();
            if (!post) {
                return response.status(404).type("html").send("<h1>Invalid edit link</h1>");
            }
            if (post.format !== 'html') {
                return response.redirect(`/${slug}/edit/${token}`);
            }
            let author = null;
            if (post.author_id) {
                author = await DB_1.default.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }
            let user = null;
            let assets = [];
            if (request.cookies.auth_id) {
                const session = await DB_1.default.from("sessions").where("id", request.cookies.auth_id).first();
                if (session) {
                    user = await DB_1.default.from("users").where("id", session.user_id).select(["id", "name", "email"]).first();
                    assets = await DB_1.default.from("assets")
                        .where("user_id", session.user_id)
                        .orderBy("created_at", "desc")
                        .limit(50);
                }
            }
            return response.inertia("VisualBuilder", {
                post: {
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    content: post.content,
                    format: post.format,
                    view_count: post.view_count,
                    created_at: post.created_at,
                    updated_at: post.updated_at
                },
                user,
                author: author ? { name: author.name, email: author.email } : null,
                edit_token: token,
                assets
            });
        }
        catch (error) {
            console.error("Error loading visual builder:", error);
            return response.status(500).type("html").send("<h1>Error loading visual builder</h1>");
        }
    }
}
exports.default = new PostController();
//# sourceMappingURL=PostController.js.map