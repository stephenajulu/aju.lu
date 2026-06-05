# aju.lu | Sovereign Personal Hub & Portfolio

A high-performance, IndieWeb-ready personal platform and portfolio built with **Hugo**. This project is designed as a sovereign digital home, emphasizing data ownership, content discoverability, and advanced user experience.

> **Note:** This repository is currently being refactored into a reusable Hugo theme/template.

[![Netlify Status](https://api.netlify.com/api/v1/badges/038dd485-2b00-42f7-b446-12489e70432e/deploy-status)](https://app.netlify.com/projects/ajulu/deploys)

## 🚀 Tech Stack & Core Technologies

- **Framework:** [Hugo](https://gohugo.io/) (v0.160.0+)
- **Styling:** Modular SCSS with CSS Variables (Theme-aware)
- **Search:** [Fuse.js](https://fusejs.io/) for high-fidelity client-side search with match highlighting
- **Auth & Identity:** [Netlify Identity](https://www.netlify.com/products/identity/)
- **Automation:** Netlify Serverless Functions (Node.js - Zero Dependency)
- **Payments:** Paystack Integration (M-Pesa & Cards)
- **PWA:** Full Progressive Web App capability with Service Workers, Custom Offline Fallback, and Manifest
- **IndieWeb:** JF2 Webmentions, IndieAuth, and JF2/Microformats2 compliance

## ✨ Key Features & Strategies

### 1. Sovereign Content & Gating
- **Localized Memberships:** Integrated Netlify Identity with Paystack webhooks (hardened with HMAC-SHA512 validation) to automate role-based access for Premium Members (KES pricing). Lookups are fully paginated to scale.
- **Secure Content Gating:** A custom `{{< member-only >}}` shortcode to protect high-value insights. Gated content is removed during compilation and fetched dynamically via a serverless gateway validating user JWT tokens.

### 2. Reading Experience (UX)
- **Theme Persistence:** Dark/Light mode toggle with `localStorage` and FOUC (Flash of Unstyled Content) prevention.
- **Reading Tools:** Adaptive progress bar, code block top-bars (language labels + copy), Medium-style image zoom, and native Speech Synthesis ("Listen to Article").
- **Fluid Animations:** Scroll-reveal animations managed by an Intersection Observer.
- **Typography:** Sophisticated heading hierarchy using *Fraunces* and *Poppins*.

### 3. Discoverability & SEO
- **Fuzzy Search:** Instant highlighted search results with a `/` keyboard shortcut.
- **Taxonomy Archives:** Automated, grouped yearly archives with site-wide statistics (word counts, post counts).
- **Structured Data:** Built-in JSON-LD schemas (FAQ, Person, Article, Breadcrumbs).
- **Zero-Dependency Tracking:** Zero-code event tracking via Umami Analytics using HTML5 declarative data attributes (`data-umami-event-*`) to capture article reads, copy links, social sharing platforms, digital store click-throughs, membership upgrades, and form sign-ups without adding external npm modules or third-party JS scripts.

### 4. CDN Edge Hardening
- **Security Headers:** Strict HTTP headers (CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy) configured in `netlify.toml` directly on Netlify's CDN edge.

### 5. IndieWeb Integration
- **POSSE Ready:** Built to support "Publish (on) Own Site, Syndicate Elsewhere."
- **Webmentions:** Automated "likes" and "replies" fetching from the open web using Webmention.io and Bridgy.

## 🛠 Development & Deployment

### Development Mode
To run the site locally with draft content and live-reload:

```powershell
hugo server -D
```

### Production Build
To generate the minified static files in the `public/` directory:

```powershell
hugo --minify
```

### Deployment (Netlify)
The site is optimized for Netlify. Deployments are triggered automatically via Git.
- **Branch:** `master`
- **Build Command:** `hugo --minify`
- **Publish Directory:** `public`

#### Required Environment Variables (for Membership Automation):
- `NETLIFY_AUTH_TOKEN`: Personal Access Token from Netlify User Settings.
- `NETLIFY_SITE_ID`: The API ID from Site Details.

## 📜 Design Principles
1. **Performance First:** Minimal JavaScript, local-bundled assets, and optimized image pipelines.
2. **Accessibility (WCAG 2.2):** Full keyboard navigation support, skip-links, and high-contrast theme enforcement.
3. **Data Sovereignty:** Own your content, your members, and your interactions.

---
Created by **Stephen Ajulu**
