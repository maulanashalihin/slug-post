"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.table("posts", (table) => {
        table.string("format", 20).defaultTo("markdown").notNullable();
    });
}
async function down(knex) {
    return knex.schema.table("posts", (table) => {
        table.dropColumn("format");
    });
}
//# sourceMappingURL=20251121000001_add_format_to_posts.js.map