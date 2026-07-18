// The list of all base elements and their properties
const ELEMENTS = {
  Pyro: { colorClass: "bg-tile", URL: "./Elements/Pyro.png" },
  Hydro: { colorClass: "bg-tile", URL: "./Elements/Hydro.png" },
  Geo: { colorClass: "bg-tile", URL: "./Elements/Geo.png" },
  Cryo: { colorClass: "bg-tile", URL: "./Elements/Cryo.png" },
  Anemo: { colorClass: "bg-tile", URL: "./Elements/Anemo.png" },
  Dendro: { colorClass: "bg-tile", URL: "./Elements/Dendro.png" },
  Electro: { colorClass: "bg-tile", URL: "./Elements/Electro.png" },

  Overload: { colorClass: "bg-tile", URL: "./Elements/Overload.png" },
  Superconduct: { colorClass: "bg-tile", URL: "./Elements/Superconduct.png" },
  ElectroCharged: {
    colorClass: "bg-tile",
    URL: "./Elements/ElectroCharged.png",
  },
  Quicken: { colorClass: "bg-tile", URL: "./Elements/Quicken.png" },
  Vaporize: { colorClass: "bg-tile", URL: "./Elements/Vaporize.png" },
  Melt: { colorClass: "bg-tile", URL: "./Elements/Melt.png" },
  Bloom: { colorClass: "bg-tile", URL: "./Elements/Bloom.png" },
  Craystaline: { colorClass: "bg-tile", URL: "./Elements/Craystaline.png" },
  Frozen: { colorClass: "bg-tile", URL: "./Elements/Frozen.png" },
  Burning: { colorClass: "bg-tile", URL: "./Elements/Burning.png" },
  Swirl: { colorClass: "bg-tile", URL: "./Elements/Swirl.png" },

  Hyperbloom: { colorClass: "bg-tile", URL: "./Elements/Hyperbloom.png" },
  Spread: { colorClass: "bg-tile", URL: "./Elements/Spread.png" },
  Aggravate: { colorClass: "bg-tile", URL: "./Elements/Aggravate.png" },
  Burgeon: { colorClass: "bg-tile", URL: "./Elements/Burgeon.png" },
};

// The RECIPE BOOK
// Key is a sorted string of two element names: "Element1|Element2"
const REACTION_RECIPES = {
  "Cryo|Pyro": "Melt",
  "Electro|Pyro": "Overload",
  "Cryo|Electro": "Superconduct",
  "Cryo|Hydro": "Frozen",
  "Dendro|Hydro": "Bloom",
  "Dendro|Pyro": "Burning",
  "Hydro|Pyro": "Vaporize",
  "Electro|Hydro": "ElectroCharged",
  "Dendro|Electro": "Quicken",
  "Anemo|Pyro": "Swirl",
  "Anemo|Hydro": "Swirl",
  "Anemo|Electro": "Swirl",
  "Anemo|Cryo": "Swirl",
  "Geo|Pyro": "Craystaline",
  "Geo|Hydroro": "Craystaline",
  "Cryo|Geo": "Craystaline",
  "Electro|Geo": "Craystaline",

  "Bloom|Electro": "Hyperbloom",
  "Bloom|Pyro": "Burgeon",
  "Dendro|Quicken": "Spread",
  "Electro|Quicken": "Aggravate",
};

// --- GAME STATE ---
let foundElements = [
  "Pyro",
  "Hydro",
  "Electro",
  "Cryo",
  "Dendro",
  "Anemo",
  "Geo",
];

// --- DOM REFERENCES ---
const elementSource = document.getElementById("element-source");
const reactionLab = document.getElementById("reaction-lab");
const messageBox = document.getElementById("message-box");
const labPlaceholder = document.getElementById("lab-placeholder");
const counter = document.getElementById("counter");
const congoMsg = document.getElementById("congoMsg");

// --- INITIALIZATION ---
window.onload = () => {
  renderElements();
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerCancel);
};

// --- RENDERING FUNCTIONS ---

