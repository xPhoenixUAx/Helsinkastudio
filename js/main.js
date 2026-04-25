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
    var items = document.querySelectorAll(".service-card, .service-block, .text-block:not(.why-card), .process-grid article");
    if (!("IntersectionObserver" in window) || !items.length) return;

    items.forEach(function (item) {
      item.classList.add("reveal");
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

  syncHeaderScrollBinding();
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
  initGallerySlider();
  initScrollCards();
  initReveal();
})();
