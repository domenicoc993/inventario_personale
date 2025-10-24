import * as dom from "./domElements.js";
import * as state from "./state.js";
import { CATEGORY_COLORS, UTILIZZO_COLORS, CATEGORY_ORDER } from "./constants.js";
import {
  generateUniqueId,
  formatItemText,
  countAllItemsRecursive,
  getFormattedTimestamp,
} from "./utils.js";
import { handleItemCheck, restoreItem, toggleChildren } from "./eventHandlers.js";

export function renderCategoryFilters() {
  if (!state.fullInventoryData || !state.fullInventoryData.inventario) {
    dom.sidebarCategoryFiltersContainer.innerHTML = "";
    return false; // Nessuna categoria attiva è vuota perché non ci sono categorie
  }
  dom.sidebarCategoryFiltersContainer.innerHTML = "";
  let activeCategoryIsEmpty = false; // Indica se la *categoria attiva* (se esiste) non ha più item rimanenti
  let currentSelectedUtilizzi =
    state.currentChecklistState.original_filters ||
    Array.from(dom.filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
  const categoryCounts = {}; // Conteggio degli item *non spuntati e non exceptionally shown* per categoria
  const allInventoryCategories = collectCategoriesRecursive(
    state.fullInventoryData.inventario,
  );
  allInventoryCategories.forEach((cat) => (categoryCounts[cat] = 0));
  if (!allInventoryCategories.has("Altro")) {
    // Assicura che "Altro" esista se ci sono item senza categoria
    categoryCounts["Altro"] = 0;
  }
  let totalAllCategoriesRemaining = 0; // Totale item rimanenti in *tutte* le categorie (per il filtro "Tutte le categorie")
  // Itera su currentChecklistState per contare gli item non spuntati, filtrati per utilizzo
  Object.values(state.currentChecklistState).forEach((stateEntry) => {
    if (
      stateEntry.itemData &&
      !stateEntry.checked &&
      !stateEntry.isExceptionallyShown // Solo item "reali" non spuntati
    ) {
      const item = stateEntry.itemData;
      const itemCategory =
        item.categoria && item.categoria.trim() !== ""
          ? item.categoria
          : "Altro";
      const passesUtilizzo =
        currentSelectedUtilizzi.length === 0 ||
        currentSelectedUtilizzi.includes(item.utilizzo);
      if (passesUtilizzo) {
        totalAllCategoriesRemaining++;
        if (categoryCounts.hasOwnProperty(itemCategory)) {
          categoryCounts[itemCategory]++;
        } else {
          // Se una categoria appare in itemData ma non in allInventoryCategories (improbabile con la logica attuale)
          categoryCounts[itemCategory] = 1;
        }
      }
    }
  });
  const allItemsFilter = document.createElement("div");
  allItemsFilter.classList.add("category-filter-item");
  allItemsFilter.dataset.categoryName = "null"; // Usa "null" come stringa per coerenza con dataset
  if (state.currentActiveCategoryFilter === null) {
    allItemsFilter.classList.add("active");
  }
  const allIconSvg = getCategoryIcon("Tutte le categorie");
  const allIconNode = new DOMParser().parseFromString(allIconSvg, "image/svg+xml").documentElement;
  allItemsFilter.appendChild(allIconNode);
  const allNameSpan = document.createElement("span");
  allNameSpan.classList.add("category-name");
  allNameSpan.textContent = "Tutte le categorie";
  allItemsFilter.style.backgroundColor = CATEGORY_COLORS.Default;
  allItemsFilter.appendChild(allNameSpan);
  const allCountSpan = document.createElement("span");
  allCountSpan.classList.add("category-item-count");
  allCountSpan.textContent = totalAllCategoriesRemaining;
  allItemsFilter.appendChild(allCountSpan);
  allItemsFilter.addEventListener("click", () => {
    if (state.currentActiveCategoryFilter !== null) {
      // Evita rerender se già su "Tutte"
      state.setCurrentActiveCategoryFilter(null);
      renderChecklist();
    }
  });
  dom.sidebarCategoryFiltersContainer.appendChild(allItemsFilter);
  const sortedUniqueCategories = [];
  CATEGORY_ORDER.forEach((catName) => {
    if (allInventoryCategories.has(catName) && catName !== "Altro") {
      sortedUniqueCategories.push(catName);
    }
  });
  allInventoryCategories.forEach((catName) => {
    // Aggiungi categorie non in CATEGORY_ORDER, escludendo "Altro" se già gestito
    if (
      catName !== "Altro" &&
      !CATEGORY_ORDER.includes(catName) &&
      !sortedUniqueCategories.includes(catName)
    ) {
      sortedUniqueCategories.push(catName);
    }
  });
  if (
    allInventoryCategories.has("Altro") &&
    !sortedUniqueCategories.includes("Altro")
  ) {
    // Assicura che "Altro" sia alla fine se presente
    sortedUniqueCategories.push("Altro");
  }
  sortedUniqueCategories.forEach((category) => {
    const remainingInCategory = categoryCounts[category] || 0;
    // Controlla se la *categoria attiva* è questa e non ha più item rimanenti
    if (
      state.currentActiveCategoryFilter === category &&
      remainingInCategory === 0
    ) {
      activeCategoryIsEmpty = true;
    }
    // Mostra la categoria solo se ha item rimanenti o se è la categoria attiva (per permettere di deselezionarla)
    // O se è la categoria attiva e diventa vuota, così l'utente la vede scomparire / resettarsi
    if (remainingInCategory > 0 || state.currentActiveCategoryFilter === category) {
      const filterItem = document.createElement("div");
      filterItem.classList.add("category-filter-item");
      filterItem.dataset.categoryName = category;
      if (state.currentActiveCategoryFilter === category) {
        filterItem.classList.add("active");
      }
      
      const iconSvg = getCategoryIcon(category);
      const iconNode = new DOMParser().parseFromString(iconSvg, "image/svg+xml").documentElement;
      filterItem.appendChild(iconNode);
      const nameSpan = document.createElement("span");
      nameSpan.classList.add("category-name");
      nameSpan.textContent = category;
      filterItem.style.backgroundColor =
        CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
      nameSpan.style.color = "white";
      filterItem.appendChild(nameSpan);
      const countSpan = document.createElement("span");
      countSpan.classList.add("category-item-count");
      countSpan.textContent = remainingInCategory;
      filterItem.appendChild(countSpan);
      filterItem.addEventListener("click", () => {
        if (state.currentActiveCategoryFilter !== category) {
          // Evita rerender se si clicca sulla stessa categoria attiva
          state.setCurrentActiveCategoryFilter(category);
          renderChecklist();
        }
      });
      dom.sidebarCategoryFiltersContainer.appendChild(filterItem);
    }
  });
  return activeCategoryIsEmpty;
}

export function adjustMainContentMargin() {
  const targetMarginLeft = dom.sidebarMenu.classList.contains("open")
    ? "300px"
    : "70px";
  if (
    dom.initialSectionsWrapper &&
    !dom.initialSectionsWrapper.classList.contains("hidden")
  ) {
    dom.initialSectionsWrapper.style.marginLeft = targetMarginLeft;
  }
  if (dom.mainContent && !dom.mainContent.classList.contains("hidden")) {
    dom.mainContent.style.marginLeft = targetMarginLeft;
  }
}

function countActuallyFilteredItemsRecursive(
  items,
  selectedUtilizzi,
  activeCategory = null,
) {
  let totalFiltered = 0;
  function recursiveCount(itemList) {
    if (!itemList) return;
    itemList.forEach((subItem) => {
      const passesUtilizzo =
        selectedUtilizzi && selectedUtilizzi.length > 0
          ? selectedUtilizzi.includes(subItem.utilizzo)
          : true;
      const passesCategory =
        !activeCategory || subItem.categoria === activeCategory;
      if (passesUtilizzo && passesCategory) {
        totalFiltered++;
      }
      if (subItem.children) {
        recursiveCount(subItem.children);
      }
    });
  }
  recursiveCount(items);
  return totalFiltered;
}

export function updateCounters() {
  let activeCategoryIsEmpty = false;
  if (!state.fullInventoryData || !state.fullInventoryData.inventario) {
    dom.sidebarTotalElementsSpan.textContent = "0";
    dom.sidebarFilteredElementsSpan.textContent = "0";
    dom.sidebarCheckedElementsSpan.textContent = "0";
    dom.sidebarRemainingElementsSpan.textContent = "0";
    activeCategoryIsEmpty = renderCategoryFilters();
    checkIfAllItemsCheckedInEntireList();
    return activeCategoryIsEmpty;
  }
  const totalInvCount = countAllItemsRecursive(state.fullInventoryData.inventario);
  dom.sidebarTotalElementsSpan.textContent = totalInvCount;

  let currentSelectedUtilizzi =
    state.currentChecklistState.original_filters ||
    Array.from(dom.filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

  let actualFilteredCountForDisplay = countActuallyFilteredItemsRecursive(
    state.fullInventoryData.inventario,
    currentSelectedUtilizzi,
    state.currentActiveCategoryFilter,
  );
  dom.sidebarFilteredElementsSpan.textContent = actualFilteredCountForDisplay;

  let visibleCheckedItemsCount = 0;
  Object.values(state.currentChecklistState).forEach((entry) => {
    if (entry.checked && entry.itemData && !entry.isExceptionallyShown) {
      const itemUtilizzo = entry.itemData.utilizzo;
      const itemCategory = entry.itemData.categoria;

      const passesEffectiveUtilizzo = state.currentChecklistState.original_filters
        ? state.currentChecklistState.original_filters.length === 0 ||
          state.currentChecklistState.original_filters.includes(itemUtilizzo)
        : currentSelectedUtilizzi.length === 0 ||
          currentSelectedUtilizzi.includes(itemUtilizzo);

      const passesCategoryFilter = 
        !state.currentActiveCategoryFilter ||
        itemCategory === state.currentActiveCategoryFilter;

      if (passesEffectiveUtilizzo && passesCategoryFilter) {
        visibleCheckedItemsCount++;
      }
    }
  });
  dom.sidebarCheckedElementsSpan.textContent = visibleCheckedItemsCount;

  const remainingCountForDisplay = Math.max(
    0,
    actualFilteredCountForDisplay - visibleCheckedItemsCount,
  );
  dom.sidebarRemainingElementsSpan.textContent = remainingCountForDisplay;

  activeCategoryIsEmpty = renderCategoryFilters();
  checkIfAllItemsCheckedInEntireList();
  return activeCategoryIsEmpty;
}

function checkIfAllItemsCheckedInEntireList() {
  if (
    !dom.sidebarTotalElementsSpan ||
    !dom.sidebarRemainingElementsSpan ||
    !dom.checklistContainer ||
    !dom.allItemsCheckedMessage
  )
    return;

  let totalItemsMatchingUtilizzoFilters = 0;
  let checkedItemsMatchingUtilizzoFilters = 0;

  const currentSelectedUtilizzi =
    state.currentChecklistState.original_filters ||
    Array.from(dom.filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

  if (state.fullInventoryData && state.fullInventoryData.inventario) {
    totalItemsMatchingUtilizzoFilters = 0;
    Object.values(state.currentChecklistState).forEach((stateEntry) => {
      if (stateEntry.itemData && !stateEntry.isExceptionallyShown) {
        const itemUtilizzo = stateEntry.itemData.utilizzo;
        const passesUtilizzo =
          currentSelectedUtilizzi.length === 0 ||
          currentSelectedUtilizzi.includes(itemUtilizzo);
        if (passesUtilizzo) {
          totalItemsMatchingUtilizzoFilters++;
        }
      }
    });

    Object.values(state.currentChecklistState).forEach((stateEntry) => {
      if (
        stateEntry.checked &&
        stateEntry.itemData &&
        !stateEntry.isExceptionallyShown
      ) {
        const itemUtilizzo = stateEntry.itemData.utilizzo;
        const passesUtilizzo =
          currentSelectedUtilizzi.length === 0 ||
          currentSelectedUtilizzi.includes(itemUtilizzo);
        if (passesUtilizzo) {
          checkedItemsMatchingUtilizzoFilters++;
        }
      }
    });
  }

  if (dom.mainContent.classList.contains("hidden")) {
    dom.checklistContainer.classList.remove("hidden");
    dom.allItemsCheckedMessage.classList.add("hidden");
    return;
  }

  if (
    totalItemsMatchingUtilizzoFilters > 0 &&
    checkedItemsMatchingUtilizzoFilters === totalItemsMatchingUtilizzoFilters
  ) {
    dom.checklistContainer.classList.add("hidden");
    dom.allItemsCheckedMessage.classList.remove("hidden");
  } else {
    dom.checklistContainer.classList.remove("hidden");
    dom.allItemsCheckedMessage.classList.add("hidden");
  }
}

function updateUtilizzoCounters(inventory) {
  dom.sidebarInventoryUtilizzoCounters.innerHTML = "";
  if (!inventory || !inventory.length) {
    dom.sidebarInventoryUtilizzoCounters.classList.add("hidden");
    return;
  }
  const counts = { Attivo: 0, "In uso": 0, Archiviato: 0, Sconosciuto: 0 };
  function countRecursive(items) {
    items.forEach((item) => {
      counts[item.utilizzo || "Sconosciuto"] =
        (counts[item.utilizzo || "Sconosciuto"] || 0) + 1;
      if (item.children) countRecursive(item.children);
    });
  }
  countRecursive(inventory);

  const utilizziOrdinati = ["Attivo", "In uso", "Archiviato", "Sconosciuto"];
  let tagsHtml = "";
  utilizziOrdinati.forEach((utilizzo) => {
    if (counts[utilizzo] > 0) {
      tagsHtml += `<span class="utilizzo-count-tag" style="background-color:${UTILIZZO_COLORS[utilizzo] || UTILIZZO_COLORS.Default}; color:white;">${utilizzo} (${counts[utilizzo]})</span>`;
    }
  });
  if (tagsHtml) {
    dom.sidebarInventoryUtilizzoCounters.innerHTML =
      "Utilizzo Inventario: " + tagsHtml;
    dom.sidebarInventoryUtilizzoCounters.classList.remove("hidden");
  } else {
    dom.sidebarInventoryUtilizzoCounters.classList.add("hidden");
  }
}

function itemOrDescendantPassesFilter(
  item,
  selectedUtilizzi,
  activeCategory = null,
) {
  const passesUtilizzo =
    !selectedUtilizzi ||
    selectedUtilizzi.length === 0 ||
    selectedUtilizzi.includes(item.utilizzo);
  const passesCategory = !activeCategory || item.categoria === activeCategory;

  if (passesUtilizzo && passesCategory) return true;

  if (item.children && item.children.length > 0) {
    return item.children.some((child) =>
      itemOrDescendantPassesFilter(child, selectedUtilizzi, activeCategory),
    );
  }
  return false;
}

function createChecklistItem(
  item,
  uniqueId,
  parentUniqueId,
  selectedUtilizziForRendering,
  activeCategoryForRendering,
  isCurrentItemExceptionallyShown,
) {
  const li = document.createElement("li");
  li.classList.add("item");

  const isPotentialParent = item.children && item.children.length > 0;

  if (isCurrentItemExceptionallyShown) {
    li.classList.add("item-exceptionally-shown");
  }

  li.dataset.itemId = uniqueId;
  li.dataset.parentId = parentUniqueId;

  if (!state.currentChecklistState[uniqueId]) {
    state.currentChecklistState[uniqueId] = {
      checked: false,
      timestamp: null,
      parentId: parentUniqueId,
      itemData: { ...item },
      isExceptionallyShown: isCurrentItemExceptionallyShown,
    };
  } else {
    state.currentChecklistState[uniqueId].itemData = { ...item };
    state.currentChecklistState[uniqueId].parentId = parentUniqueId;
    state.currentChecklistState[uniqueId].isExceptionallyShown =
      isCurrentItemExceptionallyShown;
  }

  const itemRowDiv = document.createElement("div");
  itemRowDiv.classList.add("item-row");
  const itemControlsDiv = document.createElement("div");
  itemControlsDiv.classList.add("item-controls");

  const toggleBtn = document.createElement("button");
  toggleBtn.classList.add("toggle-btn", "collapsed");
  toggleBtn.innerHTML = "▾";
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleChildren(uniqueId);
  });
  itemControlsDiv.appendChild(toggleBtn);

  const spacer = document.createElement("span");
  spacer.classList.add("toggle-spacer");
  itemControlsDiv.appendChild(spacer);

  if (isPotentialParent) {
    li.classList.add("parent");
  } else {
    toggleBtn.style.display = "none";
    spacer.style.display = "";
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `checkbox-${uniqueId}`;
  checkbox.checked = state.currentChecklistState[uniqueId].checked;
  checkbox.disabled = isCurrentItemExceptionallyShown;

  if (!isCurrentItemExceptionallyShown) {
    checkbox.addEventListener("change", () => {
      state.setHasUnsavedChanges(true);
      handleItemCheck(uniqueId, checkbox.checked);
    });
  }
  itemControlsDiv.appendChild(checkbox);
  itemRowDiv.appendChild(itemControlsDiv);

  const itemTextDiv = document.createElement("div");
  itemTextDiv.classList.add("item-text");
  itemTextDiv.innerHTML = formatItemText(item);
  itemRowDiv.appendChild(itemTextDiv);
  li.appendChild(itemRowDiv);

  if (item.children && item.children.length > 0) {
    const childrenUl = document.createElement("ul");
    childrenUl.classList.add("children-list", "collapsed");
    li.appendChild(childrenUl);
    const sortedChildren = item.children.sort(
      (a, b) => (a.ordine || 0) - (b.ordine || 0),
    );
    sortedChildren.forEach((child) => {
      const childUniqueId = generateUniqueId(child, uniqueId);
      const childPassesUtilizzo =
        !selectedUtilizziForRendering ||
        selectedUtilizziForRendering.length === 0 ||
        selectedUtilizziForRendering.includes(child.utilizzo);
      const childPassesCategory =
        !activeCategoryForRendering ||
        child.categoria === activeCategoryForRendering;
      const childPassesAllCurrentFilters =
        childPassesUtilizzo && childPassesCategory;
      const childOrDescendantPassesAll = itemOrDescendantPassesFilter(
        child,
        selectedUtilizziForRendering,
        activeCategoryForRendering,
      );

      if (childOrDescendantPassesAll) {
        const childIsExceptionallyShownItself =
          !childPassesAllCurrentFilters && childOrDescendantPassesAll;
        const childListItem = createChecklistItem(
          child,
          childUniqueId,
          uniqueId,
          selectedUtilizziForRendering,
          activeCategoryForRendering,
          childIsExceptionallyShownItself,
        );
        childrenUl.appendChild(childListItem);
      }
    });
  }
  applyVisualState(uniqueId, li);
  return li;
}

export function renderChecklist() {
  dom.checklistContainer.innerHTML = "";

  if (!state.fullInventoryData || !state.fullInventoryData.inventario) {
    dom.loadStatus.textContent = "Nessun dato da mostrare.";
    checkIfAllItemsCheckedInEntireList();
    return;
  }
  const sortedInventory = [...state.fullInventoryData.inventario].sort(
    (a, b) => (a.ordine || 0) - (b.ordine || 0),
  );
  let selectedUtilizziForRendering =
    state.currentChecklistState.original_filters || [];
  
  if (selectedUtilizziForRendering.length === 0) {
    dom.checklistContainer.innerHTML = `<p style="text-align: center; padding: 50px 0; font-size: 1.2em; color: #ccc;">Nessun filtro selezionato</p>`;
    checkIfAllItemsCheckedInEntireList(); // Still need to update counters and potentially show the "all checked" message
    updateCounters();
    return;
  }

  function ensureStateExistsRecursive(items, parentId = null) {
    items.forEach((item) => {
      const itemId = generateUniqueId(item, parentId);
      if (!state.currentChecklistState[itemId]) {
        state.currentChecklistState[itemId] = {
          checked: false,
          timestamp: null,
          parentId: parentId,
          itemData: { ...item },
          isExceptionallyShown: false,
        };
      } else {
        state.currentChecklistState[itemId].itemData = { ...item };
      }
      if (item.children) {
        ensureStateExistsRecursive(item.children, itemId);
      }
    });
  }
  ensureStateExistsRecursive(state.fullInventoryData.inventario);

  if (state.currentChecklistState.original_filters) {
    dom.sidebarInventoryUtilizzoCounters.classList.add("hidden");
  } else {
    updateUtilizzoCounters(state.fullInventoryData.inventario);
  }

  sortedInventory.forEach((item) => {
    const itemPassesUtilizzo =
      !selectedUtilizziForRendering ||
      selectedUtilizziForRendering.length === 0 ||
      selectedUtilizziForRendering.includes(item.utilizzo);
    const itemPassesCategory =
      !state.currentActiveCategoryFilter ||
      item.categoria === state.currentActiveCategoryFilter;
    const itemPassesAllCurrentFilters =
      itemPassesUtilizzo && itemPassesCategory;
    const descendantPassesAllCurrentFilters = itemOrDescendantPassesFilter(
      item,
      selectedUtilizziForRendering,
      state.currentActiveCategoryFilter,
    );

    if (descendantPassesAllCurrentFilters) {
      const isExceptionallyShownItself =
        !itemPassesAllCurrentFilters && descendantPassesAllCurrentFilters;
      const itemId = generateUniqueId(item, null);
      const listItem = createChecklistItem(
        item,
        itemId,
        null,
        selectedUtilizziForRendering,
        state.currentActiveCategoryFilter,
        isExceptionallyShownItself,
      );
      dom.checklistContainer.appendChild(listItem);
    }
  });
  updateAllParentStates();
  updateCounters();
}

function updateItemVisualType(uniqueId) {
  const listItem = document.querySelector(`[data-item-id="${uniqueId}"]`);
  if (!listItem) return;

  const itemState = state.currentChecklistState[uniqueId];
  if (!itemState || !itemState.itemData) return;

  const toggleBtnEl = listItem.querySelector(".toggle-btn");
  const spacerEl = listItem.querySelector(".toggle-spacer");
  const childrenUl = listItem.querySelector(".children-list");

  let shouldBeVisualParent = false;
  if (
    itemState.itemData.children &&
    itemState.itemData.children.length > 0 &&
    childrenUl
  ) {
    let hasVisibleRenderedChildInDOM = false;
    for (const childLi of childrenUl.children) {
      if (!childLi.classList.contains("hidden")) {
        hasVisibleRenderedChildInDOM = true;
        break;
      }
    }
    if (hasVisibleRenderedChildInDOM) {
      shouldBeVisualParent = true;
      childrenUl.style.display = "";
    } else {
      childrenUl.style.display = "none";
    }
  } else if (childrenUl) {
    childrenUl.style.display = "none";
  }

  if (itemState.isExceptionallyShown) {
    let hasAnyVisibleDescendantInDOM = false;
    if (childrenUl && childrenUl.style.display !== "none") {
      for (const childLi of childrenUl.children) {
        if (!childLi.classList.contains("hidden")) {
          hasAnyVisibleDescendantInDOM = true;
          break;
        }
      }
    }
    if (!hasAnyVisibleDescendantInDOM) {
      listItem.classList.add("hidden");
      shouldBeVisualParent = false;
    } else {
      listItem.classList.remove("hidden");
    }
  }

  if (shouldBeVisualParent) {
    listItem.classList.add("parent");
    if (toggleBtnEl) toggleBtnEl.style.display = "";
    if (spacerEl) spacerEl.style.display = "none";
  } else {
    listItem.classList.remove("parent");
    if (toggleBtnEl) toggleBtnEl.style.display = "none";
    if (spacerEl) spacerEl.style.display = "";
  }
}

export function applyVisualState(uniqueId, listItemElement = null) {
  const listItem =
    listItemElement || document.querySelector(`[data-item-id="${uniqueId}"]`);
  if (!listItem) return;

  const itemState = state.currentChecklistState[uniqueId];
  if (!itemState) return;

  const checkbox = listItem.querySelector(`#checkbox-${uniqueId}`);
  if (checkbox) {
    checkbox.checked = itemState.checked;
    checkbox.disabled = itemState.isExceptionallyShown;
  }

  listItem.classList.remove("hidden", "strikethrough");

  if (itemState.isExceptionallyShown) {
    listItem.classList.add("item-exceptionally-shown");
  } else {
    listItem.classList.remove("item-exceptionally-shown");
  }

  if (itemState.checked && !itemState.isExceptionallyShown) {
    if (
      itemState.itemData.children &&
      itemState.itemData.children.length > 0
    ) {
      const childrenUl = listItem.querySelector(".children-list");
      let allChildrenEffectivelyChecked = true;
      if (
        childrenUl &&
        childrenUl.style.display !== "none" &&
        childrenUl.children.length > 0
      ) {
        const visibleChildrenInUl = Array.from(childrenUl.children).filter(
          (childLi) => !childLi.classList.contains("hidden"),
        );
        if (visibleChildrenInUl.length > 0) {
          allChildrenEffectivelyChecked = visibleChildrenInUl.every(
            (childLi) => {
              const childState =
                state.currentChecklistState[childLi.dataset.itemId];
              return (
                childState &&
                (childState.checked || childLi.classList.contains("hidden"))
              );
            },
          );
        }
      }

      if (allChildrenEffectivelyChecked) {
        listItem.classList.add("hidden");
      } else {
        listItem.classList.add("strikethrough");
      }
    } else {
      listItem.classList.add("hidden");
    }
  }
  updateItemVisualType(uniqueId);
}

export function updateParentState(parentUniqueId) {
  if (!parentUniqueId) return;
  const parentListItem = document.querySelector(
    `[data-item-id="${parentUniqueId}"]`,
  );
  applyVisualState(parentUniqueId, parentListItem);
  const parentState = state.currentChecklistState[parentUniqueId];
  if (parentState && parentState.parentId)
    updateParentState(parentState.parentId);
}

export function updateAllParentStates() {
  Object.keys(state.currentChecklistState).forEach((uniqueId) => {
    applyVisualState(uniqueId);
  });
}

export function updateCheckedItemsOverlay() {
  dom.checkedItemsList.innerHTML = "";
  const checkedItems = [];
  for (const uniqueId in state.currentChecklistState) {
    const itemState = state.currentChecklistState[uniqueId];
    if (
      itemState.checked &&
      itemState.itemData &&
      !itemState.isExceptionallyShown
    ) {
      checkedItems.push({ ...itemState, uniqueId });
    }
  }
  checkedItems.sort(
    (a, b) =>
      new Date(b.timestamp?.replace(/\./g, ":") || 0) -
      new Date(a.timestamp?.replace(/\./g, ":") || 0),
  );

  if (checkedItems.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Nessun elemento spuntato.";
    p.style.textAlign = "center";
    p.style.padding = "20px";
    dom.checkedItemsList.appendChild(p);
    return;
  }

  checkedItems.forEach((itemStateWithId) => {
    const li = document.createElement("li");
    let displayName =
      itemStateWithId.itemData.nome || itemStateWithId.itemData.id;
    let countPrefix = "";
    const itemData = itemStateWithId.itemData;

    if (
      itemData.totali !== null &&
      typeof itemData.totali !== "undefined" &&
      itemData.in_uso !== null &&
      typeof itemData.in_uso !== "undefined"
    ) {
      if (itemData.totali === itemData.in_uso) {
        countPrefix = `<span class="history-count">${itemData.totali}</span> `;
      } else {
        countPrefix = `<span class="history-count">${itemData.in_uso}/${itemData.totali}</span> `;
      }
    }

    let baseDisplayName = displayName;
    let finalDisplayNameHTML = "";

    if (
      itemStateWithId.parentId &&
      state.currentChecklistState[itemStateWithId.parentId]
    ) {
      const parentData =
        state.currentChecklistState[itemStateWithId.parentId].itemData;
      const parentName = parentData.nome || parentData.id;
      finalDisplayNameHTML = `${countPrefix}${baseDisplayName} <span class="history-parent">(${parentName})</span>`;
    } else {
      finalDisplayNameHTML = `${countPrefix}${baseDisplayName}`;
    }

    li.innerHTML = `<span class="item-name-timestamp"><span class="item-name" title="${displayName}">${finalDisplayNameHTML}</span><span class="timestamp">${itemStateWithId.timestamp || "N/A"}</span></span>`;
    const restoreBtn = document.createElement("button");
    restoreBtn.classList.add("restore-btn");
    restoreBtn.textContent = "X";
    restoreBtn.title = "Ripristina elemento";
    restoreBtn.addEventListener("click", () => {
      state.setHasUnsavedChanges(true);
      restoreItem(itemStateWithId.uniqueId);
    });
    li.appendChild(restoreBtn);
    dom.checkedItemsList.appendChild(li);
  });
}

function collectCategoriesRecursive(items, collected = new Set()) {
  items.forEach((item) => {
    if (item.categoria && item.categoria.trim() !== "") {
      collected.add(item.categoria);
    } else {
      collected.add("Altro");
    }
    if (item.children) {
      collectCategoriesRecursive(item.children, collected);
    }
  });
  return collected;
}

function getCategoryIcon(categoryName) {
  const defaultSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.2002 3C20.1942 3.00011 20.9999 3.80585 21 4.7998V19.2002C20.9999 20.1942 20.1942 20.9999 19.2002 21H4.7998C3.80585 20.9999 3.00011 20.1942 3 19.2002V4.7998C3.00011 3.80585 3.80585 3.00011 4.7998 3H19.2002ZM16.9502 14.25C16.5922 14.25 16.2483 14.3923 15.9951 14.6455C15.7421 14.8986 15.5997 15.2418 15.5996 15.5996C15.5996 15.8664 15.679 16.1277 15.8271 16.3496C15.9755 16.5716 16.1869 16.7455 16.4336 16.8477C16.6801 16.9497 16.9513 16.9758 17.2129 16.9238C17.4747 16.8718 17.7155 16.7434 17.9043 16.5547C18.0931 16.3659 18.2223 16.1252 18.2744 15.8633C18.3265 15.6015 18.2994 15.3296 18.1973 15.083C18.0951 14.8365 17.922 14.6258 17.7002 14.4775C17.4783 14.3292 17.2171 14.25 16.9502 14.25ZM6.59961 14.7002C6.36105 14.7003 6.13257 14.7952 5.96387 14.9639C5.79518 15.1326 5.7003 15.3611 5.7002 15.5996C5.7002 15.8383 5.79508 16.0675 5.96387 16.2363C6.13256 16.405 6.36109 16.4999 6.59961 16.5H12.9004C13.1389 16.4999 13.3675 16.405 13.5361 16.2363C13.7049 16.0675 13.7998 15.8383 13.7998 15.5996C13.7997 15.3611 13.7048 15.1326 13.5361 14.9639C13.3675 14.7952 13.1389 14.7003 12.9004 14.7002H6.59961ZM16.9502 10.6504C16.5922 10.6504 16.2483 10.7918 15.9951 11.0449C15.7419 11.2981 15.5996 11.642 15.5996 12C15.5996 12.2669 15.6789 12.528 15.8271 12.75C15.9755 12.972 16.1869 13.1449 16.4336 13.2471C16.6801 13.3491 16.9512 13.3762 17.2129 13.3242C17.4746 13.2722 17.7156 13.1437 17.9043 12.9551C18.093 12.7663 18.2223 12.5255 18.2744 12.2637C18.3265 12.0018 18.2994 11.7301 18.1973 11.4834C18.0951 11.2368 17.922 11.0263 17.7002 10.8779C17.4783 10.7296 17.2171 10.6504 16.9502 10.6504ZM6.59961 11.0996C6.36119 11.0997 6.13254 11.1948 5.96387 11.3633C5.79509 11.5321 5.7002 11.7613 5.7002 12C5.7002 12.2387 5.79508 12.4679 5.96387 12.6367C6.13254 12.8052 6.36119 12.9003 6.59961 12.9004H12.9004C13.1388 12.9003 13.3675 12.8052 13.5361 12.6367C13.7049 12.4679 13.7998 12.2387 13.7998 12C13.7998 11.7613 13.7049 11.5321 13.5361 11.3633C13.3675 11.1948 13.1388 11.0997 12.9004 11.0996H6.59961ZM16.9502 7.0498C16.5922 7.0498 16.2483 7.19214 15.9951 7.44531C15.742 7.69848 15.5996 8.04238 15.5996 8.40039C15.5997 8.66726 15.6789 8.92849 15.8271 9.15039C15.9755 9.37235 16.187 9.5453 16.4336 9.64746C16.6801 9.74949 16.9512 9.77561 17.2129 9.72363C17.4747 9.67155 17.7155 9.54325 17.9043 9.35449C18.0931 9.16569 18.2223 8.92496 18.2744 8.66309C18.3264 8.40145 18.2993 8.13026 18.1973 7.88379C18.0951 7.63714 17.9222 7.42568 17.7002 7.27734C17.4783 7.12905 17.2171 7.04985 16.9502 7.0498ZM6.59961 7.5C6.3611 7.50009 6.13256 7.59505 5.96387 7.76367C5.79508 7.93245 5.7002 8.1617 5.7002 8.40039C5.7003 8.63895 5.79518 8.86744 5.96387 9.03613C6.13257 9.20482 6.36105 9.29971 6.59961 9.2998H12.9004C13.1389 9.29969 13.3675 9.20481 13.5361 9.03613C13.7048 8.86744 13.7997 8.63893 13.7998 8.40039C13.7998 8.1617 13.7049 7.93245 13.5361 7.76367C13.3675 7.59504 13.1389 7.50012 12.9004 7.5H6.59961Z" fill="white"/>
</svg>

  `;
  const cameraSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.77778 21H14.2222C17.3433 21 18.9038 21 20.0248 20.2646C20.51 19.9462 20.9267 19.5371 21.251 19.0607C22 17.9601 22 16.4279 22 13.3636C22 10.2994 22 8.76721 21.251 7.6666C20.9267 7.19014 20.51 6.78104 20.0248 6.46268C19.3044 5.99013 18.4027 5.82123 17.022 5.76086C16.3631 5.76086 15.7959 5.27068 15.6667 4.63636C15.4728 3.68489 14.6219 3 13.6337 3H10.3663C9.37805 3 8.52715 3.68489 8.33333 4.63636C8.20412 5.27068 7.63685 5.76086 6.978 5.76086C5.59733 5.82123 4.69555 5.99013 3.97524 6.46268C3.48995 6.78104 3.07328 7.19014 2.74902 7.6666C2 8.76721 2 10.2994 2 13.3636C2 16.4279 2 17.9601 2.74902 19.0607C3.07328 19.5371 3.48995 19.9462 3.97524 20.2646C5.09624 21 6.65675 21 9.77778 21ZM12 9.27273C9.69881 9.27273 7.83333 11.1043 7.83333 13.3636C7.83333 15.623 9.69881 17.4545 12 17.4545C14.3012 17.4545 16.1667 15.623 16.1667 13.3636C16.1667 11.1043 14.3012 9.27273 12 9.27273ZM12 10.9091C10.6193 10.9091 9.5 12.008 9.5 13.3636C9.5 14.7192 10.6193 15.8182 12 15.8182C13.3807 15.8182 14.5 14.7192 14.5 13.3636C14.5 12.008 13.3807 10.9091 12 10.9091ZM16.7222 10.0909C16.7222 9.63904 17.0953 9.27273 17.5556 9.27273H18.6667C19.1269 9.27273 19.5 9.63904 19.5 10.0909C19.5 10.5428 19.1269 10.9091 18.6667 10.9091H17.5556C17.0953 10.9091 16.7222 10.5428 16.7222 10.0909Z" fill="white"/>
</svg>

  `;
  const lensSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.0443 20.7867L14.079 13.8L17.2578 19.3053C15.7274 20.4099 13.8873 21.003 12 21C11.3286 21 10.6743 20.9262 10.0443 20.7867ZM8.30099 20.208C7.14467 19.6852 6.1116 18.9244 5.26921 17.9753C4.42682 17.0263 3.79405 15.9102 3.41219 14.7H11.4807L8.30099 20.2071V20.208ZM3.04499 12.9C2.9162 11.6375 3.05682 10.3621 3.45756 9.15801C3.8583 7.95393 4.51004 6.8486 5.36969 5.91511L9.40079 12.9H3.04499ZM6.74309 4.69471C8.27319 3.5903 10.1129 2.99721 12 3.00001C12.6714 3.00001 13.3257 3.07381 13.9557 3.21331L9.92099 10.2L6.74309 4.69471ZM15.699 3.79201C16.8553 4.3148 17.8884 5.07557 18.7308 6.02466C19.5731 6.97374 20.2059 8.08981 20.5878 9.3H12.5193L15.699 3.79201ZM20.955 11.1C21.0838 12.3625 20.9431 13.6379 20.5424 14.842C20.1417 16.0461 19.4899 17.1514 18.6303 18.0849L14.5992 11.1H20.9568H20.955Z" fill="white"/>
</svg>

  `;
  const batterySvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 6C20.6569 6 22 7.34315 22 9V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V9C2 7.34315 3.34315 6 5 6H19ZM7 10V12L5 12.0146V14H7V16H9V14H10.9521V12.0146H9V10H7ZM14 12.0146V14H19V12.0146H14Z" fill="white"/>
<rect x="6" y="3" width="4" height="4" rx="1" fill="white"/>
<rect x="14" y="3" width="4" height="4" rx="1" fill="white"/>
</svg>

  `;
  const accessoriSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.0888 6.23612C12.8068 5.65826 12.4201 5.12098 11.9339 4.65004C10.1928 2.9638 7.53086 2.52115 5.30981 3.54875C5.06622 3.66153 4.89434 3.88156 4.84878 4.13912C4.80311 4.39684 4.88947 4.65981 5.08035 4.84469L7.81869 7.4969L6.64301 8.63561L3.90456 5.9834C3.71379 5.79858 3.44215 5.71489 3.17611 5.75907C2.91007 5.80335 2.68282 5.96982 2.56649 6.20569C1.50565 8.35674 1.96263 10.9349 3.70364 12.621C4.18995 13.0921 4.74481 13.4664 5.34151 13.7394L13.0888 6.23612Z" fill="white"/>
<path d="M18.0333 14.3531L13.7222 18.5284L15.2482 20.0063C15.8425 20.5818 16.623 20.8696 17.4036 20.8696C18.1843 20.8695 18.965 20.5818 19.5592 20.0062C20.135 19.4486 20.452 18.7072 20.452 17.9185C20.4521 17.1299 20.135 16.3885 19.5593 15.831L18.0333 14.3531Z" fill="white"/>
<path d="M19.4049 4.2942C19.0803 3.97979 18.5538 3.97979 18.2291 4.2942L15.8776 6.57162C15.7217 6.72262 15.6341 6.92741 15.6342 7.141C15.6342 7.35459 15.7217 7.55933 15.8776 7.71033L16.4655 8.27971L14.114 10.5572L13.4801 9.94325L12.5463 9.03885L7.1745 14.2414L5.53353 15.8307C4.34493 16.9819 4.34493 18.8551 5.53358 20.0062C6.12785 20.5818 6.90829 20.8696 7.68896 20.8695C8.46946 20.8694 9.25029 20.5817 9.8445 20.0062L12.5463 17.3895L12.5464 17.3896L16.8574 13.2143L16.2708 12.6461C16.2703 12.6457 16.27 12.6452 16.2696 12.6448C16.2692 12.6444 16.2687 12.644 16.2682 12.6437L15.2897 11.696L17.6413 9.41842L18.2292 9.98775C18.3916 10.145 18.6043 10.2236 18.817 10.2236C19.0297 10.2236 19.2426 10.145 19.4049 9.98775L21.7564 7.71028C21.9124 7.55922 22 7.35449 22 7.14095C22 6.92735 21.9124 6.72257 21.7564 6.57157L19.4049 4.2942Z" fill="white"/>
</svg>

  `;
  const storageSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.1826 3.00009C13.6918 2.99943 14.1432 2.99884 14.5729 3.14632C15.0028 3.29379 15.3586 3.57134 15.7602 3.8845L15.8418 3.94809L19.2627 6.6088L19.3793 6.69925C19.9453 7.13784 20.4483 7.52766 20.7255 8.09429C21.0026 8.66091 21.0015 9.29732 21.0002 10.0133L21 10.1609V16.5594C21.0001 17.3573 21.0001 18.0447 20.9261 18.5952C20.8468 19.1852 20.6679 19.7507 20.2092 20.2094C19.7505 20.6681 19.185 20.8469 18.595 20.9263C18.0445 21.0003 17.3571 21.0003 16.5592 21.0002H7.44079C6.64294 21.0003 5.9555 21.0003 5.40499 20.9263C4.81503 20.8469 4.24952 20.6681 3.79082 20.2094C3.33212 19.7507 3.15325 19.1852 3.07394 18.5952C2.99992 18.0447 2.99996 17.3573 3 16.5595V6.5714C2.99999 6.17661 2.99998 5.83597 3.01923 5.55404C3.03948 5.25719 3.08403 4.96027 3.20554 4.66693C3.47957 4.00536 4.00519 3.47974 4.66677 3.2057C4.9601 3.0842 5.25702 3.03965 5.55386 3.01939C5.8358 3.00016 6.17644 3.00017 6.57122 3.00018H13.0791L13.1826 3.00009ZM12 12.9002C11.0059 12.9002 10.2 13.706 10.2 14.7002C10.2 15.6943 11.0059 16.5002 12 16.5002C12.9942 16.5002 13.8 15.6943 13.8 14.7002C13.8 13.706 12.9942 12.9002 12 12.9002ZM8.40001 14.7002C8.40001 12.712 10.0118 11.1002 12 11.1002C13.9882 11.1002 15.6 12.712 15.6 14.7002C15.6 16.6884 13.9882 18.3002 12 18.3002C10.0118 18.3002 8.40001 16.6884 8.40001 14.7002ZM7.50001 5.70017C7.50001 5.20312 7.09706 4.80017 6.60001 4.80017C6.10295 4.80017 5.70001 5.20312 5.70001 5.70017V6.60017C5.70001 8.09134 6.90884 9.30017 8.40001 9.30017H11.1C12.5912 9.30017 13.8 8.09134 13.8 6.60017V5.70017C13.8 5.20312 13.3971 4.80017 12.9 4.80017C12.4029 4.80017 12 5.20312 12 5.70017V6.60017C12 7.09722 11.5971 7.50017 11.1 7.50017H8.40001C7.90296 7.50017 7.50001 7.09722 7.50001 6.60017V5.70017Z" fill="white"/>
</svg>

  `;
  const audioSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0067 13.8C10.0267 13.8 8.40668 12.18 8.40668 10.2V6.6C8.40668 4.62 10.0267 3 12.0067 3C13.9867 3 15.6067 4.62 15.6067 6.6V10.2C15.6067 12.18 13.9867 13.8 12.0067 13.8Z" fill="white"/>
<path d="M18.6667 12.09C18.2167 11.82 17.6767 12 17.4067 12.45C16.3267 14.43 14.2567 15.6 12.0067 15.6C9.75667 15.6 7.68667 14.43 6.51667 12.45C6.33667 12 5.70667 11.91 5.34667 12.09C4.89667 12.36 4.80667 12.9 4.98667 13.35C6.24667 15.6 8.58667 17.04 11.1067 17.31V19.2H8.40667C7.86667 19.2 7.50667 19.56 7.50667 20.1C7.50667 20.64 7.86667 21 8.40667 21H15.6067C16.1467 21 16.5067 20.64 16.5067 20.1C16.5067 19.56 16.1467 19.2 15.6067 19.2H12.9067V17.31C15.4267 17.04 17.7667 15.6 19.0267 13.35C19.2967 12.9 19.1167 12.36 18.6667 12.09Z" fill="white"/>
</svg>

  `;
  const monitorSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.8462 20.25C15.8462 20.4489 15.7651 20.6397 15.6208 20.7803C15.4766 20.921 15.2809 21 15.0769 21H8.92308C8.71906 21 8.52341 20.921 8.37915 20.7803C8.23489 20.6397 8.15385 20.4489 8.15385 20.25C8.15385 20.0511 8.23489 19.8603 8.37915 19.7197C8.52341 19.579 8.71906 19.5 8.92308 19.5H15.0769C15.2809 19.5 15.4766 19.579 15.6208 19.7197C15.7651 19.8603 15.8462 20.0511 15.8462 20.25ZM22 5.25V15.75C21.9993 16.3465 21.7559 16.9184 21.3233 17.3402C20.8907 17.762 20.3041 17.9993 19.6923 18H4.30769C3.69587 17.9993 3.10931 17.762 2.67668 17.3402C2.24406 16.9184 2.0007 16.3465 2 15.75V5.25C2.0007 4.65347 2.24405 4.08157 2.67668 3.65976C3.1093 3.23795 3.69587 3.00068 4.30769 3H19.6923C20.3041 3.00068 20.8907 3.23795 21.3233 3.65976C21.756 4.08157 21.9993 4.65347 22 5.25ZM15.4615 10.5C15.4615 10.3738 15.4289 10.2497 15.3666 10.1391C15.3043 10.0285 15.2145 9.93499 15.1053 9.86726L10.8745 7.24226C10.7582 7.1701 10.6242 7.12974 10.4864 7.12539C10.3486 7.12104 10.2122 7.15287 10.0914 7.21754C9.97054 7.28222 9.86975 7.37736 9.79955 7.49302C9.72934 7.60868 9.69231 7.7406 9.69231 7.875V13.125C9.69231 13.2594 9.72934 13.3913 9.79955 13.507C9.86975 13.6226 9.97054 13.7178 10.0914 13.7825C10.2122 13.8471 10.3486 13.879 10.4864 13.8746C10.6242 13.8703 10.7582 13.8299 10.8745 13.7577L15.1053 11.1327C15.2145 11.065 15.3043 10.9715 15.3666 10.8609C15.4289 10.7503 15.4615 10.6262 15.4615 10.5Z" fill="white"/>
</svg>

  `;
  const lightSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.6859 10.8481H14.7131V4.36866C14.7131 2.8568 13.8376 2.55083 12.7697 3.68473L12 4.50365L5.48671 11.4331C4.59197 12.378 4.96718 13.1519 6.3141 13.1519H9.28693V19.6313C9.28693 21.1432 10.1624 21.4492 11.2303 20.3153L12 19.4963L18.5133 12.567C19.408 11.622 19.0328 10.8481 17.6859 10.8481Z" fill="white"/>
</svg>

  `;
  const bagSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 15.5087C11 15.7457 11.1054 16.9729 11.2929 17.1405C11.4805 17.308 11.7348 17.4022 12 17.4022C12.2652 17.4022 12.5196 17.308 12.7071 17.1405C12.8947 16.9729 13 15.7457 13 15.5087H16C16.729 15.5087 17.412 15.3345 18 15.0307V19.0826C18 19.5565 17.7893 20.0111 17.4142 20.3462C17.0392 20.6813 16.5305 20.8696 16 20.8696H8.00003C7.4696 20.8696 6.96089 20.6813 6.58582 20.3462C6.21074 20.0111 6.00003 19.5565 6.00003 19.0826V15.0307C6.58803 15.3345 7.27103 15.5087 8.00003 15.5087H11ZM13 14.6152V11.9348C13 11.6978 12.8947 11.4706 12.7071 11.303C12.5196 11.1354 12.2652 11.0413 12 11.0413C11.7348 11.0413 11.4805 11.1354 11.2929 11.303C11.1054 11.4706 11 11.6978 11 11.9348V14.6152H8.00003C7.20438 14.6152 6.44132 14.3328 5.87871 13.8301C5.3161 13.3275 5.00003 12.6457 5.00003 11.9348V9.25435C5.00003 8.54345 5.3161 7.86167 5.87871 7.35899C6.44132 6.85632 7.20438 6.57391 8.00003 6.57391H16C16.7957 6.57391 17.5587 6.85632 18.1214 7.35899C18.684 7.86167 19 8.54345 19 9.25435V11.9348C19 12.6457 18.684 13.3275 18.1214 13.8301C17.5587 14.3328 16.7957 14.6152 16 14.6152H13ZM10 5.68044H8.00003C7.65503 5.68044 7.32003 5.71975 7.00003 5.79301V4.34022C7.00003 3.98477 7.15807 3.64388 7.43937 3.39254C7.72068 3.1412 8.10221 3 8.50003 3C8.89786 3 9.27939 3.1412 9.56069 3.39254C9.842 3.64388 10 3.98477 10 4.34022V5.68044ZM17 5.79301C16.6733 5.71803 16.3373 5.68021 16 5.68044H14V4.34022C14 3.98477 14.1581 3.64388 14.4394 3.39254C14.7207 3.1412 15.1022 3 15.5 3C15.8979 3 16.2794 3.1412 16.5607 3.39254C16.842 3.64388 17 3.98477 17 4.34022V5.79301Z" fill="white"/>
</svg>

  `;
  const otherSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.4375 13.3354C20.755 13.3107 21 13.0453 21 12.7273V11.2727C21 10.9541 20.755 10.6893 20.4375 10.664L18.51 10.5135C18.3875 10.5042 18.282 10.4273 18.2347 10.3136L17.6008 8.7837C17.5536 8.67053 17.5734 8.54091 17.6536 8.44806L18.9104 6.97807C19.117 6.73581 19.1038 6.37546 18.878 6.15025L17.8497 5.12193C17.6245 4.89671 17.2636 4.88241 17.0219 5.08951L15.5519 6.34635C15.459 6.42601 15.3288 6.44633 15.2162 6.39964L13.6858 5.76518C13.5727 5.71849 13.4952 5.61137 13.4854 5.48998L13.3354 3.56296C13.3107 3.245 13.0459 3 12.7273 3H11.2727C10.9541 3 10.6893 3.245 10.6646 3.56306L10.5141 5.49008C10.5048 5.61204 10.4273 5.7186 10.3142 5.76529L8.78377 6.39975C8.6706 6.44644 8.54098 6.42612 8.44757 6.34645L6.97814 5.08962C6.73644 4.88251 6.37609 4.89682 6.15032 5.12203L5.122 6.15035C4.89679 6.37556 4.88304 6.73591 5.08958 6.97818L6.34642 8.44816C6.42552 8.54101 6.4464 8.67063 6.39915 8.7838L5.76525 10.3137C5.71909 10.4274 5.612 10.5043 5.49057 10.5136L3.5625 10.6641C3.245 10.6893 3 10.9541 3 11.2727V12.7267C3 13.0454 3.245 13.3107 3.5625 13.3354L5.49061 13.4854C5.612 13.4953 5.71912 13.5727 5.76529 13.6859L6.39919 15.2157C6.44644 15.3289 6.42555 15.4591 6.34645 15.5519L5.08962 17.0219C4.88307 17.2636 4.89682 17.624 5.12203 17.8498L6.15035 18.8781C6.37613 19.1033 6.73648 19.117 6.97818 18.9099L8.4476 17.6531C8.54098 17.574 8.67063 17.5531 8.7838 17.6004L10.3142 18.2343C10.4274 18.2815 10.5048 18.3875 10.5142 18.51L10.6647 20.437C10.6894 20.7545 10.9541 21.0001 11.2728 21.0001H12.7273C13.046 21.0001 13.3107 20.7546 13.3354 20.437L13.4854 18.51C13.4953 18.3875 13.5727 18.2815 13.6859 18.2343L15.2163 17.6004C15.3289 17.5531 15.4597 17.574 15.5519 17.6531L17.0219 18.9099C17.2636 19.117 17.6245 19.1033 17.8498 18.8781L18.8781 17.8498C19.1038 17.624 19.117 17.2636 18.9105 17.0219L17.6537 15.5519C17.5746 15.4591 17.5537 15.3289 17.6009 15.2157L18.2348 13.6859C18.2821 13.5727 18.3875 13.4953 18.51 13.4854L20.4375 13.3354ZM12 15.0416C11.1876 15.0416 10.4235 14.7252 9.84886 14.1511C9.27427 13.576 8.95786 12.8125 8.95786 11.9995C8.95786 11.187 9.27427 10.4229 9.84886 9.84889C10.4235 9.27377 11.1875 8.95789 12 8.95789C12.813 8.95789 13.5765 9.27374 14.1511 9.84889C14.7257 10.4229 15.0421 11.187 15.0421 11.9995C15.0421 12.8125 14.7257 13.576 14.1511 14.1511C13.5765 14.7252 12.813 15.0416 12 15.0416Z" fill="white"/>
</svg>

  `;
  const computerSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M21.3911 17.1203C21.4356 17.169 21.4579 17.1933 21.4787 17.2175C21.7998 17.5908 21.9843 18.0732 21.999 18.5778C22 18.6106 22 18.6444 22 18.7122C22 18.8702 22 18.9492 21.996 19.0159C21.9325 20.0803 21.1314 20.9285 20.1261 20.9958C20.0631 21 19.9885 21 19.8393 21H4.16068C4.01148 21 3.93688 21 3.87388 20.9958C2.86865 20.9285 2.06749 20.0803 2.00398 19.0159C2 18.9492 2 18.8702 2 18.7122C2 18.6444 2 18.6106 2.00096 18.5778C2.01569 18.0732 2.20022 17.5908 2.52127 17.2175C2.54205 17.1933 2.56429 17.1691 2.60869 17.1205L3.90311 15.7059H20.0969L21.3911 17.1203ZM8.75 18.8824C8.75 18.4438 9.08579 18.0882 9.5 18.0882H14.5C14.9142 18.0882 15.25 18.4438 15.25 18.8824C15.25 19.3209 14.9142 19.6765 14.5 19.6765H9.5C9.08579 19.6765 8.75 19.3209 8.75 18.8824Z" fill="white"/>
<path d="M15.8154 3C17.7878 3 18.7749 3.0002 19.3877 3.58594C20 4.17175 20 5.11489 20 7V14H4V7C4 5.11438 4.00045 4.17172 4.61328 3.58594C5.22612 3.00055 6.21241 3 8.18457 3H15.8154ZM12 5.11719C11.5858 5.11719 11.25 5.47353 11.25 5.91211C11.2502 6.35053 11.5859 6.70605 12 6.70605C12.4141 6.70604 12.7498 6.35052 12.75 5.91211C12.75 5.47354 12.4142 5.1172 12 5.11719Z" fill="white"/>
</svg>


  `;
  switch (categoryName) {
    case "Corpi macchina":
      return cameraSvg; // <-- PASTE YOUR SVG HERE
    case "Obiettivi e filtri":
      return lensSvg; // <-- PASTE YOUR SVG HERE
    case "Batterie e alimentazione":
      return batterySvg; // <-- PASTE YOUR SVG HERE
    case "Accessori e supporti":
      return accessoriSvg; // <-- PASTE YOUR SVG HERE
    case "Storage":
      return storageSvg; // <-- PASTE YOUR SVG HERE
    case "Audio":
      return audioSvg; // <-- PASTE YOUR SVG HERE
    case "Monitor":
      return monitorSvg; // <-- PASTE YOUR SVG HERE
    case "Luci":
      return lightSvg; // <-- PASTE YOUR SVG HERE
    case "Borse":
      return bagSvg; // <-- PASTE YOUR SVG HERE
    case "Altro":
      return otherSvg; // <-- PASTE YOUR SVG HERE
    case "Computer":
      return computerSvg; // <-- PASTE YOUR SVG HERE
    default:
      return defaultSvg;
  }
}
