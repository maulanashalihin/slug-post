import type { Response, Request } from "../../type";
import { view } from "../services/View";
import { randomUUID } from "crypto";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import anchor from "markdown-it-anchor";
import { posts } from "../repositories/posts";
import { users } from "../repositories/users";
import { sessions } from "../repositories/sessions";

// Configure markdown-it with built-in featuress
const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
	breaks: false,
	highlight: (str, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value;
			} catch (__) {}
		}
		return "";
	},
});

md.use(anchor, {
	permalink: false,
	slugify: (s: string) => {
		return s
			.toLowerCase()
			.trim()
			.replace(/[\s\W-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	},
});

class PostController {
	/**
	 * Check if slug is available
	 * GET /api/check-slug/:slug
	 */
	public async checkSlug(request: Request, response: Response) {
		try {
			const { slug } = request.params;

			const slugRegex = /^[a-z0-9-]+$/;
			if (!slugRegex.test(slug)) {
				return response.json({
					available: false,
					message:
						"Slug must contain only lowercase letters, numbers, and hyphens",
				});
			}

			if (posts.isSlugTaken(slug)) {
				return response.json({
					available: false,
					message: "This slug is already taken",
				});
			}

			return response.json({
				available: true,
				message: "This slug is available",
			});
		} catch (error) {
			console.error("Error checking slug:", error);
			return response.status(500).json({
				available: false,
				message: "Error checking slug availability",
			});
		}
	}

	/**
	 * Store a new post
	 * POST /publish
	 */
	public async store(request: Request, response: Response) {
		try {
			const body = await request.json();
			const { content, slug } = body;
			let { format } = body;

			if (!format) format = "markdown";

			if (format !== "markdown" && format !== "html") {
				return response.status(400).json({
					error: "Invalid format. Must be 'markdown' or 'html'",
				});
			}

			if (!content || !slug) {
				return response.status(400).json({
					error: "Content and slug are required",
				});
			}

			const slugRegex = /^[a-z0-9-]+$/;
			if (!slugRegex.test(slug)) {
				return response.status(400).json({
					error:
						"Slug must contain only lowercase letters, numbers, and hyphens",
				});
			}

			if (posts.isSlugTaken(slug)) {
				return response.status(409).json({
					error: "This slug is already taken. Please choose another one.",
				});
			}

			let title = slug;
			if (format === "markdown") {
				const titleMatch = content.match(/^#\s+(.+)$/m);
				if (titleMatch) {
					title = titleMatch[1].trim();
				}
			} else if (format === "html") {
				const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
				if (h1Match) {
					title = h1Match[1].replace(/<[^>]*>?/gm, "").trim();
				}
			}

			const editToken = randomUUID();
			const authorId = request?.user?.id || null;

			const result = posts.create({
				slug,
				content,
				title,
				format,
				edit_token: editToken,
				author_id: authorId,
			});

			return response.json({
				success: true,
				post_id: result.lastInsertRowid,
				slug,
				public_url: `/${slug}`,
				edit_url: `/${slug}/edit/${editToken}`,
				edit_token: editToken,
			});
		} catch (error) {
			console.error("Error creating post:", error);
			return response.status(500).json({
				error: "Failed to create post. Please try again.",
			});
		}
	}

	/**
	 * Show success page
	 * GET /success
	 */
	public async success(request: Request, response: Response) {
		const { slug, token } = request.query;

		if (!slug || !token) {
			return response.redirect("/");
		}

		const post = posts.findBySlugAndToken(slug as string, token as string);
		const isClaimed = post?.author_id ? true : false;

		return response.inertia("Success", {
			slug,
			edit_token: token,
			user: request?.user || null,
			is_claimed: isClaimed,
		});
	}

	/**
	 * Show a post by slug
	 * GET /:slug
	 */
	public async show(request: Request, response: Response) {
		try {
			const { slug } = request.params;
			const post = posts.findBySlug(slug);

			if (!post) {
				return response
					.status(404)
					.type("html")
					.send("<h1>Post not found</h1>");
			}

			posts.incrementView(post.id);

			if (post.format === "html") {
				return response.type("html").send(post.content);
			}

			let author = null;
			if (post.author_id) {
				const u = users.findByIdLight(post.author_id);
				if (u) author = { name: u.name };
			}

			const htmlContent = md.render(post.content);

			const descriptionMatch = post.content.match(/^(?!#)(.+)$/m);
			const description = descriptionMatch
				? descriptionMatch[1].trim().substring(0, 160)
				: post.title;

			const formatDate = (timestamp: any) => {
				return new Date(timestamp).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			};

			const html = view("post.html", {
				title: post.title,
				description,
				content: htmlContent,
				view_count: post.view_count,
				created_at: formatDate(post.created_at),
				updated_at: formatDate(post.updated_at),
				author: author ? { name: author.name } : null,
			});

			return response.type("html").send(html);
		} catch (error) {
			console.error("Error showing post:", error);
			return response
				.status(500)
				.type("html")
				.send("<h1>Error loading post</h1>");
		}
	}

	/**
	 * Show edit form
	 * GET /:slug/edit/:token
	 */
	public async edit(request: Request, response: Response) {
		try {
			const { slug, token } = request.params;
			const post = posts.findBySlugAndToken(slug, token);

			if (!post) {
				return response
					.status(404)
					.type("html")
					.send("<h1>Invalid edit link</h1>");
			}

			let author = null;
			if (post.author_id) {
				const u = users.findByIdLight(post.author_id);
				if (u) author = { name: u.name, email: u.email };
			}

			let user = null;
			if (request.cookies.auth_id) {
				const session = sessions.findById(request.cookies.auth_id);
				if (session) {
					user = users.findByIdAuth(session.user_id);
				}
			}

			const editorPage = post.format === "html" ? "HtmlEditor" : "EditPost";

			return response.inertia(editorPage, {
				post: {
					id: post.id,
					slug: post.slug,
					title: post.title,
					content: post.content,
					format: post.format || "markdown",
					view_count: post.view_count,
					created_at: post.created_at,
					updated_at: post.updated_at,
				},
				user,
				author: author ? { name: author.name, email: author.email } : null,
				edit_token: token,
			});
		} catch (error) {
			console.error("Error loading edit page:", error);
			return response
				.status(500)
				.type("html")
				.send("<h1>Error loading edit page</h1>");
		}
	}

	/**
	 * Update a post
	 * POST /:slug/edit/:token
	 */
	public async update(request: Request, response: Response) {
		try {
			const { slug, token } = request.params;
			const body = await request.json();
			const { content } = body;
			let { format } = body;

			if (!content) {
				return response.status(400).json({ error: "Content is required" });
			}

			const post = posts.findBySlugAndToken(slug, token);
			if (!post) {
				return response.status(404).json({ error: "Invalid edit link" });
			}

			if (!format) format = post.format || "markdown";

			let title = post.title;
			if (format === "markdown") {
				const titleMatch = content.match(/^#\s+(.+)$/m);
				if (titleMatch) title = titleMatch[1].trim();
			} else if (format === "html") {
				const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
				if (h1Match) title = h1Match[1].replace(/<[^>]*>?/gm, "").trim();
			}

			posts.updateContent(post.id, { content, title, format });

			return response.json({
				success: true,
				message: "Post updated successfully",
				updated_at: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Error updating post:", error);
			return response.status(500).json({ error: "Failed to update post" });
		}
	}

	/**
	 * Preview markdown content
	 * POST /api/preview
	 */
	public async preview(request: Request, response: Response) {
		try {
			const body = await request.json();
			const { content, format } = body;

			if (!content) {
				return response.status(400).json({ error: "Content is required" });
			}

			let htmlContent;
			if (format === "html") {
				htmlContent = content;
			} else {
				htmlContent = md.render(content);
			}

			return response.json({ success: true, html: htmlContent });
		} catch (error) {
			console.error("Error previewing markdown:", error);
			return response.status(500).json({ error: "Failed to preview markdown" });
		}
	}

	/**
	 * Initiate claim process
	 * GET /claim/:slug
	 */
	public async claim(request: Request, response: Response) {
		try {
			const { slug } = request.params;
			const { token } = request.query;

			if (!token) {
				return response
					.status(400)
					.type("html")
					.send("<h1>Invalid claim link</h1>");
			}

			const post = posts.findBySlugAndToken(slug, token as string);
			if (!post) {
				return response
					.status(404)
					.type("html")
					.send("<h1>Invalid claim link</h1>");
			}

			if (post.author_id) {
				return response.redirect(`/${slug}/edit/${token}`);
			}

			if (request.cookies.auth_id) {
				const session = sessions.findById(request.cookies.auth_id);
				if (session) {
					posts.claim(slug, token as string, session.user_id);
					response.clearCookie("redirect_after_auth");
					return response.redirect(`/${slug}/edit/${token}`);
				}
			}

			const returnUrl = `/claim/${slug}?token=${token}`;
			return response
				.cookie("redirect_after_auth", returnUrl, 1000 * 60 * 15)
				.redirect("/register");
		} catch (error) {
			console.error("Error claiming post:", error);
			return response
				.status(500)
				.type("html")
				.send("<h1>Error claiming post</h1>");
		}
	}

	/**
	 * Post Settings page
	 * GET /:slug/settings/:token
	 */
	public async settings(request: Request, response: Response) {
		try {
			const { slug, token } = request.params;
			const post = posts.findBySlugAndToken(slug, token);

			if (!post) {
				return response
					.status(404)
					.type("html")
					.send("<h1>Invalid settings link</h1>");
			}

			let author = null;
			if (post.author_id) {
				const u = users.findByIdLight(post.author_id);
				if (u) author = { name: u.name, email: u.email };
			}

			let user = null;
			if (request.cookies.auth_id) {
				const session = sessions.findById(request.cookies.auth_id);
				if (session) {
					user = users.findByIdLight(session.user_id);
				}
			}

			return response.inertia("PostSettings", {
				post: {
					id: post.id,
					slug: post.slug,
					title: post.title,
					description: (post as any).description || "",
					thumbnail: (post as any).thumbnail || "",
					format: post.format || "markdown",
					view_count: post.view_count,
					created_at: post.created_at,
					updated_at: post.updated_at,
				},
				user,
				author: author ? { name: author.name, email: author.email } : null,
				edit_token: token,
			});
		} catch (error) {
			console.error("Error loading settings page:", error);
			return response
				.status(500)
				.type("html")
				.send("<h1>Error loading settings page</h1>");
		}
	}

	/**
	 * Update post settings
	 * POST /:slug/settings/:token
	 */
	public async updateSettings(request: Request, response: Response) {
		try {
			const { slug, token } = request.params;
			const body = await request.json();
			const { slug: newSlug, title, description, thumbnail } = body;

			const post = posts.findBySlugAndToken(slug, token);
			if (!post) {
				return response.status(404).json({ error: "Invalid settings link" });
			}

			if (newSlug && newSlug !== slug) {
				const slugRegex = /^[a-z0-9-]+$/;
				if (!slugRegex.test(newSlug)) {
					return response.status(400).json({ error: "Invalid slug format" });
				}
				if (posts.isSlugTaken(newSlug)) {
					return response.status(409).json({ error: "Slug already taken" });
				}
			}

			posts.updateSettings(post.id, {
				slug: newSlug || slug,
				title: title || post.title,
				description: description ?? null,
				thumbnail: thumbnail ?? null,
			});

			return response.json({
				success: true,
				message: "Settings updated successfully",
				newSlug: newSlug || slug,
			});
		} catch (error) {
			console.error("Error updating settings:", error);
			return response.status(500).json({ error: "Failed to update settings" });
		}
	}

	/**
	 * Show visual builder page for HTML posts
	 * GET /:slug/visual/:token
	 */
	public async visualBuilder(request: Request, response: Response) {
		try {
			const { slug, token } = request.params;
			const post = posts.findBySlugAndToken(slug, token);

			if (!post) {
				return response
					.status(404)
					.type("html")
					.send("<h1>Invalid edit link</h1>");
			}

			if (post.format !== "html") {
				return response.redirect(`/${slug}/edit/${token}`);
			}

			let author = null;
			if (post.author_id) {
				const u = users.findByIdLight(post.author_id);
				if (u) author = { name: u.name, email: u.email };
			}

			let user: any = null;
			let userAssets: any[] = [];
			if (request.cookies.auth_id) {
				const session = sessions.findById(request.cookies.auth_id);
				if (session) {
					user = users.findByIdLight(session.user_id);
					const { assets } = await import("../repositories/assets");
					userAssets = assets.findByUser(session.user_id);
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
					updated_at: post.updated_at,
				},
				user,
				author: author ? { name: author.name, email: author.email } : null,
				edit_token: token,
				assets: userAssets,
			});
		} catch (error) {
			console.error("Error loading visual builder:", error);
			return response
				.status(500)
				.type("html")
				.send("<h1>Error loading visual builder</h1>");
		}
	}

	/**
	 * Delete a post by ID — only the author can delete
	 * POST /api/posts/:id/delete
	 */
	public async destroy(request: Request, response: Response) {
		try {
			const { id } = request.params;
			const postId = parseInt(id, 10);

			if (!postId) {
				return response.status(400).json({ error: "Invalid post ID" });
			}

			const post = posts.findById(postId);
			if (!post) {
				return response.status(404).json({ error: "Post not found" });
			}

			// Only the author can delete
			if (!request.user || post.author_id !== request.user.id) {
				return response.status(403).json({ error: "You can only delete your own posts" });
			}

			posts.delete(postId, request.user.id);

			return response.json({
				success: true,
				message: "Post deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting post:", error);
			return response.status(500).json({ error: "Failed to delete post" });
		}
	}
}

export default new PostController();
