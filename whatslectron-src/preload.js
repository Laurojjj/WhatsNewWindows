// preload.js
const { ipcRenderer } = require('electron');

console.log('[preload] TOP LEVEL loaded', location.href);
window.__PRELOAD_MARKER__ = 'loaded-' + Date.now();

function isFileInput(el) {
  return el instanceof HTMLInputElement && el.type === 'file';
}

function setFiles(input, files) {
  const dt = new DataTransfer();

  for (const f of files) {
    dt.items.add(f);
  }

  Object.defineProperty(input, 'files', {
    configurable: true,
    get: () => dt.files,
  });

  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

async function pickAndSet(input) {
  const result = await ipcRenderer.invoke('pick-file', {
    accept: input.accept,
    multiple: input.multiple,
  });

  if (!result || result.canceled) return;

  const files = (result.files || [result]).map(file =>
    new File([file.data], file.name, {
      type: file.type || '',
      lastModified: file.lastModified || Date.now(),
    })
  );

  setFiles(input, files);
}

function setupFileInputPicker() {
  const nativeClick = HTMLInputElement.prototype.click;

  HTMLInputElement.prototype.click = function () {
    if (!isFileInput(this)) {
      return nativeClick.call(this);
    }

    void pickAndSet(this);
    return undefined;
  };

  document.addEventListener('click', event => {
    const path = event.composedPath();

    const input = path.find(isFileInput);

    if (!input) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    void pickAndSet(input);
  }, true);

  window.showOpenFilePicker = async () => {
    throw new DOMException('Blocked by app', 'AbortError');
  };
}

setupFileInputPicker();
