"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable("post_analytics", (table) => {
        table.increments("id").primary();
        table.integer("post_id").unsigned().notNullable();
        table.string("ip_address", 45).nullable();
        table.string("user_agent", 500).nullable();
        table.string("referer", 500).nullable();
        table.string("country", 2).nullable();
        table.timestamp("viewed_at").defaultTo(knex.fn.now());
        table.foreign("post_id").references("id").inTable("posts").onDelete("CASCADE");
        table.index("post_id");
        table.index("viewed_at");
    });
}
async function down(knex) {
    return knex.schema.dropTableIfExists("post_analytics");
}
//# sourceMappingURL=20250106000002_create_post_analytics.js.map