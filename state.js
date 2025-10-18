export let fullInventoryData = null;
export let currentChecklistState = {};
export let tempLoadedData = null;
export let hasUnsavedChanges = false;
export let currentActiveCategoryFilter = null;

export function setFullInventoryData(data) {
  fullInventoryData = data;
}

export function setCurrentChecklistState(state) {
  currentChecklistState = state;
}

export function setTempLoadedData(data) {
  tempLoadedData = data;
}

export function setHasUnsavedChanges(value) {
  hasUnsavedChanges = value;
}

export function setCurrentActiveCategoryFilter(filter) {
  currentActiveCategoryFilter = filter;
}