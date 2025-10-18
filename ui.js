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
    state.currentChecklistState.original_filters ||
    Array.from(dom.filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
  dom.utilizzoFilters.classList.toggle(
    "hidden",
    !!state.currentChecklistState.original_filters,
  );

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
        countPrefix = `${itemData.totali} `;
      } else {
        countPrefix = `${itemData.in_uso}/${itemData.totali} `;
      }
    }

    let baseDisplayName = displayName;
    displayName = `${countPrefix}${displayName}`;
    
    if (
      itemStateWithId.parentId &&
      state.currentChecklistState[itemStateWithId.parentId]
    ) {
      const parentData =
        state.currentChecklistState[itemStateWithId.parentId].itemData;
      const parentName = parentData.nome || parentData.id;
      displayName = `${countPrefix}${baseDisplayName} (${parentName})`;
    }

    li.innerHTML = `<span class="item-name-timestamp"><span class="item-name" title="${displayName}">${displayName}</span><span class="timestamp">${itemStateWithId.timestamp || "N/A"}</span></span>`;
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
    <svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 8h5m0 4h-5m5 4h-5m-5 4h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2zM8 8h.001M8 12h.001M8 16h.001" data-darkreader-inline-stroke="" style="--darkreader-inline-stroke: var(--darkreader-text-000000, #e8e6e3);"></path></g></svg>
  `;
  const cameraSvg = `
    <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.77778 21H14.2222C17.3433 21 18.9038 21 20.0248 20.2646C20.51 19.9462 20.9267 19.5371 21.251 19.0607C22 17.9601 22 16.4279 22 13.3636C22 10.2994 22 8.76721 21.251 7.6666C20.9267 7.19014 20.51 6.78104 20.0248 6.46268C19.3044 5.99013 18.4027 5.82123 17.022 5.76086C16.3631 5.76086 15.7959 5.27068 15.6667 4.63636C15.4728 3.68489 14.6219 3 13.6337 3H10.3663C9.37805 3 8.52715 3.68489 8.33333 4.63636C8.20412 5.27068 7.63685 5.76086 6.978 5.76086C5.59733 5.82123 4.69555 5.99013 3.97524 6.46268C3.48995 6.78104 3.07328 7.19014 2.74902 7.6666C2 8.76721 2 10.2994 2 13.3636C2 16.4279 2 17.9601 2.74902 19.0607C3.07328 19.5371 3.48995 19.9462 3.97524 20.2646C5.09624 21 6.65675 21 9.77778 21ZM12 9.27273C9.69881 9.27273 7.83333 11.1043 7.83333 13.3636C7.83333 15.623 9.69881 17.4545 12 17.4545C14.3012 17.4545 16.1667 15.623 16.1667 13.3636C16.1667 11.1043 14.3012 9.27273 12 9.27273ZM12 10.9091C10.6193 10.9091 9.5 12.008 9.5 13.3636C9.5 14.7192 10.6193 15.8182 12 15.8182C13.3807 15.8182 14.5 14.7192 14.5 13.3636C14.5 12.008 13.3807 10.9091 12 10.9091ZM16.7222 10.0909C16.7222 9.63904 17.0953 9.27273 17.5556 9.27273H18.6667C19.1269 9.27273 19.5 9.63904 19.5 10.0909C19.5 10.5428 19.1269 10.9091 18.6667 10.9091H17.5556C17.0953 10.9091 16.7222 10.5428 16.7222 10.0909Z" fill="#ffffffff" data-darkreader-inline-fill=""></path> </g></svg>
  `;
  const lensSvg = `
    <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.827 21.763L14.31 14l3.532 6.117A9.955 9.955 0 0 1 12 22c-.746 0-1.473-.082-2.173-.237zM7.89 21.12A10.028 10.028 0 0 1 2.458 15h8.965L7.89 21.119zM2.05 13a9.964 9.964 0 0 1 2.583-7.761L9.112 13H2.05zm4.109-9.117A9.955 9.955 0 0 1 12 2c.746 0 1.473.082 2.173.237L9.69 10 6.159 3.883zM16.11 2.88A10.028 10.028 0 0 1 21.542 9h-8.965l3.533-6.119zM21.95 11a9.964 9.964 0 0 1-2.583 7.761L14.888 11h7.064z" fill="#ffffffff" data-darkreader-inline-fill=""></path> </g></svg>
  `;
  const batterySvg = `
    <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22,8a2,2,0,0,0-2-2H18V4.8A1.37,1.37,0,0,0,18,4.27a.58.58,0,0,0-.22-.22,1.37,1.37,0,0,0-.53,0H14.8a1.37,1.37,0,0,0-.53,0,.58.58,0,0,0-.22.22A1.37,1.37,0,0,0,14,4.8V6H10V4.8A1.37,1.37,0,0,0,10,4.27a.58.58,0,0,0-.22-.22A1.37,1.37,0,0,0,9.2,4H6.8a1.37,1.37,0,0,0-.53,0,.58.58,0,0,0-.22.22A1.37,1.37,0,0,0,6,4.8V6H4A2,2,0,0,0,2,8V18a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2ZM10.5,14H9v1.5H7V14H5.5V12H7V10.5H9V12h1.5ZM18,14H14V12h4Z" fill="#ffffffff" data-darkreader-inline-fill=""></path> </g></svg>
  `;
  const accessoriSvg = `
    <svg fill="#ffffff" height="18px" width="18px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 360.845 360.845" xml:space="preserve" data-darkreader-inline-fill="" style="--darkreader-inline-fill: var(--darkreader-background-000000, #000000);"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_18_"> <path id="XMLID_19_" d="M200.067,74.262c-5.087-10.765-12.064-20.774-20.837-29.547C147.816,13.302,99.789,5.056,59.716,24.199 c-4.395,2.101-7.496,6.2-8.318,10.998c-0.824,4.801,0.734,9.7,4.178,13.144l49.406,49.408L83.77,118.962L34.362,69.554 c-3.442-3.443-8.343-5.002-13.143-4.179c-4.8,0.825-8.9,3.926-10.999,8.32c-19.14,40.072-10.895,88.101,20.517,119.511 c8.774,8.775,18.785,15.749,29.551,20.834L200.067,74.262z"></path> <path id="XMLID_20_" d="M289.276,225.472l-77.782,77.782l27.533,27.532c10.723,10.721,24.805,16.082,38.889,16.082 c14.085-0.001,28.17-5.361,38.891-16.084c10.389-10.387,16.109-24.199,16.109-38.891c0.001-14.691-5.72-28.502-16.107-38.889 L289.276,225.472z"></path> <path id="XMLID_21_" d="M314.024,38.086c-5.857-5.857-15.355-5.857-21.214,0l-42.427,42.426c-2.813,2.813-4.393,6.628-4.392,10.607 c0,3.979,1.579,7.793,4.393,10.606l10.607,10.607l-42.428,42.428l-11.436-11.438l-16.848-16.848l-96.92,96.919l-29.607,29.607 c-21.445,21.445-21.445,56.34,0.001,77.784c10.722,10.723,24.803,16.084,38.888,16.083c14.082-0.002,28.17-5.362,38.891-16.083 l48.746-48.746l0.002,0.001l77.781-77.781l-10.584-10.585c-0.008-0.007-0.014-0.017-0.021-0.023 c-0.008-0.008-0.017-0.015-0.025-0.022l-17.654-17.655l42.428-42.428l10.607,10.606c2.929,2.93,6.767,4.394,10.605,4.394 c3.838,0,7.678-1.464,10.607-4.394l42.427-42.427c2.814-2.814,4.395-6.628,4.395-10.606c-0.001-3.979-1.581-7.794-4.395-10.607 L314.024,38.086z"></path> </g> </g></svg>
  `;
  const storageSvg = `
    <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.314 1.99991C13.8798 1.99918 14.3813 1.99853 14.8588 2.16239C15.3364 2.32625 15.7318 2.63464 16.178 2.98259L16.2687 3.05325L20.0697 6.00959L20.1992 6.11009C20.8281 6.59741 21.387 7.03054 21.695 7.66013C22.0029 8.28971 22.0016 8.99683 22.0002 9.7924L22 9.95635L22 17.0658C22.0001 17.9523 22.0001 18.7161 21.9179 19.3278C21.8297 19.9833 21.631 20.6117 21.1213 21.1213C20.6117 21.631 19.9833 21.8297 19.3278 21.9179C18.7161 22.0001 17.9523 22.0001 17.0658 22H6.9342C6.0477 22.0001 5.28388 22.0001 4.67221 21.9179C4.0167 21.8297 3.38835 21.631 2.87868 21.1213C2.36902 20.6117 2.17028 19.9833 2.08215 19.3278C1.99991 18.7161 1.99995 17.9523 2 17.0659V17.0658V17.0658L2 5.96803C1.99999 5.52938 1.99998 5.15089 2.02136 4.83763C2.04386 4.5078 2.09336 4.17789 2.22837 3.85196C2.53285 3.11688 3.11687 2.53286 3.85196 2.22837C4.17788 2.09337 4.50779 2.04387 4.83762 2.02136C5.15088 1.99999 5.52937 2 5.96802 2.00001L13.199 2.00001L13.314 1.99991ZM12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13ZM8 15C8 12.7909 9.79086 11 12 11C14.2091 11 16 12.7909 16 15C16 17.2091 14.2091 19 12 19C9.79086 19 8 17.2091 8 15ZM7 5C7 4.44772 6.55228 4 6 4C5.44772 4 5 4.44772 5 5V6C5 7.65685 6.34315 9 8 9H11C12.6569 9 14 7.65685 14 6V5C14 4.44772 13.5523 4 13 4C12.4477 4 12 4.44772 12 5V6C12 6.55228 11.5523 7 11 7H8C7.44772 7 7 6.55228 7 6V5Z" fill="#ffffffff" data-darkreader-inline-fill=""></path> </g></svg>
  `;
  const audioSvg = `
    <svg width="18px" height="18px" fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve" data-darkreader-inline-fill="" style="--darkreader-inline-fill: var(--darkreader-background-000000, #000000);"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10,12L10,12c-2.2,0-4-1.8-4-4V4c0-2.2,1.8-4,4-4h0c2.2,0,4,1.8,4,4v4C14,10.2,12.2,12,10,12z"></path> <path d="M17.4,10.1c-0.5-0.3-1.1-0.1-1.4,0.4C14.8,12.7,12.5,14,10,14c-2.5,0-4.8-1.3-6.1-3.5C3.7,10,3,9.9,2.6,10.1 c-0.5,0.3-0.6,0.9-0.4,1.4c1.4,2.5,4,4.1,6.8,4.4V18H6c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1s-0.4-1-1-1h-3v-2.1 c2.8-0.3,5.4-1.9,6.8-4.4C18.1,11,17.9,10.4,17.4,10.1z"></path> </g></svg>
  `;
  const monitorSvg = `
    <svg width="18px" height="18px" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M168,224a8.00008,8.00008,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8.00008,8.00008,0,0,1,168,224ZM232,64V176a24.0275,24.0275,0,0,1-24,24H48a24.0275,24.0275,0,0,1-24-24V64A24.02734,24.02734,0,0,1,48,40H208A24.02734,24.02734,0,0,1,232,64Zm-68,56a8.00014,8.00014,0,0,0-3.70508-6.74927l-44-28A7.99989,7.99989,0,0,0,104,92v56a7.99991,7.99991,0,0,0,12.29492,6.74927l44-28A8.00014,8.00014,0,0,0,164,120Z" fill="#ffffffff" data-darkreader-inline-fill=""></path> </g></svg>
  `;
  const lightSvg = `
    <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17.9105 10.7209H14.8205V3.52087C14.8205 1.84087 13.9105 1.50087 12.8005 2.76087L12.0005 3.67087L5.2305 11.3709C4.3005 12.4209 4.6905 13.2809 6.0905 13.2809H9.1805V20.4809C9.1805 22.1609 10.0905 22.5009 11.2005 21.2409L12.0005 20.3309L18.7705 12.6309C19.7005 11.5809 19.3105 10.7209 17.9105 10.7209Z" fill="#ffffff" data-darkreader-inline-fill="" style="--darkreader-inline-fill: var(--darkreader-background-292d32, #222527);"></path> </g></svg>
  `;
  const bagSvg = `
    <svg width="18px" height="18px" fill="#ffffff" viewBox="-5 -2 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" class="jam jam-backpack-f" data-darkreader-inline-fill="" style="--darkreader-inline-fill: var(--darkreader-background-000000, #000000);"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M6 14a1 1 0 0 0 2 0h3c.729 0 1.412-.195 2-.535V18a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-4.535c.588.34 1.271.535 2 .535h3zm2-1v-3a1 1 0 1 0-2 0v3H3a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H8zM5 3H3c-.345 0-.68.044-1 .126V1.5a1.5 1.5 0 0 1 3 0V3zm7 .126A4.007 4.007 0 0 0 11 3H9V1.5a1.5 1.5 0 0 1 3 0v1.626z"></path></g></svg>
  `;
  const otherSvg = `
    <svg version="1.1" width="18px" height="18px" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#ffffff" data-darkreader-inline-fill="" style="--darkreader-inline-fill: var(--darkreader-background-000000, #000000);"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css">  .st0{fill:#ffffff;}  </style><style class="darkreader darkreader--sync" media="screen"></style> <g> <path class="st0" d="M496,293.984c9.031-0.703,16-8.25,16-17.297v-41.375c0-9.063-6.969-16.594-16-17.313l-54.828-4.281 c-3.484-0.266-6.484-2.453-7.828-5.688l-18.031-43.516c-1.344-3.219-0.781-6.906,1.5-9.547l35.75-41.813 c5.875-6.891,5.5-17.141-0.922-23.547l-29.25-29.25c-6.406-6.406-16.672-6.813-23.547-0.922l-41.813,35.75 c-2.641,2.266-6.344,2.844-9.547,1.516l-43.531-18.047c-3.219-1.328-5.422-4.375-5.703-7.828l-4.266-54.813 C293.281,6.969,285.75,0,276.688,0h-41.375c-9.063,0-16.594,6.969-17.297,16.016l-4.281,54.813c-0.266,3.469-2.469,6.5-5.688,7.828 l-43.531,18.047c-3.219,1.328-6.906,0.75-9.563-1.516l-41.797-35.75c-6.875-5.891-17.125-5.484-23.547,0.922l-29.25,29.25 c-6.406,6.406-6.797,16.656-0.922,23.547l35.75,41.813c2.25,2.641,2.844,6.328,1.5,9.547l-18.031,43.516 c-1.313,3.234-4.359,5.422-7.813,5.688L16,218c-9.031,0.719-16,8.25-16,17.313v41.359c0,9.063,6.969,16.609,16,17.313l54.844,4.266 c3.453,0.281,6.5,2.484,7.813,5.703l18.031,43.516c1.344,3.219,0.75,6.922-1.5,9.563l-35.75,41.813 c-5.875,6.875-5.484,17.125,0.922,23.547l29.25,29.25c6.422,6.406,16.672,6.797,23.547,0.906l41.797-35.75 c2.656-2.25,6.344-2.844,9.563-1.5l43.531,18.031c3.219,1.344,5.422,4.359,5.688,7.844l4.281,54.813 c0.703,9.031,8.234,16.016,17.297,16.016h41.375c9.063,0,16.594-6.984,17.297-16.016l4.266-54.813 c0.281-3.484,2.484-6.5,5.703-7.844l43.531-18.031c3.203-1.344,6.922-0.75,9.547,1.5l41.813,35.75 c6.875,5.891,17.141,5.5,23.547-0.906l29.25-29.25c6.422-6.422,6.797-16.672,0.922-23.547l-35.75-41.813 c-2.25-2.641-2.844-6.344-1.5-9.563l18.031-43.516c1.344-3.219,4.344-5.422,7.828-5.703L496,293.984z M256,342.516 c-23.109,0-44.844-9-61.188-25.328c-16.344-16.359-25.344-38.078-25.344-61.203c0-23.109,9-44.844,25.344-61.172 c16.344-16.359,38.078-25.344,61.188-25.344c23.125,0,44.844,8.984,61.188,25.344c16.344,16.328,25.344,38.063,25.344,61.172 c0,23.125-9,44.844-25.344,61.203C300.844,333.516,279.125,342.516,256,342.516z"></path> </g> </g></svg>
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
    default:
      return defaultSvg;
  }
}