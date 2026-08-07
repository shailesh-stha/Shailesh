(function() {
  'use strict';

  // Force page to load at the top on refresh
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /**
   * Overrides the native mouse wheel scroll to control scroll distance.
   */
  function initCustomScrollDistance() {
      // --- Configuration ---
      // Adjust this value to control how many pixels are scrolled per mouse wheel tick.
      // Larger number = Faster scroll | Smaller number = Slower scroll
      const SCROLL_DISTANCE = 400;

      window.addEventListener('wheel', (event) => {
          if (event.ctrlKey || event.metaKey) return; // don't block browser zoom
          event.preventDefault();
          const scrollAmount = event.deltaY > 0 ? SCROLL_DISTANCE : -SCROLL_DISTANCE;
          window.scrollBy({
              top: scrollAmount,
              left: 0,
          });
      }, { passive: false });
  }
  
  /**
   * Utility function to limit how often a function can run.
   */
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  function initIntroChanger() {
    const mainHeading = document.getElementById('main-heading');
    const triggers = document.querySelectorAll('.title-part[data-trigger]');
    if (!mainHeading || triggers.length === 0) return;
    const introSection = document.getElementById('intro');
    const textElements = document.querySelectorAll('.summary-text[data-text]');
    const defaultText = document.querySelector('.summary-text[data-text="ai"]');
    if (!introSection || !defaultText) { return; }
    const setActiveText = (targetKey) => {
        const newActiveText = document.querySelector(`.summary-text[data-text="${targetKey}"]`);
        textElements.forEach(el => el.classList.remove('active'));
        if (newActiveText) { newActiveText.classList.add('active'); }
    };
    introSection.classList.add('state-default');
    defaultText.classList.add('active');
    mainHeading.addEventListener('click', () => {
        introSection.classList.add('state-default');
        triggers.forEach(trigger => trigger.classList.remove('active'));
        setActiveText('ai');
    });
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetTextKey = trigger.dataset.trigger;
            if (trigger.classList.contains('active')) return;
            introSection.classList.remove('state-default');
            triggers.forEach(t => t.classList.remove('active'));
            trigger.classList.add('active');
            setActiveText(targetTextKey);
        });
    });
  }

  function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger-button');
    const mobileNav = document.getElementById('nav-links-mobile');
    if (!hamburgerBtn || !mobileNav) return;
    hamburgerBtn.addEventListener('click', () => {
      const isOpened = document.body.classList.toggle('nav-open');
      hamburgerBtn.setAttribute('aria-expanded', isOpened);
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open')) {
          document.body.classList.remove('nav-open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  function initThemeSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;
    const docBody = document.body;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') { docBody.setAttribute('data-theme', 'dark'); }
    switcher.addEventListener('click', () => {
      const isDark = docBody.getAttribute('data-theme') === 'dark';
      if (isDark) {
        docBody.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        docBody.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  function initBackToTopButton() {
    const button = document.getElementById('back-to-top');
    if (!button) return;
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > window.innerHeight) { button.classList.add('visible'); } 
      else { button.classList.remove('visible'); }
    }, 200));
    button.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  
  function initCertificationModal() {
    const modalOverlay = document.getElementById('cert-modal-overlay');
    const modalCloseBtn = document.getElementById('cert-modal-close');
    const certCards = document.querySelectorAll('.certification-card');
    if (!modalOverlay || !modalCloseBtn || certCards.length === 0) return;
    const modal = {
      img: document.getElementById('modal-cert-img'),
      title: document.getElementById('modal-cert-title'),
      issuer: document.getElementById('modal-cert-issuer'),
      verifyBtn: document.getElementById('modal-verify-btn'),
    };
    const openModal = (card) => {
      modal.img.src = card.querySelector('.cert-logo').src;
      modal.title.textContent = card.querySelector('h3').textContent;
      modal.issuer.textContent = card.querySelector('.cert-issuer').textContent;
      modal.verifyBtn.href = card.dataset.verifyUrl;
      document.body.classList.add('modal-open');
      modalOverlay.classList.add('visible');
    };
    const closeModal = () => {
      document.body.classList.remove('modal-open');
      modalOverlay.classList.remove('visible');
    };
    certCards.forEach(card => {
      card.addEventListener('click', () => { openModal(card); });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
      });
    });
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) closeModal();
    });
  }

  function initSkillsAnimation() {
    const skillItems = document.querySelectorAll('.skill-category li');
    if (skillItems.length === 0) return;
    skillItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.classList.remove('skill-fading');
        item.classList.add('skill-hover');
      });
      item.addEventListener('mouseleave', () => {
        item.classList.remove('skill-hover');
        item.classList.add('skill-fading');
      });
      item.addEventListener('animationend', () => {
        item.classList.remove('skill-fading');
      });
    });
  }
  
  function initAutoHideHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    let lastScrollY = window.scrollY;
    const scrollThreshold = 10;
    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) <= scrollThreshold) { return; }
      if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', throttle(updateHeader, 100));
  }
  
  function initCopyrightYear() {
    const yearEl = document.getElementById('copyright-year');
    if (!yearEl) return;
    yearEl.textContent = new Date().getFullYear();
  }

  function initCopyEmail() {
    const copyBtn = document.getElementById('copy-email-btn');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.dataset.email;
      const originalText = copyBtn.textContent;
      navigator.clipboard.writeText(email).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
      }).catch(err => {
        console.error('Failed to copy email: ', err);
        copyBtn.textContent = 'Error!';
        setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
      });
    });
  }

  function initSectionObserver() {
    const sections = document.querySelectorAll('.section.glassFrameContainer');
    if (sections.length === 0) return;
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in-view'); } 
        else { entry.target.classList.remove('is-in-view'); }
      });
    }, observerOptions);
    sections.forEach(section => { observer.observe(section); });
  }

  function initNavHighlightOnScroll() {
      const sectionHeaders = document.querySelectorAll('.section h2, #intro h1');
      const dotNavItems = document.querySelectorAll('.dot-nav li');
      const mobileNavLinks = document.querySelectorAll('.nav-overlay-mobile a');
      if (sectionHeaders.length === 0) return;
      const updateNavHighlight = () => {
          const targetY = window.innerHeight * 0.25;
          let closestHeader = null;
          let smallestDistance = Infinity;
          sectionHeaders.forEach(header => {
              const rect = header.getBoundingClientRect();
              const headerCenter = rect.top + (rect.height / 2);
              const distance = Math.abs(targetY - headerCenter);
              if (distance < smallestDistance) {
                  smallestDistance = distance;
                  closestHeader = header;
              }
          });
          let activeSectionId = null;
          if (closestHeader) { activeSectionId = closestHeader.closest('.section').id; }
          dotNavItems.forEach(item => {
              item.classList.toggle('active', item.dataset.section === activeSectionId);
          });
          mobileNavLinks.forEach(link => {
              const linkHref = link.getAttribute('href').substring(1);
              link.classList.toggle('active-link', linkHref === activeSectionId);
          });
      };
      updateNavHighlight();
      window.addEventListener('scroll', throttle(updateNavHighlight, 100));
      const navLinks = document.querySelectorAll('.dot-nav a');
      const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetElement = document.querySelector(this.getAttribute('href'));
          if (targetElement) {
            const offsetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        });
      });
  }

  /**
   * Main application starter.
   */
  document.addEventListener("DOMContentLoaded", function() {
    initCustomScrollDistance();
    initIntroChanger(); 
    initMobileNav();
    initThemeSwitcher();
    initBackToTopButton();
    initCertificationModal();
    initSkillsAnimation();
    initSectionObserver();
    initNavHighlightOnScroll();
    initAutoHideHeader();
    initCopyEmail();
    initCopyrightYear();
  });

})();