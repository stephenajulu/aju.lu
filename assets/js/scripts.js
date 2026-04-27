var body = document.querySelector('body');
var menuTrigger = document.querySelector('#toggle-menu-main-mobile');
var menuContainer = document.querySelector('#menu-main-mobile');
var hamburgerIcon = document.querySelector('.hamburger');

if (menuTrigger !== null) {
  menuTrigger.addEventListener('click', function(e) {
    menuContainer.classList.toggle('open');
    hamburgerIcon.classList.toggle('is-active');
    body.classList.toggle('lock-scroll');
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

// 2. Copy Code Button & Language Labels
document.addEventListener('DOMContentLoaded', () => {
  const highlightBlocks = document.querySelectorAll('.highlight');

  highlightBlocks.forEach((block) => {
    // Attempt to extract the language from the class
    let language = "CODE";
    const codeElement = block.querySelector('code');
    if (codeElement && codeElement.className) {
      const match = codeElement.className.match(/language-([a-z0-9]+)/);
      if (match) {
        language = match[1].toUpperCase();
      }
    }

    const topBar = document.createElement('div');
    topBar.className = 'code-top-bar';

    const langLabel = document.createElement('span');
    langLabel.className = 'code-lang-label';
    langLabel.innerText = language;

    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-btn';
    copyButton.innerHTML = 'Copy';
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');

    copyButton.addEventListener('click', async () => {
      const codeText = codeElement ? codeElement.innerText : block.innerText;
      try {
        await navigator.clipboard.writeText(codeText);
        copyButton.innerHTML = 'Copied!';
        copyButton.classList.add('copied');
        setTimeout(() => {
          copyButton.innerHTML = 'Copy';
          copyButton.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code: ', err);
        copyButton.innerHTML = 'Failed';
      }
    });

    topBar.appendChild(langLabel);
    topBar.appendChild(copyButton);
    block.insertBefore(topBar, block.firstChild);
  });
});

// 3. Image Lightbox (Medium Zoom)
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.content img, .portfolio-item img, .note-content img');
  
  if (typeof mediumZoom !== 'undefined') {
    const zoom = mediumZoom(images, {
      margin: 24,
      background: getComputedStyle(document.documentElement).getPropertyValue('--base-color').trim() || '#030712',
      scrollOffset: 40
    });

    // Update background color when theme changes
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        setTimeout(() => {
          const newBg = getComputedStyle(document.documentElement).getPropertyValue('--base-color').trim();
          zoom.update({ background: newBg });
        }, 150);
      });
    }
  }
});

// 4. Back to Top Button
document.addEventListener('DOMContentLoaded', () => {
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
