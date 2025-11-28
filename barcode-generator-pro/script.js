// --------------------------- 
// BASIC VARIABLES
// ---------------------------

let prefix = "726872";
let lastNumber = parseInt(localStorage.getItem("lastNumber")) || 1;
let products = [];
let currentStep = 1;
let numberingMode = "auto";
let barcodeType = "upc";
let viewMode = "grid"; // grid or list

// Update UI
document.getElementById("nextNumber").textContent = String(lastNumber).padStart(5, "0");

// ---------------------------
// UI ELEMENTS
// ---------------------------

const autoBtn = document.getElementById("autoMode");
const manualBtn = document.getElementById("manualMode");
const upcBtn = document.getElementById("upcType");
const eanBtn = document.getElementById("eanType");
const addProductBtn = document.getElementById("addProductBtn");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const viewHistoryBtn = document.getElementById("viewHistoryBtn");
const backToFormBtn = document.getElementById("backToFormBtn");
const searchInput = document.getElementById("searchInput");
const gridViewBtn = document.getElementById("gridViewBtn");
const listViewBtn = document.getElementById("listViewBtn");

// Optional elements that may exist in your HTML
const createNewBtn = document.getElementById("createNewBtn"); // you had this before
const chooseFolderBtn = document.getElementById("chooseFolderBtn"); // may be added to history view
const downloadAllBtn = document.getElementById("downloadAllBtn"); // optional "Download All" button

// ---------------------------
// Small UI helper: Toast (non-blocking notifications)
// ---------------------------

/*
  You must add this element in your index.html (near the end of <body>):
    <div id="toast" aria-live="polite"></div>

  And this CSS in your style.css:
    #toast { position: fixed; bottom: 20px; right: 20px; background:#222; color:#fff; padding:10px 14px; border-radius:8px; opacity:0; transform:translateY(16px); transition:all .25s ease; z-index:9999; pointer-events:none;font-size:14px;}
    #toast.show { opacity:1; transform:translateY(0); }
*/

