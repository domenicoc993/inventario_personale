export const fileInput = document.getElementById("json-file-input");
export const loadFileBtn = document.getElementById("load-file-btn");
export const loadStatus = document.getElementById("load-status");
export const cancelChangeFileBtn = document.getElementById("cancel-change-file-btn");

export const initialSectionsWrapper = document.getElementById(
    "initial-sections-wrapper",
  );
export const fileInputSection = document.getElementById("file-input-section");
export const confirmLoadSection = document.getElementById("confirm-load-section");
export const confirmNewInventorySection = document.getElementById(
    "confirm-new-inventory-section",
  );
export const confirmSavedChecklistSection = document.getElementById(
    "confirm-saved-checklist-section",
  );
export const confirmLoadSavedBtn = document.getElementById("confirm-load-saved-btn");

export const savedOriginalFiltersSpan = document.getElementById(
    "saved-original-filters",
  );
export const savedTotalItemsSpan = document.getElementById("saved-total-items");
export const savedCheckedItemsSpan = document.getElementById("saved-checked-items");
export const savedRemainingItemsSpan = document.getElementById(
    "saved-remaining-items",
  );

export const hamburgerBtn = document.getElementById("hamburger-btn");
export const sidebarMenu = document.getElementById("sidebar-menu");
export const sidebarTotalElementsSpan = document.getElementById(
    "sidebar-total-elements",
  );
export const sidebarFilteredElementsSpan = document.getElementById(
    "sidebar-filtered-elements",
  );
export const sidebarCheckedElementsSpan = document.getElementById(
    "sidebar-checked-elements",
  );
export const sidebarRemainingElementsSpan = document.getElementById(
    "sidebar-remaining-elements",
  );
export const sidebarInventoryUtilizzoCounters = document.getElementById(
    "sidebar-inventory-utilizzo-counters",
  );
export const sidebarCategoryFiltersContainer = document.getElementById(
    "sidebar-category-filters",
  );
export const sidebarControlsContainer = document.getElementById("sidebar-controls");

export const filterCheckboxes = document.querySelectorAll(
    'input[name="utilizzo-filter"]',
  );

export const mainContent = document.getElementById("main-content");
export const checklistContainer = document.getElementById("checklist-container");
export const allItemsCheckedMessage = document.getElementById("all-items-checked-message",);
export const filterBtn = document.getElementById("filter-btn");
export const collapseAllBtn = document.getElementById("collapse-all-btn");
export const showCheckedBtn = document.getElementById("show-checked-btn");
export const exportChecklistBtn = document.getElementById("export-checklist-btn");
export const changeFileBtn = document.createElement("button");
changeFileBtn.id = "change-file-btn";
export const checkedItemsOverlay = document.getElementById("checked-items-overlay");
export const checkedItemsList = document.getElementById("checked-items-list");
export const clearAllCheckedBtn = document.getElementById("clear-all-checked-btn");

// Filter Modal Elements
export const filterModalOverlay = document.getElementById("filter-modal-overlay");
export const closeFilterModalBtn = document.getElementById("close-filter-modal-btn");
export const filterModalContent = document.getElementById("filter-modal-content");
export const applyFiltersBtn = document.getElementById("apply-filters-btn");
