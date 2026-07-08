const getGalleryImages = (gallery) =>
  (gallery.dataset.galleryImages || "")
    .split("|")
    .map((image) => image.trim())
    .filter(Boolean);

const setBackgroundImage = (element, image) => {
  element.dataset.galleryImage = image;
  element.style.backgroundImage = `url('${image}')`;
};

const getCurrentImages = (gallery) => {
  const main = gallery.querySelector("[data-gallery-main]");
  const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));

  return [main, ...thumbs]
    .map((item) => item?.dataset.galleryImage)
    .filter(Boolean);
};

export function initProductGallery() {
  const gallery = document.querySelector("[data-product-gallery]");
  const lightbox = document.querySelector("[data-product-lightbox]");

  if (!gallery || !lightbox || gallery.dataset.galleryReady === "true") {
    return;
  }

  gallery.dataset.galleryReady = "true";

  const main = gallery.querySelector("[data-gallery-main]");
  const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
  const image = lightbox.querySelector("[data-lightbox-image]");
  const zoomLabel = lightbox.querySelector("[data-lightbox-zoom]");
  const closeButtons = lightbox.querySelectorAll("[data-lightbox-close]");
  const prevButton = lightbox.querySelector("[data-lightbox-prev]");
  const nextButton = lightbox.querySelector("[data-lightbox-next]");
  const zoomInButton = lightbox.querySelector("[data-lightbox-zoom-in]");
  const zoomOutButton = lightbox.querySelector("[data-lightbox-zoom-out]");
  const initialImages = getGalleryImages(gallery);

  if (!main || !image || !initialImages.length) {
    return;
  }

  let currentIndex = 0;
  let zoom = 1;

  setBackgroundImage(main, initialImages[0]);
  thumbs.forEach((thumb, index) => {
    setBackgroundImage(thumb, initialImages[index + 1]);
  });

  const setZoom = (nextZoom) => {
    zoom = Math.min(2.6, Math.max(0.65, nextZoom));
    image.style.transform = `scale(${zoom})`;

    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    }
  };

  const renderLightbox = (index) => {
    const images = getCurrentImages(gallery);

    if (!images.length) return;

    currentIndex = (index + images.length) % images.length;
    image.src = images[currentIndex];
    setZoom(1);
  };

  const openLightbox = (index = 0) => {
    lightbox.hidden = false;
    document.documentElement.classList.add("has-product-lightbox");
    renderLightbox(index);
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.documentElement.classList.remove("has-product-lightbox");
    setZoom(1);
  };

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const mainImage = main.dataset.galleryImage;
      const nextMainImage = thumb.dataset.galleryImage;

      if (!mainImage || !nextMainImage) return;

      setBackgroundImage(main, nextMainImage);
      setBackgroundImage(thumb, mainImage);
    });
  });

  main.addEventListener("click", () => openLightbox(0));

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeLightbox);
  });

  prevButton?.addEventListener("click", () => renderLightbox(currentIndex - 1));
  nextButton?.addEventListener("click", () => renderLightbox(currentIndex + 1));
  zoomInButton?.addEventListener("click", () => setZoom(zoom + 0.2));
  zoomOutButton?.addEventListener("click", () => setZoom(zoom - 0.2));

  image.addEventListener("dblclick", () => {
    setZoom(zoom > 1 ? 1 : 1.8);
  });

  lightbox.addEventListener("wheel", (event) => {
    if (lightbox.hidden) return;

    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? 0.12 : -0.12));
  }, { passive: false });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      renderLightbox(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      renderLightbox(currentIndex + 1);
    }

    if (event.key === "+" || event.key === "=") {
      setZoom(zoom + 0.2);
    }

    if (event.key === "-") {
      setZoom(zoom - 0.2);
    }
  });
}
