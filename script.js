const code = document.getElementById("code");
const firstName = document.getElementById("firstName");
const middleName = document.getElementById("middleName");
const lastName = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const submitBtn = document.getElementById("submitBtn");

const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const codeError = document.getElementById("codeError");


const firstbutton = document.getElementById("fl"); 
const secondbutton = document.getElementById("fml"); 


let emailAvailable = false;

emailInput.addEventListener("focus", function() {
  document.querySelector(".choices").style.display = "flex"
  if (firstName.value && lastName.value){
    // default email without dash
    firstbutton.textContent = `${firstName.value.toLowerCase()}.${lastName.value.toLowerCase()}@square.com.eg`;
    
    // middle initial email
    secondbutton.textContent = middleName.value 
      ? `${firstName.value.toLowerCase()}.${middleName.value.charAt(0).toLowerCase()}.${lastName.value.toLowerCase()}@square.com.eg`
      : firstbutton.textContent;

    // Add dash for "Al" or "El" names longer than 5 chars
    const prefix = lastName.value.substring(0,2).toLowerCase();
    if ((prefix === "al" || prefix === "el") && lastName.value.length > 5){
      const rest = lastName.value.substring(2).toLowerCase();
      firstbutton.textContent = `${firstName.value.toLowerCase()}.${prefix}-${rest}@square.com.eg`;
      if(middleName.value){
        secondbutton.textContent = `${firstName.value.toLowerCase()}.${middleName.value.charAt(0).toLowerCase()}.${prefix}-${rest}@square.com.eg`;
      } else {
        secondbutton.textContent = firstbutton.textContent;
      }
    }

  } else {
    emailError.textContent = "Please fill your full name first";
    emailInput.classList.add("invalid");
    emailInput.classList.remove("valid");
  }
})

firstbutton.addEventListener("click", function() {
  emailInput.value = this.textContent
})

secondbutton.addEventListener("click", function() {
  emailInput.value = this.textContent
})
// Validate Employee Code
function validateCode() {
  const codeVal = code.value.trim();
  if (codeVal.length != 9) {
    codeError.textContent = "Enter a Valid Employee Code";
    code.classList.add("invalid");
    code.classList.remove("valid");
    return false;
  } else {
    codeError.textContent = "";
    code.classList.add("valid");
    code.classList.remove("invalid");
    return true;
  }
}

// Validate email format
function validateEmailFormat() {
  const emailVal = emailInput.value.trim();
  if (!emailVal.endsWith("@square.com.eg")) {
    emailError.textContent = "Email must end with @square.com.eg";
    emailInput.classList.add("invalid");
    emailInput.classList.remove("valid");
    emailAvailable = false;
    return false;
  } else {
    emailError.textContent = "";
    emailInput.classList.add("valid");
    emailInput.classList.remove("invalid");
    return true;
  }
}

// Validate phone: 11 digits, start with 01
function validatePhone() {
  const phoneVal = phoneInput.value.trim();
  if (!/^01\d{9}$/.test(phoneVal)) {
    phoneError.textContent = "Phone must be 11 digits and start with 01";
    phoneInput.classList.add("invalid");
    phoneInput.classList.remove("valid");
    return false;
  } else {
    phoneError.textContent = "";
    phoneInput.classList.add("valid");
    phoneInput.classList.remove("invalid");
    return true;
  }
}

// Check email existence in SharePoint via Power Automate
function checkEmailExistence() {
  const emailVal = emailInput.value.trim();
  if (!validateEmailFormat()) {
    emailAvailable = false;
    return;
  }

  fetch("https://default604566729c2a44a3b67843fd61ec46.20.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/02e1672fd7f44819b146f45d855b965c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_oPRW0VzcxGiJ7b41SQRPBRBR43scwX7Rsm4eqphPu8", { // Replace with your Power Automate Flow URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailVal })
  })
  .then(res => res.json())
  .then(data => {
    if (data.exists) {
      emailError.textContent = "Email already exists";
      emailInput.classList.add("invalid");
      emailInput.classList.remove("valid");
      emailAvailable = false;
    } else {
      emailError.textContent = "";
      emailInput.classList.add("valid");
      emailInput.classList.remove("invalid");
      emailAvailable = true;
    }
    validateForm();
  })
  .catch(err => {
    console.error(err);
    emailError.textContent = "Error checking email";
    emailAvailable = false;
    validateForm();
  });
}

// Validate whole form
function validateForm() {
  const first = firstName.value.trim();
  const middle = middleName.value.trim();
  const last = lastName.value.trim();
  const phoneValid = validatePhone();
  const emailValid = emailAvailable;
  const codeVal = validateCode();

  submitBtn.disabled = !(first && middle && last && phoneValid && emailValid && codeVal);
}

// Event listeners
[firstName, middleName, lastName, phoneInput].forEach(el => el.addEventListener("input", validateForm));
emailInput.addEventListener("blur", checkEmailExistence);
phoneInput.addEventListener("input", validateForm);
code.addEventListener("input", validateCode);

// Submit
document.getElementById("onboardingForm").addEventListener("submit", function(e){
  e.preventDefault();
  const data = {
    firstName: firstName.value.trim(),
    middleName: middleName.value.trim(),
    lastName: lastName.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    code: code.value.trim()
  };
  console.log("Form submitted:", data);
  alert("Form submitted successfully!");
  this.reset();
  document.querySelector(".choices").style.display = "none"
  submitBtn.disabled = true;
  emailAvailable = false;
});