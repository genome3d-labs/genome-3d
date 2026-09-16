import {
  auth,
  db
} from "./firebase-config.js?v=3";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   ELEMENTOS DA PÁGINA
========================================================= */

const feedbackUserName =
  document.getElementById("feedback-user-name");

const feedbackUserPhoto =
  document.getElementById("feedback-user-photo");

const feedbackUserEmail =
  document.getElementById("feedback-user-email");


let currentUser = null;


/* =========================================================
   CARREGAR DADOS DO USUÁRIO
========================================================= */

async function loadFeedbackUser(user) {

  let accountName =
    user.email || "Genome 3D User";

  let profilePhoto =
    "assets/perfil.jpg";


  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const userSnapshot =
      await getDoc(userRef);


    if (userSnapshot.exists()) {

      const userData =
        userSnapshot.data();


      /* NICKNAME */

      if (userData.nickname) {

        accountName =
          userData.nickname;

      }


      /* FOTO DE PERFIL */

      if (userData.photoData) {

        profilePhoto =
          userData.photoData;

      }

    }


  } catch (error) {

    console.error(
      "Erro ao carregar perfil:",
      error
    );

  }


  /* MOSTRA NICKNAME */

  if (feedbackUserName) {

    feedbackUserName.textContent =
      accountName;

  }


  /* MOSTRA E-MAIL */

  if (feedbackUserEmail) {

    feedbackUserEmail.textContent =
      user.email || "";

  }


  /* MOSTRA FOTO */

  if (feedbackUserPhoto) {

    feedbackUserPhoto.src =
      profilePhoto;

  }

}


/* =========================================================
   AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(
  auth,
  async (user) => {

    /* USUÁRIO NÃO ESTÁ LOGADO */

    if (!user) {

      window.location.replace(
        "login.html?redirect=feedbacks"
      );

      return;

    }


    /* USUÁRIO LOGADO */

    currentUser =
      user;


    await loadFeedbackUser(
      user
    );


    console.log(
      "Página de feedbacks liberada para:",
      user.uid
    );

  }
);
