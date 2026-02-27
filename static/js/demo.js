/* ── Demo for Ref-Adv: Gallery + Challenge modes ── */
(function () {
  "use strict";

  let allSamples = [];

  // ── Fixed gallery samples (curated 6) ──
  const gallerySamples = [
    {
      image: "static/images/demo/gallery_0.jpg",
      caption: "the stack of chips with the highest total value",
      bbox: [649.0, 240.0, 830.0, 359.0],
      width: 1024, height: 768,
      distractors: "4", negation: false, human_authored: true, source: "openimages"
    },
    {
      image: "static/images/demo/gallery_1.jpg",
      caption: "a person riding a red motorcycle and wearing an orange jacket",
      bbox: [150.53, 121.98, 216.92, 212.83],
      width: 640, height: 420,
      distractors: "4", negation: false, human_authored: true, source: "coco_val2017"
    },
    {
      image: "static/images/demo/gallery_2.jpg",
      caption: "the teddy bear close to a window and not wearing a black top",
      bbox: [0.0, 40.14, 76.76, 171.6],
      width: 640, height: 427,
      distractors: "6", negation: true, human_authored: true, source: "coco_val2017"
    },
    {
      image: "static/images/demo/gallery_3.jpg",
      caption: "the person in the car who is not sitting in the driver\u2019s seat",
      bbox: [277.98, 371.09, 310.22, 409.37],
      width: 640, height: 485,
      distractors: "6", negation: true, human_authored: true, source: "coco_val2017"
    },
    {
      image: "static/images/demo/gallery_4.jpg",
      caption: "a clock pointing to a time after 12 and before 6",
      bbox: [60.8, 235.2, 388.8, 540.8],
      width: 1024, height: 768,
      distractors: "2", negation: false, human_authored: true, source: "openimages"
    },
    {
      image: "static/images/demo/gallery_5.jpg",
      caption: "the warmer-colored white modern-looking truck",
      bbox: [881.0, 208.0, 1023.0, 326.0],
      width: 1024, height: 836,
      distractors: "2", negation: false, human_authored: false, source: "openimages"
    }
  ];

  // ── Load data (for challenge mode) ──
  fetch("./static/data/demo_samples.json")
    .then((r) => r.json())
    .then((data) => {
      allSamples = data;
      challengeNewRound();
    });

  // Render fixed gallery immediately
  galleryRender();

  // ════════════════════════════════
  //  Mode switching
  // ════════════════════════════════
  const tabGallery = document.getElementById("tab-gallery");
  const tabChallenge = document.getElementById("tab-challenge");
  const modeGallery = document.getElementById("mode-gallery");
  const modeChallenge = document.getElementById("mode-challenge");

  tabGallery.addEventListener("click", () => {
    tabGallery.classList.add("is-active");
    tabChallenge.classList.remove("is-active");
    modeGallery.style.display = "";
    modeChallenge.style.display = "none";
  });

  tabChallenge.addEventListener("click", () => {
    tabChallenge.classList.add("is-active");
    tabGallery.classList.remove("is-active");
    modeChallenge.style.display = "";
    modeGallery.style.display = "none";
  });

  // ════════════════════════════════
  //  Gallery mode (fixed 2x3 grid)
  // ════════════════════════════════
  function fisherShuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let galleryRevealed = false;

  function galleryRender() {
    const grid = document.getElementById("gallery-grid");
    grid.innerHTML = "";
    gallerySamples.forEach((sample, idx) => {
      const col = document.createElement("div");
      col.className = "column is-4";
      col.innerHTML = buildGalleryCard(sample, idx);
      grid.appendChild(col);

      const imgEl = col.querySelector("img");
      const positionBbox = () => {
        const container = col.querySelector(".gallery-cell-img");
        const box = col.querySelector(".bbox-overlay");
        if (!imgEl.naturalWidth || !box) return;

        const cW = container.clientWidth;
        const cH = container.clientHeight;
        const imgRatio = imgEl.naturalWidth / imgEl.naturalHeight;
        const cRatio = cW / cH;

        let renderW, renderH, offsetX, offsetY;
        if (imgRatio > cRatio) {
          renderW = cW;
          renderH = cW / imgRatio;
          offsetX = 0;
          offsetY = (cH - renderH) / 2;
        } else {
          renderH = cH;
          renderW = cH * imgRatio;
          offsetX = (cW - renderW) / 2;
          offsetY = 0;
        }

        const [bx1, by1, bx2, by2] = sample.bbox;
        box.style.left = offsetX + (bx1 / sample.width) * renderW + "px";
        box.style.top = offsetY + (by1 / sample.height) * renderH + "px";
        box.style.width = ((bx2 - bx1) / sample.width) * renderW + "px";
        box.style.height = ((by2 - by1) / sample.height) * renderH + "px";
      };
      imgEl.addEventListener("load", positionBbox);
      if (imgEl.complete) positionBbox();
    });
  }

  function buildGalleryCard(sample, idx) {
    return `
      <div class="gallery-cell">
        <div class="gallery-cell-img">
          <img src="${sample.image}" alt="Gallery image ${idx}" loading="lazy">
          <div class="bbox-overlay" style="display:none;"></div>
        </div>
        <p class="gallery-cell-caption">&ldquo;${sample.caption}&rdquo;</p>
      </div>
    `;
  }

  // Gallery reveal all
  const galleryRevealBtn = document.getElementById("btn-gallery-reveal");
  galleryRevealBtn.addEventListener("click", function () {
    galleryRevealed = !galleryRevealed;
    const icon = this.querySelector("i");
    const label = this.querySelector("span:last-child");
    if (galleryRevealed) {
      icon.className = "fa-solid fa-eye-slash";
      label.textContent = "Hide Ground Truth";
    } else {
      icon.className = "fa-solid fa-eye";
      label.textContent = "Reveal Ground Truth";
    }
    document.querySelectorAll("#gallery-grid .bbox-overlay").forEach((box) => {
      box.style.display = galleryRevealed ? "" : "none";
    });
  });

  // ════════════════════════════════
  //  Challenge mode (5 per round)
  // ════════════════════════════════
  const ROUND_SIZE = 5;
  let challengeBatch = [];
  let challengeIdx = 0;
  // Per-image state: null = not attempted, true = correct, false = incorrect
  let challengeResults = [];

  const imgArea = document.getElementById("challenge-img-area");
  const img = document.getElementById("challenge-img");
  const caption = document.getElementById("challenge-caption");
  const tagsEl = document.getElementById("challenge-tags");
  const resultLabel = document.getElementById("challenge-result");
  const revealBtn = document.getElementById("btn-challenge-reveal");
  const dotsContainer = document.getElementById("challenge-dots");
  const scoreEl = document.getElementById("challenge-score");

  let revealed = false;

  function challengeNewRound() {
    if (allSamples.length === 0) return;
    challengeBatch = fisherShuffle(allSamples).slice(0, ROUND_SIZE);
    challengeResults = new Array(ROUND_SIZE).fill(null);
    challengeIdx = 0;
    scoreEl.style.display = "none";
    challengeShow(0);
  }

  function challengeShow(idx) {
    challengeIdx = Math.max(0, Math.min(idx, ROUND_SIZE - 1));
    const s = challengeBatch[challengeIdx];
    if (!s) return;

    // Reset reveal state
    revealed = false;
    imgArea
      .querySelectorAll(".click-marker, .bbox-overlay")
      .forEach((e) => e.remove());
    revealBtn.textContent = "Reveal";

    // Set content
    img.src = s.image;
    caption.innerHTML = `&ldquo;${s.caption}&rdquo;`;
    tagsEl.innerHTML = buildTagsHTML(s);

    // Restore result label from saved state
    const res = challengeResults[challengeIdx];
    if (res === true) {
      resultLabel.textContent = "Correct!";
      resultLabel.className = "demo-result correct";
    } else if (res === false) {
      resultLabel.textContent = "Wrong!";
      resultLabel.className = "demo-result incorrect";
    } else {
      resultLabel.textContent = "Click on the target";
      resultLabel.className = "demo-result pending";
    }

    renderDots();
  }

  function renderDots() {
    let html = "";
    for (let i = 0; i < ROUND_SIZE; i++) {
      let cls = "challenge-dot";
      if (i === challengeIdx) cls += " active";
      if (challengeResults[i] === true) cls += " correct";
      else if (challengeResults[i] === false) cls += " incorrect";
      html += `<span class="${cls}" data-idx="${i}">${i + 1}</span>`;
    }
    dotsContainer.innerHTML = html;
    // Click dots to navigate
    dotsContainer.querySelectorAll(".challenge-dot").forEach((dot) => {
      dot.addEventListener("click", () =>
        challengeShow(parseInt(dot.dataset.idx))
      );
    });
  }

  function checkRoundComplete() {
    if (challengeResults.every((r) => r !== null)) {
      const correct = challengeResults.filter((r) => r === true).length;
      scoreEl.textContent = `You got ${correct} / ${ROUND_SIZE} correct!`;
      scoreEl.style.display = "";
    }
  }

  // Click to guess
  imgArea.addEventListener("click", function (e) {
    if (revealed) return;
    if (challengeResults[challengeIdx] !== null) return; // already answered

    const s = challengeBatch[challengeIdx];
    imgArea.querySelectorAll(".click-marker").forEach((m) => m.remove());

    const rect = imgArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = x / rect.width;
    const ny = y / rect.height;

    const [bx1, by1, bx2, by2] = s.bbox;
    const hit =
      nx >= bx1 / s.width &&
      nx <= bx2 / s.width &&
      ny >= by1 / s.height &&
      ny <= by2 / s.height;

    const marker = document.createElement("div");
    marker.className = "click-marker";
    marker.style.left = x + "px";
    marker.style.top = y + "px";
    marker.style.background = hit
      ? "rgba(76, 175, 80, 0.7)"
      : "rgba(244, 67, 54, 0.7)";
    imgArea.appendChild(marker);

    challengeResults[challengeIdx] = hit;
    resultLabel.textContent = hit ? "Correct!" : "Wrong!";
    resultLabel.className = "demo-result " + (hit ? "correct" : "incorrect");

    renderDots();
    checkRoundComplete();
  });

  // Reveal GT
  revealBtn.addEventListener("click", function () {
    if (revealed) {
      imgArea.querySelectorAll(".bbox-overlay").forEach((b) => b.remove());
      revealBtn.textContent = "Reveal";
      revealed = false;
      return;
    }
    revealed = true;
    revealBtn.textContent = "Hide";

    const s = challengeBatch[challengeIdx];
    const [bx1, by1, bx2, by2] = s.bbox;
    const box = document.createElement("div");
    box.className = "bbox-overlay";
    box.style.left = (bx1 / s.width) * 100 + "%";
    box.style.top = (by1 / s.height) * 100 + "%";
    box.style.width = ((bx2 - bx1) / s.width) * 100 + "%";
    box.style.height = ((by2 - by1) / s.height) * 100 + "%";
    imgArea.appendChild(box);
  });

  // Side arrows
  document
    .getElementById("btn-challenge-prev")
    .addEventListener("click", () => challengeShow(challengeIdx - 1));
  document
    .getElementById("btn-challenge-next")
    .addEventListener("click", () => challengeShow(challengeIdx + 1));

  // New round
  document
    .getElementById("btn-challenge-new")
    .addEventListener("click", challengeNewRound);

  // ════════════════════════════════
  //  Shared helpers
  // ════════════════════════════════
  function buildTagsHTML(sample) {
    return `<span class="demo-tag distractors">${sample.distractors} distractors</span>`;
  }

  // ════════════════════════════════
  //  Navbar burger (mobile)
  // ════════════════════════════════
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".navbar-burger").forEach((burger) => {
      burger.addEventListener("click", () => {
        const target = document.getElementById(burger.dataset.target);
        burger.classList.toggle("is-active");
        target.classList.toggle("is-active");
      });
    });
  });
})();
