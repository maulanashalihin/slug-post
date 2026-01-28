"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    development: {
        client: "better-sqlite3",
        connection: {
            filename: "./data/dev.sqlite3"
        },
        useNullAsDefault: true,
        seeds: {
            directory: "./seeds"
        }
    },
    production: {
        client: "better-sqlite3",
        connection: {
            filename: "./data/production.sqlite3"
        },
        useNullAsDefault: true
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map