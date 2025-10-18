import { CATEGORY_COLORS, UTILIZZO_COLORS } from "./constants.js";

export function getFormattedTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}.${String(now.getSeconds()).padStart(2, "0")}`;
}
export function createTagElement(text, type, isCountHighlight = false) {
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
export function formatItemText(item) {
  let baseText = item.nome || item.id;
  const hasTotals =
    item.totali !== null &&
    typeof item.totali !== "undefined" &&
    item.in_uso !== null &&
    typeof item.in_uso !== "undefined";
  let countText = "";

  if (hasTotals) {
    if (item.totali === item.in_uso) {
      countText = `${item.totali}`;
    } else {
      countText = `${item.in_uso}/${item.totali}`;
    }
  }

  const nameAndCountContainer = document.createElement("div");
  nameAndCountContainer.classList.add("name-count-container");

  // Gestione del conteggio prima del nome
  if (countText) {
    nameAndCountContainer.appendChild(createTagElement(countText, "", true));
  }

  const itemNameSpan = document.createElement("span");
  itemNameSpan.classList.add("item-name-text");

  // Gestione del prefisso "★ "
  if (baseText.startsWith("★ ")) {
    itemNameSpan.innerHTML = `<strong style="color: #FFD700;">${baseText.substring(2)}</strong>`;
  } else {
    itemNameSpan.textContent = baseText;
  }
  nameAndCountContainer.appendChild(itemNameSpan);

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
export function sanitizeForDomId(text) {
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
export function generateUniqueId(item, parentSanitizedUniqueId = null) {
  const currentItemSanitizedPart = sanitizeForDomId(item.id);
  return parentSanitizedUniqueId
    ? `${parentSanitizedUniqueId}__${currentItemSanitizedPart}`
    : currentItemSanitizedPart;
}
export function countAllItemsRecursive(items) {
  return items.reduce(
    (sum, item) =>
      sum + 1 + (item.children ? countAllItemsRecursive(item.children) : 0),
    0,
  );
}