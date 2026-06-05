const fs = require('fs');
const path = require('path');

// Custom, zero-dependency Markdown-to-HTML parser
function parseMarkdown(markdown) {
    let html = markdown;

    // 1. Escape HTML special characters for safety (prevent XSS)
    html = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // 2. Code blocks (extract before parsing inline formatting)
    const codeBlocks = [];
    html = html.replace(/```([a-zA-Z0-9+-]+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
        const id = `__CODE_BLOCK_${codeBlocks.length}__`;
        // Decode code HTML escaping inside code block so it renders raw code text
        const decodedCode = code
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");
        
        codeBlocks.push({
            id: id,
            html: `<div class="highlight"><pre><code class="language-${lang || 'text'}">${decodedCode}</code></pre></div>`
        });
        return id;
    });

    // 3. Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 4. Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 5. Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // 6. Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // 7. Bullet lists
    let inList = false;
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const listMatch = line.match(/^\s*[-\*]\s+(.*)$/);
        if (listMatch) {
            let replacement = '';
            if (!inList) {
                replacement += '<ul>\n';
                inList = true;
            }
            replacement += `<li>${listMatch[1]}</li>`;
            lines[i] = replacement;
        } else {
            if (inList) {
                lines[i] = '</ul>\n' + line;
                inList = false;
            }
        }
    }
    if (inList) {
        lines.push('</ul>');
    }
    html = lines.join('\n');

    // 8. Paragraphs: split by double newlines, wrap non-tags in <p>
    const blocks = html.split(/\n\s*\n/);
    const parsedBlocks = blocks.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith('__CODE_BLOCK_')) {
            return trimmed;
        }
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('</ul>') || trimmed.startsWith('</ol>') || trimmed.startsWith('<li>')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    });
    html = parsedBlocks.join('\n');

    // 9. Restore code blocks
    for (const block of codeBlocks) {
        html = html.replace(block.id, block.html);
    }

    return html;
}

exports.handler = async (event, context) => {
    // 1. Check Identity Token in Context (Populated by Netlify Gateway)
    const user = context.clientContext && context.clientContext.user;
    
    if (!user) {
        console.warn("[Auth] Unauthorized request: Missing user context");
        return { 
            statusCode: 401, 
            body: JSON.stringify({ error: "Access denied. Please log in." }) 
        };
    }

    const isPremium = user.app_metadata && user.app_metadata.roles && user.app_metadata.roles.includes('premium');
    
    if (!isPremium) {
        console.warn(`[Auth] Forbidden request: User ${user.email} is not premium`);
        return { 
            statusCode: 403, 
            body: JSON.stringify({ error: "Access denied. Premium subscription required." }) 
        };
    }

    // 2. Validate and sanitize slug parameters (XSS & Directory Traversal defense)
    const slug = event.queryStringParameters.slug;
    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Invalid or missing post slug parameter." }) 
        };
    }

    // 3. Locate the Markdown file path defensively
    const pathsToTry = [
        path.join(process.cwd(), 'content', 'posts', `${slug}.md`),
        path.join(__dirname, 'content', 'posts', `${slug}.md`),
        path.join(__dirname, '..', 'content', 'posts', `${slug}.md`),
        path.join(__dirname, '..', '..', 'content', 'posts', `${slug}.md`),
        path.join('/var/task', 'content', 'posts', `${slug}.md`) // AWS Lambda task path
    ];

    let filePath = null;
    for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
            filePath = p;
            break;
        }
    }

    if (!filePath) {
        console.error(`[Gating] Markdown file not found for slug: ${slug}`);
        return { 
            statusCode: 404, 
            body: JSON.stringify({ error: "Post not found." }) 
        };
    }

    try {
        // 4. Read file and extract content inside member-only shortcode
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const regex = /\{\{<\s*member-only\s*>\}\}([\s\S]*?)\{\{<\s*\/member-only\s*>\}\}/;
        const match = fileContent.match(regex);
        
        if (!match) {
            console.warn(`[Gating] Post '${slug}' does not contain any gated member-only section.`);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "This post is public or has no gated sections." })
            };
        }

        const premiumMarkdown = match[1].trim();
        
        // 5. Parse Markdown to HTML
        const htmlContent = parseMarkdown(premiumMarkdown);
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: htmlContent })
        };

    } catch (err) {
        console.error(`[Gating] Server error reading post '${slug}':`, err.message);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Internal server error reading premium content." }) 
        };
    }
};
