# Project: aju.lu Modernization & Sovereign Architecture

This document tracks the comprehensive overhaul of Stephen Ajulu's personal platform into a high-performance, founder-centric digital home.

## 🏛️ Core Architecture (The Engine)
- **Hugo Engine**: v0.160.1 (Aligned across local and Netlify).
- **Theme-ification**: 100% decoupled logic. All layouts, SCSS, and JS reside in `themes/aju-hub/`.
- **Single Source of Truth**: All author and identity metadata consolidated in `data/author.json`.
- **Asset Pipeline**:
  - Global WebP migration (270+ images optimized).
  - Modular SCSS with fluid typography (`clamp()`).
  - Bundled/Deferred JS for 100/100 performance potential.

## 📦 Content & Metadata
- **Elite Taxonomy**: Pruned 1,100+ tags into **9 Master Pillars** (Sovereignty, Architecture, Development, Design, Cybersecurity, Blockchain, Web3, Personal Growth, Finance).
- **Pillar-Cluster Internal Linking**: Automated "Expertise Callouts" connecting technical posts to professional services.
- **Search Engine Strategy**: Fuzzy client-side search via `Fuse.js` with absolute path indexing.
- **Crawl Optimization**: `noindex` applied to all taxonomy/term pages to preserve crawl budget and eliminate "thin content."

## 💎 Design System: "Master Depth"
- **Dark Mode**: Rich Midnight palette (`#020617`) with glassmorphism borders (`rgba(148, 163, 184, 0.1)`).
- **Typography**: Responsive scale using `clamp()` logic and premium spacing (letter-spacing: -0.03em for headings).
- **Motion Design**:
  - **View Transitions API**: Fluid, SPA-like navigation between pages.
  - **Entrance Animations**: High-performance "Fade-and-Rise" effects.
  - **Tactile Feedback**: Pulse-glow active states for utility buttons.

## 🛠️ Advanced Tech Suite (API Integration)
- **Speech Synthesis**: Native "Listen to Article" capability on blog posts.
- **Screen Wake Lock**: Prevents screen dimming during technical deep-dives.
- **PWA Identity**: Full manifest sync with themed colors and PWA Badging for new content alerts.
- **Analytics**: Performance Observer (RUM) and Beacon API for low-overhead user metrics.

## 🛍️ Digital Offerings
- **Sovereign Store**: Data-driven products via `data/store.json` with stylized grid layout.
- **Membership**: Netlify Identity + Paystack bridge for automated premium role gating (`premium`).

---
**Active Development Branch:** `master`
**Status:** Technical Infrastructure Complete. Content Deep-Dive Phase Incoming.
**OS:** Windows 11 (PowerShell syntax required).
