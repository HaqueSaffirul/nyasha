document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-button");
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (!filterButtons.length || !galleryItems.length) {
    return;
  }

  const galleryEntries = Array.from(galleryItems).map((item) => {
    const img = item.querySelector("img");
    const figcaption = item.querySelector("figcaption");
    return {
      item,
      category: item.getAttribute("data-category") || "all",
      full: item.getAttribute("data-full") || img?.getAttribute("src") || "",
      alt: img?.getAttribute("alt") || "",
      caption: item.getAttribute("data-caption") || figcaption?.textContent.trim() || img?.getAttribute("alt") || "",
    };
  });

  const toggleActiveButton = (target) => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    target.classList.add("active");
  };

  let updateSlideshow = () => {};

  const applyFilter = (category) => {
    galleryItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");
      const shouldShow = category === "all" || itemCategory === category;
      item.style.display = shouldShow ? "flex" : "none";
      item.style.opacity = shouldShow ? "1" : "0";
    });
    updateSlideshow(category);
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const { filter } = button.dataset;
      toggleActiveButton(button);
      applyFilter(filter);
    });
  });

  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = lightbox?.querySelector(".lightbox-image");
  const lightboxCaption = lightbox?.querySelector(".lightbox-caption");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  let lastFocusedElement = null;

  const openLightbox = (item) => {
    if (!lightbox || !lightboxImage || !lightboxCaption) {
      return;
    }

    const img = item.querySelector("img");
    const fullImage = item.getAttribute("data-full") || img?.getAttribute("src");
    const caption = item.getAttribute("data-caption") || img?.getAttribute("alt") || "";

    if (!fullImage) {
      return;
    }

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    lightboxImage.src = fullImage;
    lightboxImage.alt = img?.getAttribute("alt") ?? "Expanded gallery image";
    lightboxCaption.textContent = caption;
    lightbox.hidden = false;

    requestAnimationFrame(() => {
      lightbox.classList.add("is-visible");
      document.body.classList.add("lightbox-open");
      lightboxClose?.focus();
    });
  };

  const closeLightbox = () => {
    if (!lightbox) {
      return;
    }

    lightbox.classList.remove("is-visible");
    document.body.classList.remove("lightbox-open");
    setTimeout(() => {
      lightbox.hidden = true;
      if (lightboxImage) {
        lightboxImage.src = "";
      }
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }, 180);
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox?.hidden) {
      closeLightbox();
    }
  });

  const slideshow = document.querySelector(".gallery-slideshow");
  if (slideshow) {
    const frame = slideshow.querySelector(".slideshow-frame");
    const prevButton = slideshow.querySelector(".slideshow-button.prev");
    const nextButton = slideshow.querySelector(".slideshow-button.next");
    const playPauseButton = slideshow.querySelector(".slideshow-button.toggle");
    const indicatorsHost = slideshow.querySelector(".slideshow-indicators");
    const AUTOPLAY_INTERVAL = 3000;
    let slides = [];
    let indicators = [];
    let currentIndex = 0;
    let autoplayTimeout;
    let isPausedManually = false;

    const updateNavState = () => {
      const disableNav = slides.length <= 1;
      if (prevButton) prevButton.disabled = disableNav;
      if (nextButton) nextButton.disabled = disableNav;
      if (playPauseButton) playPauseButton.disabled = slides.length <= 1;
    };

    const setActiveSlide = (index) => {
      if (!slides.length) {
        return;
      }
      const boundedIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle("is-active", idx === boundedIndex);
      });
      indicators.forEach((indicator, idx) => {
        indicator.classList.toggle("is-active", idx === boundedIndex);
        indicator.setAttribute("aria-pressed", idx === boundedIndex ? "true" : "false");
      });
      currentIndex = boundedIndex;
    };

    const changeSlide = (delta) => {
      if (!slides.length) {
        return;
      }
      setActiveSlide(currentIndex + delta);
    };

    const stopAutoplay = () => {
      if (autoplayTimeout) {
        clearTimeout(autoplayTimeout);
        autoplayTimeout = undefined;
      }
    };

    const scheduleAutoplay = () => {
      if (isPausedManually || slides.length <= 1) {
        return;
      }
      stopAutoplay();
      autoplayTimeout = window.setTimeout(() => {
        changeSlide(1);
        scheduleAutoplay();
      }, AUTOPLAY_INTERVAL);
    };

    const updatePlayPauseState = () => {
      if (!playPauseButton) {
        return;
      }
      playPauseButton.textContent = isPausedManually ? "Play" : "Pause";
      playPauseButton.setAttribute("aria-pressed", isPausedManually ? "true" : "false");
    };

    const pauseAutoplay = () => {
      isPausedManually = true;
      stopAutoplay();
      updatePlayPauseState();
    };

    const resumeAutoplay = () => {
      isPausedManually = false;
      updatePlayPauseState();
      scheduleAutoplay();
    };

    playPauseButton?.addEventListener("click", () => {
      if (isPausedManually) {
        resumeAutoplay();
      } else {
        pauseAutoplay();
      }
    });

    const renderIndicators = (length) => {
      if (!indicatorsHost) {
        return;
      }
      indicatorsHost.innerHTML = "";
      indicators = [];
      for (let idx = 0; idx < length; idx += 1) {
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.className = "slideshow-indicator";
        indicator.innerHTML = `<span>Show slide ${idx + 1}</span>`;
        indicator.addEventListener("click", () => {
          stopAutoplay();
          setActiveSlide(idx);
          if (!isPausedManually) {
            scheduleAutoplay();
          }
        });
        indicatorsHost.appendChild(indicator);
        indicators.push(indicator);
      }
    };

    const buildSlides = (entries) => {
      stopAutoplay();
      frame.innerHTML = "";

      if (!entries.length) {
        frame.innerHTML =
          '<div class="slideshow-empty">No designs available for this selection yet. Please explore another category.</div>';
        slides = [];
        renderIndicators(0);
        updateNavState();
        updatePlayPauseState();
        return;
      }

      currentIndex = 0;
      const fragment = document.createDocumentFragment();
      entries.forEach((entry, idx) => {
        const slide = document.createElement("figure");
        slide.className = "slideshow-slide";
        slide.dataset.index = String(idx);

        const image = document.createElement("img");
        image.src = entry.full;
        image.alt = entry.alt || `Gallery slide ${idx + 1}`;

        const caption = document.createElement("figcaption");
        caption.textContent = entry.caption;

        slide.append(image, caption);
        fragment.appendChild(slide);
      });

      frame.appendChild(fragment);
      slides = Array.from(frame.querySelectorAll(".slideshow-slide"));
      renderIndicators(slides.length);
      updateNavState();
      updatePlayPauseState();
      setActiveSlide(0);
      if (!isPausedManually) {
        scheduleAutoplay();
      }
    };

    const getEntriesByCategory = (category) =>
      galleryEntries.filter((entry) => category === "all" || entry.category === category);

    updateSlideshow = (category) => {
      const entries = getEntriesByCategory(category);
      buildSlides(entries);
    };

    const handleManualChange = (delta) => {
      stopAutoplay();
      changeSlide(delta);
      if (!isPausedManually) {
        scheduleAutoplay();
      }
    };

    prevButton?.addEventListener("click", () => handleManualChange(-1));
    nextButton?.addEventListener("click", () => handleManualChange(1));

    slideshow.addEventListener("mouseenter", stopAutoplay);
    slideshow.addEventListener("mouseleave", () => {
      if (!isPausedManually) {
        scheduleAutoplay();
      }
    });
    slideshow.addEventListener("focusin", stopAutoplay);
    slideshow.addEventListener("focusout", () => {
      if (!slideshow.contains(document.activeElement)) {
        if (!isPausedManually) {
          scheduleAutoplay();
        }
      }
    });
  }

  applyFilter("all");
});

