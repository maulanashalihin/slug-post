import type { Knex } from "knex";
import path from "path";

// Single config — DB_FILENAME env var takes precedence, otherwise derive from NODE_ENV
const defaultFile =
	process.env.NODE_ENV === "production" ? "production.sqlite3" : "dev.sqlite3";

const config: { [key: string]: Knex.Config } = {
	development: {
		client: "better-sqlite3",
		connection: {
			filename: path.join(
				process.cwd(),
				"data",
				process.env.DB_FILENAME || defaultFile,
			),
		},
		useNullAsDefault: true,
		seeds: {
			directory: "./seeds",
		},
	},
	production: {
		client: "better-sqlite3",
		connection: {
			filename: path.join(
				process.cwd(),
				"data",
				process.env.DB_FILENAME || defaultFile,
			),
		},
		useNullAsDefault: true,
		seeds: {
			directory: "./seeds",
		},
	},
};

export default config;
