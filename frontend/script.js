/**
 * Alaska Tour & Travel - Interactive Scripts
 * Handles mobile navigation menu toggle, header shadow, and smooth interactions.
 */
document.addEventListener("DOMContentLoaded", () => {
  const menuOpenButton = document.getElementById("menu-open-button");
  const menuCloseButton = document.getElementById("menu-close-button");
  const navLinks = document.querySelectorAll(".navbar .nav-menu .nav-link");

  if (menuOpenButton) {
    menuOpenButton.addEventListener("click", (e) => {
      e.stopPropagation();
      document.body.classList.toggle("show-mobile-menu");
    });
  }

  if (menuCloseButton) {
    menuCloseButton.addEventListener("click", (e) => {
      e.stopPropagation();
      document.body.classList.remove("show-mobile-menu");
    });
  }

  // Close mobile navigation when clicking on any menu link
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      document.body.classList.remove("show-mobile-menu");
    });
  });

  // Close when clicking outside drawer (backdrop)
  document.addEventListener("click", (e) => {
    if (document.body.classList.contains("show-mobile-menu")) {
      const navMenu = document.querySelector(".navbar .nav-menu");
      if (navMenu && !navMenu.contains(e.target) && menuOpenButton && !menuOpenButton.contains(e.target)) {
        document.body.classList.remove("show-mobile-menu");
      }
    }
  });

  // Header background on scroll
  const header = document.querySelector("header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    });
  }
});