function removePlaceholder() {
  if (labPlaceholder) {
    labPlaceholder.style.display = "none";
  }
}

function showPlaceholder() {
  if (
    reactionLab.querySelectorAll(".element-tile").length === 0 &&
    labPlaceholder
  ) {
    labPlaceholder.style.display = "block";
  }
}

function createElementTile(
  elementName,
  isDraggable = true,
  x = null,
  y = null,
) {
  const element = ELEMENTS[elementName];
  const tile = document.createElement("div");
  const tileId =
    isDraggable && x !== null
      ? `tile-${elementName}-${Date.now()}`
      : elementName;

  tile.id = tileId;
  tile.className = `element-tile ${element.colorClass} text-white rounded-xl shadow-xl `;
  tile.setAttribute("data-element", elementName);
  tile.setAttribute("draggable", isDraggable);
  tile.innerHTML = `
                        <img src="${element.URL}" alt="${elementName}" class="text-3xl element-icon">
                        <div class="absolute bottom-0 text-xs leading-none">${elementName}</div>
                    `;

  if (x !== null && y !== null) {
    tile.style.position = "absolute";
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
  }

  if (isDraggable) {
    tile.addEventListener("dragstart", handleDragStart);
    tile.addEventListener("dragend", handleDragEnd);
    tile.addEventListener("pointerdown", handlePointerDown);
    reactionLab.addEventListener("dragleave", handleDragLeave);
  }
  return tile;
}

function renderElements() {
  elementSource.innerHTML = "";
  foundElements.forEach((elementName) => {
    const tile = createElementTile(elementName, true, null, null);
    elementSource.appendChild(tile);
  });
}

function displayMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.className = `p-4 mb-6 rounded-lg shadow-lg text-center text-lg transition duration-300 ease-in-out ${isError ? "bg-red-800" : "bg-green-800"}`;
  setTimeout(() => {
    messageBox.className =
      "p-4 mb-6 rounded-lg shadow-lg text-center text-lg transition duration-300 ease-in-out bg-gray-700";
  }, 3000);
}

// --- DRAG & DROP HANDLERS ---

let draggedElementData = null;
let activePointerDrag = null;

function handleDragStart(event) {
  const element = event.target.closest(".element-tile");
  if (!element) return;

  const isFromSource = element.parentElement.id === "element-source";

  draggedElementData = {
    name: element.getAttribute("data-element"),
    id: element.id,
    isFromSource: isFromSource,
    originalElement: isFromSource ? null : element,
  };

  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", element.id);
  }

  if (!isFromSource && draggedElementData.originalElement) {
    draggedElementData.originalElement.style.opacity = "0.3";
  }
}

function handleDragLeave(event) {
  if (
    event.target.id === "reaction-lab" ||
    event.target.closest("#reaction-lab")
  ) {
    reactionLab.classList.remove("drag-over");
    if (draggedElementData?.originalElement) {
      draggedElementData.originalElement.style.opacity = "1";
    }
  }
}

function handleDrop(event) {
  event.preventDefault();
  const droppedTarget = getDropTarget(event.clientX, event.clientY);
  finalizeDrop(event.clientX, event.clientY, droppedTarget);
}

function handleDragEnd(event) {
  if (!draggedElementData) return;
  const droppedTarget = getDropTarget(event.clientX, event.clientY);
  finalizeDrop(event.clientX, event.clientY, droppedTarget);
}

