import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("post_analytics").del();
  await knex("posts").del();

  // Inserts seed entries
  await knex("posts").insert([
    {
      slug: "welcome-to-markdown-publisher",
      title: "Welcome to Markdown Publisher",
      content: `# Welcome to Markdown Publisher

This is a sample markdown post to demonstrate the features of this application.

## Features

- **Easy Publishing**: Just paste your markdown or upload a file
- **Custom URLs**: Choose your own memorable slug
- **No Registration**: Start publishing immediately
- **Secure Editing**: Get a unique edit link (shown only once!)

## Markdown Support

You can use all standard markdown features:

### Text Formatting

This is **bold text** and this is *italic text*.

You can also use ~~strikethrough~~ and \`inline code\`.

### Lists

Unordered list:
- Item 1
- Item 2
- Item 3

Ordered list:
1. First item
2. Second item
3. Third item

### Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

### Links and Images

[Visit our website](https://example.com)

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Getting Started

1. Go to the homepage
2. Paste your markdown content or upload a file
3. Choose a custom slug
4. Click publish
5. **Save your edit link!** (It's shown only once)
6. Share your public URL

Happy publishing! 🚀`,
      edit_token: uuidv4(),
      view_count: 42,
      created_at: new Date("2025-01-01T10:00:00"),
      updated_at: new Date("2025-01-01T10:00:00"),
      last_viewed_at: new Date("2025-01-05T15:30:00"),
    },
    {
      slug: "markdown-syntax-guide",
      title: "Markdown Syntax Guide",
      content: `# Markdown Syntax Guide

A comprehensive guide to markdown syntax.

## Headers

# H1
## H2
### H3
#### H4
##### H5
###### H6

## Emphasis

*Italic* or _italic_
**Bold** or __bold__
***Bold and italic***

## Lists

### Unordered
* Item 1
* Item 2
  * Nested item

### Ordered
1. First
2. Second
3. Third

## Links

[Link text](https://example.com)
[Link with title](https://example.com "Title")

## Images

![Alt text](https://via.placeholder.com/150)

## Code

Inline \`code\` has backticks.

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

## Horizontal Rule

---

## Blockquotes

> This is a blockquote
> with multiple lines

That's it! Happy writing! ✍️`,
      edit_token: uuidv4(),
      view_count: 128,
      created_at: new Date("2025-01-02T14:30:00"),
      updated_at: new Date("2025-01-02T14:30:00"),
      last_viewed_at: new Date("2025-01-06T09:15:00"),
    },
  ]);

  console.log("✅ Sample posts seeded successfully!");
}