function showToast(message) {
    let t = document.getElementById("toast");
    if (!t) {
        // create it if missing (defensive)
        t = document.createElement("div");
        t.id = "toast";
        document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(t._timeout);
    t._timeout = setTimeout(() => {
        t.classList.remove("show");
    }, 3000);
}

// ---------------------------
// MODE TOGGLE
// ---------------------------

autoBtn.onclick = () => {
    numberingMode = "auto";
    autoBtn.classList.add("active");
    manualBtn.classList.remove("active");
    document.getElementById("manualInput").classList.add("hidden");
    document.getElementById("autoDisplay").classList.remove("hidden");
};

manualBtn.onclick = () => {
    numberingMode = "manual";
    manualBtn.classList.add("active");
    autoBtn.classList.remove("active");
    document.getElementById("manualInput").classList.remove("hidden");
    document.getElementById("autoDisplay").classList.add("hidden");
};

// ---------------------------
// BARCODE TYPE TOGGLE
// ---------------------------

upcBtn.onclick = () => {
    barcodeType = "upc";
    upcBtn.classList.add("active");
    eanBtn.classList.remove("active");
};

eanBtn.onclick = () => {
    barcodeType = "ean";
    eanBtn.classList.add("active");
    upcBtn.classList.remove("active");
};

// ---------------------------
// VIEW MODE TOGGLE
// ---------------------------

gridViewBtn.onclick = () => {
    viewMode = "grid";
    gridViewBtn.classList.add("active");
    listViewBtn.classList.remove("active");
    const h = document.getElementById("historyList");
    if (h) h.className = "history-grid";
    loadHistory();
};

listViewBtn.onclick = () => {
    viewMode = "list";
    listViewBtn.classList.add("active");
    gridViewBtn.classList.remove("active");
    const h = document.getElementById("historyList");
    if (h) h.className = "history-list";
    loadHistory();
};

// ---------------------------
// SEARCH FUNCTIONALITY
// ---------------------------

searchInput.addEventListener("input", function() {
    loadHistory(this.value.toLowerCase());
});

// ---------------------------
// MULTI-STEP NAVIGATION
// ---------------------------

function nextStep() {
    if (currentStep === 3 && products.length === 0) {
        alert("Please add at least one product!");
        return;
    }

    if (currentStep < 4) {
        const ps = document.querySelector(`.progress-step[data-step="${currentStep}"]`);
        if (ps) ps.classList.add("completed");
        
        currentStep++;
        updateStepDisplay();
        
        if (currentStep === 4) {
            updateReview();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    const cur = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (cur) cur.classList.add('active');
    
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        if (stepNum < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// ---------------------------
// PRODUCT MANAGEMENT
// ---------------------------

addProductBtn.onclick = () => {
    const productNumber = products.length + 1;
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.innerHTML = `
        <div class="product-number">${productNumber}</div>
        <input type="text" placeholder="Enter product name" class="product-name-input" />
        <button class="remove-product-btn" onclick="removeProduct(this)">×</button>
    `;
    
    const list = document.getElementById('productList');
    if (list) list.appendChild(productItem);
    products.push({ id: productNumber, name: '' });
    
    const input = productItem.querySelector('input');
    if (input) {
        input.focus();
        input.addEventListener('input', function() {
            const index = products.findIndex(p => p.id === productNumber);
            if (index !== -1) {
                products[index].name = this.value;
            }
        });
    }
};

function removeProduct(button) {
    const productItem = button.parentElement;
    const productNumber = parseInt(productItem.querySelector('.product-number').textContent);
    
    productItem.remove();
    products = products.filter(p => p.id !== productNumber);
    renumberProducts();
}

function renumberProducts() {
    const productItems = document.querySelectorAll('.product-item');
    products = [];
    
    productItems.forEach((item, index) => {
        const newNumber = index + 1;
        const numEl = item.querySelector('.product-number');
        if (numEl) numEl.textContent = newNumber;
        const nameInput = item.querySelector('.product-name-input');
        const name = nameInput ? nameInput.value : '';
        products.push({ id: newNumber, name: name });
    });
}

// ---------------------------
// REVIEW UPDATE
// ---------------------------

function updateReview() {
    const rm = document.getElementById('reviewMode');
    const rt = document.getElementById('reviewType');
    const rc = document.getElementById('reviewCount');
    const rs = document.getElementById('reviewStart');

    if (rm) rm.textContent = numberingMode === 'auto' ? 'Auto' : 'Manual';
    if (rt) rt.textContent = barcodeType === 'upc' ? 'UPC-A (12-digit)' : 'EAN-13 (13-digit)';
    if (rc) rc.textContent = products.length;
    
    const startNum = numberingMode === "manual" 
        ? parseInt(document.getElementById("startNumber").value) || lastNumber
        : lastNumber;
    
    if (rs) rs.textContent = String(startNum).padStart(5, "0");
    
    const reviewProducts = document.getElementById('reviewProducts');
    if (!reviewProducts) return;
    reviewProducts.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCode = String(startNum + index).padStart(5, "0");
        const div = document.createElement('div');
        div.className = 'product-item';
        div.innerHTML = `
            <div class="product-number">${index + 1}</div>
            <div style="flex: 1;">
                <strong>${product.name || 'Unnamed Product'}</strong><br>
                <small>Code: ${prefix}${productCode}</small>
            </div>
        `;
        reviewProducts.appendChild(div);
    });
}

// ---------------------------
// CHECK DIGIT CALCULATORS
// ---------------------------

function calcUPCCheckDigit(num11) {
    let digits = num11.split("").map(Number);
    let odd = digits.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
    let even = digits.filter((_, i) => i % 2 !== 0).reduce((a, b) => a + b, 0);
    let total = (odd * 3) + even;
    return (10 - (total % 10)) % 10;
}

function calcEANCheckDigit(num12) {
    let digits = num12.split("").map(Number);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    return (10 - (sum % 10)) % 10;
}

// ---------------------------
// GENERATE BARCODES
// ---------------------------

generateBtn.onclick = async function () {
    if (products.length === 0) {
        alert("Please add at least one product!");
        return;
    }

    const startNum = numberingMode === "manual"
        ? parseInt(document.getElementById("startNumber").value) || lastNumber
        : lastNumber;

    const history = JSON.parse(localStorage.getItem("barcodeHistory")) || [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productCode = String(startNum + i).padStart(5, "0");
        let fullNumber;

        if (barcodeType === "upc") {
            let base = prefix + productCode;
            let check = calcUPCCheckDigit(base);
            fullNumber = base + check;
        } else {
            let base = prefix + productCode;
            let check = calcEANCheckDigit(base);
            fullNumber = base + check;
        }

        let canvas = document.createElement("canvas");

        try {
            bwipjs.toCanvas(canvas, {
                bcid: barcodeType === "upc" ? "upca" : "ean13",
                text: fullNumber,
                scale: 3,
                height: 12,
                includetext: true
            });
        } catch (e) {
            console.error("Barcode generation error:", e);
            continue;
        }

        history.push({
            productName: product.name || 'Unnamed Product',
            barcode: fullNumber,
            type: barcodeType.toUpperCase(),
            date: new Date().toISOString(),
            dataURL: canvas.toDataURL()
        });
    }

    localStorage.setItem("barcodeHistory", JSON.stringify(history));
    localStorage.setItem("lastNumber", startNum + products.length);
    lastNumber = startNum + products.length;
    const nextNumEl = document.getElementById("nextNumber");
    if (nextNumEl) nextNumEl.textContent = String(lastNumber).padStart(5, "0");

    // Clear the form
    products = [];
    const productListEl = document.getElementById('productList');
    if (productListEl) productListEl.innerHTML = '';
    
    // Reset to step 1
    currentStep = 1;
    updateStepDisplay();
    
    // Redirect to history
    showHistory();
};

// ---------------------------
// RESET FUNCTION
// ---------------------------

resetBtn.onclick = () => {
    if (confirm("Are you sure you want to reset the generation history? This will reset the counter to 00001 and clear all history.")) {
        localStorage.removeItem("lastNumber");
        localStorage.removeItem("barcodeHistory");
        lastNumber = 1;
        const nextNumEl = document.getElementById("nextNumber");
        if (nextNumEl) nextNumEl.textContent = "00001";
        alert("Generation history has been reset!");
        
        currentStep = 1;
        products = [];
        const productListEl = document.getElementById('productList');
        if (productListEl) productListEl.innerHTML = '';
        updateStepDisplay();
        
        const historyViewEl = document.getElementById('historyView');
        if (historyViewEl && !historyViewEl.classList.contains('hidden')) {
            loadHistory();
        }
    }
};

// ---------------------------
// HISTORY VIEW
// ---------------------------

function showHistory() {
    const formView = document.getElementById('formView');
    const historyView = document.getElementById('historyView');
    if (formView) formView.classList.add('hidden');
    if (historyView) historyView.classList.remove('hidden');
    if (searchInput) searchInput.value = '';
    loadHistory();
}

if (viewHistoryBtn) viewHistoryBtn.onclick = showHistory;

if (backToFormBtn) backToFormBtn.onclick = () => {
    const historyView = document.getElementById('historyView');
    const formView = document.getElementById('formView');
    if (historyView) historyView.classList.add('hidden');
    if (formView) formView.classList.remove('hidden');
};

if (createNewBtn) createNewBtn.onclick = () => {
    const historyView = document.getElementById('historyView');
    const formView = document.getElementById('formView');
    if (historyView) historyView.classList.add('hidden');
    if (formView) formView.classList.remove('hidden');
    currentStep = 1;
    updateStepDisplay();
};

function loadHistory(searchTerm = '') {
    const history = JSON.parse(localStorage.getItem("barcodeHistory")) || [];
    const historyList = document.getElementById('historyList');
    
    // Filter by search term
    const filteredHistory = searchTerm 
        ? history.filter(item => item.productName.toLowerCase().includes(searchTerm))
        : history;
    
    if (!historyList) return;
    
    if (filteredHistory.length === 0) {
        historyList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                <p style="font-size: 18px;">${searchTerm ? 'No results found.' : 'No barcode history yet.'}</p>
                <p>${searchTerm ? 'Try a different search term.' : 'Generate your first barcode to see it here!'}</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    
    filteredHistory.reverse().forEach((item) => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        if (viewMode === 'list') {
            historyItem.innerHTML = `
                <div class="history-item-list-content">
                    <div class="history-list-info">
                        <div class="history-item-title">${item.productName}</div>
                        <div class="history-item-meta">
                            <span class="history-item-type">${item.type}</span>
                            <span class="history-item-date">${dateStr}</span>
                        </div>
                    </div>
                    <div class="history-barcode-inline">
                        <p>${item.barcode}</p>
                        <img src="${item.dataURL}" alt="${item.barcode}" />
                    </div>
                    <div>
                        <button class="download-btn" onclick="downloadBarcode('${item.dataURL}', '${item.productName}_${item.barcode}.png')">Download</button>
                        <button class="delete-barcode-btn" onclick="deleteBarcode('${item.barcode}')">Delete</button>
                    </div>
                </div>
            `;
        } else {
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${item.productName}</div>
                    <div class="history-item-type">${item.type}</div>
                </div>
                <div class="history-barcode">
                    <p>${item.barcode}</p>
                    <img src="${item.dataURL}" alt="${item.barcode}" />
                </div>
                <div class="history-item-footer">
                    <div class="history-item-date">${dateStr}</div>
                    <div>
                        <button class="download-btn" onclick="downloadBarcode('${item.dataURL}', '${item.productName}_${item.barcode}.png')">Download</button>
                        <button class="delete-barcode-btn" onclick="deleteBarcode('${item.barcode}')">Delete</button>
                    </div>
                </div>
            `;
        }
        
        historyList.appendChild(historyItem);
    });
}

/* =========================
   ADDED: ELECTRON INTEGRATION HELPERS
   - Detects Electron environment (via window.electronAPI)
   - Asks user once for folder and stores it in localStorage under 'electron_save_folder'
   - Uses preload-exposed saveFile to write PNG directly to disk when available
   - Falls back to browser-download (improved)
   ========================= */

const isElectron = !!(window && window.electronAPI && (typeof window.electronAPI.saveFile === 'function'));

// Ask user for folder (Electron) and store path in localStorage
async function ensureElectronFolder() {
    try {
        let folder = localStorage.getItem('electron_save_folder') || null;
        if (!folder) {
            if (isElectron && typeof window.electronAPI.chooseFolder === 'function') {
                const chosen = await window.electronAPI.chooseFolder();
                if (chosen) {
                    folder = chosen;
                    localStorage.setItem('electron_save_folder', folder);
                    console.log("Electron: chosen folder ->", folder);
                    showToast("Output folder set.");
                } else {
                    console.log("Electron: folder not chosen");
                }
            }
        }
        return folder;
    } catch (err) {
        console.error("ensureElectronFolder error:", err);
        return null;
    }
}

// Save a dataURL into chosen folder via preload -> main process
async function saveDataURLInElectron(folderPath, filename, dataURL) {
    try {
        const res = await window.electronAPI.saveFile({ folderPath, filename, dataURL });
        return res; // { ok: true, path: 'C:\\...' } or { ok:false, error: '...' }
    } catch (err) {
        console.error("saveDataURLInElectron error:", err);
        return { ok: false, error: String(err) };
    }
}

/* =========================
   ELEMENT: Choose Output Folder button handler (if present)
   - Works only in Electron; harmless in browser (shows alert)
   ========================= */

if (chooseFolderBtn) {
    chooseFolderBtn.addEventListener('click', async () => {
        if (!isElectron) {
            alert("This feature only works in the desktop app (Electron). In your browser it will use the normal Download flow.");
            return;
        }
        const chosen = await window.electronAPI.chooseFolder();
        if (chosen) {
            localStorage.setItem('electron_save_folder', chosen);
            showToast("Output folder updated.");
        } else {
            showToast("No folder chosen.");
        }
    });
}

/* =========================
   BULK SAVE: electronBulkSave(items)
   - items: array of objects with { productName, barcode, dataURL }
   - Saves each file into chosen folder (Electron) or triggers browser downloads
   ========================= */

async function electronBulkSave(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
        showToast("No items to save.");
        return;
    }

    // If running in Electron, ensure folder
    if (isElectron) {
        const folder = await ensureElectronFolder();
        if (!folder) {
            showToast("No output folder. Choose a folder first.");
            return;
        }

        let failed = 0;
        for (let item of items) {
            const filename = `${sanitizeFileName(item.productName || 'product')}_${item.barcode}.png`;
            const res = await saveDataURLInElectron(folder, filename, item.dataURL);
            if (!res || !res.ok) failed++;
        }

        if (failed === 0) showToast("All saved to folder.");
        else showToast(`${items.length - failed} saved, ${failed} failed.`);
        return;
    }

    // Browser fallback: download each item (will go to browser Downloads)
    for (let item of items) {
        const filename = `${sanitizeFileName(item.productName || 'product')}_${item.barcode}.png`;
        browserDownload(item.dataURL, filename);
    }
    showToast("Downloads started (browser).");
}

// Wire "Download All" button if present
if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', async () => {
        const history = JSON.parse(localStorage.getItem("barcodeHistory")) || [];
        if (history.length === 0) {
            showToast("No history to download.");
            return;
        }
        // Save all
        await electronBulkSave(history);
    });
}

/* =========================
   Utility: improved filename sanitizer
   ========================= */
function sanitizeFileName(name) {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_').slice(0, 120);
}

/* =========================
   DOWNLOAD: downloadBarcode (improved fallback as Option B)
   - Uses Electron save if available (asks once for folder)
   - Otherwise uses a safe browser download approach
   - Shows a toast for success/failure
   ========================= */

function browserDownload(dataURL, filename) {
    // Create temporary link and click; ensure removal after use
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    try {
        link.click();
        showToast(`Downloaded: ${filename}`);
    } catch (err) {
        console.error("Download error:", err);
        showToast("Download failed.");
    } finally {
        setTimeout(() => {
            try { link.remove(); } catch(e){}
        }, 200);
    }
}

async function downloadBarcode(dataURL, filename) {
    // If Electron is available, try to save directly
    if (isElectron) {
        try {
            const folder = await ensureElectronFolder();
            if (folder) {
                const res = await saveDataURLInElectron(folder, filename, dataURL);
                if (res && res.ok) {
                    console.log("Saved via Electron:", res.path);
                    showToast(`Saved: ${filename}`);
                    return;
                } else {
                    console.warn("Electron save failed:", res && res.error);
                    showToast("Save failed, falling back to browser download.");
                    // fallthrough to browser download fallback
                }
            } else {
                // user didn't choose a folder -> fallthrough to browser download fallback
                console.log("Electron: no folder chosen, falling back to browser download");
                showToast("No output folder chosen; starting browser download.");
            }
        } catch (err) {
            console.error("Electron save flow error:", err);
            showToast("Error saving file; using browser download.");
            // fallthrough to fallback
        }
    }

    // Browser fallback (improved behavior)
    browserDownload(dataURL, filename);
}

// ---------------------------
// DELETE BARCODE
// ---------------------------

function deleteBarcode(barcodeNumber) {
    if (confirm(`Are you sure you want to delete barcode ${barcodeNumber}?`)) {
        let history = JSON.parse(localStorage.getItem("barcodeHistory")) || [];
        history = history.filter(item => item.barcode !== barcodeNumber);
        localStorage.setItem("barcodeHistory", JSON.stringify(history));
        loadHistory(searchInput.value.toLowerCase());
        showToast("Deleted barcode.");
    }
}

// ---------------------------
// INITIALIZE
// ---------------------------

updateStepDisplay();
