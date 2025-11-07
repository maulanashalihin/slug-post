import { Request, Response } from "../../type";
import DB from "../services/DB";

class SitemapController {
  /**
   * Generate sitemap.xml
   * Returns XML sitemap with all public URLs
   */
  public async sitemap(request: Request, response: Response) {
    try {
      // Get base URL from environment or request
      const baseUrl = process.env.APP_URL || `${request.protocol}://${request.hostname}`;
      
      // Get all published posts
      const posts = await DB.from("posts")
        .select("slug", "updated_at", "created_at")
        .orderBy("updated_at", "desc");

      // Static pages
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/about", priority: "0.8", changefreq: "monthly" },
        { url: "/docs", priority: "0.8", changefreq: "monthly" },
      ];

      // Build XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Add static pages
      for (const page of staticPages) {
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += "  </url>\n";
      }

      // Add dynamic post pages
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

      // Set proper headers
      response.header("Content-Type", "application/xml; charset=utf-8");
      response.header("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      
      return response.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      response.status(500);
      return response.send("Error generating sitemap");
    }
  }

  /**
   * Generate robots.txt
   * Returns robots.txt with sitemap reference
   */
  public async robots(request: Request, response: Response) {
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
    response.header("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    
    return response.send(robotsTxt);
  }
}

export default new SitemapController();
