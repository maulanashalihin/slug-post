/**
 * Posts Repository — all database queries for the posts table
 */
import db from "./db";

export interface Post {
	id: number;
	slug: string;
	content: string;
	title: string;
	format: string | null;
	edit_token: string;
	author_id: string | null;
	view_count: number;
	meta: string | null;
	description: string | null;
	thumbnail: string | null;
	created_at: number;
	updated_at: number;
	last_viewed_at: number | null;
}

export const posts = {
	/** Find a single post by id */
	findById(id: number): Post | undefined {
		return db.prepare("SELECT * FROM posts WHERE id = ?").get(id) as
			| Post
			| undefined;
	},

	/** Find a single post by slug */
	findBySlug(slug: string): Post | undefined {
		return db.prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as
			| Post
			| undefined;
	},

	/** Find a post by slug AND edit token */
	findBySlugAndToken(slug: string, token: string): Post | undefined {
		return db
			.prepare("SELECT * FROM posts WHERE slug = ? AND edit_token = ?")
			.get(slug, token) as Post | undefined;
	},

	/** Check whether a slug is already taken */
	isSlugTaken(slug: string): boolean {
		const row = db.prepare("SELECT 1 FROM posts WHERE slug = ?").get(slug);
		return !!row;
	},

	/** Create a new post — returns the new row id */
	create(data: {
		slug: string;
		content: string;
		title: string;
		format?: string;
		edit_token: string;
		author_id: string | null;
	}) {
		const stmt = db.prepare(`
      INSERT INTO posts (slug, content, title, format, edit_token, author_id, view_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `);
		const now = Date.now();
		return stmt.run(
			data.slug,
			data.content,
			data.title,
			data.format || "markdown",
			data.edit_token,
			data.author_id,
			now,
			now,
		);
	},

	/** Update post content & title by id */
	updateContent(
		id: number,
		data: { content: string; title: string; format?: string },
	) {
		const stmt = db.prepare(`
      UPDATE posts SET content = ?, title = ?, format = ?, updated_at = ? WHERE id = ?
    `);
		return stmt.run(
			data.content,
			data.title,
			data.format || "markdown",
			Date.now(),
			id,
		);
	},

	/** Update post settings (slug, title, description, thumbnail) */
	updateSettings(
		id: number,
		data: {
			slug?: string;
			title?: string;
			description?: string | null;
			thumbnail?: string | null;
		},
	) {
		const sets: string[] = [];
		const params: any[] = [];

		if (data.slug !== undefined) {
			sets.push("slug = ?");
			params.push(data.slug);
		}
		if (data.title !== undefined) {
			sets.push("title = ?");
			params.push(data.title);
		}
		if (data.description !== undefined) {
			sets.push("description = ?");
			params.push(data.description);
		}
		if (data.thumbnail !== undefined) {
			sets.push("thumbnail = ?");
			params.push(data.thumbnail);
		}

		sets.push("updated_at = ?");
		params.push(Date.now(), id);

		return db
			.prepare(`UPDATE posts SET ${sets.join(", ")} WHERE id = ?`)
			.run(...params);
	},

	/** Increment view counter and update last_viewed_at */
	incrementView(id: number) {
		db.prepare(
			"UPDATE posts SET view_count = view_count + 1, last_viewed_at = ? WHERE id = ?",
		).run(Date.now(), id);
	},

	/** Claim an anonymous post (set author_id) */
	claim(slug: string, token: string, authorId: string) {
		return db
			.prepare(
				"UPDATE posts SET author_id = ?, updated_at = ? WHERE slug = ? AND edit_token = ? AND author_id IS NULL",
			)
			.run(authorId, Date.now(), slug, token);
	},

	/** List posts by author, newest first */
	findByAuthor(authorId: string): Post[] {
		return db
			.prepare(
				"SELECT id, slug, title, format, view_count, created_at, updated_at, edit_token FROM posts WHERE author_id = ? ORDER BY created_at DESC",
			)
			.all(authorId) as Post[];
	},

	/** Delete a post by id — only the author can delete */
	delete(id: number, authorId: string) {
		return db
			.prepare("DELETE FROM posts WHERE id = ? AND author_id = ?")
			.run(id, authorId);
	},

	/** All slugs + updated_at for sitemap */
	allSlugs(): Pick<Post, "slug" | "updated_at" | "created_at">[] {
		return db
			.prepare(
				"SELECT slug, updated_at, created_at FROM posts ORDER BY updated_at DESC",
			)
			.all() as Pick<Post, "slug" | "updated_at" | "created_at">[];
	},
};
