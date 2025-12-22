import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table("posts", (table) => {
    table.text("description").nullable();
    table.string("thumbnail", 500).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table("posts", (table) => {
    table.dropColumn("description");
    table.dropColumn("thumbnail");
  });
}
