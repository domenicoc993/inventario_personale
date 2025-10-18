import * as dom from "./domElements.js";
import * as state from "./state.js";
import {
  adjustMainContentMargin,
  renderChecklist,
  updateCheckedItemsOverlay,
  updateCounters,
  applyVisualState,
  updateParentState,
  updateAllParentStates,
} from "./ui.js";
import { getFormattedTimestamp } from "./utils.js";
import { processCsvFile, processJsonFile } from "./fileHandler.js";

export function handleItemCheck(uniqueId, isChecked) {
  const itemState = state.currentChecklistState[uniqueId];
  if (!itemState || itemState.isExceptionallyShown) return;
  itemState.checked = isChecked;
  itemState.timestamp = isChecked ? getFormattedTimestamp() : null;

  applyVisualState(uniqueId);

  if (isChecked) {
    const listItem = document.querySelector(`[data-item-id="${uniqueId}"]`);
    if (listItem && listItem.classList.contains("parent")) {
      const childrenUl = listItem.querySelector(".children-list");
      const toggleBtn = listItem.querySelector(".toggle-btn");
      if (childrenUl && childrenUl.classList.contains("collapsed")) {
        if (toggleBtn && toggleBtn.style.display !== "none") {
          childrenUl.classList.remove("collapsed");
          toggleBtn.classList.remove("collapsed");
        }
      }
    }
  }

  if (itemState.parentId) updateParentState(itemState.parentId);
  updateCheckedItemsOverlay();

  const activeCategoryIsEmpty = updateCounters();

  if (state.currentActiveCategoryFilter && activeCategoryIsEmpty) {
    state.setCurrentActiveCategoryFilter(null);
    renderChecklist();
    if (!dom.sidebarMenu.classList.contains("open")) {
      dom.sidebarMenu.classList.add("open");
      adjustMainContentMargin();
    }
  }
}

export function restoreItem(uniqueIdToRestore) {
  const itemState = state.currentChecklistState[uniqueIdToRestore];
  if (!itemState || itemState.isExceptionallyShown) return;
  itemState.checked = false;
  itemState.timestamp = null;

  applyVisualState(uniqueIdToRestore);
  if (itemState.parentId) updateParentState(itemState.parentId);
  updateAllParentStates();
  updateCheckedItemsOverlay();
  const activeCatIsEmpty = updateCounters();

  if (state.currentActiveCategoryFilter && activeCatIsEmpty) {
    state.setCurrentActiveCategoryFilter(null);
    renderChecklist();
    if (!dom.sidebarMenu.classList.contains("open")) {
      dom.sidebarMenu.classList.add("open");
      adjustMainContentMargin();
    }
  }
}


function clearAllCheckedItems() {
  let itemsWereRestored = false;
  const idsToRestore = [];
  for (const uniqueId in state.currentChecklistState) {
    if (
      state.currentChecklistState[uniqueId].checked &&
      !state.currentChecklistState[uniqueId].isExceptionallyShown
    ) {
      idsToRestore.push(uniqueId);
    }
  }
  idsToRestore.forEach((id) => {
    restoreItem(id);
    itemsWereRestored = true;
  });

  if (itemsWereRestored) {
    state.setHasUnsavedChanges(true);
    const activeCatIsEmpty = updateCounters();

    if (state.currentActiveCategoryFilter && activeCatIsEmpty) {
      state.setCurrentActiveCategoryFilter(null);
      renderChecklist();
      if (!dom.sidebarMenu.classList.contains("open")) {
        dom.sidebarMenu.classList.add("open");
        adjustMainContentMargin();
      }
    }
  }
}

function toggleAll(shouldExpand) {
  const allListItems = document.querySelectorAll(
    ".checklist .item[data-item-id]",
  );
  allListItems.forEach((itemLi) => {
    const childrenUl = itemLi.querySelector(".children-list");
    const toggleBtn = itemLi.querySelector(".toggle-btn");
    if (childrenUl && toggleBtn && toggleBtn.style.display !== "none") {
      childrenUl.classList.toggle("collapsed", !shouldExpand);
      toggleBtn.classList.toggle("collapsed", !shouldExpand);
    }
  });
}
export function toggleChildren(uniqueId) {
  const listItem = document.querySelector(`[data-item-id="${uniqueId}"]`);
  if (!listItem) return;
  const toggleBtn = listItem.querySelector(".toggle-btn");
  if (!toggleBtn || toggleBtn.style.display === "none") return;

  const childrenUl = listItem.querySelector(".children-list");
  if (childrenUl) {
    childrenUl.classList.toggle("collapsed");
    toggleBtn.classList.toggle("collapsed");
  }
}
export function initEventHandlers() {
  dom.hamburgerBtn.addEventListener("click", () => {
    dom.sidebarMenu.classList.toggle("open");
    adjustMainContentMargin();
  });

  dom.collapseAllBtn.addEventListener("click", () => toggleAll(false));
dom.checkedItemsOverlay.addEventListener("click", (event) => {
  if (event.target === dom.checkedItemsOverlay) {
    dom.checkedItemsOverlay.classList.add("hidden");
    document.body.classList.remove("body-blur");
  }
});

dom.loadFileBtn.addEventListener("click", () => {
  const file = dom.fileInput.files[0];
  if (!file) {
    dom.loadStatus.textContent = "Seleziona un file.";
    return;
  }
  dom.loadStatus.textContent = `Lettura file "${file.name}"...`;
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".csv")) {
    processCsvFile(file);
  } else if (fileName.endsWith(".json")) {
    processJsonFile(file);
  } else {
    dom.loadStatus.textContent =
      "Tipo di file non supportato. Seleziona un file .csv o .json.";
    dom.fileInput.value = "";
  }
});

