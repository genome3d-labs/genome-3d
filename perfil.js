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
let selectedPhotoData = null;


/* =========================================================
   MENSAGENS PT / EN
========================================================= */

const messages = {

  pt: {

    loading:
      "Carregando perfil...",

    nicknameRequired:
      "Digite um nickname.",

    nicknameInvalid:
      "O nickname deve ter entre 3 e 24 caracteres e pode conter letras, números, ponto, hífen e underline.",

    nicknameTaken:
      "Este nickname já está sendo utilizado.",

    saving:
      "Salvando alterações...",

    saved:
      "Perfil salvo com sucesso.",

    invalidImage:
      "Selecione uma imagem válida.",

    imageTooLarge:
      "A imagem deve ter menos de 5 MB.",

    imageError:
      "Não foi possível processar a imagem.",

    error:
      "Não foi possível salvar o perfil. Tente novamente."

  },


  en: {

    loading:
      "Loading profile...",

    nicknameRequired:
      "Enter a nickname.",

    nicknameInvalid:
      "The nickname must contain between 3 and 24 characters and may include letters, numbers, periods, hyphens and underscores.",

    nicknameTaken:
      "This nickname is already being used.",

    saving:
      "Saving changes...",

    saved:
      "Profile saved successfully.",

    invalidImage:
      "Please select a valid image.",

    imageTooLarge:
      "The image must be smaller than 5 MB.",

    imageError:
      "Unable to process the image.",

    error:
      "Unable to save the profile. Please try again."

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
   VALIDAÇÃO DO NICKNAME
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


      console.log(
        "Dados do perfil carregados:",
        userData
      );


      /* CARREGA NICKNAME */

      if (
        userData.nickname &&
        nicknameInput
      ) {

        nicknameInput.value =
          userData.nickname;

      }


      /* CARREGA FOTO */

      if (
        userData.photoData &&
        profilePhoto
      ) {

        profilePhoto.src =
          userData.photoData;

      }

    } else {

      console.log(
        "Perfil ainda não existe no Firestore."
      );

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
   REDIMENSIONAR FOTO
========================================================= */

function resizeProfileImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload = () => {

        const image =
          new Image();


        image.onload = () => {

          const canvas =
            document.createElement(
              "canvas"
            );


          const size = 160;


          canvas.width =
            size;

          canvas.height =
            size;


          const ctx =
            canvas.getContext("2d");


          const cropSize =
            Math.min(
              image.width,
              image.height
            );


          const sourceX =
            (
              image.width -
              cropSize
            ) / 2;


          const sourceY =
            (
              image.height -
              cropSize
            ) / 2;


          ctx.drawImage(
            image,

            sourceX,
            sourceY,

            cropSize,
            cropSize,

            0,
            0,

            size,
            size
          );


          const compressedImage =
            canvas.toDataURL(
              "image/webp",
              0.75
            );


          resolve(
            compressedImage
          );

        };


        image.onerror =
          reject;


        image.src =
          reader.result;

      };


      reader.onerror =
        reject;


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   SELECIONAR FOTO
========================================================= */

changePhotoButton.addEventListener(
  "click",
  () => {

    profilePhotoInput.click();

  }
);


profilePhotoInput.addEventListener(
  "change",
  async () => {

    const file =
      profilePhotoInput.files[0];


    if (!file) {
      return;
    }


    /* TIPO DE ARQUIVO */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      showMessage(
        getMessage(
          "invalidImage"
        ),
        "error"
      );


      profilePhotoInput.value =
        "";


      return;
    }


    /* LIMITE 5 MB */

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      showMessage(
        getMessage(
          "imageTooLarge"
        ),
        "error"
      );


      profilePhotoInput.value =
        "";


      return;
    }


    try {

      selectedPhotoData =
        await resizeProfileImage(
          file
        );


      profilePhoto.src =
        selectedPhotoData;


      showMessage("");


    } catch (error) {

      console.error(
        "Erro ao processar foto:",
        error
      );


      showMessage(
        getMessage(
          "imageError"
        ),
        "error"
      );

    }

  }
);


/* =========================================================
   SALVAR PERFIL
========================================================= */

async function saveProfile() {

  if (!currentUser) {
    return;
  }


  const nickname =
    nicknameInput.value.trim();


  /* CAMPO VAZIO */

  if (!nickname) {

    showMessage(
      getMessage(
        "nicknameRequired"
      ),
      "error"
    );

    return;
  }


  /* NICKNAME INVÁLIDO */

  if (
    !nicknameIsValid(
      nickname
    )
  ) {

    showMessage(
      getMessage(
        "nicknameInvalid"
      ),
      "error"
    );

    return;
  }


  const nicknameKey =
    normalizeNickname(
      nickname
    );


  saveButton.disabled =
    true;


  showMessage(
    getMessage(
      "saving"
    )
  );


  try {

    await runTransaction(
      db,

      async (transaction) => {


        /* ================================================
           PERFIL DO USUÁRIO
        ================================================= */

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


        let oldNicknameKey =
          null;


        if (
          userSnapshot.exists()
        ) {

          const userData =
            userSnapshot.data();


          oldNicknameKey =
            userData.nicknameKey ||
            null;

        }


        /* ================================================
           NOVO NICKNAME
        ================================================= */

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


        /* NICKNAME JÁ PERTENCE A OUTRO USUÁRIO */

        if (
          nicknameSnapshot.exists() &&
          nicknameSnapshot.data().uid !==
            currentUser.uid
        ) {

          throw new Error(
            "NICKNAME_TAKEN"
          );

        }


        /* ================================================
           RESERVA NOVO NICKNAME
        ================================================= */

        if (
          !nicknameSnapshot.exists()
        ) {

          transaction.set(
            nicknameRef,
            {

              uid:
                currentUser.uid,

              createdAt:
                serverTimestamp()

            }
          );

        }


        /* ================================================
           LIBERA O NICKNAME ANTIGO
        ================================================= */

        if (
          oldNicknameKey &&
          oldNicknameKey !==
            nicknameKey
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


        /* ================================================
           DADOS DO PERFIL
        ================================================= */

        const profileData = {

          nickname:
            nickname,

          nicknameKey:
            nicknameKey,

          updatedAt:
            serverTimestamp()

        };


        /* SALVA NOVA FOTO SOMENTE SE FOI ALTERADA */

        if (
          selectedPhotoData
        ) {

          profileData.photoData =
            selectedPhotoData;

        }


        /* ================================================
           ATUALIZA O PERFIL
        ================================================= */

        transaction.set(
          userRef,

          profileData,

          {
            merge: true
          }
        );


      }
    );


    /* =================================================
       SALVO COM SUCESSO
    ================================================== */

    showMessage(
      getMessage(
        "saved"
      ),
      "success"
    );


    console.log(
      "Perfil salvo. Redirecionando..."
    );


    /* VOLTA PARA A HOME */

    window.location.replace(
      "./index.html"
    );


  } catch (error) {

    console.error(
      "Erro ao salvar perfil:",
      error
    );


    if (
      error.message ===
      "NICKNAME_TAKEN"
    ) {

      showMessage(
        getMessage(
          "nicknameTaken"
        ),
        "error"
      );

    } else {

      showMessage(
        getMessage(
          "error"
        ),
        "error"
      );

    }


    saveButton.disabled =
      false;

  }

}


/* =========================================================
   BOTÃO SALVAR
========================================================= */

saveButton.addEventListener(
  "click",
  saveProfile
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


    currentUser =
      user;


    await loadProfile(
      user
    );

  }
);
