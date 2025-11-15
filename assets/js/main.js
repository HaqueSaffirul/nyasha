document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const primaryMenu = document.querySelector(".main-nav ul");
  const yearTarget = document.getElementById("current-year");
  const animatedBlocks = document.querySelectorAll(".animate-on-scroll");

  if (navToggle && primaryMenu) {
    const closeMenu = () => {
      navToggle.setAttribute("aria-expanded", "false");
      primaryMenu.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    };

    const openMenu = () => {
      navToggle.setAttribute("aria-expanded", "true");
      primaryMenu.classList.add("is-open");
      document.body.classList.add("nav-open");
    };

    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking on menu items
    primaryMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (primaryMenu.classList.contains("is-open")) {
        if (!primaryMenu.contains(e.target) && !navToggle.contains(e.target)) {
          closeMenu();
        }
      }
    });

    // Close menu on Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && primaryMenu.classList.contains("is-open")) {
        closeMenu();
        navToggle.focus();
      }
    });

    // Close menu when resizing to desktop
    const desktopMediaQuery = window.matchMedia("(min-width: 921px)");
    const handleDesktopChange = (event) => {
      if (event.matches) {
        closeMenu();
      }
    };
    desktopMediaQuery.addEventListener("change", handleDesktopChange);
  }

  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  if ("IntersectionObserver" in window && animatedBlocks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    animatedBlocks.forEach((block) => observer.observe(block));
  } else {
    animatedBlocks.forEach((block) => block.classList.add("is-visible"));
  }

  // WhatsApp form submission handler
  const contactForm = document.getElementById("consultation");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      
      const formData = new FormData(contactForm);
      const phoneNumber = "916267058285";
      
      // Build WhatsApp message
      let message = "Hello Nyasha,\n\n";
      message += "I am interested in your mehndi services. Please find my details below:\n\n";
      message += `*Full Name:* ${formData.get("Full Name")}\n`;
      message += `*Email:* ${formData.get("Email")}\n`;
      message += `*Phone:* ${formData.get("Phone")}\n`;
      message += `*Occasion:* ${formData.get("Occasion")}\n`;
      message += `*Event Dates:* ${formData.get("Event Dates")}\n`;
      message += `*Primary Venue:* ${formData.get("Primary Venue")}\n`;
      message += `*Guest Count:* ${formData.get("Guest Count")}\n`;
      message += `*Design Inspiration:* ${formData.get("Design Notes")}\n`;
      
      const allergies = formData.get("Allergies");
      if (allergies && allergies.trim() !== "") {
        message += `*Skin Sensitivities/Allergies:* ${allergies}\n`;
      }
      
      message += "\nThank you!";
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
    });
  }
});

