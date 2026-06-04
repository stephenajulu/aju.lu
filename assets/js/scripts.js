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

// A. Performance Observer
if ('PerformanceObserver' in window) {
  const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`[Perf] ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
    }
  });
  perfObserver.observe({ type: 'largest-contentful-paint', buffered: true });
}

// B. Beacon API
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    const data = JSON.stringify({ url: window.location.href, time: Date.now() });
    // navigator.sendBeacon('/api/log', data);
  }
});

// C. Speech Synthesis (Listen to Article)
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

// D. Screen Wake Lock
document.addEventListener('DOMContentLoaded', () => {
    let wakeLock = null;
    const wakeLockBtn = document.getElementById('btn-wake-lock');
    if (wakeLockBtn && 'wakeLock' in navigator) {
      wakeLockBtn.addEventListener('click', async () => {
        if (wakeLock === null) {
          try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLockBtn.innerHTML = '<span>🔆</span> Awake';
            wakeLockBtn.classList.add('active');
          } catch (err) {}
        } else {
          await wakeLock.release();
          wakeLock = null;
          wakeLockBtn.innerHTML = '<span>🌙</span> Auto';
          wakeLockBtn.classList.remove('active');
        }
      });
    }
});

// E. PWA Badging
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

// 4. Smooth Page Entrance
window.addEventListener('load', () => {
    body.classList.add('page-loaded');
});
