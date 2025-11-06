/**
 * Helper class for markdown operations
 */
class MarkdownHelper {
  /**
   * Extract the first H1 heading from markdown content as title
   * @param {string} content - Markdown content
   * @returns {string | null} Extracted title or null
   */
  public extractTitle(content: string): string | null {
    // Match first H1 heading (# Title)
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Match alternative H1 syntax
    const altH1Match = content.match(/^(.+)\n=+$/m);
    if (altH1Match) {
      return altH1Match[1].trim();
    }

    return null;
  }

  /**
   * Generate a slug from text
   * @param {string} text - Text to slugify
   * @returns {string} URL-friendly slug
   */
  public slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Generate a slug from markdown content (uses title if available)
   * @param {string} content - Markdown content
   * @returns {string} Generated slug
   */
  public generateSlugFromContent(content: string): string {
    const title = this.extractTitle(content);
    if (title) {
      return this.slugify(title);
    }

    // Fallback: use first line or random
    const firstLine = content.split("\n")[0].trim();
    if (firstLine) {
      return this.slugify(firstLine.substring(0, 50));
    }

    // Last resort: timestamp-based slug
    return `post-${Date.now()}`;
  }

  /**
   * Get a preview/excerpt from markdown content
   * @param {string} content - Markdown content
   * @param {number} length - Maximum length of preview
   * @returns {string} Preview text
   */
  public getPreview(content: string, length: number = 200): string {
    // Remove markdown syntax for preview
    let preview = content
      .replace(/^#+\s+/gm, "") // Remove headers
      .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.+?)\*/g, "$1") // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
      .replace(/`(.+?)`/g, "$1") // Remove inline code
      .replace(/^>\s+/gm, "") // Remove blockquotes
      .replace(/^[-*+]\s+/gm, "") // Remove list markers
      .replace(/^\d+\.\s+/gm, "") // Remove ordered list markers
      .trim();

    if (preview.length > length) {
      preview = preview.substring(0, length) + "...";
    }

    return preview;
  }

  /**
   * Count words in markdown content
   * @param {string} content - Markdown content
   * @returns {number} Word count
   */
  public countWords(content: string): number {
    const text = content
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .trim();

    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Estimate reading time in minutes
   * @param {string} content - Markdown content
   * @returns {number} Estimated reading time in minutes
   */
  public estimateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.countWords(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

export default new MarkdownHelper();
