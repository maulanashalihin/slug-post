import { v4 as uuidv4 } from "uuid";
import Hashids from "hashids";

/**
 * Helper class for generating secure tokens
 */
class TokenHelper {
  private hashids: Hashids;

  constructor() {
    // Initialize Hashids with a salt (should be in .env in production)
    this.hashids = new Hashids(
      process.env.APP_KEY || "markdown-publisher-secret",
      16 // Minimum length
    );
  }

  /**
   * Generate a unique edit token using UUID v4
   * @returns {string} A unique token string
   */
  public generateEditToken(): string {
    return uuidv4();
  }

  /**
   * Generate a shorter, URL-friendly token using Hashids
   * @returns {string} A short unique token
   */
  public generateShortToken(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return this.hashids.encode(timestamp, random);
  }

  /**
   * Generate a token from a specific ID (useful for obfuscating IDs)
   * @param {number} id - The ID to encode
   * @returns {string} Encoded token
   */
  public encodeId(id: number): string {
    return this.hashids.encode(id);
  }

  /**
   * Decode a token back to ID
   * @param {string} token - The token to decode
   * @returns {number | null} Decoded ID or null if invalid
   */
  public decodeId(token: string): number | null {
    const decoded = this.hashids.decode(token);
    return decoded.length > 0 ? Number(decoded[0]) : null;
  }

  /**
   * Validate if a token matches the expected format
   * @param {string} token - Token to validate
   * @returns {boolean} True if valid UUID format
   */
  public isValidUUID(token: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }
}

export default new TokenHelper();
