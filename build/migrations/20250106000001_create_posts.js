"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable("posts", (table) => {
        table.increments("id").primary();
        table.string("slug", 255).notNullable().unique().index();
        table.text("content").notNullable();
        table.string("title", 500).nullable();
        table.string("edit_token", 100).notNullable().unique().index();
        table.uuid("author_id").nullable().index();
        table.integer("view_count").defaultTo(0);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.timestamp("last_viewed_at").nullable();
        table.foreign("author_id").references("id").inTable("users").onDelete("SET NULL");
    });
}
async function down(knex) {
    return knex.schema.dropTableIfExists("posts");
}
//# sourceMappingURL=20250106000001_create_posts.js.map