function handlePointerDown(event) {
  const tile = event.target.closest(".element-tile");
  if (!tile) return;

  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  const isFromSource = tile.parentElement.id === "element-source";
  const isLabTile = tile.parentElement.id === "reaction-lab";

  if (!isFromSource && !isLabTile) {
    return;
  }

  draggedElementData = {
    name: tile.getAttribute("data-element"),
    id: tile.id,
    isFromSource: isFromSource,
    originalElement: isFromSource ? null : tile,
  };

  activePointerDrag = {
    pointerId: event.pointerId,
    tile,
    startX: event.clientX,
    startY: event.clientY,
    clone: null,
    moved: false,
  };

  if (!isFromSource && draggedElementData.originalElement) {
    draggedElementData.originalElement.style.opacity = "0.3";
  }

  event.preventDefault();
  tile.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!activePointerDrag || event.pointerId !== activePointerDrag.pointerId) {
    return;
  }

  const dx = event.clientX - activePointerDrag.startX;
  const dy = event.clientY - activePointerDrag.startY;

  if (!activePointerDrag.moved && Math.hypot(dx, dy) < 8) {
    return;
  }

  activePointerDrag.moved = true;

  if (!activePointerDrag.clone) {
    const clone = activePointerDrag.tile.cloneNode(true);
    clone.className = `${clone.className} pointer-events-none fixed z-[1000] opacity-90`;
    clone.style.position = "fixed";
    clone.style.left = `${event.clientX - 35}px`;
    clone.style.top = `${event.clientY - 35}px`;
    clone.style.pointerEvents = "none";
    clone.style.transform = "scale(1.03)";
    document.body.appendChild(clone);
    activePointerDrag.clone = clone;
  } else {
    activePointerDrag.clone.style.left = `${event.clientX - 35}px`;
    activePointerDrag.clone.style.top = `${event.clientY - 35}px`;
  }
}

function handlePointerUp(event) {
  if (!activePointerDrag || event.pointerId !== activePointerDrag.pointerId) {
    return;
  }

  const droppedTarget = getDropTarget(event.clientX, event.clientY);

  if (activePointerDrag.moved) {
    finalizeDrop(event.clientX, event.clientY, droppedTarget);
  } else {
    cleanupPointerDrag();
  }
}

function handlePointerCancel(event) {
  if (!activePointerDrag || event.pointerId !== activePointerDrag.pointerId) {
    return;
  }
  cleanupPointerDrag();
}

function cleanupPointerDrag() {
  if (activePointerDrag?.clone) {
    activePointerDrag.clone.remove();
  }
  activePointerDrag = null;
  if (draggedElementData?.originalElement) {
    draggedElementData.originalElement.style.opacity = "1";
  }
}

function getDropTarget(clientX, clientY) {
  const elementUnderPointer = document.elementFromPoint(clientX, clientY);
  if (!elementUnderPointer) return null;

  const tile = elementUnderPointer.closest(".element-tile");
  if (!tile) return null;

  return tile.parentElement?.id === "reaction-lab" ? tile : null;
}

function getDropCoordinates(clientX, clientY) {
  const labRect = reactionLab.getBoundingClientRect();
  let x = clientX - labRect.left - 35;
  let y = clientY - labRect.top - 35;

  const tileWidth = 70;
  const tileHeight = 70;
  const labWidth = labRect.width;
  const labHeight = labRect.height;

  x = Math.max(0, Math.min(x, labWidth - tileWidth));
  y = Math.max(0, Math.min(y, labHeight - tileHeight));

  return { x, y };
}

