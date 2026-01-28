import type { Knex } from "knex"; 

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "better-sqlite3",
    connection: {
      filename: "./data/dev.sqlite3"
    },
    useNullAsDefault : true,
    seeds: {
      directory: "./seeds"
    }
  },

  production: {
    client: "better-sqlite3",
    connection: {
      filename: "./data/production.sqlite3"
    },
    useNullAsDefault : true
  },
 
 

};

export default config