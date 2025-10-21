import * as dom from "./domElements.js";
import * as state from "./state.js";
import {
  svgIconFilter,
  svgIconCollapse,
  svgIconHistory,
  svgIconExport,
} from "./constants.js";
import { initEventHandlers } from "./eventHandlers.js";
import { adjustMainContentMargin, renderChecklist, updateCheckedItemsOverlay } from "./ui.js";
import { getFormattedTimestamp } from "./utils.js";
import { processCsvText } from "./fileHandler.js";

async function loadInitialInventory() {
  try {
    const response = await fetch("inventario.csv");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    const lastModified = response.headers.get('last-modified') || new Date().toISOString();
    
    // Process the CSV text
    processCsvText(csvText, lastModified);

    // Automatically confirm with "Attivo" filter
    if (state.tempLoadedData) {
      state.setFullInventoryData(state.tempLoadedData);
      state.setCurrentChecklistState({
        checklist_timestamp: getFormattedTimestamp(),
        original_filters: ["Attivo"],
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
    }
  } catch (error) {
    console.error("Failed to load initial inventory:", error);
    dom.loadStatus.textContent = "Impossibile caricare inventario.csv. Carica un file manualmente.";
    // Show the manual file input section if auto-load fails
    if (dom.initialSectionsWrapper) dom.initialSectionsWrapper.classList.remove("hidden");
    dom.fileInputSection.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Inizializza i controlli della sidebar con le icone SVG
  dom.filterBtn.innerHTML = svgIconFilter;
  dom.collapseAllBtn.innerHTML = svgIconCollapse;
  dom.showCheckedBtn.innerHTML = svgIconHistory;
  dom.exportChecklistBtn.innerHTML = svgIconExport;

  // Aggiungi i pulsanti alla sidebar
  dom.sidebarControlsContainer.appendChild(dom.filterBtn);
  dom.sidebarControlsContainer.appendChild(dom.collapseAllBtn);
  dom.sidebarControlsContainer.appendChild(dom.showCheckedBtn);
  dom.sidebarControlsContainer.appendChild(dom.exportChecklistBtn);

  // Imposta il margine iniziale
  adjustMainContentMargin();

  // Collega tutti gli event listener
  initEventHandlers();

  // Auto-load the inventory
  loadInitialInventory();
});
