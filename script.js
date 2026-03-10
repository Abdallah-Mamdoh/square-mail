// ================= ELEMENTS =================
const firstName = document.getElementById("firstName");
const middleName = document.getElementById("middleName");
const lastName = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submitBtn");

const emailError = document.getElementById("emailError");

const firstbutton = document.getElementById("fl");
const secondbutton = document.getElementById("fml");

const choicesContainer = document.querySelector(".choices");

// Create error spans beside suggestion buttons
let flError = document.createElement("span");
flError.classList.add("button-error");
firstbutton.insertAdjacentElement("afterend", flError);

let fmlError = document.createElement("span");
fmlError.classList.add("button-error");
secondbutton.insertAdjacentElement("afterend", fmlError);

let emailAvailable = false;

// ================= EMAIL SUGGESTION FUNCTION =================
function generateEmailSuggestions() {
  if (!firstName.value || !lastName.value) return;

  // Reset buttons
  firstbutton.disabled = false;
  secondbutton.disabled = false;
  flError.textContent = "";
  fmlError.textContent = "";

  const first = firstName.value.toLowerCase();
  const middle = middleName.value.toLowerCase();
  const last = lastName.value.toLowerCase();

  let email1 = `${first}.${last}@square.com.eg`;
  let email2 = middle ? `${first}.${middle.charAt(0)}.${last}@square.com.eg` : email1;

  // Al / El dash logic
  const prefix = last.substring(0, 2);
  if ((prefix === "al" || prefix === "el") && last.length > 5) {
    const rest = last.substring(2);
    email1 = `${first}.${prefix}-${rest}@square.com.eg`;
    email2 = middle ? `${first}.${middle.charAt(0)}.${prefix}-${rest}@square.com.eg` : email1;
  }

  firstbutton.textContent = email1;
  secondbutton.textContent = email2;

  choicesContainer.style.display = "flex";

  // Check each suggestion separately (do not affect main email)
  checkSuggestionEmail(email1, firstbutton, flError);
  checkSuggestionEmail(email2, secondbutton, fmlError);
}

// ================= CHECK SUGGESTION EMAIL =================
function checkSuggestionEmail(email, btn, errorSpan) {
  fetch("https://default604566729c2a44a3b67843fd61ec46.20.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/02e1672fd7f44819b146f45d855b965c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_oPRW0VzcxGiJ7b41SQRPBRBR43scwX7Rsm4eqphPu8", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() })
  })
    .then(res => res.json())
    .then(data => {
      if (data.exists) {
        errorSpan.textContent = "Email already exists";
        btn.disabled = true;
      } else {
        errorSpan.textContent = "";
        btn.disabled = false;
      }
    })
    .catch(err => {
      console.error(err);
      errorSpan.textContent = "Error checking email";
      btn.disabled = true;
    });
}

// ================= EMAIL BUTTON CLICK =================
firstbutton.addEventListener("click", function () {
  emailInput.value = this.textContent;
  validateEmailFormat();
  checkEmailAndSetError(this.textContent);
});

secondbutton.addEventListener("click", function () {
  emailInput.value = this.textContent;
  validateEmailFormat();
  checkEmailAndSetError(this.textContent);
});

// ================= EMAIL VALIDATION =================
function validateEmailFormat() {
  const emailVal = emailInput.value.trim();
  const first = firstName.value.trim();
  const last = lastName.value.trim();

  if (!first || !last) {
    setEmailInvalid("First and last name required");
    return false;
  }

  if (!emailVal.endsWith("@square.com.eg")) {
    // setEmailInvalid("Email must end with @square.com.eg");
    document.querySelector("#rule1").style.color = "red"
    return false;
  }else{
    document.querySelector("#rule1").style.color = "green"
  }

  const username = emailVal.split("@")[0];

  if (!username.includes(first.toLowerCase()) || !username.includes(last.toLowerCase())) {
    // setEmailInvalid("Email must contain first and last name in lower case");
    document.querySelector("#rule2").style.color = "red"
    return false;
  }else{
    document.querySelector("#rule2").style.color = "green"
  }

  if (/\d/.test(username)) {
    // setEmailInvalid("Numbers are not allowed");
    document.querySelector("#rule4").style.color = "red"
    return false;
  }else{
    document.querySelector("#rule4").style.color = "green"
  }

  if (!/^[a-zA-Z.-]+$/.test(username)) {
    // setEmailInvalid("Only lowercase letters, dot (.) and dash (-) allowed");
    document.querySelector("#rule5").style.color = "red"
    return false;
  }else{
    document.querySelector("#rule5").style.color = "green"
  }

  if (emailVal !== emailVal.toLowerCase()) {
    // setEmailInvalid("Email must be lowercase");
    document.querySelector("#rule3").style.color = "red"
    return false;
  }else{
    document.querySelector("#rule3").style.color = "green"
  }

  setEmailValid();
  return true;
}

