document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("json-file-input");
  const loadFileBtn = document.getElementById("load-file-btn");
  const loadStatus = document.getElementById("load-status");

  const initialSectionsWrapper = document.getElementById(
    "initial-sections-wrapper",
  );
  const fileInputSection = document.getElementById("file-input-section");
  const confirmLoadSection = document.getElementById("confirm-load-section");
  const confirmNewInventorySection = document.getElementById(
    "confirm-new-inventory-section",
  );
  const confirmSavedChecklistSection = document.getElementById(
    "confirm-saved-checklist-section",
  );
  const utilizzoFilters = document.getElementById("utilizzo-filters");
  const confirmLoadNewBtn = document.getElementById("confirm-load-new-btn");
  const confirmLoadSavedBtn = document.getElementById("confirm-load-saved-btn");

  const savedOriginalFiltersSpan = document.getElementById(
    "saved-original-filters",
  );
  const savedTotalItemsSpan = document.getElementById("saved-total-items");
  const savedCheckedItemsSpan = document.getElementById("saved-checked-items");
  const savedRemainingItemsSpan = document.getElementById(
    "saved-remaining-items",
  );

  const hamburgerBtn = document.getElementById("hamburger-btn");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const sidebarTotalElementsSpan = document.getElementById(
    "sidebar-total-elements",
  );
  const sidebarFilteredElementsSpan = document.getElementById(
    "sidebar-filtered-elements",
  );
  const sidebarCheckedElementsSpan = document.getElementById(
    "sidebar-checked-elements",
  );
  const sidebarRemainingElementsSpan = document.getElementById(
    "sidebar-remaining-elements",
  );
  const sidebarInventoryUtilizzoCounters = document.getElementById(
    "sidebar-inventory-utilizzo-counters",
  );
  const sidebarCategoryFiltersContainer = document.getElementById(
    "sidebar-category-filters",
  );
  const sidebarControlsContainer = document.getElementById("sidebar-controls");

  const filterCheckboxes = document.querySelectorAll(
    'input[name="utilizzo-filter"]',
  );

  const mainContent = document.getElementById("main-content");
  // const checklistContainerWrapper = document.getElementById( // Non più usato direttamente per la logica del messaggio
  //   "checklist-container-wrapper",
  // );
  const checklistContainer = document.getElementById("checklist-container");
  const allItemsCheckedMessage = document.getElementById(
    "all-items-checked-message",
  );

  const expandAllBtn = document.getElementById("expand-all-btn");
  const collapseAllBtn = document.getElementById("collapse-all-btn");
  const showCheckedBtn = document.getElementById("show-checked-btn");
  const exportChecklistBtn = document.getElementById("export-checklist-btn");

  const checkedItemsOverlay = document.getElementById("checked-items-overlay");
  const checkedItemsList = document.getElementById("checked-items-list");
  const clearAllCheckedBtn = document.getElementById("clear-all-checked-btn");

  const svgIconCollapse = `
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="btn-icon">
    <path d="M18.3174 4.71072C18.708 4.32019 18.708 3.68703 18.3174 3.2965C17.9269 2.90598 17.2937 2.90598 16.9032 3.2965L12.7212 7.47854C12.3307 7.86907 11.6975 7.86907 11.307 7.47854L7.12132 3.29289C6.7308 2.90237 6.09763 2.90237 5.70711 3.29289C5.31658 3.68342 5.31658 4.31658 5.70711 4.70711L10.5975 9.59747C11.3783 10.3782 12.644 10.3786 13.4252 9.59816L18.3174 4.71072Z" fill="#0F0F0F"/>
    <path d="M5.70712 19.312C5.31659 19.7025 5.31659 20.3357 5.70712 20.7262C6.09764 21.1167 6.73081 21.1167 7.12133 20.7262L11.3034 16.5442C11.6939 16.1536 12.3271 16.1536 12.7176 16.5442L16.9032 20.7298C17.2938 21.1203 17.9269 21.1203 18.3174 20.7298C18.708 20.3393 18.708 19.7061 18.3174 19.3156L13.4271 14.4252C12.6463 13.6445 11.3805 13.6441 10.5993 14.4245L5.70712 19.312Z" fill="#0F0F0F"/>
  </svg>
  `;

  const svgIconExpand = `
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="btn-icon">
    <path d="M5.70711 16.1359C5.31659 16.5264 5.31659 17.1596 5.70711 17.5501L10.5993 22.4375C11.3805 23.2179 12.6463 23.2176 13.4271 22.4369L18.3174 17.5465C18.708 17.156 18.708 16.5228 18.3174 16.1323C17.9269 15.7418 17.2937 15.7418 16.9032 16.1323L12.7176 20.3179C12.3271 20.7085 11.6939 20.7085 11.3034 20.3179L7.12132 16.1359C6.7308 15.7454 6.09763 15.7454 5.70711 16.1359Z" fill="#0F0F0F"/>
    <path d="M18.3174 7.88675C18.708 7.49623 18.708 6.86307 18.3174 6.47254L13.4252 1.58509C12.644 0.804698 11.3783 0.805008 10.5975 1.58579L5.70711 6.47615C5.31658 6.86667 5.31658 7.49984 5.70711 7.89036C6.09763 8.28089 6.7308 8.28089 7.12132 7.89036L11.307 3.70472C11.6975 3.31419 12.3307 3.31419 12.7212 3.70472L16.9032 7.88675C17.2937 8.27728 17.9269 8.27728 18.3174 7.88675Z" fill="#0F0F0F"/>
  </svg>
  `;

  const svgIconHistory = `
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="btn-icon">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22ZM14.4743 8.419C14.7952 8.68094 14.8429 9.15341 14.581 9.47428L8.86671 16.4743C8.72427 16.6488 8.51096 16.75 8.28571 16.75C8.06047 16.75 7.84716 16.6488 7.70472 16.4743L5.419 13.6743C5.15707 13.3534 5.20484 12.8809 5.52572 12.619C5.84659 12.3571 6.31906 12.4048 6.581 12.7257L8.28571 14.814L13.419 8.52572C13.6809 8.20484 14.1534 8.15707 14.4743 8.419ZM18.4743 8.41901C18.7952 8.68095 18.8429 9.15342 18.581 9.47429L12.8665 16.4743C12.7152 16.6596 12.4846 16.7617 12.2457 16.7489C12.0068 16.7362 11.7883 16.6103 11.6575 16.4099L11.3719 15.9724C11.1455 15.6256 11.2432 15.1608 11.5901 14.9344C11.7939 14.8014 12.0384 14.7803 12.2514 14.8558L17.419 8.52571C17.681 8.20484 18.1534 8.15707 18.4743 8.41901Z" fill="#0F0F0F"/>
  </svg>
  `;

  const svgIconExport = `
  <svg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="btn-icon">
  <path d="M11 6C12.6569 6 14 4.65685 14 3C14 1.34315 12.6569 0 11 0C9.34315 0 8 1.34315 8 3C8 3.22371 8.02449 3.44169 8.07092 3.65143L4.86861 5.65287C4.35599 5.24423 3.70652 5 3 5C1.34315 5 0 6.34315 0 8C0 9.65685 1.34315 11 3 11C3.70652 11 4.35599 10.7558 4.86861 10.3471L8.07092 12.3486C8.02449 12.5583 8 12.7763 8 13C8 14.6569 9.34315 16 11 16C12.6569 16 14 14.6569 14 13C14 11.3431 12.6569 10 11 10C10.2935 10 9.644 10.2442 9.13139 10.6529L5.92908 8.65143C5.97551 8.44169 6 8.22371 6 8C6 7.77629 5.97551 7.55831 5.92908 7.34857L9.13139 5.34713C9.644 5.75577 10.2935 6 11 6Z" fill="#0F0F0F"/>
  </svg>
  `;

  let fullInventoryData = null;
  let currentChecklistState = {};
  let tempLoadedData = null;
  let hasUnsavedChanges = false;
  let currentActiveCategoryFilter = null;

  const CATEGORY_ORDER = [
    "Corpi macchina",
    "Obiettivi e filtri",
    "Batterie e alimentazione",
    "Accessori e supporti",
    "Storage",
    "Audio",
    "Monitor",
    "Luci",
    "Borse",
    "Altro",
  ];

  const UTILIZZO_COLORS = {
    Attivo: "#007c35",
    "In uso": "#756209",
    Archiviato: "#6a1616",
    Default: "#bdc3c7",
  };
  const CATEGORY_COLORS = {
    "Corpi macchina": "#337ea980",
    "Obiettivi e filtri": "#a85bf257",
    "Batterie e alimentazione": "#b8654373",
    "Accessori e supporti": "#e97e2373",
    Storage: "#2d996480",
    Audio: "#fab14380",
    Monitor: "#ffffff21",
    Luci: "#dc4c9166",
    Borse: "#de555373",
    Altro: "#ffffff18",
    Default: "#3c5354ff",
  };

  sidebarControlsContainer.appendChild(expandAllBtn);
  expandAllBtn.innerHTML = svgIconExpand;
  expandAllBtn.addEventListener("click", () => toggleAll(true));

  sidebarControlsContainer.appendChild(collapseAllBtn);
  collapseAllBtn.innerHTML = svgIconCollapse;
  collapseAllBtn.addEventListener("click", () => toggleAll(false));

  sidebarControlsContainer.appendChild(showCheckedBtn);
  showCheckedBtn.innerHTML = svgIconHistory;

  sidebarControlsContainer.appendChild(exportChecklistBtn);
  exportChecklistBtn.innerHTML = svgIconExport;

  hamburgerBtn.addEventListener("click", () => {
    sidebarMenu.classList.toggle("open");
    adjustMainContentMargin();
  });

  function adjustMainContentMargin() {
    const targetMarginLeft = sidebarMenu.classList.contains("open")
      ? "300px"
      : "70px";
    if (
      initialSectionsWrapper &&
      !initialSectionsWrapper.classList.contains("hidden")
    ) {
      initialSectionsWrapper.style.marginLeft = targetMarginLeft;
    }
    if (mainContent && !mainContent.classList.contains("hidden")) {
      mainContent.style.marginLeft = targetMarginLeft;
    }
  }
  adjustMainContentMargin();

  function getFormattedTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}.${String(now.getSeconds()).padStart(2, "0")}`;
  }

  function createTagElement(text, type, isCountHighlight = false) {
    const tag = document.createElement("span");
    tag.classList.add("item-tag");
    let backgroundColor = CATEGORY_COLORS.Default;
    if (isCountHighlight) {
      tag.classList.add("count-highlight-tag");
      backgroundColor = "#141414";
    } else {
      tag.classList.add(`tag-${type.toLowerCase()}`);
      if (type.toLowerCase() === "category")
        backgroundColor = CATEGORY_COLORS[text] || CATEGORY_COLORS.Default;
      else if (type.toLowerCase() === "utilizzo")
        backgroundColor = UTILIZZO_COLORS[text] || UTILIZZO_COLORS.Default;
    }
    tag.style.backgroundColor = backgroundColor;
    tag.textContent = text;
    tag.style.color = "white";
    return tag;
  }

  function formatItemText(item) {
    let baseText = item.nome;
    const hasTotals = item.totali !== null && item.in_uso !== null;
    let countText = null;

    if (hasTotals) {
      if (item.totali === item.in_uso) {
        baseText = `${item.id}`;
        countText = `${item.totali}`;
      } else {
        baseText = item.id;
        countText = `${item.in_uso} / ${item.totali}`;
      }
    } else {
      baseText = item.id;
    }

    const nameAndCountContainer = document.createElement("div");
    nameAndCountContainer.classList.add("name-count-container");

    const itemNameSpan = document.createElement("span");
    itemNameSpan.classList.add("item-name-text");
    itemNameSpan.textContent = baseText;
    nameAndCountContainer.appendChild(itemNameSpan);

    if (countText) {
      nameAndCountContainer.appendChild(createTagElement(countText, "", true));
    }

    const otherTagsContainer = document.createElement("div");
    otherTagsContainer.classList.add("tags-container");

    if (item.categoria) {
      otherTagsContainer.appendChild(
        createTagElement(item.categoria, "category"),
      );
    }
    if (item.utilizzo) {
      otherTagsContainer.appendChild(
        createTagElement(item.utilizzo, "utilizzo"),
      );
    }

    return nameAndCountContainer.outerHTML + otherTagsContainer.outerHTML;
  }

  function sanitizeForDomId(text) {
    if (typeof text !== "string") text = String(text);
    let sanitized = text.replace(/\s+/g, "-");
    let finalSanitized = "";
    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      if (/[a-zA-Z0-9_-]/.test(char)) finalSanitized += char;
      else
        finalSanitized += "_" + char.charCodeAt(0).toString(16).toUpperCase();
    }
    finalSanitized = finalSanitized
      .replace(/-{2,}/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "");
    if (!finalSanitized) {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        hash = (hash << 5) - hash + charCode;
        hash |= 0;
      }
      return (
        "id-" +
        Math.abs(hash).toString(36) +
        "_" +
        Math.random().toString(36).substr(2, 3)
      );
    }
    return finalSanitized;
  }

  function generateUniqueId(item, parentSanitizedUniqueId = null) {
    const currentItemSanitizedPart = sanitizeForDomId(item.id);
    return parentSanitizedUniqueId
      ? `${parentSanitizedUniqueId}__${currentItemSanitizedPart}`
      : currentItemSanitizedPart;
  }

  function countAllItemsRecursive(items) {
    return items.reduce(
      (sum, item) =>
        sum + 1 + (item.children ? countAllItemsRecursive(item.children) : 0),
      0,
    );
  }

  function countActuallyFilteredItemsRecursive(
    items,
    selectedUtilizzi,
    activeCategory = null, // Questo conteggio considera la categoria attiva
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

  function updateCounters() {
    let activeCategoryIsEmpty = false; // Questa variabile si riferisce se la *categoria attiva* è vuota
    if (!fullInventoryData || !fullInventoryData.inventario) {
      sidebarTotalElementsSpan.textContent = "0";
      sidebarFilteredElementsSpan.textContent = "0";
      sidebarCheckedElementsSpan.textContent = "0";
      sidebarRemainingElementsSpan.textContent = "0";
      activeCategoryIsEmpty = renderCategoryFilters(); // Può diventare true se non ci sono categorie con items
      checkIfAllItemsCheckedInEntireList(); // MODIFICATO: nome funzione per chiarezza
      return activeCategoryIsEmpty;
    }
    const totalInvCount = countAllItemsRecursive(fullInventoryData.inventario);
    sidebarTotalElementsSpan.textContent = totalInvCount;

    let currentSelectedUtilizzi =
      currentChecklistState.original_filters ||
      Array.from(filterCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

    // Conteggio degli elementi filtrati che considera ANCHE la categoria attiva (per il contatore "Elementi filtrati")
    let actualFilteredCountForDisplay = countActuallyFilteredItemsRecursive(
      fullInventoryData.inventario,
      currentSelectedUtilizzi,
      currentActiveCategoryFilter,
    );
    sidebarFilteredElementsSpan.textContent = actualFilteredCountForDisplay;

    let visibleCheckedItemsCount = 0;
    Object.values(currentChecklistState).forEach((entry) => {
      if (entry.checked && entry.itemData && !entry.isExceptionallyShown) {
        const itemUtilizzo = entry.itemData.utilizzo;
        const itemCategory = entry.itemData.categoria;

        const passesEffectiveUtilizzo = currentChecklistState.original_filters
          ? currentChecklistState.original_filters.length === 0 ||
            currentChecklistState.original_filters.includes(itemUtilizzo)
          : currentSelectedUtilizzi.length === 0 ||
            currentSelectedUtilizzi.includes(itemUtilizzo);

        const passesCategoryFilter = // Questo filtro è per gli elementi *attualmente visibili* sotto il filtro categoria
          !currentActiveCategoryFilter ||
          itemCategory === currentActiveCategoryFilter;

        if (passesEffectiveUtilizzo && passesCategoryFilter) {
          visibleCheckedItemsCount++;
        }
      }
    });
    sidebarCheckedElementsSpan.textContent = visibleCheckedItemsCount;

    const remainingCountForDisplay = Math.max(
      0,
      actualFilteredCountForDisplay - visibleCheckedItemsCount,
    );
    sidebarRemainingElementsSpan.textContent = remainingCountForDisplay;

    activeCategoryIsEmpty = renderCategoryFilters();
    checkIfAllItemsCheckedInEntireList(); // MODIFICATO: nome funzione e logica interna
    return activeCategoryIsEmpty; // Questo valore è usato per resettare la categoria se si svuota
  }

  // MODIFICATO: La logica di questa funzione ora controlla l'intera lista, non solo la vista corrente
  function checkIfAllItemsCheckedInEntireList() {
    if (
      !sidebarTotalElementsSpan || // Usiamo i contatori globali
      !sidebarRemainingElementsSpan ||
      !checklistContainer ||
      !allItemsCheckedMessage
    )
      return;

    // Controlla se TUTTI gli elementi dell'inventario che passano i filtri di UTILIZZO (ignorando la categoria) sono stati spuntati.
    let totalItemsMatchingUtilizzoFilters = 0;
    let checkedItemsMatchingUtilizzoFilters = 0;

    const currentSelectedUtilizzi =
      currentChecklistState.original_filters ||
      Array.from(filterCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

    if (fullInventoryData && fullInventoryData.inventario) {
      function recursiveCheck(items) {
        items.forEach((item) => {
          const passesUtilizzo =
            currentSelectedUtilizzi.length === 0 ||
            currentSelectedUtilizzi.includes(item.utilizzo);
          if (passesUtilizzo) {
            totalItemsMatchingUtilizzoFilters++;
            const uniqueId = generateUniqueId(item); // Dovrebbe essere coerente con come gli ID sono generati
            // Per items annidati, questo ID potrebbe non essere direttamente in currentChecklistState se non è stato renderizzato,
            // quindi dobbiamo iterare su currentChecklistState e verificare l'itemData.
            // Più semplice: iterare currentChecklistState.
          }
          if (item.children) {
            recursiveCheck(item.children);
          }
        });
      }
      // Per ottenere totalItemsMatchingUtilizzoFilters in modo corretto rispetto alla struttura di currentChecklistState
      totalItemsMatchingUtilizzoFilters = 0;
      Object.values(currentChecklistState).forEach((stateEntry) => {
        if (stateEntry.itemData && !stateEntry.isExceptionallyShown) {
          // Considera solo gli items "reali"
          const itemUtilizzo = stateEntry.itemData.utilizzo;
          const passesUtilizzo =
            currentSelectedUtilizzi.length === 0 ||
            currentSelectedUtilizzi.includes(itemUtilizzo);
          if (passesUtilizzo) {
            totalItemsMatchingUtilizzoFilters++;
          }
        }
      });

      Object.values(currentChecklistState).forEach((stateEntry) => {
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

    if (mainContent.classList.contains("hidden")) {
      checklistContainer.classList.remove("hidden");
      allItemsCheckedMessage.classList.add("hidden");
      return;
    }

    // Mostra il messaggio "Tutti gli elementi spuntati" solo se ci sono elementi che corrispondono
    // ai filtri di utilizzo globali E tutti questi sono stati spuntati.
    if (
      totalItemsMatchingUtilizzoFilters > 0 &&
      checkedItemsMatchingUtilizzoFilters === totalItemsMatchingUtilizzoFilters
    ) {
      checklistContainer.classList.add("hidden");
      allItemsCheckedMessage.classList.remove("hidden");
    } else {
      checklistContainer.classList.remove("hidden");
      allItemsCheckedMessage.classList.add("hidden");
    }
  }

  function updateUtilizzoCounters(inventory) {
    sidebarInventoryUtilizzoCounters.innerHTML = "";
    if (!inventory || !inventory.length) {
      sidebarInventoryUtilizzoCounters.classList.add("hidden");
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
      sidebarInventoryUtilizzoCounters.innerHTML =
        "Utilizzo Inventario: " + tagsHtml;
      sidebarInventoryUtilizzoCounters.classList.remove("hidden");
    } else {
      sidebarInventoryUtilizzoCounters.classList.add("hidden");
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

  // function hasVisibleChildren(item, selectedUtilizzi, activeCategory = null) { // Non usata direttamente
  //   if (!item.children || item.children.length === 0) return false;
  //   return item.children.some((child) =>
  //     itemOrDescendantPassesFilter(child, selectedUtilizzi, activeCategory),
  //   );
  // }

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

    if (!currentChecklistState[uniqueId]) {
      currentChecklistState[uniqueId] = {
        checked: false,
        timestamp: null,
        parentId: parentUniqueId,
        itemData: { ...item }, // Salva una copia dei dati dell'item
        isExceptionallyShown: isCurrentItemExceptionallyShown,
      };
    } else {
      // Aggiorna i dati se già esiste, mantenendo lo stato checked/timestamp
      currentChecklistState[uniqueId].itemData = { ...item };
      currentChecklistState[uniqueId].parentId = parentUniqueId;
      currentChecklistState[uniqueId].isExceptionallyShown =
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
    checkbox.checked = currentChecklistState[uniqueId].checked;
    checkbox.disabled = isCurrentItemExceptionallyShown;

    if (!isCurrentItemExceptionallyShown) {
      checkbox.addEventListener("change", () => {
        hasUnsavedChanges = true;
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

  function renderChecklist() {
    checklistContainer.innerHTML = "";
    // allItemsCheckedMessage.classList.add("hidden"); // La visibilità di questo è gestita da checkIfAllItemsCheckedInEntireList

    if (!fullInventoryData || !fullInventoryData.inventario) {
      loadStatus.textContent = "Nessun dato da mostrare.";
      checkIfAllItemsCheckedInEntireList();
      return;
    }
    const sortedInventory = [...fullInventoryData.inventario].sort(
      (a, b) => (a.ordine || 0) - (b.ordine || 0),
    );
    let selectedUtilizziForRendering =
      currentChecklistState.original_filters ||
      Array.from(filterCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);
    utilizzoFilters.classList.toggle(
      "hidden",
      !!currentChecklistState.original_filters,
    );

    // Pre-popola currentChecklistState per tutti gli item se non già presenti
    // Questo è importante per il calcolo di checkIfAllItemsCheckedInEntireList
    // e per renderCategoryFilters che conta gli item non spuntati.
    function ensureStateExistsRecursive(items, parentId = null) {
      items.forEach((item) => {
        const itemId = generateUniqueId(item, parentId);
        if (!currentChecklistState[itemId]) {
          currentChecklistState[itemId] = {
            checked: false,
            timestamp: null,
            parentId: parentId,
            itemData: { ...item },
            isExceptionallyShown: false, // Default, verrà aggiornato se necessario durante il rendering
          };
        } else {
          // Assicura che itemData sia aggiornato se il file JSON cambia
          currentChecklistState[itemId].itemData = { ...item };
        }
        if (item.children) {
          ensureStateExistsRecursive(item.children, itemId);
        }
      });
    }
    ensureStateExistsRecursive(fullInventoryData.inventario);

    if (currentChecklistState.original_filters) {
      // Non mostrare i contatori di utilizzo specifici se si carica una checklist salvata con filtri originali
      sidebarInventoryUtilizzoCounters.classList.add("hidden");
    } else {
      updateUtilizzoCounters(fullInventoryData.inventario);
    }

    sortedInventory.forEach((item) => {
      const itemPassesUtilizzo =
        !selectedUtilizziForRendering ||
        selectedUtilizziForRendering.length === 0 ||
        selectedUtilizziForRendering.includes(item.utilizzo);
      const itemPassesCategory =
        !currentActiveCategoryFilter ||
        item.categoria === currentActiveCategoryFilter;
      const itemPassesAllCurrentFilters =
        itemPassesUtilizzo && itemPassesCategory;
      const descendantPassesAllCurrentFilters = itemOrDescendantPassesFilter(
        item,
        selectedUtilizziForRendering,
        currentActiveCategoryFilter,
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
          currentActiveCategoryFilter,
          isExceptionallyShownItself,
        );
        checklistContainer.appendChild(listItem);
      }
    });
    updateAllParentStates(); // Assicura che gli stati visuali dei parent siano corretti
    updateCounters(); // Questo chiamerà anche renderCategoryFilters e checkIfAllItemsCheckedInEntireList
  }

  function updateItemVisualType(uniqueId) {
    const listItem = document.querySelector(`[data-item-id="${uniqueId}"]`);
    if (!listItem) return;

    const itemState = currentChecklistState[uniqueId];
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
          // Controlla se il child LI è effettivamente nel DOM e non nascosto
          hasVisibleRenderedChildInDOM = true;
          break;
        }
      }
      if (hasVisibleRenderedChildInDOM) {
        shouldBeVisualParent = true;
        childrenUl.style.display = ""; // Assicura che sia visibile se ha figli visibili
      } else {
        childrenUl.style.display = "none"; // Nascondi se non ha figli visibili nel DOM
      }
    } else if (childrenUl) {
      // Se non ci sono figli nell'itemData ma l'UL esiste, nascondilo
      childrenUl.style.display = "none";
    }

    // Se l'item è "exceptionally shown", deve essere nascosto se non ha figli visibili nel DOM
    if (itemState.isExceptionallyShown) {
      let hasAnyVisibleDescendantInDOM = false;
      if (childrenUl && childrenUl.style.display !== "none") {
        // Controlla se l'UL dei figli è mostrato
        for (const childLi of childrenUl.children) {
          if (!childLi.classList.contains("hidden")) {
            // Controlla se un figlio è visibile
            hasAnyVisibleDescendantInDOM = true;
            break;
          }
        }
      }
      if (!hasAnyVisibleDescendantInDOM) {
        listItem.classList.add("hidden"); // Nascondi l'item "exceptionally shown" se non ha discendenti visibili
        shouldBeVisualParent = false; // Non può essere un parent visuale se è nascosto
      } else {
        listItem.classList.remove("hidden"); // Mostra se ha discendenti visibili
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

  function applyVisualState(uniqueId, listItemElement = null) {
    const listItem =
      listItemElement || document.querySelector(`[data-item-id="${uniqueId}"]`);
    if (!listItem) return;

    const itemState = currentChecklistState[uniqueId];
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
        let allChildrenEffectivelyChecked = true; // Assume true se non ci sono figli visibili
        if (
          childrenUl &&
          childrenUl.style.display !== "none" && // Controlla se l'UL dei figli è attualmente mostrato
          childrenUl.children.length > 0
        ) {
          const visibleChildrenInUl = Array.from(childrenUl.children).filter(
            (childLi) => !childLi.classList.contains("hidden"),
          );
          if (visibleChildrenInUl.length > 0) {
            // Solo se ci sono figli effettivamente visibili nel DOM
            allChildrenEffectivelyChecked = visibleChildrenInUl.every(
              (childLi) => {
                const childState =
                  currentChecklistState[childLi.dataset.itemId];
                // Un figlio è "effettivamente spuntato" se il suo stato è checked O se l'elemento LI del figlio è nascosto
                // (perché il figlio stesso è stato spuntato e nascosto)
                return (
                  childState &&
                  (childState.checked || childLi.classList.contains("hidden"))
                );
              },
            );
          }
        }
        // Se non ci sono figli visibili (o l'UL è nascosto), allChildrenEffectivelyChecked rimane true.
        // Questo significa che un parent spuntato si nasconderà se tutti i suoi figli *attualmente visibili* sono spuntati,
        // o se non ha figli visibili.

        if (allChildrenEffectivelyChecked) {
          listItem.classList.add("hidden");
        } else {
          listItem.classList.add("strikethrough");
        }
      } else {
        // L'item non ha figli
        listItem.classList.add("hidden");
      }
    }
    updateItemVisualType(uniqueId); // Aggiorna se è un parent visuale, ecc.
  }

  function handleItemCheck(uniqueId, isChecked) {
    const itemState = currentChecklistState[uniqueId];
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

    const activeCategoryIsEmpty = updateCounters(); // Questo chiamerà renderCategoryFilters e checkIfAllItemsCheckedInEntireList

    // MODIFICATO: Logica per resettare la categoria
    if (currentActiveCategoryFilter && activeCategoryIsEmpty) {
      currentActiveCategoryFilter = null;
      renderChecklist(); // Rerender per applicare il filtro "Tutte le categorie"
      // L'aggiornamento della classe 'active' sul filtro categoria avverrà in renderCategoryFilters
      // chiamato da updateCounters -> renderChecklist -> updateCounters.
      // Assicurati che il menu sidebar si apra se era chiuso e una categoria si svuota
      if (!sidebarMenu.classList.contains("open")) {
        sidebarMenu.classList.add("open");
        adjustMainContentMargin();
      }
    }
  }

  function updateParentState(parentUniqueId) {
    if (!parentUniqueId) return;
    const parentListItem = document.querySelector(
      `[data-item-id="${parentUniqueId}"]`,
    );
    // parentListItem potrebbe essere null se il parent non è renderizzato (es. a causa di un filtro categoria)
    // applyVisualState gestisce il caso di listItemElement nullo.
    applyVisualState(parentUniqueId, parentListItem);
    const parentState = currentChecklistState[parentUniqueId];
    if (parentState && parentState.parentId)
      updateParentState(parentState.parentId);
  }

  function updateAllParentStates() {
    // Itera su tutti gli uniqueId in currentChecklistState che potrebbero avere un LI nel DOM
    // o semplicemente tutti gli ID per assicurare che lo stato logico sia aggiornato,
    // e poi applyVisualState gestirà se l'LI esiste.
    Object.keys(currentChecklistState).forEach((uniqueId) => {
      // Non è necessario trovare l'elemento qui, applyVisualState lo farà.
      applyVisualState(uniqueId);
    });
  }

  function updateCheckedItemsOverlay() {
    checkedItemsList.innerHTML = "";
    const checkedItems = [];
    for (const uniqueId in currentChecklistState) {
      const itemState = currentChecklistState[uniqueId];
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
      checkedItemsList.appendChild(p);
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
        currentChecklistState[itemStateWithId.parentId]
      ) {
        const parentData =
          currentChecklistState[itemStateWithId.parentId].itemData;
        const parentName = parentData.nome || parentData.id;
        displayName = `${countPrefix}${baseDisplayName} (${parentName})`;
      }

      li.innerHTML = `<span class="item-name-timestamp"><span class="item-name" title="${displayName}">${displayName}</span><span class="timestamp">${itemStateWithId.timestamp || "N/A"}</span></span>`;
      const restoreBtn = document.createElement("button");
      restoreBtn.classList.add("restore-btn");
      restoreBtn.textContent = "X";
      restoreBtn.title = "Ripristina elemento";
      restoreBtn.addEventListener("click", () => {
        hasUnsavedChanges = true;
        restoreItem(itemStateWithId.uniqueId);
      });
      li.appendChild(restoreBtn);
      checkedItemsList.appendChild(li);
    });
  }

  function restoreItem(uniqueIdToRestore) {
    const itemState = currentChecklistState[uniqueIdToRestore];
    if (!itemState || itemState.isExceptionallyShown) return;
    itemState.checked = false;
    itemState.timestamp = null;

    // Non è necessario trovare listItem qui, applyVisualState lo fa.
    applyVisualState(uniqueIdToRestore);
    if (itemState.parentId) updateParentState(itemState.parentId);

    updateAllParentStates(); // Assicura che tutti gli stati visuali siano aggiornati globalmente

    updateCheckedItemsOverlay();
    const activeCatIsEmpty = updateCounters(); // Questo chiamerà renderCategoryFilters e checkIfAllItemsCheckedInEntireList

    // MODIFICATO: Logica per resettare la categoria se si svuota dopo un ripristino
    if (currentActiveCategoryFilter && activeCatIsEmpty) {
      currentActiveCategoryFilter = null;
      renderChecklist();
      if (!sidebarMenu.classList.contains("open")) {
        sidebarMenu.classList.add("open");
        adjustMainContentMargin();
      }
    }
  }

  function clearAllCheckedItems() {
    let itemsWereRestored = false;
    const idsToRestore = [];
    for (const uniqueId in currentChecklistState) {
      if (
        currentChecklistState[uniqueId].checked &&
        !currentChecklistState[uniqueId].isExceptionallyShown
      ) {
        idsToRestore.push(uniqueId);
      }
    }
    idsToRestore.forEach((id) => {
      restoreItem(id);
      itemsWereRestored = true;
    });

    if (itemsWereRestored) {
      hasUnsavedChanges = true;
      // updateAllParentStates(); // restoreItem ora lo chiama già
      const activeCatIsEmpty = updateCounters(); // Chiamerà renderCategoryFilters

      if (currentActiveCategoryFilter && activeCatIsEmpty) {
        currentActiveCategoryFilter = null;
        renderChecklist();
        if (!sidebarMenu.classList.contains("open")) {
          sidebarMenu.classList.add("open");
          adjustMainContentMargin();
        }
      }
    }
  }

  function toggleAll(shouldExpand) {
    // console.log( // Rimosso per pulizia, può essere riattivato per debug
    //   `--- DEBUG: toggleAll called with shouldExpand: ${shouldExpand} ---`,
    // );
    const allListItems = document.querySelectorAll(
      ".checklist .item[data-item-id]",
    );
    // console.log(
    //   `Found ${allListItems.length} items with data-item-id to iterate for toggleAll.`,
    // );

    allListItems.forEach((itemLi) => {
      // const uniqueId = itemLi.dataset.itemId; // Non usato direttamente
      const childrenUl = itemLi.querySelector(".children-list");
      const toggleBtn = itemLi.querySelector(".toggle-btn");

      if (childrenUl && toggleBtn && toggleBtn.style.display !== "none") {
        // console.log(
        //   `Action: Toggling visual parent ${uniqueId} to collapsed: ${!shouldExpand}`,
        // );
        childrenUl.classList.toggle("collapsed", !shouldExpand);
        toggleBtn.classList.toggle("collapsed", !shouldExpand);
      }
    });
    // console.log("--- DEBUG: toggleAll finished ---");
  }

  function jsCleanName(nameWithLink) {
    if (!nameWithLink) return null;
    // Replicates Python's re.sub(r'\s*\([^)]*\)\s*$', '', name_with_link).strip()
    let cleaned = String(nameWithLink)
      .replace(/\s*\([^)]*\)\s*$/, "")
      .trim();
    return cleaned ? cleaned : null;
  }

  function jsParseIntOrNull(value) {
    if (value && String(value).trim()) {
      const num = parseInt(String(value).trim(), 10);
      if (!isNaN(num)) {
        return num;
      }
    }
    return null;
  }

  /**
   * Basic CSV parser.
   * NOTE: This is a simplified parser and may not handle all CSV complexities
   * (e.g., commas within quoted fields, multiline fields).
   * For robust CSV parsing, a library like PapaParse is recommended.
   */

  function parseCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length === 0) return { header: [], rows: [] };

    const parseRow = (rowString) => {
      const fields = [];
      // Regex to handle CSV fields:
      // It matches fields separated by commas.
      // A field can be:
      // 1. Enclosed in double quotes: "..."
      //    - Inside the quotes, "" is treated as a single "
      //    - The content captured is group 1.
      // 2. Not enclosed in quotes: ...
      //    - This is any sequence of characters not containing a comma.
      //    - The content captured is group 2.
      // The (?:^|,) part ensures we match from the start of the line or after a comma.
      const regex = /(?:^|,)(?:"((?:[^"]|"")*)"|([^,]*))/g;
      let match;

      while ((match = regex.exec(rowString)) !== null) {
        let value;
        if (match[1] !== undefined) {
          // Quoted field (content in match[1])
          value = match[1].replace(/""/g, '"'); // Replace escaped double quotes "" with a single "
        } else if (match[2] !== undefined) {
          // Unquoted field (content in match[2])
          value = match[2];
        } else {
          // This case should ideally not be hit if the regex is comprehensive
          // and the row is not entirely empty or malformed in a specific way.
          value = "";
        }
        fields.push(value.trim()); // Trim whitespace from the extracted field
      }

      // Handle case where the row ends with a comma, indicating a final empty field
      // The regex above might not add the last empty field if the line ends with a comma
      // e.g. "a,b," -> regex gives ["a", "b"]. We need ["a", "b", ""].
      if (rowString.trim().endsWith(",")) {
        // Check if the last field captured by regex is already empty due to a trailing comma.
        // If the regex captured "a,b," as fields ["a", "b"], and the original was "a,b,",
        // we need to add an empty string.
        // If regex captured "a,," as ["a", ""], and original was "a,,", it's fine.
        // The current regex seems to handle it: for "a,b,", match for last comma will have match[2] = ""
        // Let's test: 'a,b,'.exec(regex) -> match[2] for 'b'. Next match: for ',', match[2] will be ''. So it seems fine.
      }

      return fields;
    };

    const headerFields = parseRow(lines[0]);
    const header = headerFields.map((h) => h.trim()); // Ensure header names are also trimmed

    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue; // Skip empty lines

      const values = parseRow(lines[i]);
      const rowObject = {};
      let emptyRow = true;

      header.forEach((col, index) => {
        // Use `values[index]` directly. If it's undefined (e.g. fewer columns in data row than header), it becomes empty string.
        const value =
          values[index] !== undefined ? String(values[index]).trim() : "";
        rowObject[col] = value;
        if (value) emptyRow = false;
      });

      // Optional: Warn if the number of parsed values doesn't match the number of header columns
      if (values.length > header.length) {
        console.warn(
          `Riga ${i + 1} (contenuto: "${lines[i]}") ha ${values.length} colonne, ma l'intestazione ne ha ${header.length}. Le colonne extra verranno ignorate.`,
        );
      } else if (values.length < header.length) {
        // This case is handled by assigning empty strings to missing columns above.
        // console.warn(`Riga ${i + 1} ha meno colonne (${values.length}) dell'intestazione (${header.length}). Colonne mancanti saranno vuote.`);
      }

      if (!emptyRow) {
        rows.push(rowObject);
      }
    }
    return { header, rows };
  }

  function jsCleanupItemForApp(itemsList) {
    itemsList.forEach((item) => {
      delete item.componenti_raw;
      delete item.oggetto_riferimento_raw;
      delete item.internal_unique_id;
      if (item.children && item.children.length > 0) {
        jsCleanupItemForApp(item.children);
      }
    });
  }

  function jsSortItemsRecursive(items) {
    items.sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        jsSortItemsRecursive(item.children);
      }
    });
    return items;
  }

  function getFormattedDateForCsvMod(dateObject) {
    const y = dateObject.getFullYear();
    const m = String(dateObject.getMonth() + 1).padStart(2, "0");
    const d = String(dateObject.getDate()).padStart(2, "0");
    const h = String(dateObject.getHours()).padStart(2, "0");
    const min = String(dateObject.getMinutes()).padStart(2, "0");
    const s = String(dateObject.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  }

  // --- MODIFIED/NEW FILE PROCESSING LOGIC ---

  function processCsvFile(file) {
    loadStatus.textContent = `Lettura file CSV "${file.name}"...`;
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const { header: csvHeader, rows: csvRows } = parseCSV(csvText);

        if (!csvHeader.length || !csvRows.length) {
          throw new Error("CSV vuoto o formato non valido.");
        }

        // Expected headers (case sensitive, like Python's DictReader)
        const expectedHeaders = [
          "Oggetto",
          "Utilizzo",
          "Categoria",
          "Totali",
          "In uso",
          "ID",
          "Componenti",
          "Oggetto di riferimento",
        ];
        for (const h of expectedHeaders) {
          if (!csvHeader.includes(h)) {
            // 'Componenti' and 'Oggetto di riferimento' can be missing if not used
            if (h !== "Componenti" && h !== "Oggetto di riferimento") {
              throw new Error(
                `Colonna CSV richiesta mancante: ${h}. Colonne trovate: ${csvHeader.join(", ")}`,
              );
            } else if (!csvHeader.includes(h)) {
              // if optional header is missing, add it to prevent errors later
              csvHeader.push(h);
              csvRows.forEach((row) => (row[h] = "")); // Add empty value for this missing optional column
            }
          }
        }

        let itemsMapForLookup = {};
        let collectedValidItems = [];
        let validationErrors = [];

        // === PRIMO PASSAGGIO: Leggere e validare tutti gli item dal CSV ===
        csvRows.forEach((row, index) => {
          const rowNumber = index + 1; // 1-based for errors
          let currentRowErrors = [];

          const oggetto_name = row["Oggetto"]
            ? String(row["Oggetto"]).trim()
            : "";
          const utilizzo_val = row["Utilizzo"]
            ? String(row["Utilizzo"]).trim()
            : "";
          const categoria_val = row["Categoria"]
            ? String(row["Categoria"]).trim()
            : "";
          const totali_str = row["Totali"] ? String(row["Totali"]).trim() : "";
          const in_uso_str = row["In uso"] ? String(row["In uso"]).trim() : "";
          const ordine_str = row["ID"] ? String(row["ID"]).trim() : "";

          let ordine_val_parsed_for_item_data = null;

          if (!oggetto_name)
            currentRowErrors.push("Il campo 'Oggetto' è vuoto.");
          if (!utilizzo_val)
            currentRowErrors.push("Il campo 'Utilizzo' è vuoto.");
          if (!categoria_val)
            currentRowErrors.push("Il campo 'Categoria' è vuoto.");

          if ((totali_str && !in_uso_str) || (!totali_str && in_uso_str)) {
            currentRowErrors.push(
              "I campi 'Totali' e 'In uso' devono essere entrambi presenti o entrambi assenti.",
            );
          } else if (totali_str && in_uso_str) {
            const totali_val_parsed = jsParseIntOrNull(totali_str);
            const in_uso_val_parsed = jsParseIntOrNull(in_uso_str);
            let validNumbersForComparison = true;

            if (totali_val_parsed === null) {
              currentRowErrors.push(
                `Il valore '${totali_str}' per 'Totali' non è un numero intero valido.`,
              );
              validNumbersForComparison = false;
            }
            if (in_uso_val_parsed === null) {
              currentRowErrors.push(
                `Il valore '${in_uso_str}' per 'In uso' non è un numero intero valido.`,
              );
              validNumbersForComparison = false;
            }
            if (
              validNumbersForComparison &&
              in_uso_val_parsed > totali_val_parsed
            ) {
              currentRowErrors.push(
                `'In uso' (${in_uso_val_parsed}) non può essere maggiore di 'Totali' (${totali_val_parsed}).`,
              );
            }
          }

          if (!ordine_str) {
            currentRowErrors.push("Il campo 'ID' (ordine) è vuoto.");
          } else {
            const temp_ordine_val = jsParseIntOrNull(ordine_str);
            if (temp_ordine_val === null) {
              currentRowErrors.push(
                `Il valore '${ordine_str}' per 'ID' (ordine) non è un numero intero valido.`,
              );
            } else {
              ordine_val_parsed_for_item_data = temp_ordine_val;
            }
          }

          if (currentRowErrors.length > 0) {
            validationErrors.push({
              row_number: rowNumber,
              errors: currentRowErrors,
            });
            return; // Skip to next row on error for this row
          }

          const item_data = {
            internal_unique_id: `row_${rowNumber}`,
            id: oggetto_name,
            nome: oggetto_name,
            utilizzo: utilizzo_val,
            totali: jsParseIntOrNull(totali_str),
            in_uso: jsParseIntOrNull(in_uso_str),
            categoria: categoria_val,
            componenti_raw: row["Componenti"]
              ? String(row["Componenti"]).trim()
              : "",
            ordine: ordine_val_parsed_for_item_data,
            oggetto_riferimento_raw: row["Oggetto di riferimento"]
              ? String(row["Oggetto di riferimento"]).trim()
              : "",
            children: [],
          };
          collectedValidItems.push(item_data);
          if (!itemsMapForLookup[oggetto_name]) {
            itemsMapForLookup[oggetto_name] = item_data;
          }
        });

        // === CONTROLLO DUPLICATI NELLA COLONNA "ID" (Ordine) ===
        const ordineValues = collectedValidItems.map((item) => item.ordine);
        const duplicateOrdini = ordineValues.filter(
          (val, i, arr) => arr.indexOf(val) !== i && val !== null,
        );
        if (duplicateOrdini.length > 0) {
          const uniqueDuplicateOrdini = [...new Set(duplicateOrdini)];
          validationErrors.push({
            row_number: "Global",
            errors: [
              `Valori 'ID' (ordine) duplicati trovati: ${uniqueDuplicateOrdini.sort((a, b) => a - b).join(", ")}`,
            ],
          });
        }

        if (validationErrors.length > 0) {
          let errorMsg = "Errori di validazione CSV:\n";
          validationErrors.forEach((err) => {
            errorMsg += `Riga ${err.row_number}: ${err.errors.join(", ")}\n`;
          });
          throw new Error(errorMsg);
        }

        if (collectedValidItems.length === 0) {
          throw new Error("Nessun dato valido trovato nel CSV.");
        }

        // === SECONDO PASSAGGIO: Costruire la gerarchia E VALIDARE ID GERARCHICI ===
        let hierarchyIdErrors = [];
        collectedValidItems.forEach((item_data) => {
          const parent_name_raw = item_data.oggetto_riferimento_raw;
          const parent_name_cleaned = jsCleanName(parent_name_raw);

          if (parent_name_cleaned && itemsMapForLookup[parent_name_cleaned]) {
            const parent_item = itemsMapForLookup[parent_name_cleaned];
            if (
              parent_item.internal_unique_id !== item_data.internal_unique_id
            ) {
              if (item_data.ordine <= parent_item.ordine) {
                hierarchyIdErrors.push(
                  `ID Gerarchia (Oggetto Riferimento): Figlio '${item_data.id}' (ID: ${item_data.ordine}) ` +
                    `ha ID non strettamente maggiore del Padre '${parent_item.id}' (ID: ${parent_item.ordine}).`,
                );
              }
              if (
                !parent_item.children.find(
                  (c) => c.internal_unique_id === item_data.internal_unique_id,
                )
              ) {
                parent_item.children.push(item_data);
              }
            }
          }

          const components_raw = item_data.componenti_raw;
          if (components_raw) {
            const component_names_raw = components_raw.split(",");
            component_names_raw.forEach((comp_name_raw) => {
              const comp_name_cleaned = jsCleanName(comp_name_raw);
              if (comp_name_cleaned && itemsMapForLookup[comp_name_cleaned]) {
                const child_item_candidate =
                  itemsMapForLookup[comp_name_cleaned];
                const child_parent_ref_raw =
                  child_item_candidate.oggetto_riferimento_raw;
                const child_parent_ref_cleaned =
                  jsCleanName(child_parent_ref_raw);

                if (
                  !child_parent_ref_cleaned ||
                  child_parent_ref_cleaned === item_data.id
                ) {
                  if (
                    item_data.internal_unique_id !==
                    child_item_candidate.internal_unique_id
                  ) {
                    if (child_item_candidate.ordine <= item_data.ordine) {
                      hierarchyIdErrors.push(
                        `ID Gerarchia (Componenti): Componente/Figlio '${child_item_candidate.id}' (ID: ${child_item_candidate.ordine}) ` +
                          `di Padre '${item_data.id}' (ID: ${item_data.ordine}) ` +
                          `ha ID non strettamente maggiore.`,
                      );
                    }
                    if (
                      !item_data.children.find(
                        (c) =>
                          c.internal_unique_id ===
                          child_item_candidate.internal_unique_id,
                      )
                    ) {
                      item_data.children.push(child_item_candidate);
                    }
                  }
                }
              }
            });
          }
        });

        // Deduplicate hierarchyIdErrors
        if (hierarchyIdErrors.length > 0) {
          hierarchyIdErrors = [...new Set(hierarchyIdErrors)];
          let errorMsg =
            "Errori di Gerarchia ID:\nRegola: L'ID di un figlio deve essere strettamente maggiore dell'ID del padre.\n";
          hierarchyIdErrors
            .sort()
            .forEach((msg) => (errorMsg += `  - ${msg}\n`));
          throw new Error(errorMsg);
        }

        // === DETERMINARE I ROOT ITEMS ===
        const all_child_internal_ids = new Set();
        collectedValidItems.forEach((item_from_list) => {
          item_from_list.children.forEach((child) => {
            all_child_internal_ids.add(child.internal_unique_id);
          });
        });
        let final_root_items = collectedValidItems.filter(
          (item) => !all_child_internal_ids.has(item.internal_unique_id),
        );

        // === PULIZIA FINALE E ORDINAMENTO ===
        jsCleanupItemForApp(final_root_items); // In-place cleanup
        final_root_items = jsSortItemsRecursive(final_root_items); // In-place sort

        const csvModStr = getFormattedDateForCsvMod(
          new Date(file.lastModified),
        );
        tempLoadedData = {
          inventario: final_root_items,
          csv_ultima_modifica: csvModStr,
        };

        // Proceed to confirmation screen (same as for a new inventory JSON)
        if (initialSectionsWrapper)
          initialSectionsWrapper.classList.remove("hidden");
        fileInputSection.classList.add("hidden");
        confirmLoadSection.classList.remove("hidden");
        mainContent.classList.add("hidden");
        loadStatus.textContent = ""; // Clear loading message
        adjustMainContentMargin();

        confirmNewInventorySection.classList.remove("hidden");
        confirmSavedChecklistSection.classList.add("hidden");
        // Utilizzo filters are already part of confirmNewInventorySection
      } catch (e) {
        loadStatus.textContent = `Errore elaborazione CSV: ${e.message}`;
        console.error("Errore elaborazione CSV:", e);
        tempLoadedData = null;
        // Reset UI to initial state
        if (initialSectionsWrapper)
          initialSectionsWrapper.classList.remove("hidden");
        fileInputSection.classList.remove("hidden");
        confirmLoadSection.classList.add("hidden");
        confirmNewInventorySection.classList.add("hidden");
        confirmSavedChecklistSection.classList.add("hidden");
        mainContent.classList.add("hidden");
        adjustMainContentMargin();
      }
    };

    reader.onerror = () => {
      loadStatus.textContent = "Errore lettura file CSV.";
      tempLoadedData = null;
      if (initialSectionsWrapper)
        initialSectionsWrapper.classList.remove("hidden");
      fileInputSection.classList.remove("hidden");
      confirmLoadSection.classList.add("hidden");
      mainContent.classList.add("hidden");
      adjustMainContentMargin();
    };
    reader.readAsText(file);
  }

  function processJsonFile(file) {
    loadStatus.textContent = `Lettura file JSON "${file.name}"...`;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        tempLoadedData = JSON.parse(event.target.result);
        if (
          !tempLoadedData ||
          (!tempLoadedData.inventario && !tempLoadedData.currentChecklistState)
        ) {
          throw new Error("Struttura dati JSON non valida.");
        }

        if (initialSectionsWrapper)
          initialSectionsWrapper.classList.remove("hidden");
        fileInputSection.classList.add("hidden");
        confirmLoadSection.classList.remove("hidden");
        mainContent.classList.add("hidden");
        loadStatus.textContent = "";
        adjustMainContentMargin();

        if (
          Array.isArray(tempLoadedData.inventario) &&
          !tempLoadedData.currentChecklistState
        ) {
          // This is a pure inventory JSON (like one output by Python script)
          confirmNewInventorySection.classList.remove("hidden");
          confirmSavedChecklistSection.classList.add("hidden");
        } else if (
          tempLoadedData.inventario &&
          tempLoadedData.currentChecklistState
        ) {
          // This is a saved checklist JSON (exported by this web app)
          confirmNewInventorySection.classList.add("hidden");
          confirmSavedChecklistSection.classList.remove("hidden");

          const originalFilters =
            tempLoadedData.currentChecklistState.original_filters || [];
          savedOriginalFiltersSpan.textContent =
            originalFilters.length > 0 ? originalFilters.join(", ") : "Tutti";
          savedTotalItemsSpan.textContent = countAllItemsRecursive(
            tempLoadedData.inventario,
          );

          const state = tempLoadedData.currentChecklistState;
          let checkedCount = 0;
          let relevantItemsForSavedChecklist = 0;

          function countRelevantForSaved(items, savedOriginalUtilizzi) {
            let count = 0;
            items.forEach((item) => {
              if (
                savedOriginalUtilizzi.length === 0 ||
                savedOriginalUtilizzi.includes(item.utilizzo)
              ) {
                count++;
              }
              if (item.children) {
                count += countRelevantForSaved(
                  item.children,
                  savedOriginalUtilizzi,
                );
              }
            });
            return count;
          }
          relevantItemsForSavedChecklist = countRelevantForSaved(
            tempLoadedData.inventario,
            originalFilters,
          );

          for (const key in state) {
            if (state[key]?.checked && state[key]?.itemData) {
              if (
                originalFilters.length === 0 ||
                originalFilters.includes(state[key].itemData.utilizzo)
              ) {
                checkedCount++;
              }
            }
          }
          savedCheckedItemsSpan.textContent = checkedCount;
          savedRemainingItemsSpan.textContent = Math.max(
            0,
            relevantItemsForSavedChecklist - checkedCount,
          );
        } else {
          throw new Error(
            "Formato JSON non riconosciuto o struttura interna mancante.",
          );
        }
      } catch (e) {
        loadStatus.textContent = `Errore lettura/parsing JSON: ${e.message}`;
        console.error("Errore JSON:", e);
        if (initialSectionsWrapper)
          initialSectionsWrapper.classList.remove("hidden");
        fileInputSection.classList.remove("hidden");
        confirmLoadSection.classList.add("hidden");
        confirmNewInventorySection.classList.add("hidden");
        confirmSavedChecklistSection.classList.add("hidden");
        mainContent.classList.add("hidden");
        tempLoadedData = null;
        adjustMainContentMargin();
      }
    };
    reader.onerror = () => {
      loadStatus.textContent = "Errore lettura file JSON.";
      tempLoadedData = null;
      if (initialSectionsWrapper)
        initialSectionsWrapper.classList.remove("hidden");
      fileInputSection.classList.remove("hidden");
      confirmLoadSection.classList.add("hidden");
      mainContent.classList.add("hidden");
      adjustMainContentMargin();
    };
    reader.readAsText(file);
  }

  function toggleChildren(uniqueId) {
    const listItem = document.querySelector(`[data-item-id="${uniqueId}"]`);
    if (!listItem) return; // Aggiunto controllo per sicurezza
    const toggleBtn = listItem.querySelector(".toggle-btn");
    if (!toggleBtn || toggleBtn.style.display === "none") return;

    const childrenUl = listItem.querySelector(".children-list");
    if (childrenUl) {
      childrenUl.classList.toggle("collapsed");
      toggleBtn.classList.toggle("collapsed");
    }
  }

  checkedItemsOverlay.addEventListener("click", (event) => {
    if (event.target === checkedItemsOverlay) {
      checkedItemsOverlay.classList.add("hidden");
      document.body.classList.remove("body-blur");
    }
  });

  loadFileBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) {
      // Modificato il messaggio per essere generico, dato che ora accetta CSV e JSON
      loadStatus.textContent = "Seleziona un file.";
      return;
    }

    // Messaggio di stato generico, la funzione specifica (processCsvFile/processJsonFile)
    // imposterà un messaggio più dettagliato.
    loadStatus.textContent = `Lettura file "${file.name}"...`;

    const fileName = file.name.toLowerCase();
    // console.log("File selezionato:", fileName); // Puoi tenere questo per debug

    if (fileName.endsWith(".csv")) {
      // console.log("Riconosciuto come CSV, chiamo processCsvFile"); // Puoi tenere questo per debug
      processCsvFile(file); // processCsvFile ora gestisce il suo FileReader e il parsing
    } else if (fileName.endsWith(".json")) {
      // console.log("Riconosciuto come JSON, chiamo processJsonFile"); // Puoi tenere questo per debug
      processJsonFile(file); // processJsonFile ora gestisce il suo FileReader e il parsing
    } else {
      loadStatus.textContent =
        "Tipo di file non supportato. Seleziona un file .csv o .json.";
      fileInput.value = ""; // Reset file input
    }
  });

  confirmLoadNewBtn.addEventListener("click", () => {
    const selectedUtilizzi = Array.from(filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    if (selectedUtilizzi.length === 0) {
      alert("Seleziona almeno un filtro di utilizzo.");
      return;
    }
    if (!tempLoadedData) {
      loadStatus.textContent = "Dati non pronti.";
      return;
    }
    fullInventoryData = tempLoadedData;
    currentChecklistState = {
      // Resetta lo stato
      checklist_timestamp: getFormattedTimestamp(),
      original_filters: selectedUtilizzi, // Salva i filtri di utilizzo iniziali
    };
    currentActiveCategoryFilter = null; // Inizia con tutte le categorie

    if (initialSectionsWrapper) initialSectionsWrapper.classList.add("hidden");
    mainContent.classList.remove("hidden");

    sidebarMenu.classList.add("open");
    adjustMainContentMargin();
    renderChecklist(); // Questo popolerà currentChecklistState e renderizzerà
    updateCheckedItemsOverlay();
    loadStatus.textContent = `Inventario caricato.`;
    tempLoadedData = null;
    hasUnsavedChanges = false;
  });

  confirmLoadSavedBtn.addEventListener("click", () => {
    if (!tempLoadedData) {
      loadStatus.textContent = "Dati non pronti.";
      return;
    }
    fullInventoryData = tempLoadedData; // Contiene inventario e currentChecklistState
    currentChecklistState = tempLoadedData.currentChecklistState;
    currentChecklistState.checklist_timestamp =
      currentChecklistState.checklist_timestamp || getFormattedTimestamp();
    currentActiveCategoryFilter = null; // Inizia con tutte le categorie

    // Rimuovi lo stato visuale runtime 'isExceptionallyShown' dal caricamento
    for (const key in currentChecklistState) {
      if (
        currentChecklistState[key] &&
        typeof currentChecklistState[key] === "object"
      ) {
        // Conserva itemData, checked, timestamp, parentId
        // Ma resetta isExceptionallyShown
        currentChecklistState[key].isExceptionallyShown = false; // Sarà ricalcolato al render
      }
    }

    if (initialSectionsWrapper) initialSectionsWrapper.classList.add("hidden");
    mainContent.classList.remove("hidden");

    sidebarMenu.classList.add("open");
    adjustMainContentMargin();
    renderChecklist();
    updateCheckedItemsOverlay();
    loadStatus.textContent = `Checklist salvata caricata.`;
    tempLoadedData = null;
    hasUnsavedChanges = false;
  });

  showCheckedBtn.addEventListener("click", () => {
    checkedItemsOverlay.classList.remove("hidden");
    document.body.classList.add("body-blur");
    updateCheckedItemsOverlay();
  });
  clearAllCheckedBtn.addEventListener("click", clearAllCheckedItems);

  exportChecklistBtn.addEventListener("click", () => {
    if (!fullInventoryData) {
      alert("Carica un inventario prima.");
      return;
    }
    // Crea una copia profonda dello stato da esportare per evitare modifiche accidentali
    const stateToExport = JSON.parse(JSON.stringify(currentChecklistState));
    stateToExport.checklist_timestamp = getFormattedTimestamp();

    // Se non ci sono original_filters (es. caricato un nuovo inventario e non una checklist),
    // salva i filtri di utilizzo correnti come original_filters.
    if (!stateToExport.original_filters) {
      stateToExport.original_filters = Array.from(filterCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);
    }

    // Rimuovi lo stato visuale runtime 'isExceptionallyShown' prima dell'esportazione
    for (const key in stateToExport) {
      if (stateToExport[key] && typeof stateToExport[key] === "object") {
        delete stateToExport[key].isExceptionallyShown;
      }
    }
    const exportData = {
      csv_ultima_modifica: fullInventoryData.csv_ultima_modifica,
      inventario: fullInventoryData.inventario,
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
    hasUnsavedChanges = false;
    loadStatus.textContent = `Checklist esportata: ${filename}`;
  });

  window.addEventListener("beforeunload", (event) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue =
        "Hai modifiche non salvate. Sei sicuro di voler uscire?";
      return event.returnValue;
    }
  });

  function collectCategoriesRecursive(items, collected = new Set()) {
    items.forEach((item) => {
      if (item.categoria && item.categoria.trim() !== "") {
        collected.add(item.categoria);
      } else {
        // Se un item non ha categoria, lo consideriamo "Altro" ai fini del filtro
        // Ma l'itemData originale non viene modificato.
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

  function renderCategoryFilters() {
    if (!fullInventoryData || !fullInventoryData.inventario) {
      sidebarCategoryFiltersContainer.innerHTML = "";
      return false; // Nessuna categoria attiva è vuota perché non ci sono categorie
    }
    sidebarCategoryFiltersContainer.innerHTML = "";
    let activeCategoryIsEmpty = false; // Indica se la *categoria attiva* (se esiste) non ha più item rimanenti

    let currentSelectedUtilizzi =
      currentChecklistState.original_filters ||
      Array.from(filterCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

    const categoryCounts = {}; // Conteggio degli item *non spuntati e non exceptionally shown* per categoria
    const allInventoryCategories = collectCategoriesRecursive(
      fullInventoryData.inventario,
    );

    allInventoryCategories.forEach((cat) => (categoryCounts[cat] = 0));
    if (!allInventoryCategories.has("Altro")) {
      // Assicura che "Altro" esista se ci sono item senza categoria
      categoryCounts["Altro"] = 0;
    }

    let totalAllCategoriesRemaining = 0; // Totale item rimanenti in *tutte* le categorie (per il filtro "Tutte le categorie")

    // Itera su currentChecklistState per contare gli item non spuntati, filtrati per utilizzo
    Object.values(currentChecklistState).forEach((stateEntry) => {
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
    if (currentActiveCategoryFilter === null) {
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
      if (currentActiveCategoryFilter !== null) {
        // Evita rerender se già su "Tutte"
        currentActiveCategoryFilter = null;
        renderChecklist();
      }
    });
    sidebarCategoryFiltersContainer.appendChild(allItemsFilter);

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
        currentActiveCategoryFilter === category &&
        remainingInCategory === 0
      ) {
        activeCategoryIsEmpty = true;
      }

      // Mostra la categoria solo se ha item rimanenti o se è la categoria attiva (per permettere di deselezionarla)
      // O se è la categoria attiva e diventa vuota, così l'utente la vede scomparire / resettarsi
      if (remainingInCategory > 0 || currentActiveCategoryFilter === category) {
        const filterItem = document.createElement("div");
        filterItem.classList.add("category-filter-item");
        filterItem.dataset.categoryName = category;
        if (currentActiveCategoryFilter === category) {
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
          if (currentActiveCategoryFilter !== category) {
            // Evita rerender se si clicca sulla stessa categoria attiva
            currentActiveCategoryFilter = category;
            renderChecklist();
          }
        });
        sidebarCategoryFiltersContainer.appendChild(filterItem);
      }
    });

    return activeCategoryIsEmpty;
  }

  // Inizializzazione (es. per sidebar margin)
  adjustMainContentMargin();
});