function finalizeDrop(clientX, clientY, droppedTarget = null) {
  reactionLab.classList.remove("drag-over");

  if (!draggedElementData) {
    cleanupPointerDrag();
    return;
  }

  if (draggedElementData.originalElement) {
    draggedElementData.originalElement.style.opacity = "1";
  }

  const labRect = reactionLab.getBoundingClientRect();
  const isInsideLab =
    clientX >= labRect.left &&
    clientX <= labRect.right &&
    clientY >= labRect.top &&
    clientY <= labRect.bottom;
  const { x, y } = getDropCoordinates(clientX, clientY);

  if (!isInsideLab) {
    if (draggedElementData.originalElement) {
      draggedElementData.originalElement.remove();
      displayMessage("Element removed from the playground.", true);
    }
    cleanupPointerDrag();
    draggedElementData = null;
    return;
  }

  if (!droppedTarget) {
    removePlaceholder();

    if (draggedElementData.isFromSource) {
      const droppedTile = createElementTile(
        draggedElementData.name,
        true,
        x,
        y,
      );
      reactionLab.appendChild(droppedTile);
      displayMessage(
        `Added ${draggedElementData.name} to the lab. Now add another one to combine!`,
      );
    } else {
      const movingTile = draggedElementData.originalElement;
      if (movingTile) {
        movingTile.style.left = `${x}px`;
        movingTile.style.top = `${y}px`;
      }
    }
  } else {
    if (draggedElementData.originalElement === droppedTarget) {
      const movingTile = draggedElementData.originalElement;
      if (movingTile) {
        movingTile.style.left = `${x}px`;
        movingTile.style.top = `${y}px`;
      }
    } else if (
      draggedElementData.originalElement &&
      droppedTarget.parentElement.id === "reaction-lab"
    ) {
      const sourceName = draggedElementData.name;
      const targetName = droppedTarget.getAttribute("data-element");

      if (sourceName === targetName) {
        displayMessage(
          `Whoops! Combining ${sourceName} with itself doesn't cause a reaction, try something new!`,
          true,
        );
        cleanupPointerDrag();
        draggedElementData = null;
        return;
      }

      const sortedNames = [sourceName, targetName].sort();
      const recipeKey = sortedNames.join("|");
      const newElement = REACTION_RECIPES[recipeKey];

      if (newElement) {
        performReaction(
          newElement,
          droppedTarget,
          draggedElementData.originalElement,
          x,
          y,
        );
      } else {
        displayMessage(
          `No known reaction between ${sourceName} and ${targetName}. Experiment failed!`,
          true,
        );
      }
    } else {
      const sourceName = draggedElementData.name;
      const targetName = droppedTarget.getAttribute("data-element");

      if (sourceName === targetName) {
        displayMessage(
          `Whoops! Combining ${sourceName} with itself doesn't cause a reaction, try something new!`,
          true,
        );
        cleanupPointerDrag();
        draggedElementData = null;
        return;
      }

      const sortedNames = [sourceName, targetName].sort();
      const recipeKey = sortedNames.join("|");
      const newElement = REACTION_RECIPES[recipeKey];

      if (newElement) {
        performReaction(
          newElement,
          droppedTarget,
          draggedElementData.originalElement,
          x,
          y,
        );
      } else {
        displayMessage(
          `No known reaction between ${sourceName} and ${targetName}. Experiment failed!`,
          true,
        );
      }
    }
  }

  cleanupPointerDrag();
  draggedElementData = null;
}

let RemainingElements = Object.keys(ELEMENTS).length - 7;
let FoundElements = 0;

function performReaction(
  newElement,
  targetTile,
  sourceTile,
  x = null,
  y = null,
  isDraggable = true,
) {
  // Remove the two source tiles from the Lab
  targetTile.remove();
  if (sourceTile) {
    sourceTile.remove();
  }

  // Add the new reaction tile to the Lab at the drop point
  const newTile = createElementTile(newElement, isDraggable, x, y);
  reactionLab.appendChild(newTile);

  //  Add the new reaction to the Found Elements list if it's new
  if (!foundElements.includes(newElement)) {
    foundElements.push(newElement);
    renderElements(); // Re-render the source area to include the new element
    RemainingElements--;
    FoundElements++;
    counter.textContent = FoundElements;
    displayMessage(
      `You discovered ${newElement}! Only ${RemainingElements} elemental reactions remain!`,
      false,
    );
  } else {
    displayMessage(`Reaction complete! Created another ${newElement}.!`);
  }

  if (RemainingElements === 0) {
    displayMessage(
      "Congratulations! You have discovered all elemental reactions!",
      false,
    );
    congoMsg.classList.add("show");
  }
  showPlaceholder();
}

// --- CONTROL BUTTON HANDLERS ---

function resetLab() {
  reactionLab
    .querySelectorAll(".element-tile")
    .forEach((tile) => tile.remove());
  showPlaceholder();
  displayMessage("Lab reset. Start a fresh synthesis!");
}

function hideCongoMsg() {
  congoMsg.classList.remove("show");
}
