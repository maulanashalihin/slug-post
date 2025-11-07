import { Response, Request } from "../../type";
import { view } from "../services/View";
import DB from "../services/DB";
import { randomUUID } from "crypto";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import anchor from "markdown-it-anchor";

// Configure markdown-it with built-in features
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

            // Extract title from markdown (first # heading)
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1].trim() : slug;

            // Generate unique edit token
            const editToken = randomUUID();

            // Get author_id if user is logged in
            const authorId = request?.user?.id || null;

            // Insert post into database
            const postId = await DB.table("posts").insert({
                slug,
                content,
                title,
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
        return response.type("html").send(view("success.html"));
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

            // Load author info if exists
            let author = null;
            if (post.author_id) {
                author = await DB.from("users")
                    .where("id", post.author_id)
                    .select("name", "email")
                    .first();
            }

            // Render markdown to HTML
            const htmlContent = md.render(post.content);


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

            // Return Inertia view
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

            // Extract new title from markdown
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1].trim() : post.title;

            // Update post
            await DB.table("posts")
                .where("id", post.id)
                .update({
                    content,
                    title,
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
            const { content } = body;

            if (!content) {
                return response.status(400).json({
                    error: "Content is required"
                });
            }

            // Render markdown to HTML
            const htmlContent = md.render(content);

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

                } else {

                    const returnUrl = `/claim/${slug}?token=${token}`;

                    return response
                        .cookie("redirect_after_auth", returnUrl, 1000 * 60 * 15) // 15 minutes
                        .redirect("/register");
                }

            }



            // User not logged in, save redirect URL in cookie and redirect to register




        } catch (error) {
            console.error("Error claiming post:", error);
            return response.status(500).type("html").send("<h1>Error claiming post</h1>");
        }
    }
}

export default new PostController();
