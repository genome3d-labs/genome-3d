import {
  auth,
  db
} from "./firebase-config.js?v=3";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const feedbackList =
  document.getElementById("feedback-list");

const feedbackLoading =
  document.getElementById("feedback-list-loading");

const feedbackEmpty =
  document.getElementById("feedback-list-empty");

const feedbackTemplate =
  document.getElementById("feedback-card-template");


let feedbackDocuments = [];


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


/* =========================================================
   TRADUÇÃO DOS TIPOS
========================================================= */

function translateFeedbackType(type) {

  const language =
    getLanguage();


  const translations = {

    pt: {
      suggestion: "Sugestão",
      bug: "Problema / Bug",
      interface: "Interface",
      performance: "Desempenho",
      other: "Outro"
    },

    en: {
      suggestion: "Suggestion",
      bug: "Problem / Bug",
      interface: "Interface",
      performance: "Performance",
      other: "Other"
    }

  };


  return (
    translations[language][type]
    || type
  );
}


/* =========================================================
   FORMATAR DATA
========================================================= */

function formatFeedbackDate(timestamp) {

  if (!timestamp) {

    return getLanguage() === "en"
      ? "Date unavailable"
      : "Data indisponível";
  }


  const date =
    timestamp.toDate();


  const locale =
    getLanguage() === "en"
      ? "en-US"
      : "pt-BR";


  return new Intl.DateTimeFormat(
    locale,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);
}


/* =========================================================
   AVALIAÇÃO
========================================================= */

function createRating(rating) {

  const value =
    Math.max(
      1,
      Math.min(
        5,
        Number(rating) || 1
      )
    );


  const filledStars =
    "★".repeat(value);

  const emptyStars =
    "☆".repeat(5 - value);


  return `${filledStars}${emptyStars} ${value}/5`;
}


/* =========================================================
   CRIAR CARD
========================================================= */

function createFeedbackCard(data) {

  const fragment =
    feedbackTemplate.content.cloneNode(
      true
    );


  const photo =
    fragment.querySelector(
      ".community-feedback-photo"
    );

  const nickname =
    fragment.querySelector(
      ".community-feedback-nickname"
    );

  const date =
    fragment.querySelector(
      ".community-feedback-date"
    );

  const type =
    fragment.querySelector(
      ".community-feedback-type"
    );

  const version =
    fragment.querySelector(
      ".community-feedback-version"
    );

  const rating =
    fragment.querySelector(
      ".community-feedback-rating-value"
    );

  const message =
    fragment.querySelector(
      ".community-feedback-message"
    );


  /* =====================================================
     FOTO
  ====================================================== */

  if (data.photoData) {

    photo.src =
      data.photoData;

  } else {

    photo.src =
      "assets/perfil.jpg";

  }


  photo.alt =
    getLanguage() === "en"
      ? "Profile picture"
      : "Foto de perfil";


  /* =====================================================
     NICKNAME
  ====================================================== */

  nickname.textContent =
    data.nickname ||
    "Genome 3D User";


  /* =====================================================
     DATA
  ====================================================== */

  date.textContent =
    formatFeedbackDate(
      data.createdAt
    );


  /* =====================================================
     TIPO
  ====================================================== */

  type.textContent =
    translateFeedbackType(
      data.type
    );


  /* =====================================================
     VERSÃO
  ====================================================== */

  version.textContent =
    data.version
      ? `Genome 3D ${data.version}`
      : "Genome 3D";


  /* =====================================================
     AVALIAÇÃO
  ====================================================== */

  rating.textContent =
    createRating(
      data.rating
    );


  /* =====================================================
     MENSAGEM
  ====================================================== */

  /*
    IMPORTANTE:
    usamos textContent e NÃO innerHTML.

    Assim, o texto enviado pelo usuário é exibido
    somente como texto e não é executado como HTML.
  */

  message.textContent =
    data.message || "";


  return fragment;
}


/* =========================================================
   RENDERIZAR FEEDBACKS
========================================================= */

function renderFeedbacks() {

  feedbackList.innerHTML = "";


  if (
    feedbackDocuments.length === 0
  ) {

    feedbackLoading.hidden =
      true;

    feedbackEmpty.hidden =
      false;

    return;
  }


  feedbackLoading.hidden =
    true;

  feedbackEmpty.hidden =
    true;


  feedbackDocuments.forEach(
    (feedback) => {

      const card =
        createFeedbackCard(
          feedback
        );


      feedbackList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   CARREGAR FEEDBACKS DO FIRESTORE
========================================================= */

async function loadFeedbacks() {

  feedbackLoading.hidden =
    false;

  feedbackEmpty.hidden =
    true;


  try {

    const feedbackQuery =
      query(
        collection(
          db,
          "feedbacks"
        ),

        orderBy(
          "createdAt",
          "desc"
        )
      );


    const snapshot =
      await getDocs(
        feedbackQuery
      );


    feedbackDocuments =
      [];


    snapshot.forEach(
      (documentSnapshot) => {

        feedbackDocuments.push({

          id:
            documentSnapshot.id,

          ...documentSnapshot.data()

        });

      }
    );


    renderFeedbacks();


  } catch (error) {

    console.error(
      "Erro ao carregar feedbacks:",
      error
    );


    feedbackLoading.hidden =
      false;


    feedbackLoading.textContent =
      getLanguage() === "en"
        ? "Unable to load feedbacks."
        : "Não foi possível carregar os feedbacks.";

  }

}


/* =========================================================
   ATUALIZAR QUANDO O IDIOMA MUDAR
========================================================= */

const languageObserver =
  new MutationObserver(() => {

    if (
      feedbackDocuments.length > 0
    ) {

      renderFeedbacks();

    }

  });


languageObserver.observe(
  document.documentElement,
  {
    attributes: true,
    attributeFilter: [
      "lang"
    ]
  }
);


/* =========================================================
   AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(
  auth,
  async (user) => {

    /*
      PÁGINA DISPONÍVEL SOMENTE
      PARA USUÁRIOS LOGADOS
    */

    if (!user) {

      window.location.replace(
        "login.html?redirect=feedbacks"
      );

      return;
    }


    await loadFeedbacks();

  }
);
