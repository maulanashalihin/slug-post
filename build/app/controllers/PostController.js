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
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1].trim() : slug;
            const editToken = (0, crypto_1.randomUUID)();
            const authorId = request?.user?.id || null;
            const postId = await DB_1.default.table("posts").insert({
                slug,
                content,
                title,
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
        return response.type("html").send((0, View_1.view)("success.html"));
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
            let author = null;
            if (post.author_id) {
                author = await DB_1.default.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }
            const htmlContent = md.render(post.content);
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
            return response.inertia("EditPost", {
                post: {
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    content: post.content,
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
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1].trim() : post.title;
            await DB_1.default.table("posts")
                .where("id", post.id)
                .update({
                content,
                title,
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
                else {
                    const returnUrl = `/claim/${slug}?token=${token}`;
                    return response
                        .cookie("redirect_after_auth", returnUrl, 1000 * 60 * 15)
                        .redirect("/register");
                }
            }
        }
        catch (error) {
            console.error("Error claiming post:", error);
            return response.status(500).type("html").send("<h1>Error claiming post</h1>");
        }
    }
}
exports.default = new PostController();
//# sourceMappingURL=PostController.js.map