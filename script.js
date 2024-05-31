const rainContainer = document.querySelector(".rain-container");

function createRaindrop() {
  const raindrop = document.createElement("div");
  raindrop.classList.add("raindrop");
  raindrop.style.left = `${Math.random() * 100}vw`;
  raindrop.style.animationDuration = `${Math.random() * 0.5 + 10}s`;
  raindrop.style.opacity = `${Math.random()}`;
  raindrop.style.height = `${Math.random() * 7 + 20}vh`;
  rainContainer.appendChild(raindrop);

  // Remove raindrop after animation is complete to prevent too many elements in the DOM
  setTimeout(() => {
    raindrop.remove();
  }, 40000);
}

setInterval(createRaindrop, 100);
