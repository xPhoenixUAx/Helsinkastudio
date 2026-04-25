(function () {
  var body = document.body;
  var header = document.querySelector("[data-header]");
  var menu = document.querySelector("[data-mobile-menu]");
  var openButton = document.querySelector("[data-menu-open]");
  var closeButton = document.querySelector("[data-menu-close]");
  var yearNodes = document.querySelectorAll("[data-year]");
  var form = document.querySelector("[data-contact-form]");
  var desktopHeaderQuery = window.matchMedia("(min-width: 981px)");
  var headerScrollBound = false;
  var progressTicking = false;

  function setHeaderState() {
    if (!header) return;
    if (!desktopHeaderQuery.matches) {
      header.classList.add("is-scrolled");
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function syncHeaderScrollBinding() {
    if (!header) return;

    if (desktopHeaderQuery.matches && !headerScrollBound) {
      window.addEventListener("scroll", setHeaderState, { passive: true });
      headerScrollBound = true;
    }

    if (!desktopHeaderQuery.matches && headerScrollBound) {
      window.removeEventListener("scroll", setHeaderState);
      headerScrollBound = false;
    }

    setHeaderState();
  }

  function updateScrollProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    var scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var progress = Math.min(1, Math.max(0, scrollTop / scrollable));
    body.style.setProperty("--scroll-progress", progress.toFixed(4));
    progressTicking = false;
  }

  function requestScrollProgress() {
    if (progressTicking) return;
    progressTicking = true;
    window.requestAnimationFrame(updateScrollProgress);
  }

  function openMenu() {
    if (!menu || !openButton) return;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    openButton.setAttribute("aria-expanded", "true");
    body.classList.add("is-menu-open");
    if (closeButton) closeButton.focus();
  }

  function closeMenu() {
    if (!menu || !openButton) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    openButton.setAttribute("aria-expanded", "false");
    body.classList.remove("is-menu-open");
  }

  function validateField(field) {
    if (field.type === "checkbox") {
      return field.checked;
    }

    if (field.type === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    }

    return field.value.trim().length > 0;
  }

  function initFormValidation() {
    if (!form) return;

    var message = form.querySelector("[data-form-message]");

    form.addEventListener("submit", function (event) {
      var requiredFields = Array.prototype.slice.call(form.querySelectorAll("[required]"));
      var invalidField = requiredFields.find(function (field) {
        return !validateField(field);
      });

      if (invalidField) {
        event.preventDefault();
        invalidField.focus();
        if (message) {
          message.textContent = "Please complete the required fields before sending.";
          message.className = "form-message is-error";
        }
        return;
      }

      if (message) {
        message.textContent = "Sending your inquiry...";
        message.className = "form-message is-success";
      }
    });
  }

  function initReveal() {
    var items = document.querySelectorAll([
      ".section-heading",
      ".insight-card",
      ".service-card",
      ".service-block",
      ".service-offer-grid article",
      ".offer-paths__grid article",
      ".offer-direction-list article",
      ".comparison-list article",
      ".solution-direction-grid article",
      ".solution-fit__cards article",
      ".group-process article",
      ".text-block:not(.why-card)",
      ".process-grid article",
      ".case-feature__cards article",
      ".contact-note",
      ".legal-content section"
    ].join(", "));
    if (!("IntersectionObserver" in window) || !items.length) return;

    items.forEach(function (item, index) {
      item.classList.add("reveal");
      item.style.setProperty("--reveal-delay", Math.min(index % 4, 3) * 70 + "ms");
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initGallerySlider() {
    var galleries = document.querySelectorAll("[data-gallery]");
    if (!galleries.length) return;

    galleries.forEach(function (gallery) {
      var track = gallery.querySelector("[data-gallery-track]");
      var dots = Array.prototype.slice.call(gallery.querySelectorAll("[data-gallery-dot]"));
      if (!track || !dots.length) return;
      var activeIndex = 0;
      var timer = null;

      function setSlide(index) {
        var slide = track.children[index];
        if (!slide) return;
        activeIndex = index;

        var styles = window.getComputedStyle(track);
        var gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;
        var offset = index * (slide.getBoundingClientRect().width + gap);
        track.style.transform = "translateX(-" + offset + "px)";

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function startAutoPlay() {
        stopAutoPlay();
        timer = window.setInterval(function () {
          var nextIndex = (activeIndex + 1) % dots.length;
          setSlide(nextIndex);
        }, 4500);
      }

      function stopAutoPlay() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setSlide(Number(dot.getAttribute("data-gallery-dot")));
          startAutoPlay();
        });
      });

      gallery.addEventListener("mouseenter", stopAutoPlay);
      gallery.addEventListener("mouseleave", startAutoPlay);

      window.addEventListener("resize", function () {
        setSlide(activeIndex < 0 ? 0 : activeIndex);
      });

      setSlide(0);
      startAutoPlay();
    });
  }

  function initScrollCards() {
    var sections = document.querySelectorAll("[data-scroll-cards]");
    if (!sections.length) return;

    function updateCards() {
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      sections.forEach(function (section) {
        var cards = Array.prototype.slice.call(section.querySelectorAll(".why-card"));
        if (!cards.length) return;

        if (window.matchMedia("(max-width: 980px)").matches) {
          cards.forEach(function (card) {
            card.classList.add("is-open");
          });
          return;
        }

        var rect = section.getBoundingClientRect();
        var progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        var clampedProgress = Math.max(0, Math.min(1, progress));

        cards.forEach(function (card, index) {
          var threshold = index === 0 ? 0 : 0.12 + (index * 0.12);
          card.classList.toggle("is-open", clampedProgress >= threshold);
        });
      });
    }

    updateCards();
    window.addEventListener("scroll", updateCards, { passive: true });
    window.addEventListener("resize", updateCards);
  }

  function initDropdownNav() {
    var dropdowns = Array.prototype.slice.call(document.querySelectorAll("[data-dropdown]"));
    if (!dropdowns.length) return;

    function closeDropdowns(except) {
      dropdowns.forEach(function (dropdown) {
        if (dropdown === except) return;
        dropdown.classList.remove("is-open");
        var toggle = dropdown.querySelector("[data-dropdown-toggle]");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }

    dropdowns.forEach(function (dropdown) {
      var toggle = dropdown.querySelector("[data-dropdown-toggle]");
      if (!toggle) return;

      toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        var willOpen = !dropdown.classList.contains("is-open");
        closeDropdowns(dropdown);
        dropdown.classList.toggle("is-open", willOpen);
        toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    });

    document.addEventListener("click", function () {
      closeDropdowns();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeDropdowns();
    });
  }

  function initSiteSearch() {
    var search = document.querySelector("[data-site-search]");
    if (!search) return;

    var input = search.querySelector("[data-search-input]");
    var results = search.querySelector("[data-search-results]");
    if (!input || !results) return;

    var pages = [
      {
        title: "All Services",
        url: "services.html",
        label: "Service offer",
        keywords: "services offer individual services direction packages complete solution marketing strategy paid advertising web design website development frontend backend landing pages conversion content analytics maintenance"
      },
      {
        title: "Strategy & Planning",
        url: "strategy-planning.html",
        label: "Direction",
        keywords: "strategy planning marketing strategy performance marketing paid social search advertising analytics reporting positioning audience channel plan campaign path measurement"
      },
      {
        title: "Design & Content",
        url: "design-content.html",
        label: "Direction",
        keywords: "design content web design landing page creation conversion optimization creative production content strategy messaging wireframes page logic UI UX copy"
      },
      {
        title: "Development & Support",
        url: "development-support.html",
        label: "Direction",
        keywords: "development support website development frontend backend php forms email marketing systems launch maintenance responsive code technical support"
      },
      {
        title: "Complete Solution",
        url: "service-detail.html",
        label: "Full-cycle cooperation",
        keywords: "complete solution full cycle cooperation strategy design content development launch support analytics maintenance project roadmap"
      },
      {
        title: "Home",
        url: "index.html",
        label: "Overview",
        keywords: "helsinka studio full cycle digital partner marketing web design development launch support homepage process case study"
      },
      {
        title: "About",
        url: "about.html",
        label: "Company",
        keywords: "about helsinka studio digital partner company approach principles address specialist network project team"
      },
      {
        title: "Contact",
        url: "contact.html",
        label: "Project inquiry",
        keywords: "contact start project inquiry email support budget timeline form cooperation"
      },
      {
        title: "Privacy Policy",
        url: "privacy.html",
        label: "Legal",
        keywords: "privacy policy data contact form email communication website usage cookies analytics user rights"
      },
      {
        title: "Terms of Service",
        url: "terms.html",
        label: "Legal",
        keywords: "terms service website use proposals project scope intellectual property third party tools liability"
      },
      {
        title: "Cookie Policy",
        url: "cookie-policy.html",
        label: "Legal",
        keywords: "cookie policy cookies analytics marketing cookies consent google meta tracking preferences opt out"
      }
    ];

    function normalize(value) {
      return value.toLowerCase().trim();
    }

    function getMatches(query) {
      var words = normalize(query).split(/\s+/).filter(Boolean);
      if (!words.length) return [];

      return pages.map(function (page) {
        var haystack = normalize(page.title + " " + page.label + " " + page.keywords);
        var score = words.reduce(function (total, word) {
          if (normalize(page.title).indexOf(word) !== -1) return total + 4;
          if (normalize(page.label).indexOf(word) !== -1) return total + 2;
          if (haystack.indexOf(word) !== -1) return total + 1;
          return total;
        }, 0);

        return { page: page, score: score };
      }).filter(function (item) {
        return item.score > 0;
      }).sort(function (a, b) {
        return b.score - a.score;
      }).slice(0, 5);
    }

    function render(query) {
      var matches = getMatches(query);

      if (!normalize(query)) {
        search.classList.remove("is-open");
        results.innerHTML = "";
        return matches;
      }

      search.classList.add("is-open");

      if (!matches.length) {
        results.innerHTML = '<div class="site-search__empty">No matching pages</div>';
        return matches;
      }

      results.innerHTML = matches.map(function (item) {
        return '<a href="' + item.page.url + '"><strong>' + item.page.title + '</strong><span>' + item.page.label + '</span></a>';
      }).join("");

      return matches;
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    input.addEventListener("focus", function () {
      render(input.value);
    });

    search.addEventListener("submit", function (event) {
      event.preventDefault();
      var matches = render(input.value);
      if (matches.length) {
        window.location.href = matches[0].page.url;
      }
    });

    document.addEventListener("click", function (event) {
      if (!search.contains(event.target)) {
        search.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        search.classList.remove("is-open");
        input.blur();
      }
    });
  }

  function initAccordions() {
    var detailsItems = Array.prototype.slice.call(document.querySelectorAll("details"));
    if (!detailsItems.length) return;

    detailsItems.forEach(function (details) {
      var summary = details.querySelector("summary");
      if (!summary || details.querySelector(".accordion-panel")) return;

      var panel = document.createElement("div");
      var inner = document.createElement("div");
      panel.className = "accordion-panel";
      inner.className = "accordion-panel__inner";

      while (summary.nextSibling) {
        inner.appendChild(summary.nextSibling);
      }

      panel.appendChild(inner);
      details.appendChild(panel);

      if (details.open) {
        panel.style.height = inner.scrollHeight + "px";
      }

      summary.addEventListener("click", function (event) {
        event.preventDefault();
        if (details.dataset.animating === "true") return;

        details.open ? closeDetails(details, panel, inner) : openDetails(details, panel, inner);
      });
    });

    window.addEventListener("resize", function () {
      detailsItems.forEach(function (details) {
        if (!details.open) return;
        var panel = details.querySelector(".accordion-panel");
        var inner = details.querySelector(".accordion-panel__inner");
        if (panel && inner) panel.style.height = inner.scrollHeight + "px";
      });
    });
  }

  function openDetails(details, panel, inner) {
    details.dataset.animating = "true";
    details.open = true;
    panel.style.height = "0px";

    window.requestAnimationFrame(function () {
      panel.style.height = inner.scrollHeight + "px";
    });

    panel.addEventListener("transitionend", function handleTransition(event) {
      if (event.propertyName !== "height") return;
      panel.removeEventListener("transitionend", handleTransition);
      panel.style.height = "auto";
      details.dataset.animating = "false";
    });
  }

  function closeDetails(details, panel, inner) {
    details.dataset.animating = "true";
    panel.style.height = inner.scrollHeight + "px";

    window.requestAnimationFrame(function () {
      panel.style.height = "0px";
    });

    panel.addEventListener("transitionend", function handleTransition(event) {
      if (event.propertyName !== "height") return;
      panel.removeEventListener("transitionend", handleTransition);
      details.open = false;
      details.dataset.animating = "false";
    });
  }

  function initCookieConsent() {
    var cookieName = "cookie_consent";
    var existingConsent = readCookieConsent(cookieName);
    var root = document.createElement("div");

    root.className = "cookie-consent";
    root.hidden = true;
    root.innerHTML = [
      '<section class="cookie-consent__banner" data-cookie-banner role="region" aria-label="Cookie notice">',
      '<p class="eyebrow">Cookie preferences</p>',
      '<h2>We use cookies to keep the website useful.</h2>',
      '<p>Essential cookies keep the site working. With your consent, analytics and marketing cookies may help us understand website usage and improve campaigns. You can change your choice at any time in the footer.</p>',
      '<p><a href="cookie-policy.html">Read the Cookie Policy</a></p>',
      '<div class="cookie-consent__actions">',
      '<button class="button button--small" type="button" data-cookie-accept>Accept All</button>',
      '<button class="button button--small button--secondary" type="button" data-cookie-reject>Reject Non-Essential</button>',
      '<button class="button button--small button--secondary" type="button" data-cookie-customize>Customize</button>',
      '</div>',
      '</section>',
      '<div class="cookie-modal" data-cookie-modal hidden aria-hidden="true">',
      '<div class="cookie-modal__panel" role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title">',
      '<p class="eyebrow">Cookie settings</p>',
      '<h2 id="cookie-preferences-title">Manage cookie preferences</h2>',
      '<label class="cookie-option"><input type="checkbox" checked disabled><span>Strictly necessary cookies</span><p>Required for core website functionality, privacy preferences, and form protection.</p></label>',
      '<label class="cookie-option"><input type="checkbox" data-cookie-category="analytics"><span>Analytics cookies</span><p>Help us understand which pages are useful and where the website can be improved.</p></label>',
      '<label class="cookie-option"><input type="checkbox" data-cookie-category="marketing"><span>Marketing cookies</span><p>Support campaign measurement and remarketing when advertising tools are enabled.</p></label>',
      '<div class="cookie-modal__actions">',
      '<button class="button button--small" type="button" data-cookie-save>Save Preferences</button>',
      '<button class="button button--small button--secondary" type="button" data-cookie-modal-close>Close</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join("");

    body.appendChild(root);

    var banner = root.querySelector("[data-cookie-banner]");
    var modal = root.querySelector("[data-cookie-modal]");
    var settingsTriggers = Array.prototype.slice.call(document.querySelectorAll("[data-cookie-settings]"));
    var analyticsInput = root.querySelector('[data-cookie-category="analytics"]');
    var marketingInput = root.querySelector('[data-cookie-category="marketing"]');

    function showRoot() {
      root.hidden = false;
    }

    function hideRootIfIdle() {
      if (banner.hidden && modal.hidden) root.hidden = true;
    }

    function showBanner() {
      showRoot();
      banner.hidden = false;
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
    }

    function hideBanner() {
      banner.hidden = true;
      hideRootIfIdle();
    }

    function showModal() {
      var current = readCookieConsent(cookieName) || { analytics: false, marketing: false };
      analyticsInput.checked = Boolean(current.analytics);
      marketingInput.checked = Boolean(current.marketing);
      showRoot();
      banner.hidden = true;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      analyticsInput.focus();
    }

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      if (!readCookieConsent(cookieName)) {
        showBanner();
        return;
      }
      hideRootIfIdle();
    }

    function saveConsent(analytics, marketing) {
      writeCookieConsent(cookieName, {
        essential: true,
        analytics: Boolean(analytics),
        marketing: Boolean(marketing),
        saved_at: new Date().toISOString()
      });
      banner.hidden = true;
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      hideRootIfIdle();
    }

    root.querySelector("[data-cookie-accept]").addEventListener("click", function () {
      saveConsent(true, true);
    });

    root.querySelector("[data-cookie-reject]").addEventListener("click", function () {
      saveConsent(false, false);
    });

    root.querySelector("[data-cookie-customize]").addEventListener("click", showModal);

    root.querySelector("[data-cookie-save]").addEventListener("click", function () {
      saveConsent(analyticsInput.checked, marketingInput.checked);
    });

    root.querySelector("[data-cookie-modal-close]").addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    settingsTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        showModal();
      });
    });

    if (!existingConsent) showBanner();
  }

  function readCookieConsent(cookieName) {
    var cookies = document.cookie ? document.cookie.split("; ") : [];
    var match = cookies.find(function (cookie) {
      return cookie.indexOf(cookieName + "=") === 0;
    });

    if (!match) return null;

    try {
      return JSON.parse(decodeURIComponent(match.slice(cookieName.length + 1)));
    } catch (error) {
      return null;
    }
  }

  function writeCookieConsent(cookieName, preferences) {
    var value = encodeURIComponent(JSON.stringify(preferences));
    document.cookie = cookieName + "=" + value + "; Max-Age=31536000; Path=/; SameSite=Lax";
  }

  body.classList.add("is-loaded");

  syncHeaderScrollBinding();
  updateScrollProgress();
  window.addEventListener("scroll", requestScrollProgress, { passive: true });
  window.addEventListener("resize", requestScrollProgress);
  window.addEventListener("resize", syncHeaderScrollBinding);
  if (desktopHeaderQuery.addEventListener) {
    desktopHeaderQuery.addEventListener("change", syncHeaderScrollBinding);
  } else if (desktopHeaderQuery.addListener) {
    desktopHeaderQuery.addListener(syncHeaderScrollBinding);
  }

  if (openButton) openButton.addEventListener("click", openMenu);
  if (closeButton) closeButton.addEventListener("click", closeMenu);

  if (menu) {
    menu.addEventListener("click", function (event) {
      if (event.target.matches("a")) closeMenu();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  yearNodes.forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });

  initFormValidation();
  initDropdownNav();
  initSiteSearch();
  initAccordions();
  initCookieConsent();
  initGallerySlider();
  initScrollCards();
  initReveal();
})();
