# Project: aju.lu Modernization & Enhancement

This document tracks the comprehensive overhaul of Stephen Ajulu's personal platform.

## 🛠 Core Modernization
- **Hugo Upgrade**: Migrated from legacy v0.80.0 to v0.125.7 (local) and v0.160.0 (Netlify).
- **Template Optimization**: 100% conversion of legacy `.Site` calls to modern `site` global functions.
- **Asset Pipeline**: Implemented modular SCSS and local script bundling using Hugo Pipes.
- **Syntax Highlighting**: Transitioned from Pygments to **Chroma** with theme-aware CSS variables for perfect contrast in all modes.

## 📦 Content & Migration
- **Post Migration**: Automated migration of 252 legacy posts to standardized YAML frontmatter.
- **Schema Cleanup**: Resolved metadata corruption, fixed truncated titles, and mapped legacy fields (`hero` → `image`, `authors` → `author`).
- **Shortcode Modernization**: Updated `articlepreview`, `rawhtml`, and added `img`, `see-also`, `dramatic`, `bold`, and `firm`.

## ✨ UI/UX Enhancements
- **Theming**: Implemented a persistent Dark/Light mode toggle using `localStorage` with a root-level initialization to prevent flickering (FOUC).
- **Navigation**:
    - Refactored into a "More" dropdown for cleaner desktop view.
    - Created a centered, themed, and scrollable mobile overlay menu.
    - Streamlined header layout: [Logo | Toggle | Hamburger].
- **Portfolio**: Implemented Grid/Mosaic layouts with Glassmorphism overlays and high-contrast text enforcement.
- **Notes (Microblog)**: Created a dedicated section for short-form content with rich media support (Video, Images, Links).
- **Reading Experience**:
    - Added a theme-adaptive Reading Progress Bar.
    - Implemented Code Block Top Bars with language labels and "Copy to Clipboard" buttons.
    - Integrated a Medium-style Image Lightbox (local-bundled `medium-zoom`).
- **Back to Top**: Added a floating SVG button with smooth-scroll logic.

## 🔍 Search & Discoverability
- **Fuzzy Search**: Implemented high-performance client-side search using `Fuse.js`.
- **Search Optimization**: Reduced search index size by ~80% and added the `/` keyboard shortcut for instant focus.
- **Grouped Archive**: Created a yearly-grouped archive page with a stats dashboard (word counts, post counts).
- **Related Content**: Configured Hugo's internal engine to show "You might also like" suggestions.

## 📈 SEO & IndieWeb
- **Structured Data**: Integrated Person, Article, and Breadcrumb JSON-LD schemas for Google Rich Snippets.
- **WordPress Migration Strategy**: Implemented robust self-canonical links and automated 160-character meta descriptions.
- **Feeds**: Generated high-fidelity XML (RSS) and JSON Feed v1.1 for the entire site and specific sections (Posts, Notes, Newsletter).
- **Identity**: Reinforced IndieAuth `rel="me"` metadata and Microformats2 (`h-entry`, `h-card`, `e-content`) compliance.

## 📱 Responsiveness & Accessibility
- **Semantic HTML**: Replaced generic containers with HTML5 landmarks (`<main>`, `<header>`, `<footer>`, `<nav>`).
- **A11y**: Audited all images for `alt` tags and ensured full keyboard navigation for menus.
- **Form Optimization**: Fixed horizontal scroll issues on Contact and Search forms for mobile devices.

---
**Active Development Branch:** `dev-modernization-enhancements`
**Local OS:** Windows 11
