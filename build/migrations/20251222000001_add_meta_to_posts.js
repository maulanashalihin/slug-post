"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.table("posts", (table) => {
        table.text("description").nullable();
        table.string("thumbnail", 500).nullable();
    });
}
async function down(knex) {
    return knex.schema.table("posts", (table) => {
        table.dropColumn("description");
        table.dropColumn("thumbnail");
    });
}
//# sourceMappingURL=20251222000001_add_meta_to_posts.js.map