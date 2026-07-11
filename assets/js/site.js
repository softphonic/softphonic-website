/* =============================================================
   Softphonic Technologies — Site scripts (vanilla JS, no deps)
   ============================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav-toggle");
    if (!nav || !toggle) return;

    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      // Lock background scroll while the mobile menu is open
      document.body.classList.toggle("nav-open", open);
    }

    function closeMenu() {
      setMenu(false);
    }

    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });

    // Close menu when a link is clicked (mobile)
    nav.querySelectorAll(".nav-menu a, .nav-cta a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape / resize to desktop
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  /* ---------- Header shadow + back-to-top ---------- */
  function initScrollUI() {
    var header = document.querySelector(".site-header");
    var toTop = document.querySelector(".to-top");

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (toTop) toTop.classList.toggle("show", y > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    }
  }

  /* ---------- Active nav link (multi-page aware) ---------- */
  function initActiveLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-menu a").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      var target = href.split("/").pop().split("#")[0];
      if (target === path || (path === "" && target === "index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Technology tabs ---------- */
  function initTechTabs() {
    var tablist = document.querySelector(".tech-tabs");
    if (!tablist) return;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll(".tech-tab"));
    var panels = Array.prototype.slice.call(
      document.querySelectorAll(".tech-panel")
    );

    function activate(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (p) {
        var active = p.id === tab.getAttribute("aria-controls");
        p.classList.toggle("is-active", active);
        if (active) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        activate(tab);
      });
      tab.addEventListener("keydown", function (e) {
        var idx = i;
        if (e.key === "ArrowRight") idx = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
        else return;
        e.preventDefault();
        tabs[idx].focus();
        activate(tabs[idx]);
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll(".faq-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var answer = document.getElementById(btn.getAttribute("aria-controls"));
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (answer) {
          answer.style.maxHeight = expanded
            ? null
            : answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Contact form (validation + mailto) ---------- */
  function initContactForm() {
    var form = document.getElementById("enquiry-form");
    if (!form) return;

    var company = form.getAttribute("data-email") || "contact@softphonic.com";

    function setError(field, message) {
      var wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.add("has-error");
      var msg = wrap.querySelector(".error-msg");
      if (msg && message) msg.textContent = message;
      field.setAttribute("aria-invalid", "true");
    }

    function clearError(field) {
      var wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
    }

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phoneRe = /^[+()\-\s0-9]{7,20}$/;

    function validate() {
      var ok = true;
      var firstInvalid = null;

      var name = form.elements.name;
      var email = form.elements.email;
      var phone = form.elements.phone;
      var service = form.elements.service;
      var message = form.elements.message;

      [name, email, phone, service, message].forEach(clearError);

      if (!name.value.trim()) {
        setError(name, "Please enter your name.");
        ok = false;
        firstInvalid = firstInvalid || name;
      }
      if (!email.value.trim() || !emailRe.test(email.value.trim())) {
        setError(email, "Please enter a valid email address.");
        ok = false;
        firstInvalid = firstInvalid || email;
      }
      if (phone.value.trim() && !phoneRe.test(phone.value.trim())) {
        setError(phone, "Please enter a valid phone number.");
        ok = false;
        firstInvalid = firstInvalid || phone;
      }
      if (!service.value) {
        setError(service, "Please select a service.");
        ok = false;
        firstInvalid = firstInvalid || service;
      }
      if (message.value.trim().length < 10) {
        setError(message, "Please add a few details (at least 10 characters).");
        ok = false;
        firstInvalid = firstInvalid || message;
      }

      if (firstInvalid) firstInvalid.focus();
      return ok;
    }

    // Live clearing
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        clearError(el);
      });
      el.addEventListener("change", function () {
        clearError(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var f = form.elements;
      var subject =
        "New enquiry: " +
        (f.service.value || "General") +
        " — " +
        f.name.value.trim();

      var lines = [
        "Name: " + f.name.value.trim(),
        "Company: " + (f.company.value.trim() || "—"),
        "Email: " + f.email.value.trim(),
        "Phone: " + (f.phone.value.trim() || "—"),
        "Service Required: " + f.service.value,
        "",
        "Message:",
        f.message.value.trim(),
      ];
      var body = lines.join("\r\n");

      var mailto =
        "mailto:" +
        company +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      var status = document.getElementById("form-status");
      if (status) {
        status.className = "form-status success show";
        status.textContent =
          "Opening your email app to send this enquiry to " +
          company +
          ". If nothing opens, please email us directly.";
      }

      window.location.href = mailto;
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initScrollUI();
    initActiveLink();
    initReveal();
    initTechTabs();
    initFaq();
    initYear();
    initContactForm();
  });
})();
