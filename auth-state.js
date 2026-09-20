import {
  auth,
  db
} from "./firebase-config.js?v=3";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", () => {

  const loginLink = document.querySelector(
    ".masthead .login-button"
  );

  const feedbackButton =
    document.getElementById("feedback-button");


  if (!loginLink) {
    console.warn("Botão de login não encontrado.");
    return;
  }


  // IMPORTANTE:
  // alteramos somente o SPAN.
  // Nunca apagamos o conteúdo inteiro do botão.
  const loginLabel =
    loginLink.querySelector("span");

  const loginPhoto =
    loginLink.querySelector("img");


  // =========================================
  // ÁREA DA CONTA
  // =========================================

  let authArea =
    document.getElementById("auth-area");


  if (!authArea) {

    authArea =
      document.createElement("div");

    authArea.id =
      "auth-area";

    authArea.className =
      "auth-area";


    loginLink.parentNode.insertBefore(
      authArea,
      loginLink
    );


    authArea.appendChild(
      loginLink
    );
  }


  // =========================================
  // BOTÃO SAIR
  // =========================================

  let logoutButton =
    document.getElementById(
      "logout-button"
    );


  if (!logoutButton) {

    logoutButton =
      document.createElement("button");


    logoutButton.id =
      "logout-button";

    logoutButton.className =
      "logout-button";

    logoutButton.type =
      "button";

    logoutButton.textContent =
      "Sair";

    logoutButton.setAttribute(
      "data-i18n",
      "logout"
    );

    logoutButton.hidden =
      true;


    authArea.appendChild(
      logoutButton
    );
  }


  // =========================================
  // ESTADO DA CONTA
  // =========================================

  onAuthStateChanged(
    auth,
    async (user) => {

      if (user) {

        // Feedback liberado para usuário logado
        if (feedbackButton) {

          feedbackButton.href =
            "feedbacks.html";
        }


        // =====================================
        // CARREGA PERFIL
        // =====================================

        let accountName =
          user.email;


        try {

          const userRef =
            doc(
              db,
              "users",
              user.uid
            );


          const userSnapshot =
            await getDoc(
              userRef
            );


          if (
            userSnapshot.exists()
          ) {

            const userData =
              userSnapshot.data();


            // NICKNAME
            if (
              userData.nickname
            ) {

              accountName =
                userData.nickname;
            }


            // FOTO DE PERFIL
            if (
              userData.photoData &&
              loginPhoto
            ) {

              loginPhoto.src =
                userData.photoData;
            }

          }


        } catch (error) {

          console.error(
            "Erro ao carregar perfil:",
            error
          );

        }


        // =====================================
        // MOSTRA CONTA
        // =====================================

        loginLabel.textContent =
          accountName;

        loginLink.href =
          "perfil.html";

        loginLink.title =
          accountName;

        logoutButton.hidden =
          false;


      } else {

        // =====================================
        // USUÁRIO DESLOGADO
        // =====================================

        loginLabel.textContent =
          "Login";


        if (loginPhoto) {

          loginPhoto.src =
            "assets/perfil.jpg";
        }


        loginLink.href =
          "login.html";

        loginLink.title =
          "Login";

        logoutButton.hidden =
          true;
      }

    }
  );


  // =========================================
  // SAIR
  // =========================================

  logoutButton.addEventListener(
    "click",
    async () => {

      try {

        await signOut(
          auth
        );


        window.location.href =
          "index.html";


      } catch (error) {

        console.error(
          "Erro ao sair:",
          error
        );

      }

    }
  );

});
