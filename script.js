/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// Helper: build storage key for a given range
function _storageKey(min, max) {
    return `used_${min}_${max}`;
}

// Retrieve used set (as Set) from sessionStorage for the given range
function getUsedSet(min, max) {
    const key = _storageKey(min, max);
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    try {
        const arr = JSON.parse(raw);
        return new Set(arr);
    } catch (e) {
        return new Set();
    }
}

// Save used set to sessionStorage
function saveUsedSet(min, max, usedSet) {
    const key = _storageKey(min, max);
    const arr = Array.from(usedSet);
    sessionStorage.setItem(key, JSON.stringify(arr));
}

// Reset history for current range
function resetHistory() {
    const min = parseInt(document.getElementById("inputMin").value);
    const max = parseInt(document.getElementById("inputMax").value);
    if (Number.isNaN(min) || Number.isNaN(max)) {
        // if range not set, clear all used_* keys in sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && k.startsWith("used_")) {
                sessionStorage.removeItem(k);
                // adjust index because we removed an entry
                i--;
            }
        }
        showMessage("Semua dihapus.");
        return;
    }
    const key = _storageKey(min, max);
    sessionStorage.removeItem(key);
    showMessage(`Rentang ${min} - ${max}`);
}

// simple helper to display message/result
function showMessage(text) {
    var label = document.getElementById("resultLabel")
    if (label == null) {
        label = document.createElement("LABEL")
        label.id = "resultLabel"
        label.innerText = text
        document.getElementById("divResult").appendChild(label)
    } else {
        label.innerText = text
    }
}

// calculates random value (inclusive max)
function Random() {
    // Parse inputs as integers
    var minRaw = document.getElementById("inputMin").value
    var maxRaw = document.getElementById("inputMax").value

    if (minRaw === "" || maxRaw === "") {
        alert("Masukkan nilai min dan max terlebih dahulu.")
        return
    }

    var min = parseInt(minRaw, 10)
    var max = parseInt(maxRaw, 10)

    if (Number.isNaN(min) || Number.isNaN(max)) {
        alert("Nilai min/max tidak valid.")
        return
    }

    if (max < min) {
        alert("Max harus lebih besar atau sama dengan min.")
        return
    }

    // Inclusive range: [min, max] termasuk max
    var rangeSize = (max - min) + 1
    var noRepeat = document.getElementById("noRepeatCheckbox")?.checked === true

    if (!noRepeat) {
        // simple random (may repeat), inclusive max
        var rand = Math.random();
        var value = Math.floor(rand * rangeSize) + min
        showMessage("Hasil: " + value)
        return
    }

    // noRepeat == true: use sessionStorage to persist used numbers per range
    var usedSet = getUsedSet(min, max)

    if (usedSet.size >= rangeSize) {
        showMessage("angka habis")
        return
    }

    // Build list of remaining numbers and pick one randomly (inclusive max)
    var remaining = []
    for (var v = min; v <= max; v++) {
        if (!usedSet.has(String(v))) { // store as strings to be consistent with JSON parse
            remaining.push(v)
        }
    }

    // pick random index from remaining
    var idx = Math.floor(Math.random() * remaining.length)
    var value = remaining[idx]

    // mark used and save
    usedSet.add(String(value))
    saveUsedSet(min, max, usedSet)

    var remainingCount = rangeSize - usedSet.size
    showMessage("" + value + (remainingCount >= 0 ? ("\n  "  + /*remainingCount + */ "  ") : ""))
}

// input field click
function inputAnimate(elem) {
    elem.className = "inputAnimateClass" 
}


/*
 * Theming
 */
function setTheme(themeName) {
    localStorage.setItem("theme", themeName)
    document.documentElement.className = themeName
}

function toggleTheme() {
    if (localStorage.getItem("theme") === "theme-dark") {
        setTheme("theme-light")
    } else {
        setTheme("theme-dark")
    }
}

// function to init theme
function startupAction(){
    var savedTheme = localStorage.getItem("theme")

    // system theme listener
    window?.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",
        e => {
            const newColorScheme = e.matches ? "theme-dark" : "theme-light"
            setTheme(newColorScheme)
        })  
    
    // if no saved theme prefers, then
    // trying to get system prefers theme
    if (savedTheme == null) {
        if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
            savedTheme = "theme-dark" 
        } else {
            savedTheme = "theme-light"
        }
    }

    var slider = document.getElementById("inputCheckbox") 
    if (slider != null) {
        slider.checked = (savedTheme === "theme-dark") 
    } else {
        console.log("element is null")
    }
    setTheme(savedTheme)
}


window.onload = startupAction