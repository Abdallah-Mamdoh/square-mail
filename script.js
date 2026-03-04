const firstName = document.getElementById("firstName");
const middleName = document.getElementById("middleName");
const lastName = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const submitBtn = document.getElementById("submitBtn");

const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");

const firstbutton = document.getElementById("fl"); 
const secondbutton = document.getElementById("fml"); 
const thirdbutton = document.getElementById("ldash"); 

thirdbutton.addEventListener("click",function(){
  console.log("third");
  
})

let emailAvailable = false;

emailInput.addEventListener("focus", function() {
  emailInput.value = `${firstName.value}.${lastName.value}@square.com.eg`.toLowerCase()
})

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

  submitBtn.disabled = !(first && middle && last && phoneValid && emailValid);
}

// Event listeners
[firstName, middleName, lastName, phoneInput].forEach(el => el.addEventListener("input", validateForm));
emailInput.addEventListener("blur", checkEmailExistence);
phoneInput.addEventListener("input", validateForm);

// Submit
document.getElementById("onboardingForm").addEventListener("submit", function(e){
  e.preventDefault();
  const data = {
    firstName: firstName.value.trim(),
    middleName: middleName.value.trim(),
    lastName: lastName.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim()
  };
  console.log("Form submitted:", data);
  alert("Form submitted successfully!");
  this.reset();
  submitBtn.disabled = true;
  emailAvailable = false;
});