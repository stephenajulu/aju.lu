---
title: How to Use Optimized Images
date: 2026-04-25 10:00:00+00:00
description: A guide on using the new image optimization shortcode for better performance
  and Core Web Vitals.
image: images/me.webp
tags:
- Development
---
To keep your site fast and achieve high scores on Google PageSpeed Insights, you should use the new `img` shortcode for any local images you add to your posts.

## Why use the `img` shortcode?

1. **WebP Support:** It automatically generates a WebP version of your image, which is significantly smaller.
2. **Responsive Loading:** It creates a `srcset` so mobile devices download smaller versions of the image.
3. **Lazy Loading:** Images only load when they are about to enter the viewport.
4. **Automatic Dimensions:** Prevents layout shifts (CLS) by adding `width` and `height` attributes.

## How to use it

Instead of standard Markdown like `![Alt](path)`, use this:

```markdown
{{< img src="images/me.webp" alt="Stephen Ajulu" >}}
```

*Note: The `src` path should be relative to the `assets/` or `static/` directory depending on where you store them, but it works best with images in `assets/` for full processing.*

## Example in Action

{{< img src="images/me.webp" alt="Stephen Ajulu" class="author-demo" >}}

You can also pass a custom CSS class:

```markdown
{{< img src="images/me.webp" alt="Alt text" class="my-custom-class" >}}
```
