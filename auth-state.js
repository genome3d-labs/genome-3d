import { auth } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", () => {

  const loginLink =
    document.querySelector('a[href="login.html"]');

  if (!loginLink) {
    console.warn("Link de login não encontrado.");
    return;
  }


  onAuthStateChanged(auth, (user) => {

    const logoutExistente =
      document.getElementById("logout-link");


    // ==========================
    // USUÁRIO LOGADO
    // ==========================

    if (user) {

      loginLink.textContent = user.email;
      loginLink.href = "#";

      if (!logoutExistente) {

        const logoutLink =
          document.createElement("a");

        logoutLink.id = "logout-link";
        logoutLink.href = "#";
        logoutLink.textContent = "Sair";
        logoutLink.className = loginLink.className;

        logoutLink.style.marginLeft = "8px";


        logoutLink.addEventListener(
          "click",
          async (event) => {

            event.preventDefault();

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


        loginLink.insertAdjacentElement(
          "afterend",
          logoutLink
        );
      }

    }


    // ==========================
    // USUÁRIO DESLOGADO
    // ==========================

    else {

      loginLink.textContent = "Login";
      loginLink.href = "login.html";

      if (logoutExistente) {
        logoutExistente.remove();
      }
    }

  });

});
