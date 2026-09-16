import {
  auth,
  db
} from "./firebase-config.js?v=3";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const feedbackUserName =
  document.getElementById("feedback-user-name");

const feedbackUserPhoto =
  document.getElementById("feedback-user-photo");

const feedbackUserEmail =
  document.getElementById("feedback-user-email");

const feedbackForm =
  document.getElementById("feedback-form");

const feedbackType =
  document.getElementById("feedback-type");

const feedbackRating =
  document.getElementById("feedback-rating");

const feedbackText =
  document.getElementById("feedback-text");

const feedbackStatus =
  document.getElementById("feedback-status");

const feedbackSubmitButton =
  document.getElementById(
    "feedback-submit-button"
  );


let currentUser = null;

let currentProfile = {
  nickname: "",
  photoData: ""
};


/* =========================================================
   MENSAGENS PT / EN
========================================================= */

const messages = {

  pt: {

    selectType:
      "Selecione o tipo de feedback.",

    selectRating:
      "Selecione uma avaliação.",

    writeMessage:
      "Escreva seu feedback.",

    sending:
      "Enviando feedback...",

    sent:
      "Feedback enviado com sucesso.",

    cooldown:
      "Aguarde {time} para enviar outro feedback.",

    error:
      "Não foi possível enviar o feedback. Tente novamente."
  },


  en: {

    selectType:
      "Select a feedback type.",

    selectRating:
      "Select a rating.",

    writeMessage:
      "Write your feedback.",

    sending:
      "Sending feedback...",

    sent:
      "Feedback sent successfully.",

    cooldown:
      "Please wait {time} before sending another feedback.",

    error:
      "Unable to send feedback. Please try again."
  }

};


/* =========================================================
   IDIOMA
========================================================= */

function getLanguage() {

  return (
    localStorage.getItem(
      "genome-language"
    ) === "en"
  )
    ? "en"
    : "pt";
}


function getMessage(key) {

  return messages[
    getLanguage()
  ][key];
}


/* =========================================================
   STATUS
========================================================= */

function showStatus(
  text,
  type = ""
) {

  feedbackStatus.textContent =
    text;

  feedbackStatus.classList.remove(
    "success-message",
    "error-message"
  );


  if (type === "success") {

    feedbackStatus.classList.add(
      "success-message"
    );
  }


  if (type === "error") {

    feedbackStatus.classList.add(
      "error-message"
    );
  }

}


/* =========================================================
   TEMPO RESTANTE
========================================================= */

function formatRemainingTime(
  milliseconds
) {

  const totalSeconds =
    Math.max(
      1,
      Math.ceil(
        milliseconds / 1000
      )
    );


  const minutes =
    Math.floor(
      totalSeconds / 60
    );


  const seconds =
    totalSeconds % 60;


  if (minutes > 0) {

    return (
      `${minutes} min ${seconds}s`
    );
  }


  return `${seconds}s`;

}


/* =========================================================
   CARREGAR USUÁRIO
========================================================= */

async function loadFeedbackUser(
  user
) {

  let accountName =
    user.email ||
    "Genome 3D User";

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
      await getDoc(
        userRef
      );


    if (
      userSnapshot.exists()
    ) {

      const userData =
        userSnapshot.data();


      if (userData.nickname) {

        accountName =
          userData.nickname;

        currentProfile.nickname =
          userData.nickname;
      }


      if (userData.photoData) {

        profilePhoto =
          userData.photoData;

        currentProfile.photoData =
          userData.photoData;
      }

    }

  } catch (error) {

    console.error(
      "Erro ao carregar perfil:",
      error
    );
  }


  if (feedbackUserName) {

    feedbackUserName.textContent =
      accountName;
  }


  /*
    O E-MAIL APARECE SOMENTE
    NESTA PÁGINA PRIVADA
  */

  if (feedbackUserEmail) {

    feedbackUserEmail.textContent =
      user.email || "";
  }


  if (feedbackUserPhoto) {

    feedbackUserPhoto.src =
      profilePhoto;
  }

}


