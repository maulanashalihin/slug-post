import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("post_analytics", (table) => {
    table.increments("id").primary();
    table.integer("post_id").unsigned().notNullable();
    table.string("ip_address", 45).nullable(); // Support IPv6
    table.string("user_agent", 500).nullable();
    table.string("referer", 500).nullable();
    table.string("country", 2).nullable(); // Country code
    table.timestamp("viewed_at").defaultTo(knex.fn.now());
    
    // Foreign key
    table.foreign("post_id").references("id").inTable("posts").onDelete("CASCADE");
    
    // Index for faster queries
    table.index("post_id");
    table.index("viewed_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("post_analytics");
}
