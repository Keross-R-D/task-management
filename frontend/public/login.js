document.addEventListener("DOMContentLoaded", function () {
  const usernameInput = document.getElementById("userName");
  const passwordInput = document.getElementById("userPassword");
  const resetButton = document.getElementById("resetLoginBtn");
  const loginButton = document.getElementById("submitLoginBtn");

  usernameInput.setAttribute("autocomplete", "off");
  passwordInput.setAttribute("autocomplete", "off");

  resetButton.addEventListener("click", function (e) {
    e.preventDefault();
    usernameInput.value = "";
    passwordInput.value = "";
  });

  // Function to show custom alerts
  function showAlert(message, type = "error") {
    const alertContainer = document.getElementById("alertContainer");

    const alertDiv = document.createElement("div");
    alertDiv.className = `flex items-center justify-between p-3 text-white rounded-md shadow-lg ${type === "success" ? "bg-green-600" : "bg-red-600"
      } transition-transform transform translate-x-5 opacity-0`;

    alertDiv.innerHTML = `
      <span>${message}</span>
      <button class="ml-3 text-white font-bold px-2 py-1 rounded hover:bg-gray-700 transition" onclick="this.parentElement.remove()">✖</button>
    `;

    alertContainer.appendChild(alertDiv);

    // Animate alert (slide in effect)
    setTimeout(() => {
      alertDiv.classList.remove("translate-x-5", "opacity-0");
      alertDiv.classList.add("opacity-100");
    }, 100);

    // Remove alert after 3 seconds
    setTimeout(() => {
      alertDiv.classList.add("opacity-0");
      setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
  }

  loginButton.addEventListener("click", async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    console.log("Username:", username);
    console.log("Password:", password);
    try {
      const response = await fetch(`api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userlogin: username,
          password,
          credentialType: "PASSWORD",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showAlert("Login successful!", "success");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        showAlert(result.error || "Login failed.");
      }
    } catch (error) {
      showAlert("Error connecting to the server.");
    }
  });
});