// ================= EMAIL VALID / INVALID UI =================
function setEmailInvalid(message) {
  emailError.textContent = message;
  emailInput.classList.add("invalid");
  emailInput.classList.remove("valid");
  emailAvailable = false;
}

function setEmailValid() {
  emailError.textContent = "";
  emailInput.classList.add("valid");
  emailInput.classList.remove("invalid");
  emailAvailable = true;
}

// ================= EMAIL INPUT EVENTS =================
let debounceTimer; // Add this near lastEmailChecked

emailInput.addEventListener("input", () => {
  const emailVal = emailInput.value.trim();
  
  // Track the latest email typed
  lastEmailChecked = emailVal;

  // Clear any previous timer
  clearTimeout(debounceTimer);

  document.querySelector(".loadingicon").style.display = "inline";
  // Validate format immediately
  if (!validateEmailFormat()) {
    emailAvailable = false;
    validateForm();
    document.querySelector(".loadingicon").style.display = "none";
    return;
  }

  // Debounce the async check by 2 seconds
  debounceTimer = setTimeout(() => {
    fetch("https://default604566729c2a44a3b67843fd61ec46.20.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/02e1672fd7f44819b146f45d855b965c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_oPRW0VzcxGiJ7b41SQRPBRBR43scwX7Rsm4eqphPu8", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailVal })
    })
    .then(res => res.json())
    .then(data => {
      // Ignore old responses
      if (emailVal !== lastEmailChecked) return;

      if (data.exists) {
        setEmailInvalid("Email already exists");
        emailAvailable = false;
      } else {
        setEmailValid();
        emailAvailable = true;
      }
      document.querySelector(".loadingicon").style.display = "none";

      validateForm();
    })
    .catch(err => {
      console.error(err);
      if (emailVal !== lastEmailChecked) return;
      setEmailInvalid("Error checking email");
      
      document.querySelector(".loadingicon").style.display = "none";

    });
  }, 1000); // wait 2 seconds
});

// ================= CHECK MANUAL EMAIL =================
function checkEmailAndSetError(email) {
  fetch("https://default604566729c2a44a3b67843fd61ec46.20.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/02e1672fd7f44819b146f45d855b965c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_oPRW0VzcxGiJ7b41SQRPBRBR43scwX7Rsm4eqphPu8", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() })
  })
    .then(res => res.json())
    .then(data => {
      if (data.exists) {
        setEmailInvalid("Email already exists");
        emailAvailable = false;
      } else {
        setEmailValid();
        emailAvailable = true;
      }
      validateForm();
    })
    .catch(err => {
      console.error(err);
      setEmailInvalid("Error checking email");
      emailAvailable = false;
      validateForm();
    });
}

// ================= FORM VALIDATION =================
function validateForm() {
  const first = firstName.value.trim();
  const middle = middleName.value.trim();
  const last = lastName.value.trim();

  // submit only enabled if names filled AND email is valid & available
  submitBtn.disabled = !(first && middle && last && emailAvailable);
}

// ================= NAME INPUT EVENTS =================
[firstName, middleName, lastName].forEach(input => {
  input.addEventListener("input", () => {
    generateEmailSuggestions();
  });
});

// ================= FORM SUBMIT =================
document.getElementById("onboardingForm")
  .addEventListener("submit", function (e) {

    e.preventDefault();

    const data = {
      firstName: firstName.value.trim(),
      middleName: middleName.value.trim(),
      lastName: lastName.value.trim(),
      email: emailInput.value.trim(),
      code: code.value.trim()
    };

    submitBtn.disabled = true;

    fetch("https://default604566729c2a44a3b67843fd61ec46.20.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/19cf3612f8bc49cbaba507eb24359176/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lLA9Cjv35YGngZt0m2Vfi3hgeP_p12a1h7zI-UkPMYU", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(() => {
      alert("Form submitted successfully!");
      this.reset();
      choicesContainer.style.display = "none";
      emailAvailable = false;
    })
    .catch(err => {
      console.error(err);
      alert("Submission failed.");
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});

// Fill Candidate ID Automatically
// Get the "id" parameter from URL
const params = new URLSearchParams(window.location.search);
const candidateID = params.get("id");

// Fill the input field automatically
const codeInput = document.getElementById("code");
if(candidateID) {
    codeInput.value = candidateID;
    codeInput.readOnly = true; // prevent editing
}
