"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DB_1 = __importDefault(require("../services/DB"));
class SitemapController {
    async sitemap(request, response) {
        try {
            const baseUrl = process.env.APP_URL || `${request.protocol}://${request.hostname}`;
            const posts = await DB_1.default.from("posts")
                .select("slug", "updated_at", "created_at")
                .orderBy("updated_at", "desc");
            const staticPages = [
                { url: "/", priority: "1.0", changefreq: "daily" },
                { url: "/about", priority: "0.8", changefreq: "monthly" },
                { url: "/docs", priority: "0.8", changefreq: "monthly" },
            ];
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
            for (const page of staticPages) {
                xml += "  <url>\n";
                xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
                xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
                xml += `    <priority>${page.priority}</priority>\n`;
                xml += "  </url>\n";
            }
            for (const post of posts) {
                const lastmod = post.updated_at || post.created_at;
                const formattedDate = new Date(lastmod).toISOString().split("T")[0];
                xml += "  <url>\n";
                xml += `    <loc>${baseUrl}/${post.slug}</loc>\n`;
                xml += `    <lastmod>${formattedDate}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.7</priority>\n`;
                xml += "  </url>\n";
            }
            xml += "</urlset>";
            response.header("Content-Type", "application/xml; charset=utf-8");
            response.header("Cache-Control", "public, max-age=3600");
            return response.send(xml);
        }
        catch (error) {
            console.error("Error generating sitemap:", error);
            response.status(500);
            return response.send("Error generating sitemap");
        }
    }
    async robots(request, response) {
        const baseUrl = process.env.APP_URL || `${request.protocol}://${request.hostname}`;
        const robotsTxt = `User-agent: *
Allow: /
Disallow: /login
Disallow: /register
Disallow: /profile
Disallow: /home
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /api/
Disallow: /*/edit/*

Sitemap: ${baseUrl}/sitemap.xml
`;
        response.header("Content-Type", "text/plain; charset=utf-8");
        response.header("Cache-Control", "public, max-age=86400");
        return response.send(robotsTxt);
    }
}
exports.default = new SitemapController();
//# sourceMappingURL=SitemapController.js.map