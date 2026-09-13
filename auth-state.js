import { auth } from "./firebase-config.js?v=2";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", () => {

  const loginLink = document.querySelector(
    ".masthead .login-button"
  );
  const downloadButton =
  document.getElementById("download-button");

const DOWNLOAD_URL =
  "https://github.com/genome3d-labs/genome-3d/releases/download/v0.1-beta/Genome3D_Setup_0.1_BETA.exe";

  if (!loginLink) {
    console.warn("Botão de login não encontrado.");
    return;
  }

  // IMPORTANTE:
  // alteramos somente o SPAN.
  // Nunca mais apagamos o conteúdo inteiro do botão.
  const loginLabel = loginLink.querySelector("span");


  // Cria um contêiner para Login/Conta + Sair
  let authArea = document.getElementById("auth-area");

  if (!authArea) {

    authArea = document.createElement("div");
    authArea.id = "auth-area";
    authArea.className = "auth-area";

    loginLink.parentNode.insertBefore(
      authArea,
      loginLink
    );

    authArea.appendChild(loginLink);
  }


  // Botão sair
  let logoutButton =
    document.getElementById("logout-button");

  if (!logoutButton) {

    logoutButton =
      document.createElement("button");

    logoutButton.id = "logout-button";
    logoutButton.className = "logout-button";
    logoutButton.type = "button";
    logoutButton.textContent = "Sair";

    logoutButton.hidden = true;

    authArea.appendChild(logoutButton);
  }


  // =========================================
  // ESTADO DA CONTA
  // =========================================

  onAuthStateChanged(auth, (user) => {

    if (user) {

      // mantém a foto de perfil
      loginLabel.textContent = user.email;

      loginLink.href = "#";
      loginLink.title = user.email;

      logoutButton.hidden = false;

    } else {

      // volta ao estado original
      loginLabel.textContent = "Login";

      loginLink.href = "login.html";
      loginLink.title = "Login";

      logoutButton.hidden = true;
    }

  });


  // =========================================
  // SAIR
  // =========================================

  logoutButton.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        window.location.href = "index.html";

      } catch (error) {

        console.error(
          "Erro ao sair:",
          error
        );
      }

    }
  );

});
