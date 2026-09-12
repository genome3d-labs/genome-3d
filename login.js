const form = document.getElementById("login-form");
const message = document.getElementById("login-message");
const forgot = document.getElementById("forgot-link");

function tr(key, fallback) {
  if (window.GenomeI18n) {
    return window.GenomeI18n.t(key);
  }
  return fallback;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = tr(
    "loginUnavailable",
    "A página de login está pronta, mas a autenticação ainda precisa ser conectada a um servidor."
  );
});

forgot.addEventListener("click", (event) => {
  event.preventDefault();
  message.textContent = tr(
    "recoveryUnavailable",
    "A recuperação de senha será habilitada quando o sistema de contas for implementado."
  );
});

window.addEventListener("genome-language-changed", () => {
  if (message.textContent.trim()) {
    message.textContent = "";
  }
});
