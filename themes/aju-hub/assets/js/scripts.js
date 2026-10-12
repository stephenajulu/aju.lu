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

// B. Speech Synthesis (Sticky Dock with Playback Rate Controls)
document.addEventListener('DOMContentLoaded', () => {
    const speechBtn = document.getElementById('btn-listen');
    const contentEl = document.querySelector('.e-content');

    if ('speechSynthesis' in window && (speechBtn || contentEl)) {
      let isPlaying = false;
      let isPaused = false;
      let currentRate = 1.0;
      const rates = [1.0, 1.25, 1.5, 2.0];
      let currentUtterance = null;
      let articleTitle = document.querySelector('h1')?.innerText || 'Article';

      // Create Sticky Dock DOM if not present
      let dock = document.getElementById('sticky-audio-bar');
      if (!dock) {
        dock = document.createElement('div');
        dock.id = 'sticky-audio-bar';
        dock.className = 'sticky-audio-bar';
        dock.innerHTML = `
          <div class="sticky-audio-indicator" id="dock-indicator">
            <span class="audio-pulse"></span>
            <span>Listening</span>
          </div>
          <span class="sticky-audio-title">${articleTitle}</span>
          <div class="sticky-audio-controls">
            <button class="sticky-audio-btn" id="dock-play-pause" type="button" aria-label="Pause audio">⏸ Pause</button>
            <button class="sticky-audio-btn sticky-audio-speed" id="dock-speed" type="button" aria-label="Playback speed">1.0x</button>
            <button class="sticky-audio-close" id="dock-stop" type="button" aria-label="Stop audio">&times;</button>
          </div>
        `;
        document.body.appendChild(dock);
      }

      const dockPlayPause = document.getElementById('dock-play-pause');
      const dockSpeed = document.getElementById('dock-speed');
      const dockStop = document.getElementById('dock-stop');
      const dockIndicator = document.getElementById('dock-indicator');

      function startReading(rate = currentRate) {
        window.speechSynthesis.cancel();
        const text = contentEl ? contentEl.innerText : '';
        if (!text) return;

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = rate;
        
        currentUtterance.onend = () => {
          stopReading();
        };

        currentUtterance.onerror = () => {
          stopReading();
        };

        window.speechSynthesis.speak(currentUtterance);
        isPlaying = true;
        isPaused = false;
        dock.classList.add('active');
        dockIndicator.classList.remove('paused');
        if (dockPlayPause) dockPlayPause.innerText = '⏸ Pause';
        if (speechBtn) speechBtn.innerHTML = '<span>🛑</span> Stop';
      }

      function togglePause() {
        if (!isPlaying) return;
        if (isPaused) {
          window.speechSynthesis.resume();
          isPaused = false;
          dockIndicator.classList.remove('paused');
          if (dockPlayPause) dockPlayPause.innerText = '⏸ Pause';
        } else {
          window.speechSynthesis.pause();
          isPaused = true;
          dockIndicator.classList.add('paused');
          if (dockPlayPause) dockPlayPause.innerText = '▶ Resume';
        }
      }

      function stopReading() {
        window.speechSynthesis.cancel();
        isPlaying = false;
        isPaused = false;
        dock.classList.remove('active');
        dockIndicator.classList.remove('paused');
        if (dockPlayPause) dockPlayPause.innerText = '⏸ Pause';
        if (speechBtn) speechBtn.innerHTML = '<span>🔊</span> Listen';
      }

      function cycleSpeed() {
        const nextIdx = (rates.indexOf(currentRate) + 1) % rates.length;
        currentRate = rates[nextIdx];
        dockSpeed.innerText = `${currentRate.toFixed(currentRate % 1 === 0 ? 0 : 2)}x`;

        // If currently speaking, restart utterance at new rate
        if (isPlaying && !isPaused) {
          startReading(currentRate);
        }
      }

      if (speechBtn) {
        speechBtn.addEventListener('click', () => {
          if (isPlaying) {
            stopReading();
          } else {
            startReading();
          }
        });
      }

      if (dockPlayPause) dockPlayPause.addEventListener('click', togglePause);
      if (dockSpeed) dockSpeed.addEventListener('click', cycleSpeed);
      if (dockStop) dockStop.addEventListener('click', stopReading);

      window.AjuAudio = {
        play: () => startReading(),
        pause: togglePause,
        stop: stopReading,
        toggle: () => isPlaying ? stopReading() : startReading()
      };
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
