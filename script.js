document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (username === "username" && password === "password") {
    // success → redirect
    window.location.href = "clients.html";
  } else {
    errorMsg.textContent = "Invalid username or password";
  }
});
