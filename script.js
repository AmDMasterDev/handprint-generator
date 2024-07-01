const backgroundImage = document.getElementById("backgroundImage");
const scaleValue = document.getElementById("hand-scale");
const uploadedImage1 = document.getElementById("uploaded-image-1");
const uploadedImage2 = document.getElementById("uploaded-image-2");
const controlButtons = document.getElementById("control-buttons");
const stepInput = document.getElementById("step-value");
const imageSelectButtons = document.getElementById("image-select-buttons");
const selectImage1Button = document.getElementById("select-image-1");
const selectImage2Button = document.getElementById("select-image-2");
let selectedImage = null;
let selectedShadow = null;
let rotation = 0;
let rotation1 = 0;
let rotation2 = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.setProperty("--canvas-width", "75%");
});

backgroundImage.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      let imageContainer = document.getElementById("image-container");
      let blur = document.createElement("div");
      blur.style.height = "100%";
      blur.style.backdropFilter = "blur(8px)";
      imageContainer.appendChild(blur);

      imageContainer.style.backgroundImage = `url(${e.target.result})`;
    };
    reader.readAsDataURL(file);
  }
});

scaleValue.addEventListener("input", function () {
  const percentage = this.value;
  document.documentElement.style.setProperty(
    "--canvas-width",
    percentage + "%"
  );
});

function toggleControls() {
  if (
    controlButtons.style.display === "none" ||
    controlButtons.style.display === ""
  ) {
    controlButtons.style.display = "block";
  } else {
    controlButtons.style.display = "none";
  }
}

function selectImage(imageNumber) {
  if (imageNumber === 1) {
    selectedImage = document.getElementById("canvas1");
    selectedShadow = document.getElementById("shadowCanvas1");
    rotation = rotation1;
    selectImage1Button.classList.add("active-button");
    selectImage2Button.classList.remove("active-button");
  } else if (imageNumber === 2) {
    selectedImage = document.getElementById("canvas2");
    selectedShadow = document.getElementById("shadowCanvas2");
    rotation = rotation2;
    selectImage2Button.classList.add("active-button");
    selectImage1Button.classList.remove("active-button");
  }
  controlButtons.style.display = "block";
}

function moveImage(direction) {
  if (!selectedImage) return;
  const step = parseInt(stepInput.value) || 1; // Number of pixels to move
  const currentTop = parseInt(selectedImage.style.top);
  const currentLeft = parseInt(selectedImage.style.left);

  switch (direction) {
    case "up":
      selectedImage.style.top = currentTop - step + "%";
      selectedShadow.style.top = currentTop - step + "%";
      break;
    case "down":
      selectedImage.style.top = currentTop + step + "%";
      selectedShadow.style.top = currentTop + step + "%";
      break;
    case "left":
      selectedImage.style.left = currentLeft - step + "%";
      selectedShadow.style.left = currentLeft - step + "%";
      break;
    case "right":
      selectedImage.style.left = currentLeft + step + "%";
      selectedShadow.style.left = currentLeft + step + "%";
      break;
  }
}

function rotateImage(direction) {
  if (!selectedImage) return;

  const step = parseInt(stepInput.value) || 15; // Degrees to rotate
  if (direction === "clockwise") {
    rotation += step;
  } else if (direction === "anticlockwise") {
    rotation -= step;
  }
  selectedImage.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  selectedShadow.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

  // Save the current rotation value for the selected image
  if (selectedImage === uploadedImage1) {
    rotation1 = rotation;
  } else if (selectedImage === uploadedImage2) {
    rotation2 = rotation;
  }
}

function saveAsPng() {
  html2canvas(document.querySelector("#image-container")).then((canvas) => {
    const link = document.createElement("a");
    link.download = "image-container.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

/////////////////////////////////////////////////////////////////////////////////////

function applyMask(baseInputId, maskInputId, canvasId) {
  const baseImageInput = document.getElementById(baseInputId);
  const maskImageInput = document.getElementById(maskInputId);
  const resultContainer = document.getElementById("image-container");
  const labelButton = document.getElementById(maskInputId + "Label");

  if (baseImageInput.files.length) {
    if (canvasId == "canvas1") {
      selectImage1Button.style.display = "inline";
    } else if (canvasId == "canvas2") {
      selectImage2Button.style.display = "inline";
    }

    const baseImage = new Image();
    const maskImage = new Image();

    // Load base image
    baseImage.onload = () => {
      // Load mask image
      maskImage.onload = () => {
        let canvas = document.getElementById(canvasId);
        if (!canvas) {
          // Create new canvas
          canvas = document.createElement("canvas");
          canvas.id = canvasId;
          canvas.style.top = "50%";
          canvas.style.left = "50%";
          canvas.style.transform = "translate(-50%, -50%)";
          canvas.style.zIndex = resultContainer.children + 1;
          resultContainer.appendChild(canvas);
        }
        const ctx = canvas.getContext("2d");
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;

        // Draw the base image
        ctx.drawImage(baseImage, 0, 0);

        // Apply the mask
        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(maskImage, 0, 0, baseImage.width, baseImage.height);

        // Reset compositing to normal
        ctx.globalCompositeOperation = "source-over";
      };
      if (!maskImageInput.files.length) {
        const randomNumber = Math.floor(Math.random() * 24) + 1;
        maskImage.src = "images/watercolors/" + randomNumber + ".jpg";
      } else {
        maskImage.src = URL.createObjectURL(maskImageInput.files[0]);
        labelButton.style.backgroundColor = "#4caf50";
      }
    };
    baseImage.src = URL.createObjectURL(baseImageInput.files[0]);
  } else {
  }
}

function applyShadowToBaseImage(baseInputId, shadowCanvasId) {
  const baseImageInput = document.getElementById(baseInputId);
  const resultContainer = document.getElementById("image-container");
  const labelButton = document.getElementById(baseInputId + "Label");

  if (baseImageInput.files.length) {
    const baseImage = new Image();

    labelButton.style.backgroundColor = "#4caf50";

    // Load base image
    baseImage.onload = () => {
      let shadowCanvas = document.getElementById(shadowCanvasId);
      if (!shadowCanvas) {
        // Create new shadow canvas
        shadowCanvas = document.createElement("canvas");
        shadowCanvas.id = shadowCanvasId;
        shadowCanvas.style.position = "absolute";
        shadowCanvas.style.top = "50%";
        shadowCanvas.style.left = "50%";
        shadowCanvas.style.transform = "translate(-50%, -50%)";
        shadowCanvas.style.zIndex = resultContainer.children + 1;
        resultContainer.appendChild(shadowCanvas);
      }
      const ctx = shadowCanvas.getContext("2d");
      shadowCanvas.width = baseImage.width;
      shadowCanvas.height = baseImage.height;

      // Apply shadow properties
      ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 10;
      ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);
    };
    baseImage.src = URL.createObjectURL(baseImageInput.files[0]);
  } else {
    alert("Please upload the base image.");
  }
}
