---
title: 'Implementing Webmentions on Hugo: An IndieWeb Guide'
date: 2026-04-27 10:00:00+00:00
description: A comprehensive guide on how to integrate Webmentions into your Hugo
  site, adhering to POSSE and IndieWeb principles.
image: https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1000&auto=format&fit=crop
tags:
- Development
---
Webmentions are a cornerstone of the IndieWeb movement. They allow you to "own your data" while still participating in the broader social web. Instead of having a centralized comment system (like Disqus), Webmentions allow you to receive notifications whenever someone links to your post from their own site, or even from social networks like Mastodon or Twitter.

## How it Works

The workflow typically follows the **POSSE** principle: **P**ublish (on) **O**wn **S**ite, **S**yndicate **E**lsewhere.

1. **Syndication:** You publish a post here and share it on Mastodon or Twitter.
2. **Interaction:** Someone likes or replies to your syndicated post on social media.
3. **Bridge:** A service like [Bridgy](https://bridgy.gy) sees that interaction and sends a "Webmention" to your site's endpoint.
4. **Inbox:** Your site's endpoint (configured via [Webmention.io](https://webmention.io)) receives the mention.
5. **Display:** Your Hugo templates fetch these mentions via JavaScript and display them at the bottom of your post.

{{< member-only >}}

## Step-by-Step Implementation

### 1. Setup your Identity (IndieAuth)
Ensure your site has `rel="me"` links to your social profiles in the `<head>`. This proves you own the domain.

### 2. Configure Webmention.io
Log in to Webmention.io with your domain. Add the following to your `extend-head.html`:

```html
<link rel="webmention" href="https://webmention.io/ajulu.netlify.app/webmention" />
<link rel="pingback" href="https://webmention.io/ajulu.netlify.app/xmlrpc" />
```

### 3. Display the Mentions
Add a container and a script to your post template. We've already implemented a themed version of this in our `webmention.html` partial, which uses CSS Grid to display likes and a threaded list for replies.

{{< /member-only >}}

## Why Bother?
By using Webmentions, you become a first-class citizen of the open web. You aren't just a "user" on a platform; you are a node in a distributed social network.

Happy hacking!