dom.confirmLoadNewBtn.addEventListener("click", () => {
  const selectedUtilizzi = Array.from(dom.filterCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  if (selectedUtilizzi.length === 0) {
    alert("Seleziona almeno un filtro di utilizzo.");
    return;
  }
  if (!state.tempLoadedData) {
    dom.loadStatus.textContent = "Dati non pronti.";
    return;
  }
  state.setFullInventoryData(state.tempLoadedData);
  state.setCurrentChecklistState({
    checklist_timestamp: getFormattedTimestamp(),
    original_filters: selectedUtilizzi,
  });
  state.setCurrentActiveCategoryFilter(null);

  if (dom.initialSectionsWrapper)
    dom.initialSectionsWrapper.classList.add("hidden");
  dom.mainContent.classList.remove("hidden");
  dom.sidebarMenu.classList.add("open");
  adjustMainContentMargin();
  renderChecklist();
  updateCheckedItemsOverlay();
  dom.loadStatus.textContent = `Inventario caricato.`;
  state.setTempLoadedData(null);
  state.setHasUnsavedChanges(false);
});

dom.filterBtn.addEventListener("click", () => {
  // Populate checkboxes based on current state
  const currentFilters = state.currentChecklistState.original_filters || [];
  const modalCheckboxes = document.querySelectorAll('input[name="modal-utilizzo-filter"]');
  modalCheckboxes.forEach(cb => {
    cb.checked = currentFilters.includes(cb.value);
  });
  dom.filterModalOverlay.classList.remove("hidden");
});

dom.closeFilterModalBtn.addEventListener("click", () => {
  dom.filterModalOverlay.classList.add("hidden");
});

dom.applyFiltersBtn.addEventListener("click", () => {
  const modalCheckboxes = document.querySelectorAll('input[name="modal-utilizzo-filter"]');
  const selectedUtilizzi = Array.from(modalCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  state.currentChecklistState.original_filters = selectedUtilizzi;
  renderChecklist();
  dom.filterModalOverlay.classList.add("hidden");
});

dom.confirmLoadSavedBtn.addEventListener("click", () => {
  if (!state.tempLoadedData) {
    dom.loadStatus.textContent = "Dati non pronti.";
    return;
  }
  state.setFullInventoryData(state.tempLoadedData);
  state.setCurrentChecklistState(state.tempLoadedData.currentChecklistState);
  state.currentChecklistState.checklist_timestamp =
    state.currentChecklistState.checklist_timestamp || getFormattedTimestamp();
  state.setCurrentActiveCategoryFilter(null);

  for (const key in state.currentChecklistState) {
    if (
      state.currentChecklistState[key] &&
      typeof state.currentChecklistState[key] === "object"
    ) {
      state.currentChecklistState[key].isExceptionallyShown = false;
    }
  }

  if (dom.initialSectionsWrapper)
    dom.initialSectionsWrapper.classList.add("hidden");
  dom.mainContent.classList.remove("hidden");
  dom.sidebarMenu.classList.add("open");
  adjustMainContentMargin();
  renderChecklist();
  updateCheckedItemsOverlay();
  dom.loadStatus.textContent = `Checklist salvata caricata.`;
  state.setTempLoadedData(null);
  state.setHasUnsavedChanges(false);
});

dom.showCheckedBtn.addEventListener("click", () => {
  dom.checkedItemsOverlay.classList.remove("hidden");
  document.body.classList.add("body-blur");
  updateCheckedItemsOverlay();
});

dom.clearAllCheckedBtn.addEventListener("click", clearAllCheckedItems);

dom.exportChecklistBtn.addEventListener("click", () => {
  if (!state.fullInventoryData) {
    alert("Carica un inventario prima.");
    return;
  }
  const stateToExport = JSON.parse(JSON.stringify(state.currentChecklistState));
  stateToExport.checklist_timestamp = getFormattedTimestamp();

  if (!stateToExport.original_filters) {
    stateToExport.original_filters = Array.from(dom.filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
  }

  for (const key in stateToExport) {
    if (stateToExport[key] && typeof stateToExport[key] === "object") {
      delete stateToExport[key].isExceptionallyShown;
    }
  }
  const exportData = {
    csv_ultima_modifica: state.fullInventoryData.csv_ultima_modifica,
    inventario: state.fullInventoryData.inventario,
    currentChecklistState: stateToExport,
  };
  const filename = `checklist_${getFormattedTimestamp().replace(/[ .:"]/g, "_")}.json`;
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportData, null, 2));
  const dl = document.createElement("a");
  dl.setAttribute("href", dataStr);
  dl.setAttribute("download", filename);
  dl.click();
  dl.remove();
  state.setHasUnsavedChanges(false);
  dom.loadStatus.textContent = `Checklist esportata: ${filename}`;
});

window.addEventListener("beforeunload", (event) => {
  if (state.hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue =
      "Hai modifiche non salvate. Sei sicuro di voler uscire?";
    return event.returnValue;
  }
});
}