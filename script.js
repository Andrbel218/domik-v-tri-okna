(function () {
  "use strict";

  /* ---------- Header ---------- */
  const header = document.querySelector(".site-header");
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("nav");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!header) return;
    header.classList.remove("nav-open");
    document.body.classList.remove("no-scroll");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
    }
  };

  if (burger) {
    burger.addEventListener("click", () => {
      const isOpen = header.classList.toggle("nav-open");
      document.body.classList.toggle("no-scroll", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    });
  }

  if (nav) {
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("nav-open")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ---------- Reveal on scroll ---------- */
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-in"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((el) => observer.observe(el));
  }

  /* ---------- Lightbox ---------- */
  const dialog = document.getElementById("lightbox");
  const dialogImg = document.getElementById("lightbox-img");
  const closeBtn = dialog ? dialog.querySelector(".lightbox__close") : null;
  const prevBtn = dialog ? dialog.querySelector(".lightbox__nav--prev") : null;
  const nextBtn = dialog ? dialog.querySelector(".lightbox__nav--next") : null;
  const items = Array.from(document.querySelectorAll("[data-lightbox]"));
  let current = 0;

  const preload = (i) => {
    const item = items[(i + items.length) % items.length];
    if (!item) return;
    const src = item.dataset.full || item.querySelector("img")?.src;
    if (src) {
      const img = new Image();
      img.src = src;
    }
  };

  const show = (i) => {
    if (!dialog || !items.length) return;
    current = (i + items.length) % items.length;
    const item = items[current];
    const img = item.querySelector("img");
    dialogImg.src = item.dataset.full || img.src;
    dialogImg.alt = img ? img.alt : "";
    preload(current + 1);
    preload(current - 1);
  };

  const open = (i) => {
    if (!dialog) return;
    show(i);
    document.body.classList.add("no-scroll");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const close = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.body.classList.remove("no-scroll");
  };

  items.forEach((item, i) => {
    item.addEventListener("click", () => open(i));
  });

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (prevBtn) prevBtn.addEventListener("click", () => show(current - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => show(current + 1));

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });

    dialog.addEventListener("close", () => {
      document.body.classList.remove("no-scroll");
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        show(current - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        show(current + 1);
      }
    });

    let startX = null;
    dialog.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length === 1) startX = event.touches[0].clientX;
      },
      { passive: true }
    );
    dialog.addEventListener(
      "touchend",
      (event) => {
        if (startX === null) return;
        const delta = event.changedTouches[0].clientX - startX;
        if (Math.abs(delta) > 50) show(delta > 0 ? current - 1 : current + 1);
        startX = null;
      },
      { passive: true }
    );
  }

  /* ---------- Year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
