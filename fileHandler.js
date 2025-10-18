import * as dom from "./domElements.js";
import * as state from "./state.js";
import { adjustMainContentMargin } from "./ui.js";
import { countAllItemsRecursive } from "./utils.js";

function jsCleanName(nameWithLink) {
  if (!nameWithLink) return null;
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

function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return { header: [], rows: [] };

  const parseRow = (rowString) => {
    const fields = [];
    const regex = /(?:^|,)(?:"((?:[^"]|"")*)"|([^,]*))/g;
    let match;

    while ((match = regex.exec(rowString)) !== null) {
      let value;
      if (match[1] !== undefined) {
        value = match[1].replace(/""/g, '"');
      } else if (match[2] !== undefined) {
        value = match[2];
      } else {
        value = "";
      }
      fields.push(value.trim());
    }
    return fields;
  };

  const headerFields = parseRow(lines[0]);
  const header = headerFields.map((h) => h.trim());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;

    const values = parseRow(lines[i]);
    const rowObject = {};
    let emptyRow = true;

    header.forEach((col, index) => {
      const value =
        values[index] !== undefined ? String(values[index]).trim() : "";
      rowObject[col] = value;
      if (value) emptyRow = false;
    });

    if (values.length > header.length) {
      console.warn(
        `Riga ${i + 1} (contenuto: "${lines[i]}") ha ${values.length} colonne, ma l'intestazione ne ha ${header.length}. Le colonne extra verranno ignorate.`,
      );
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

export function processCsvText(csvText, lastModified) {
  try {
    const { header: csvHeader, rows: csvRows } = parseCSV(csvText);

    if (!csvHeader.length || !csvRows.length) {
      throw new Error("CSV vuoto o formato non valido.");
    }

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
        if (h !== "Componenti" && h !== "Oggetto di riferimento") {
          throw new Error(
            `Colonna CSV richiesta mancante: ${h}. Colonne trovate: ${csvHeader.join(", ")}`,
          );
        } else if (!csvHeader.includes(h)) {
          csvHeader.push(h);
          csvRows.forEach((row) => (row[h] = ""));
        }
      }
    }

    let itemsMapForLookup = {};
    let collectedValidItems = [];
    let validationErrors = [];

    csvRows.forEach((row, index) => {
      const rowNumber = index + 1;
      let currentRowErrors = [];

      const oggetto_name = row["Oggetto"] ? String(row["Oggetto"]).trim() : "";
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
        return;
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

    if (hierarchyIdErrors.length > 0) {
      hierarchyIdErrors = [...new Set(hierarchyIdErrors)];
      let errorMsg =
        "Errori di Gerarchia ID:\nRegola: L'ID di un figlio deve essere strettamente maggiore dell'ID del padre.\n";
      hierarchyIdErrors
        .sort()
        .forEach((msg) => (errorMsg += `  - ${msg}\n`));
      throw new Error(errorMsg);
    }

    const all_child_internal_ids = new Set();
    collectedValidItems.forEach((item_from_list) => {
      item_from_list.children.forEach((child) => {
        all_child_internal_ids.add(child.internal_unique_id);
      });
    });
    let final_root_items = collectedValidItems.filter(
      (item) => !all_child_internal_ids.has(item.internal_unique_id),
    );

    jsCleanupItemForApp(final_root_items);
    final_root_items = jsSortItemsRecursive(final_root_items);

    const csvModStr = getFormattedDateForCsvMod(new Date(lastModified));
    state.setTempLoadedData({
      inventario: final_root_items,
      csv_ultima_modifica: csvModStr,
    });

    if (dom.initialSectionsWrapper)
      dom.initialSectionsWrapper.classList.remove("hidden");
    dom.fileInputSection.classList.add("hidden");
    dom.confirmLoadSection.classList.remove("hidden");
    dom.mainContent.classList.add("hidden");
    dom.loadStatus.textContent = "";
    adjustMainContentMargin();

    dom.confirmNewInventorySection.classList.remove("hidden");
    dom.confirmSavedChecklistSection.classList.add("hidden");
  } catch (e) {
    dom.loadStatus.textContent = `Errore elaborazione CSV: ${e.message}`;
    console.error("Errore elaborazione CSV:", e);
    state.setTempLoadedData(null);
    if (dom.initialSectionsWrapper)
      dom.initialSectionsWrapper.classList.remove("hidden");
    dom.fileInputSection.classList.remove("hidden");
    dom.confirmLoadSection.classList.add("hidden");
    dom.confirmNewInventorySection.classList.add("hidden");
    dom.confirmSavedChecklistSection.classList.add("hidden");
    dom.mainContent.classList.add("hidden");
    adjustMainContentMargin();
  }
}

export function processCsvFile(file) {
  dom.loadStatus.textContent = `Lettura file CSV "${file.name}"...`;
  const reader = new FileReader();

  reader.onload = (event) => {
    processCsvText(event.target.result, file.lastModified);
  };

  reader.onerror = () => {
    dom.loadStatus.textContent = "Errore lettura file CSV.";
    state.setTempLoadedData(null);
    if (dom.initialSectionsWrapper)
      dom.initialSectionsWrapper.classList.remove("hidden");
    dom.fileInputSection.classList.remove("hidden");
    dom.confirmLoadSection.classList.add("hidden");
    dom.mainContent.classList.add("hidden");
    adjustMainContentMargin();
  };
  reader.readAsText(file);
}

export function processJsonFile(file) {
  dom.loadStatus.textContent = `Lettura file JSON "${file.name}"...`;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      state.setTempLoadedData(data);

      if (
        !state.tempLoadedData ||
        (!state.tempLoadedData.inventario && !state.tempLoadedData.currentChecklistState)
      ) {
        throw new Error("Struttura dati JSON non valida.");
      }

      if (dom.initialSectionsWrapper)
        dom.initialSectionsWrapper.classList.remove("hidden");
      dom.fileInputSection.classList.add("hidden");
      dom.confirmLoadSection.classList.remove("hidden");
      dom.mainContent.classList.add("hidden");
      dom.loadStatus.textContent = "";
      adjustMainContentMargin();

      if (
        Array.isArray(state.tempLoadedData.inventario) &&
        !state.tempLoadedData.currentChecklistState
      ) {
        dom.confirmNewInventorySection.classList.remove("hidden");
        dom.confirmSavedChecklistSection.classList.add("hidden");
      } else if (
        state.tempLoadedData.inventario &&
        state.tempLoadedData.currentChecklistState
      ) {
        dom.confirmNewInventorySection.classList.add("hidden");
        dom.confirmSavedChecklistSection.classList.remove("hidden");

        const originalFilters =
          state.tempLoadedData.currentChecklistState.original_filters || [];
        dom.savedOriginalFiltersSpan.textContent =
          originalFilters.length > 0 ? originalFilters.join(", ") : "Tutti";
        dom.savedTotalItemsSpan.textContent = countAllItemsRecursive(
         state.tempLoadedData.inventario,
        );

        const checklistState = state.tempLoadedData.currentChecklistState;
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
          state.tempLoadedData.inventario,
          originalFilters,
        );

        for (const key in checklistState) {
          if (checklistState[key]?.checked && checklistState[key]?.itemData) {
            if (
              originalFilters.length === 0 ||
              originalFilters.includes(checklistState[key].itemData.utilizzo)
            ) {
              checkedCount++;
            }
          }
        }
        dom.savedCheckedItemsSpan.textContent = checkedCount;
        dom.savedRemainingItemsSpan.textContent = Math.max(
          0,
          relevantItemsForSavedChecklist - checkedCount,
        );
      } else {
        throw new Error(
          "Formato JSON non riconosciuto o struttura interna mancante.",
        );
      }
    } catch (e) {
      dom.loadStatus.textContent = `Errore lettura/parsing JSON: ${e.message}`;
      console.error("Errore JSON:", e);
      if (dom.initialSectionsWrapper)
        dom.initialSectionsWrapper.classList.remove("hidden");
      dom.fileInputSection.classList.remove("hidden");
      dom.confirmLoadSection.classList.add("hidden");
      dom.confirmNewInventorySection.classList.add("hidden");
      dom.confirmSavedChecklistSection.classList.add("hidden");
      dom.mainContent.classList.add("hidden");
      state.setTempLoadedData(null);
      adjustMainContentMargin();
    }
  };
  reader.onerror = () => {
    dom.loadStatus.textContent = "Errore lettura file JSON.";
    state.setTempLoadedData(null);
    if (dom.initialSectionsWrapper)
      dom.initialSectionsWrapper.classList.remove("hidden");
    dom.fileInputSection.classList.remove("hidden");
    dom.confirmLoadSection.classList.add("hidden");
    dom.mainContent.classList.add("hidden");
    adjustMainContentMargin();
  };
  reader.readAsText(file);
}