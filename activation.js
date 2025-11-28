// ------------ VALID SERIAL KEYS (add more when you sell license) -----------

const validSerials = [
    "GIFT-726872-2025",
    "VIP-726872-9999",
    "PRO-726872-5555"
];

const EXPECTED_LENGTH = 16; // XXXX-XXXXXX-XXXX format

// ------------ CHECK IF USER IS ALREADY ACTIVATED ---------------------------

if (localStorage.getItem("isActivated") === "yes") {
    window.location.href = "index.html"; // redirect to main app
}

// ------------ CHARACTER COUNTER --------------------------------------------

const serialInput = document.getElementById("serialInput");
const charCount = document.getElementById("charCount");
const activateBtn = document.getElementById("activateBtn");

serialInput.addEventListener("input", function() {
    let value = this.value.toUpperCase();
    this.value = value;
    
    // Update character counter
    charCount.textContent = value.length;
    
    // Change counter color based on length
    if (value.length === EXPECTED_LENGTH) {
        charCount.style.color = "#28a745";
    } else {
        charCount.style.color = "#999";
    }
    
    // Enable/disable button based on length
    if (value.length === EXPECTED_LENGTH) {
        activateBtn.disabled = false;
    } else {
        activateBtn.disabled = true;
    }
});

// ------------ AUTO-FORMAT KEY (add dashes automatically) -------------------

serialInput.addEventListener("keyup", function(e) {
    let value = this.value.replace(/-/g, ''); // Remove existing dashes
    
    if (value.length > 4 && value.length <= 10) {
        this.value = value.slice(0, 4) + '-' + value.slice(4);
    } else if (value.length > 10) {
        this.value = value.slice(0, 4) + '-' + value.slice(4, 10) + '-' + value.slice(10, 14);
    }
});

// ------------ ACTIVATION FUNCTION ------------------------------------------

function activate() {
    let key = serialInput.value.trim().toUpperCase();
    let errorDiv = document.getElementById("error");
    let successDiv = document.getElementById("success");
    
    // Clear previous messages
    errorDiv.classList.remove("show");
    successDiv.classList.remove("show");
    
    // Validate length
    if (key.length !== EXPECTED_LENGTH) {
        showError("Serial key must be exactly 18 characters!");
        return;
    }
    
    // Validate format (XXXX-XXXXXX-XXXX)
    const format = /^[A-Z0-9]{4}-[A-Z0-9]{6}-[A-Z0-9]{4}$/;
    if (!format.test(key)) {
        showError("Invalid serial key format! Use: XXXX-XXXXXX-XXXX");
        return;
    }
    
    // Check if key is valid
    if (validSerials.includes(key)) {
        // Show success message
        successDiv.textContent = "✓ Activation successful! Redirecting...";
        successDiv.classList.add("show");
        
        // Disable input and button
        serialInput.disabled = true;
        activateBtn.disabled = true;
        
        // Save activation
        localStorage.setItem("isActivated", "yes");
        localStorage.setItem("serialKey", key);
        localStorage.setItem("activationDate", new Date().toISOString());
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    } else {
        showError("❌ Invalid serial key! Please check and try again.");
    }
}

function showError(message) {
    const errorDiv = document.getElementById("error");
    errorDiv.textContent = message;
    errorDiv.classList.add("show");
    
    // Shake the input
    serialInput.style.animation = "shake 0.5s";
    setTimeout(() => {
        serialInput.style.animation = "";
    }, 500);
}

// ------------ ENTER KEY TO ACTIVATE ----------------------------------------

serialInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter" && !activateBtn.disabled) {
        activate();
    }
});

// ------------ INITIALIZE ---------------------------------------------------

activateBtn.disabled = true;