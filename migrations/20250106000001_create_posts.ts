import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("posts", (table) => {
    table.increments("id").primary();
    table.string("slug", 255).notNullable().unique().index();
    table.text("content").notNullable();
    table.string("title", 500).nullable(); // Extracted from markdown
    table.string("edit_token", 100).notNullable().unique().index();
    table.uuid("author_id").nullable().index(); // Foreign key to users table
    table.integer("view_count").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.timestamp("last_viewed_at").nullable();

    // Foreign key constraint
    table.foreign("author_id").references("id").inTable("users").onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("posts");
}
