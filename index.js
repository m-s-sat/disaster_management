document.addEventListener("DOMContentLoaded", function () {
  document.body.style.opacity = "1";
  document.querySelector(".navbar").classList.add("show");
});

let tooltipPinned = false;

function toggleTooltip(event) {
  event.stopPropagation();
  tooltipPinned = !tooltipPinned;

  const mapTooltip = document.querySelector(".map-tooltip");
  const disasterCircles = document.querySelector(".disaster-circles");

  if (tooltipPinned) {
    mapTooltip.classList.add("show", "pinned");
    disasterCircles.classList.add("show");

    // Reset animations for circles
    document.querySelectorAll(".disaster-circle").forEach((circle) => {
      circle.style.transition = "none";
      circle.offsetHeight; // Force reflow
      circle.style.transition = "";
    });
  } else {
    mapTooltip.classList.remove("show", "pinned");
    disasterCircles.classList.remove("show");
  }
}

// Add click handler to document to close tooltip
document.addEventListener("click", () => {
  tooltipPinned = false;
  document.querySelector(".map-tooltip").classList.remove("pinned");
  document.querySelector(".map-tooltip").classList.remove("show");
  document.querySelector(".disaster-circles").classList.remove("show");
});

// Click handlers with stopPropagation
document.querySelector(".map-tooltip").addEventListener("click", toggleTooltip);
document.querySelector(".side-nav").addEventListener("click", toggleTooltip);

// Hover handlers (only work when not pinned)
document.querySelector(".side-nav").addEventListener("mouseenter", () => {
  if (!tooltipPinned) {
    document.querySelector(".map-tooltip").classList.add("show");
  }
});

document.querySelector(".side-nav").addEventListener("mouseleave", () => {
  if (!tooltipPinned) {
    document.querySelector(".map-tooltip").classList.remove("show");
  }
});
