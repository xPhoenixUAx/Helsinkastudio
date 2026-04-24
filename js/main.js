(function () {
  var body = document.body;
  var header = document.querySelector("[data-header]");
  var menu = document.querySelector("[data-mobile-menu]");
  var openButton = document.querySelector("[data-menu-open]");
  var closeButton = document.querySelector("[data-menu-close]");
  var yearNodes = document.querySelectorAll("[data-year]");
  var form = document.querySelector("[data-contact-form]");

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
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

  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

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
  initGallerySlider();
  initScrollCards();
  initReveal();
})();
