// Centralized selectors for all auth views and navigation triggers.
const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");
const navLogin = document.getElementById("navLogin");
const navRegister = document.getElementById("navRegister");
const switchLinks = document.querySelectorAll(".switch-link");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showView(view) {
  const showLogin = view === "login";

  loginView.classList.toggle("active-view", showLogin);
  registerView.classList.toggle("active-view", !showLogin);

  loginView.setAttribute("aria-hidden", String(!showLogin));
  registerView.setAttribute("aria-hidden", String(showLogin));

  navLogin.classList.toggle("active", showLogin);

  // Clear inline submit messages when switching context.
  document.getElementById("loginSubmitMessage").textContent = "";
  document.getElementById("registerSubmitMessage").textContent = "";
}

function setFieldError(fieldErrorId, message) {
  document.getElementById(fieldErrorId).textContent = message;
}

function clearLoginErrors() {
  setFieldError("loginEmailError", "");
  setFieldError("loginPasswordError", "");
}

function clearRegisterErrors() {
  setFieldError("registerNameError", "");
  setFieldError("registerEmailError", "");
  setFieldError("registerPasswordError", "");
  setFieldError("registerConfirmPasswordError", "");
}

function validateLogin() {
  clearLoginErrors();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  let valid = true;

  if (!email) {
    setFieldError("loginEmailError", "Email is required.");
    valid = false;
  } else if (!emailPattern.test(email)) {
    setFieldError("loginEmailError", "Please enter a valid email address.");
    valid = false;
  }

  if (!password) {
    setFieldError("loginPasswordError", "Password is required.");
    valid = false;
  }

  return valid;
}

function validateRegister() {
  clearRegisterErrors();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword",
  ).value;

  let valid = true;

  if (!name) {
    setFieldError("registerNameError", "Name is required.");
    valid = false;
  }

  if (!email) {
    setFieldError("registerEmailError", "Email is required.");
    valid = false;
  } else if (!emailPattern.test(email)) {
    setFieldError("registerEmailError", "Please enter a valid email address.");
    valid = false;
  }

  if (!password) {
    setFieldError("registerPasswordError", "Password is required.");
    valid = false;
  }

  if (!confirmPassword) {
    setFieldError(
      "registerConfirmPasswordError",
      "Please confirm your password.",
    );
    valid = false;
  } else if (password && password !== confirmPassword) {
    setFieldError("registerConfirmPasswordError", "Passwords do not match.");
    valid = false;
  }

  return valid;
}

navLogin.addEventListener("click", (event) => {
  event.preventDefault();
  showView("login");
});

navRegister.addEventListener("click", () => {
  showView("register");
});

switchLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const targetView = link.getAttribute("data-view");
    showView(targetView);
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitMessage = document.getElementById("loginSubmitMessage");

  if (validateLogin()) {
    submitMessage.textContent = "Login successful (demo mode).";
    submitMessage.style.color = "#34d399";
  } else {
    submitMessage.textContent = "Please fix the errors above.";
    submitMessage.style.color = "#f87171";
  }
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitMessage = document.getElementById("registerSubmitMessage");

  if (validateRegister()) {
    submitMessage.textContent = "Registration successful (demo mode).";
    submitMessage.style.color = "#34d399";
  } else {
    submitMessage.textContent = "Please fix the errors above.";
    submitMessage.style.color = "#f87171";
  }
});
