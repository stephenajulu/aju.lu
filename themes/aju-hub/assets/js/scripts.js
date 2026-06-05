var body = document.querySelector('body');
var menuTrigger = document.querySelector('#toggle-menu-main-mobile');
var menuContainer = document.querySelector('#menu-main-mobile');
var hamburgerIcon = document.querySelector('.hamburger');

// Mobile Menu Toggle
if (menuTrigger !== null) {
  menuTrigger.addEventListener('click', function(e) {
    const isOpen = menuContainer.classList.contains('open');
    menuContainer.classList.toggle('open');
    hamburgerIcon.classList.toggle('is-active');
    body.classList.toggle('lock-scroll');
    hamburgerIcon.setAttribute('aria-expanded', !isOpen);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuContainer.classList.contains('open')) {
        menuContainer.classList.remove('open');
        hamburgerIcon.classList.remove('is-active');
        body.classList.remove('lock-scroll');
        hamburgerIcon.setAttribute('aria-expanded', 'false');
    }
  });
}

// 1. Reading Progress Bar
window.addEventListener('scroll', () => {
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    const scroll = window.pageYOffset || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (scroll / height) * 100 : 0;
    progressBar.style.width = scrolled + "%";
  }
});

// 2. Copy Code Button
document.addEventListener('DOMContentLoaded', () => {
  const highlightBlocks = document.querySelectorAll('.highlight');
  highlightBlocks.forEach((block) => {
    let language = "CODE";
    const codeElement = block.querySelector('code');
    if (codeElement && codeElement.className) {
      const match = codeElement.className.match(/language-([a-z0-9]+)/);
      if (match) language = match[1].toUpperCase();
    }
    const topBar = document.createElement('div');
    topBar.className = 'code-top-bar';
    const langLabel = document.createElement('span');
    langLabel.className = 'code-lang-label';
    langLabel.innerText = language;
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-btn';
    copyButton.innerHTML = 'Copy';
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeElement.innerText);
        copyButton.innerHTML = 'Copied!';
        setTimeout(() => { copyButton.innerHTML = 'Copy'; }, 2000);
      } catch (err) { console.error(err); }
    });
    topBar.appendChild(langLabel);
    topBar.appendChild(copyButton);
    block.insertBefore(topBar, block.firstChild);
  });
});

// 3. Advanced Browser APIs Suite

// A. Performance Observer HUD (Localhost Dev Mode Only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('DOMContentLoaded', () => {
    const hud = document.createElement('div');
    hud.id = 'perf-hud';
    hud.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(2, 6, 23, 0.85);
      border: 1px solid rgba(148, 163, 184, 0.2);
      padding: 10px 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 11px;
      color: #10b981;
      z-index: 9999;
      pointer-events: none;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;
    hud.innerHTML = '⚡ Perf: Loading...';
    document.body.appendChild(hud);

    if ('PerformanceObserver' in window) {
      const perfObserver = new PerformanceObserver((list) => {
        let fcp = '-';
        let lcp = '-';
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            fcp = `${entry.startTime.toFixed(0)}ms`;
          }
          if (entry.entryType === 'largest-contentful-paint') {
            lcp = `${entry.startTime.toFixed(0)}ms`;
          }
        }
        hud.innerHTML = `⚡ FCP: ${fcp} | LCP: ${lcp}`;
      });
      perfObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      perfObserver.observe({ type: 'paint', buffered: true });
    }
  });
}

// B. Speech Synthesis (Listen to Article)
document.addEventListener('DOMContentLoaded', () => {
    const speechBtn = document.getElementById('btn-listen');
    if (speechBtn && 'speechSynthesis' in window) {
      let isReading = false;
      speechBtn.addEventListener('click', () => {
        if (isReading) {
          window.speechSynthesis.cancel();
          isReading = false;
          speechBtn.innerHTML = '<span>🔊</span> Listen';
        } else {
          const content = document.querySelector('.e-content').innerText;
          const utterance = new SpeechSynthesisUtterance(content);
          utterance.onend = () => { 
            isReading = false;
            speechBtn.innerHTML = '<span>🔊</span> Listen';
          };
          window.speechSynthesis.speak(utterance);
          isReading = true;
          speechBtn.innerHTML = '<span>🛑</span> Stop';
        }
      });
    }
});

// C. PWA Badging
if ('setAppBadge' in navigator) {
  const newestPost = document.body.getAttribute('data-newest-post');
  if (newestPost && localStorage.getItem('last_seen') !== newestPost) {
    navigator.setAppBadge(1).catch(() => {});
  }
  if (window.location.pathname === '/' || window.location.pathname === '/posts/') {
    navigator.clearAppBadge();
    if (newestPost) localStorage.setItem('last_seen', newestPost);
  }
}

// 4. Smooth Page Entrance & Intersection Reveals
window.addEventListener('load', () => {
    body.classList.add('page-loaded');
});

document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(r => observer.observe(r));
    } else {
        // Fallback for older browsers
        reveals.forEach(r => r.classList.add('active'));
    }
});