/* =========================================================
   ENVIO
========================================================= */

async function sendFeedback(
  event
) {

  event.preventDefault();


  if (!currentUser) {
    return;
  }


  const type =
    feedbackType.value;


  const rating =
    Number(
      feedbackRating.value
    );


  const message =
    feedbackText.value.trim();


  /* VALIDAÇÕES */

  if (!type) {

    showStatus(
      getMessage(
        "selectType"
      ),
      "error"
    );

    return;
  }


  if (
    !rating ||
    rating < 1 ||
    rating > 5
  ) {

    showStatus(
      getMessage(
        "selectRating"
      ),
      "error"
    );

    return;
  }


  if (!message) {

    showStatus(
      getMessage(
        "writeMessage"
      ),
      "error"
    );

    return;
  }


  feedbackSubmitButton.disabled =
    true;


  showStatus(
    getMessage(
      "sending"
    )
  );


  try {

    const feedbackRef =
      doc(
        collection(
          db,
          "feedbacks"
        )
      );


    const cooldownRef =
      doc(
        db,
        "feedbackCooldowns",
        currentUser.uid
      );


    await runTransaction(
      db,
      async (transaction) => {

        const cooldownSnapshot =
          await transaction.get(
            cooldownRef
          );


        /*
          VALIDAÇÃO VISUAL DO COOLDOWN.
          AS REGRAS DO FIRESTORE
          TAMBÉM PROTEGEM ISSO.
        */

        if (
          cooldownSnapshot.exists()
        ) {

          const lastFeedbackAt =
            cooldownSnapshot
              .data()
              .lastFeedbackAt;


          if (lastFeedbackAt) {

            const nextAllowed =
              lastFeedbackAt
                .toMillis()
              + 5 * 60 * 1000;


            const remaining =
              nextAllowed -
              Date.now();


            if (remaining > 0) {

              const error =
                new Error(
                  "FEEDBACK_COOLDOWN"
                );


              error.remaining =
                remaining;


              throw error;
            }
          }
        }


        /*
          DOCUMENTO PÚBLICO DO FEEDBACK.

          ATENÇÃO:
          NÃO EXISTE CAMPO DE E-MAIL.
        */

        transaction.set(
          feedbackRef,
          {

            uid:
              currentUser.uid,

            nickname:
              currentProfile.nickname ||
              "Genome 3D User",

            photoData:
              currentProfile.photoData ||
              "",

            type:
              type,

            rating:
              rating,

            message:
              message,

            version:
              "0.1 BETA",

            createdAt:
              serverTimestamp()

          }
        );


        /*
          ATUALIZA HORÁRIO
          DO ÚLTIMO FEEDBACK
        */

        transaction.set(
          cooldownRef,
          {

            lastFeedbackAt:
              serverTimestamp()

          },
          {
            merge: true
          }
        );

      }
    );


    showStatus(
      getMessage(
        "sent"
      ),
      "success"
    );


    feedbackType.value =
      "";

    feedbackRating.value =
      "";

    feedbackText.value =
      "";


  } catch (error) {

    console.error(
      "Erro ao enviar feedback:",
      error
    );


    if (
      error.message ===
      "FEEDBACK_COOLDOWN"
    ) {

      const time =
        formatRemainingTime(
          error.remaining
        );


      showStatus(
        getMessage(
          "cooldown"
        ).replace(
          "{time}",
          time
        ),
        "error"
      );

    } else {

      showStatus(
        getMessage(
          "error"
        ),
        "error"
      );
    }

  } finally {

    feedbackSubmitButton.disabled =
      false;
  }

}


/* =========================================================
   FORMULÁRIO
========================================================= */

feedbackForm.addEventListener(
  "submit",
  sendFeedback
);


/* =========================================================
   AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.replace(
        "login.html?redirect=feedbacks"
      );

      return;
    }


    currentUser =
      user;


    await loadFeedbackUser(
      user
    );

  }
);
