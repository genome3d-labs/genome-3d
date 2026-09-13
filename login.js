import { auth } from "./firebase-config.js?v=3";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", () => {

  const form =
    document.getElementById("login-form");

  const email =
    document.getElementById("usuario");

  const password =
    document.getElementById("senha");

  const remember =
    document.querySelector(".remember input");

  const message =
    document.getElementById("login-message");

  const forgot =
    document.getElementById("forgot-link");

  const submitButton =
    form.querySelector('button[type="submit"]');


  function mostrarErro(texto) {

    message.textContent = texto;

    message.classList.remove(
      "success-message"
    );

    message.classList.add(
      "error-message"
    );
  }


  function mostrarSucesso(texto) {

    message.textContent = texto;

    message.classList.remove(
      "error-message"
    );

    message.classList.add(
      "success-message"
    );
  }


  function traduzirErro(codigo) {

    switch (codigo) {

      case "auth/invalid-email":
        return "Digite um endereço de e-mail válido.";

      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "E-mail ou senha incorretos.";

      case "auth/too-many-requests":
        return "Muitas tentativas de login. Aguarde alguns minutos.";

      case "auth/network-request-failed":
        return "Não foi possível conectar ao servidor. Verifique sua internet.";

      default:
        return "Não foi possível entrar. Verifique seus dados e tente novamente.";
    }
  }


  // ==========================================
  // LOGIN
  // ==========================================

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      message.textContent = "";

      const emailValor =
        email.value.trim();

      const senhaValor =
        password.value;


      if (!emailValor) {

        mostrarErro(
          "Informe seu e-mail."
        );

        email.focus();

        return;
      }


      if (!senhaValor) {

        mostrarErro(
          "Informe sua senha."
        );

        password.focus();

        return;
      }


      try {

        submitButton.disabled = true;
        submitButton.textContent =
          "Entrando...";


        // Lembrar neste computador
        await setPersistence(
          auth,

          remember.checked
            ? browserLocalPersistence
            : browserSessionPersistence
        );


        const credencial =
          await signInWithEmailAndPassword(
            auth,
            emailValor,
            senhaValor
          );


        const user =
          credencial.user;


        mostrarSucesso(
          "Login realizado com sucesso."
        );


        console.log(
          "Usuário conectado:",
          user.email
        );


        setTimeout(() => {

          window.location.href =
            "index.html";

        }, 700);


      } catch (error) {

        console.error(
          "Erro no login:",
          error
        );

        mostrarErro(
          traduzirErro(error.code)
        );


        submitButton.disabled = false;
        submitButton.textContent =
          "Entrar";
      }

    }
  );


  // ==========================================
  // ESQUECI MINHA SENHA
  // ==========================================

  forgot.addEventListener(
    "click",
    async (event) => {

      event.preventDefault();

      const emailValor =
        email.value.trim();


      if (!emailValor) {

        mostrarErro(
          "Digite seu e-mail acima para recuperar sua senha."
        );

        email.focus();

        return;
      }


      try {

        await sendPasswordResetEmail(
          auth,
          emailValor
        );


        mostrarSucesso(
          "Enviamos um e-mail para redefinir sua senha."
        );


      } catch (error) {

        console.error(
          "Erro na recuperação de senha:",
          error
        );


        if (
          error.code ===
          "auth/invalid-email"
        ) {

          mostrarErro(
            "Digite um endereço de e-mail válido."
          );

        } else {

          mostrarErro(
            "Não foi possível enviar o e-mail de recuperação."
          );
        }

      }

    }
  );

});
