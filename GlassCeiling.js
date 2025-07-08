// ==UserScript==
// @name         GlassCeiling
// @version      1.0
// @description  A tool for a smoother experience on Glassdoor 
// @match        *://*.glassdoor.*/*
// @grant        none
// ==/UserScript==
// Source by Perplexity

(function() {
  'use strict';

  // --- Overlay and Scroll Unlock ---
  let lastScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

  // Patch window.scrollTo to prevent scroll-to-top when overlay appears
  const originalScrollTo = window.scrollTo;
  window.scrollTo = function(x, y) {
    // If hardsellOverlay is present or about to be shown and scrollTo(0,0) is called, block it
    if (
      (x === 0 && y === 0) &&
      (document.querySelector('.hardsellOverlay') || document.querySelector('#HardsellOverlay'))
    ) {
      // Optionally, do nothing or restore lastScroll
      setTimeout(() => window.scrollTo(0, lastScroll), 1);
      return;
    }
    // Otherwise, allow normal scrolling
    return originalScrollTo.apply(window, arguments);
  };

  // Also, monitor scroll events to record last position
  window.addEventListener('scroll', function() {
    lastScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  }, {passive: true});

  // Hide overlays and restore scrolling
  function unlockScrollAndHideOverlay() {
    [
      '.hardsellOverlay',
      '#HardsellOverlay',
      '#ContentWallHardsell',
      '[id*="HardsellOverlay"]'
    ].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
      });
    });

    // Restore scroll and position on html/body
    [document.body, document.documentElement].forEach(el => {
      if (el) {
        el.style.overflow = 'auto';
        el.style.position = 'unset';
        el.style.height = 'unset';
      }
    });

    // Remove scroll event locks
    window.onscroll = null;
    window.onwheel = null;
    window.onmousewheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;

    // If page is at the top and overlay was present, restore last scroll position
    if ((window.scrollY === 0 || window.pageYOffset === 0) && lastScroll > 0) {
      setTimeout(() => window.scrollTo(0, lastScroll), 1);
    }
  }

  unlockScrollAndHideOverlay();
  const overlayObserver = new MutationObserver(unlockScrollAndHideOverlay);
  overlayObserver.observe(document.body, { childList: true, subtree: true });

  // --- Reviews ---
  function revealReviews() {
    document.querySelectorAll('p.review-text_isCollapsed__dPlLp').forEach(function(p) {
      p.classList.remove('review-text_isCollapsed__dPlLp');
      p.style.maxHeight = 'none';
      p.style.overflow = 'visible';
      p.style.whiteSpace = 'normal';
    });
    document.querySelectorAll('.review-details_showMoreButton__N4hkO').forEach(function(el) {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
    });
  }

  // --- Interviews ---
  function revealInterviews() {
    document.querySelectorAll('.interview-details_interviewText__YH2ZO .truncated-text_truncate__021Uu').forEach(function(p) {
      p.classList.remove('truncated-text_truncate__021Uu');
      p.style.maxHeight = 'none';
      p.style.overflow = 'visible';
      p.style.whiteSpace = 'normal';
    });
    document.querySelectorAll('.interview-details_readMoreButton__cjzuB').forEach(function(btn) {
      btn.style.display = 'none';
      btn.style.visibility = 'hidden';
    });
    document.querySelectorAll('.interview-details_answerCTAContainer__Ac9Sr').forEach(function(el) {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
    });
  }

  const url = window.location.href;
  if (/\/Reviews\//.test(url)) {
    revealReviews();
    const reviewObserver = new MutationObserver(revealReviews);
    reviewObserver.observe(document.body, { childList: true, subtree: true });
  }
  if (/\/Interview\//.test(url)) {
    revealInterviews();
    const interviewObserver = new MutationObserver(revealInterviews);
    interviewObserver.observe(document.body, { childList: true, subtree: true });
  }
})();
