"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.view = view;
const fs_1 = require("fs");
const eta_1 = require("eta");
const path_1 = __importDefault(require("path"));
require("dotenv/config");
let directory = "resources/views";
const eta = new eta_1.Eta({
    views: path_1.default.join(process.cwd(), directory),
    cache: process.env.NODE_ENV !== 'development',
    autoEscape: true
});
let jsFilesCache = [];
let viteManifest;
function loadViteManifest() {
    const manifestPath = path_1.default.join(process.cwd(), 'dist/.vite/manifest.json');
    if ((0, fs_1.existsSync)(manifestPath)) {
        try {
            const manifestContent = (0, fs_1.readFileSync)(manifestPath, 'utf8');
            viteManifest = JSON.parse(manifestContent);
        }
        catch (error) {
            console.error('Error loading Vite manifest:', error);
            viteManifest = {};
        }
    }
}
if (process.env.NODE_ENV === 'production') {
    loadViteManifest();
}
function view(filename, view_data) {
    view_data = view_data || {};
    view_data.base_url = process.env.APP_URL;
    view_data.current_year = new Date().getFullYear();
    view_data.asset = function (file) {
        if (process.env.NODE_ENV === 'production') {
            const entry = viteManifest[file];
            if (!entry)
                return file;
            return file.endsWith(".js") ? "/" + entry.file : entry.file.endsWith(".css") ? "/" + entry.file : "/" + entry.css?.[0] || "/" + file;
        }
        return `http://localhost:${process.env.VITE_PORT}/${file}`;
    };
    let rendered = eta.render(filename, view_data || {});
    return rendered;
}
//# sourceMappingURL=View.js.map