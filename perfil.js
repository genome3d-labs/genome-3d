import {
  auth,
  db
} from "./firebase-config.js?v=3";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const nicknameInput =
  document.getElementById("profile-nickname");

const saveButton =
  document.getElementById("save-profile-button");

const profileMessage =
  document.getElementById("profile-message");

const profilePhoto =
  document.getElementById("profile-photo");

const profilePhotoInput =
  document.getElementById("profile-photo-input");

const changePhotoButton =
  document.getElementById("change-photo-button");

let currentUser = null;


/* =========================================================
   MENSAGENS PT / EN
========================================================= */

const messages = {

  pt: {
    loading: "Carregando perfil...",
    nicknameRequired: "Digite um nickname.",

    nicknameInvalid:
      "O nickname deve ter entre 3 e 24 caracteres e pode conter letras, números, ponto, hífen e underline.",

    nicknameTaken:
      "Este nickname já está sendo utilizado.",

    saving:
      "Salvando alterações...",

    saved:
      "Nickname salvo com sucesso.",

    error:
      "Não foi possível salvar o nickname. Tente novamente."
  },

  en: {
    loading: "Loading profile...",
    nicknameRequired: "Enter a nickname.",

    nicknameInvalid:
      "The nickname must contain between 3 and 24 characters and may include letters, numbers, periods, hyphens and underscores.",

    nicknameTaken:
      "This nickname is already being used.",

    saving:
      "Saving changes...",

    saved:
      "Nickname saved successfully.",

    error:
      "Unable to save the nickname. Please try again."
  }

};


/* =========================================================
   IDIOMA
========================================================= */

function getLanguage() {

  const savedLanguage =
    localStorage.getItem("genome-language");

  return savedLanguage === "en"
    ? "en"
    : "pt";
}


function getMessage(key) {

  const language =
    getLanguage();

  return messages[language][key];
}


/* =========================================================
   MENSAGENS NA TELA
========================================================= */

function showMessage(text, type = "") {

  if (!profileMessage) {
    return;
  }

  profileMessage.textContent = text;

  profileMessage.classList.remove(
    "success-message",
    "error-message"
  );

  if (type === "success") {
    profileMessage.classList.add(
      "success-message"
    );
  }

  if (type === "error") {
    profileMessage.classList.add(
      "error-message"
    );
  }
}


/* =========================================================
   NORMALIZAÇÃO DO NICKNAME
========================================================= */

function normalizeNickname(nickname) {

  return nickname
    .normalize("NFKC")
    .trim()
    .toLowerCase();
}


/* =========================================================
   VALIDAÇÃO
========================================================= */

function nicknameIsValid(nickname) {

  const regex =
    /^[\p{L}\p{N}._-]{3,24}$/u;

  return regex.test(nickname);
}


/* =========================================================
   CARREGAR PERFIL
========================================================= */

async function loadProfile(user) {

  showMessage(
    getMessage("loading")
  );

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

      if (userData.nickname) {

        nicknameInput.value =
          userData.nickname;
      }
    }


    showMessage("");

  } catch (error) {

    console.error(
      "Erro ao carregar perfil:",
      error
    );

    showMessage(
      getMessage("error"),
      "error"
    );
  }
}


/* =========================================================
   SALVAR NICKNAME
========================================================= */

async function saveNickname() {

  if (!currentUser) {
    return;
  }


  const nickname =
    nicknameInput.value.trim();


  /* CAMPO VAZIO */

  if (!nickname) {

    showMessage(
      getMessage("nicknameRequired"),
      "error"
    );

    return;
  }


  /* VALIDAÇÃO */

  if (!nicknameIsValid(nickname)) {

    showMessage(
      getMessage("nicknameInvalid"),
      "error"
    );

    return;
  }


  const nicknameKey =
    normalizeNickname(nickname);


  saveButton.disabled = true;

  showMessage(
    getMessage("saving")
  );


  try {

    await runTransaction(
      db,
      async (transaction) => {

        /* PERFIL DO USUÁRIO */

        const userRef =
          doc(
            db,
            "users",
            currentUser.uid
          );


        const userSnapshot =
          await transaction.get(
            userRef
          );


        let oldNicknameKey = null;


        if (userSnapshot.exists()) {

          const userData =
            userSnapshot.data();

          oldNicknameKey =
            userData.nicknameKey || null;
        }


        /* NOVO NICKNAME */

        const nicknameRef =
          doc(
            db,
            "usernames",
            nicknameKey
          );


        const nicknameSnapshot =
          await transaction.get(
            nicknameRef
          );


        /* NICKNAME PERTENCE A OUTRO USUÁRIO */

        if (
          nicknameSnapshot.exists() &&
          nicknameSnapshot.data().uid !==
            currentUser.uid
        ) {

          throw new Error(
            "NICKNAME_TAKEN"
          );
        }


        /* RESERVA O NOVO NICKNAME */

        if (!nicknameSnapshot.exists()) {

          transaction.set(
            nicknameRef,
            {
              uid: currentUser.uid,

              createdAt:
                serverTimestamp()
            }
          );
        }


        /* LIBERA O NICKNAME ANTIGO */

        if (
          oldNicknameKey &&
          oldNicknameKey !== nicknameKey
        ) {

          const oldNicknameRef =
            doc(
              db,
              "usernames",
              oldNicknameKey
            );

          transaction.delete(
            oldNicknameRef
          );
        }


        /* ATUALIZA O PERFIL */

        transaction.set(
          userRef,
          {
            nickname: nickname,

            nicknameKey: nicknameKey,

            updatedAt:
              serverTimestamp()
          },
          {
            merge: true
          }
        );

      }
    );


    /* SALVOU COM SUCESSO */

    showMessage(
      getMessage("saved"),
      "success"
    );


    console.log(
      "Nickname salvo. Redirecionando..."
    );


    /* VOLTA PARA A HOME */

    window.location.replace(
      "./index.html"
    );


  } catch (error) {

    console.error(
      "Erro ao salvar nickname:",
      error
    );


    if (
      error.message ===
      "NICKNAME_TAKEN"
    ) {

      showMessage(
        getMessage("nicknameTaken"),
        "error"
      );

    } else {

      showMessage(
        getMessage("error"),
        "error"
      );
    }


    saveButton.disabled = false;
  }

}


/* =========================================================
   BOTÃO SALVAR
========================================================= */

saveButton.addEventListener(
  "click",
  saveNickname
);


/* =========================================================
   AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.replace(
        "./login.html"
      );

      return;
    }


    currentUser = user;

    await loadProfile(user);

  }
);
