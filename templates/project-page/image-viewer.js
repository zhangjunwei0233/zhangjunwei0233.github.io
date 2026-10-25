"use strict";

(() => {
  const links = document.querySelectorAll("a[data-image-viewer], [data-project-page] figure a:has(img)");
  if (!links.length) return;

  const viewer = document.createElement("dialog");
  viewer.className = "image-viewer";
  viewer.setAttribute("aria-label", "Enlarged figure");
  const image = document.createElement("img");
  const close = document.createElement("button");
  close.className = "image-viewer-close";
  close.type = "button";
  close.setAttribute("aria-label", "Close enlarged figure");
  close.textContent = "×";
  viewer.append(image, close);
  document.body.appendChild(viewer);
  let opener;

  const updateRatio = (source) => {
    if (source.naturalWidth && source.naturalHeight) {
      image.style.setProperty("--image-ratio", source.naturalWidth / source.naturalHeight);
    }
  };
  image.addEventListener("load", () => updateRatio(image));

  close.addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (event) => {
    if (event.target !== viewer) return;
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      viewer.close();
    }
  });
  viewer.addEventListener("close", () => {
    document.documentElement.classList.remove("image-viewer-open");
    image.removeAttribute("src");
    image.style.removeProperty("--image-ratio");
    opener?.focus({ preventScroll: true });
  });

  for (const link of links) {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!viewer.showModal) return;
      const thumbnail = link.querySelector("img");
      if (!thumbnail) return;
      event.preventDefault();
      opener = link;
      updateRatio(thumbnail);
      image.src = link.href;
      image.alt = thumbnail.alt;
      viewer.showModal();
      document.documentElement.classList.add("image-viewer-open");
    });
  }
})();
