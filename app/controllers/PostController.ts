import { Response, Request } from "../../type";
import { view } from "../services/View";
import DB from "../services/DB";
import { randomUUID } from "crypto";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import anchor from "markdown-it-anchor";

// Configure markdown-it with built-in featuress
const md = new MarkdownIt({
    html: false, // Disable HTML tags for security
    linkify: true, // Auto-convert URLs to links
    typographer: true, // Enable smart quotes and other typographic replacements
    breaks: false, // Convert \n to <br>
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) { }
        }
        return ''; // use external default escaping
    }
});

// Add anchor plugin to generate IDs for headings
md.use(anchor, {
    permalink: false, // Don't add permalink symbols
    slugify: (s: string) => {
        // Convert heading text to URL-friendly slug
        return s
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '-') // Replace spaces and special chars with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }
});

class PostController {

    /**
     * Check if slug is available
     * GET /api/check-slug/:slug
     */
    public async checkSlug(request: Request, response: Response) {
        try {
            const { slug } = request.params;

            // Validate slug format
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                return response.json({
                    available: false,
                    message: "Slug must contain only lowercase letters, numbers, and hyphens"
                });
            }

            // Check if slug exists
            const existingPost = await DB.from("posts").where("slug", slug).first();

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

        } catch (error) {
            console.error("Error checking slug:", error);
            return response.status(500).json({
                available: false,
                message: "Error checking slug availability"
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

            // Default format to markdown if not specified
            if (!format) {
                format = 'markdown';
            }

            // Validate format
            if (format !== 'markdown' && format !== 'html') {
                return response.status(400).json({
                    error: "Invalid format. Must be 'markdown' or 'html'"
                });
            }

            // Validate required fields
            if (!content || !slug) {
                return response.status(400).json({
                    error: "Content and slug are required"
                });
            }

            // Validate slug format (lowercase, numbers, hyphens only)
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                return response.status(400).json({
                    error: "Slug must contain only lowercase letters, numbers, and hyphens"
                });
            }

            // Check if slug already exists
            const existingPost = await DB.from("posts").where("slug", slug).first();
            if (existingPost) {
                return response.status(409).json({
                    error: "This slug is already taken. Please choose another one."
                });
            }

            // Extract title from content
            let title = slug;
            if (format === 'markdown') {
                const titleMatch = content.match(/^#\s+(.+)$/m);
                if (titleMatch) {
                    title = titleMatch[1].trim();
                }
            } else if (format === 'html') {
                // Try to extract text from first h1 tag
                const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
                if (h1Match) {
                    // Strip tags from title
                    title = h1Match[1].replace(/<[^>]*>?/gm, '').trim();
                }
            }

            // Generate unique edit token
            const editToken = randomUUID();

            // Get author_id if user is logged in
            const authorId = request?.user?.id || null;

            // Insert post into database
            const postId = await DB.table("posts").insert({
                slug,
                content,
                title,
                format,
                edit_token: editToken,
                author_id: authorId,
                view_count: 0,
                created_at: DB.fn.now(),
                updated_at: DB.fn.now(),
            });

            // Return success with URLs
            return response.json({
                success: true,
                post_id: postId[0],
                slug,
                public_url: `/${slug}`,
                edit_url: `/${slug}/edit/${editToken}`,
                edit_token: editToken,
            });

        } catch (error) {
            console.error("Error creating post:", error);
            return response.status(500).json({
                error: "Failed to create post. Please try again."
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

        // Check if post is already claimed
        const post = await DB.from("posts")
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

    /**
     * Show a post by slug
     * GET /:slug
     */
    public async show(request: Request, response: Response) {
        try {
            const { slug } = request.params;

            // Find post by slug
            const post = await DB.from("posts").where("slug", slug).first();

            if (!post) {
                return response.status(404).type("html").send("<h1>Post not found</h1>");
            }

            // Increment view counter
            await DB.table("posts")
                .where("id", post.id)
                .increment("view_count", 1)
                .update({
                    last_viewed_at: DB.fn.now()
                });

            if (post.format === 'html') { 
                return response.type("html").send(post.content);
            }

            // Load author info if exists
            let author = null;
            if (post.author_id) {
                author = await DB.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }

            // Render content based on format
            let htmlContent  = md.render(post.content); 


            // Extract description from content (first paragraph)
            const descriptionMatch = post.content.match(/^(?!#)(.+)$/m);
            const description = descriptionMatch
                ? descriptionMatch[1].trim().substring(0, 160)
                : post.title;

            // Format dates
            const formatDate = (timestamp: any) => {
                return new Date(timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            // Render view with Squirrelly template and data
            const html = view("post.html", {
                title: post.title,
                description,
                content: htmlContent,
                view_count: post.view_count,
                created_at: formatDate(post.created_at),
                updated_at: formatDate(post.updated_at),
                author: author ? { name: author.name } : null
            });

            return response.type("html").send(html);

        } catch (error) {
            console.error("Error showing post:", error);
            return response.status(500).type("html").send("<h1>Error loading post</h1>");
        }
    }

    /**
     * Show edit form
     * GET /:slug/edit/:token
     */
    public async edit(request: Request, response: Response) {
        try {
            const { slug, token } = request.params;

            // Find post by slug and token
            const post = await DB.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();

            if (!post) {
                return response.status(404).type("html").send("<h1>Invalid edit link</h1>");
            }

            // Load author info if exists
            let author = null;
            if (post.author_id) {
                author = await DB.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }

            let user = null;

            if (request.cookies.auth_id) {
                const session = await DB.from("sessions").where("id", request.cookies.auth_id).first();

                if (session) {
                    user = await DB.from("users").where("id", session.user_id).select(["id", "name", "email", "phone", "is_admin", "is_verified"]).first();
                }

            }

            // Determine which editor to use based on format
            const editorPage = post.format === 'html' ? 'HtmlEditor' : 'EditPost';

            // Return Inertia view
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

        } catch (error) {
            console.error("Error loading edit page:", error);
            return response.status(500).type("html").send("<h1>Error loading edit page</h1>");
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

            // Default to markdown if not sent (backward compatibility) but ideally we want it from the request
            // If format is not provided, we might want to keep existing format, but let's assume user can change it.
            
            if (!content) {
                return response.status(400).json({
                    error: "Content is required"
                });
            }

            // Find post by slug and token
            const post = await DB.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();

            if (!post) {
                return response.status(404).json({
                    error: "Invalid edit link"
                });
            }

            // If format not provided in update, keep existing
            if (!format) {
                format = post.format || 'markdown';
            }

            // Extract new title
            let title = post.title;
            if (format === 'markdown') {
                const titleMatch = content.match(/^#\s+(.+)$/m);
                if (titleMatch) {
                    title = titleMatch[1].trim();
                }
            } else if (format === 'html') {
                const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
                if (h1Match) {
                    title = h1Match[1].replace(/<[^>]*>?/gm, '').trim();
                }
            }

            // Update post
            await DB.table("posts")
                .where("id", post.id)
                .update({
                    content,
                    title,
                    format,
                    updated_at: DB.fn.now()
                });

            // Return success with updated data
            return response.json({
                success: true,
                message: "Post updated successfully",
                updated_at: new Date().toISOString()
            });

        } catch (error) {
            console.error("Error updating post:", error);
            return response.status(500).json({
                error: "Failed to update post"
            });
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
                return response.status(400).json({
                    error: "Content is required"
                });
            }

            // Render content based on format
            let htmlContent;
            if (format === 'html') {
                htmlContent = content;
            } else {
                htmlContent = md.render(content);
            }

            return response.json({
                success: true,
                html: htmlContent
            });

        } catch (error) {
            console.error("Error previewing markdown:", error);
            return response.status(500).json({
                error: "Failed to preview markdown"
            });
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
                return response.status(400).type("html").send("<h1>Invalid claim link</h1>");
            }

            // Verify post exists and token is valid
            const post = await DB.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();

            if (!post) {
                return response.status(404).type("html").send("<h1>Invalid claim link</h1>");
            }

            // Check if already claimed
            if (post.author_id) {
                return response.redirect(`/${slug}/edit/${token}`);
            }

            if (request.cookies.auth_id) {
                const session = await DB.from("sessions").where("id", request.cookies.auth_id).first();

                if (session) {
                    const user = await DB.from("users").where("id", session.user_id).select(["id", "name", "email", "phone", "is_admin", "is_verified"]).first();



                    await DB.table("posts")
                        .where("id", post.id)
                        .update({
                            author_id: user.id,
                            updated_at: DB.fn.now()
                        });

                    // Clear redirect cookie if exists
                    response.clearCookie("redirect_after_auth");

                    return response.redirect(`/${slug}/edit/${token}`);

                }  

            }

            console.log("masuk sini")

               const returnUrl = `/claim/${slug}?token=${token}`;

                    return response
                        .cookie("redirect_after_auth", returnUrl, 1000 * 60 * 15) // 15 minutes
                        .redirect("/register");


            // User not logged in, save redirect URL in cookie and redirect to register
            




        } catch (error) {
            console.error("Error claiming post:", error);
            return response.status(500).type("html").send("<h1>Error claiming post</h1>");
        }
    }

    /**
     * Show settings page
     * GET /:slug/settings/:token
     */
    public async settings(request: Request, response: Response) {
        try {
            const { slug, token } = request.params;

            const post = await DB.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();

            if (!post) {
                return response.status(404).type("html").send("<h1>Invalid settings link</h1>");
            }

            let author = null;
            if (post.author_id) {
                author = await DB.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }

            let user = null;
            if (request.cookies.auth_id) {
                const session = await DB.from("sessions").where("id", request.cookies.auth_id).first();
                if (session) {
                    user = await DB.from("users").where("id", session.user_id).select(["id", "name", "email"]).first();
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

        } catch (error) {
            console.error("Error loading settings page:", error);
            return response.status(500).type("html").send("<h1>Error loading settings page</h1>");
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

            const post = await DB.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();

            if (!post) {
                return response.status(404).json({ error: "Invalid settings link" });
            }

            // If slug is changing, check availability
            if (newSlug && newSlug !== slug) {
                const slugRegex = /^[a-z0-9-]+$/;
                if (!slugRegex.test(newSlug)) {
                    return response.status(400).json({ error: "Invalid slug format" });
                }

                const existingPost = await DB.from("posts").where("slug", newSlug).first();
                if (existingPost) {
                    return response.status(409).json({ error: "Slug already taken" });
                }
            }

            await DB.table("posts")
                .where("id", post.id)
                .update({
                    slug: newSlug || slug,
                    title: title || post.title,
                    description: description || null,
                    thumbnail: thumbnail || null,
                    updated_at: DB.fn.now()
                });

            return response.json({
                success: true,
                message: "Settings updated successfully",
                newSlug: newSlug || slug
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

            const post = await DB.from("posts")
                .where("slug", slug)
                .where("edit_token", token)
                .first();

            if (!post) {
                return response.status(404).type("html").send("<h1>Invalid edit link</h1>");
            }

            // Only allow visual builder for HTML posts
            if (post.format !== 'html') {
                return response.redirect(`/${slug}/edit/${token}`);
            }

            let author = null;
            if (post.author_id) {
                author = await DB.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }

            let user = null;
            let assets: any[] = [];
            if (request.cookies.auth_id) {
                const session = await DB.from("sessions").where("id", request.cookies.auth_id).first();
                if (session) {
                    user = await DB.from("users").where("id", session.user_id).select(["id", "name", "email"]).first();
                    // Load user's assets for image picker
                    assets = await DB.from("assets")
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

        } catch (error) {
            console.error("Error loading visual builder:", error);
            return response.status(500).type("html").send("<h1>Error loading visual builder</h1>");
        }
    }
}

export default new PostController();
