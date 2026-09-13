import { auth } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("register-form");

  const email = document.getElementById("register-email");
  const password = document.getElementById("register-password");
  const passwordConfirm = document.getElementById(
    "register-password-confirm"
  );

  const terms = document.getElementById("accept-terms");

  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const confirmError = document.getElementById("confirm-error");
  const termsError = document.getElementById("terms-error");

  const registerMessage =
    document.getElementById("register-message");

  const submitButton =
    form.querySelector('button[type="submit"]');


  function limparErros() {

    emailError.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";
    termsError.textContent = "";
    registerMessage.textContent = "";

    email.classList.remove("input-error");
    password.classList.remove("input-error");
    passwordConfirm.classList.remove("input-error");

    registerMessage.classList.remove(
      "error-message",
      "success-message"
    );
  }


  function emailValido(valor) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }


  function senhaValida(senha) {

    const minimo = senha.length >= 10;
    const maiuscula = /[A-Z]/.test(senha);
    const minuscula = /[a-z]/.test(senha);
    const numero = /[0-9]/.test(senha);
    const especial = /[^A-Za-z0-9]/.test(senha);

    return (
      minimo &&
      maiuscula &&
      minuscula &&
      numero &&
      especial
    );
  }


  function mostrarErro(elemento, mensagem, campo) {

    elemento.textContent = mensagem;

    if (campo) {
      campo.classList.add("input-error");
    }
  }


  function traduzirErroFirebase(codigo) {

    switch (codigo) {

      case "auth/email-already-in-use":
        return "Já existe uma conta cadastrada com este e-mail.";

      case "auth/invalid-email":
        return "O endereço de e-mail informado não é válido.";

      case "auth/weak-password":
        return "A senha não atende aos requisitos de segurança.";

      case "auth/network-request-failed":
        return "Não foi possível conectar ao servidor. Verifique sua internet.";

      case "auth/too-many-requests":
        return "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.";

      case "auth/operation-not-allowed":
        return "O cadastro por e-mail e senha não está disponível no momento.";

      default:
        return "Não foi possível criar a conta. Tente novamente.";
    }
  }


  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    limparErros();

    const emailValor = email.value.trim();
    const senhaValor = password.value;
    const confirmacaoValor = passwordConfirm.value;

    let valido = true;
    let primeiroCampoComErro = null;


    // ========================================
    // E-MAIL
    // ========================================

    if (emailValor === "") {

      mostrarErro(
        emailError,
        "Informe seu e-mail.",
        email
      );

      valido = false;
      primeiroCampoComErro ??= email;

    } else if (!emailValido(emailValor)) {

      mostrarErro(
        emailError,
        "Digite um endereço de e-mail válido.",
        email
      );

      valido = false;
      primeiroCampoComErro ??= email;
    }


    // ========================================
    // SENHA
    // ========================================

    if (senhaValor === "") {

      mostrarErro(
        passwordError,
        "Crie uma senha.",
        password
      );

      valido = false;
      primeiroCampoComErro ??= password;

    } else if (!senhaValida(senhaValor)) {

      mostrarErro(
        passwordError,
        "Use pelo menos 10 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.",
        password
      );

      valido = false;
      primeiroCampoComErro ??= password;
    }


    // ========================================
    // CONFIRMAÇÃO DA SENHA
    // ========================================

    if (confirmacaoValor === "") {

      mostrarErro(
        confirmError,
        "Confirme sua senha.",
        passwordConfirm
      );

      valido = false;
      primeiroCampoComErro ??= passwordConfirm;

    } else if (senhaValor !== confirmacaoValor) {

      mostrarErro(
        confirmError,
        "As senhas informadas não coincidem.",
        passwordConfirm
      );

      valido = false;
      primeiroCampoComErro ??= passwordConfirm;
    }


    // ========================================
    // TERMOS
    // ========================================

    if (!terms.checked) {

      termsError.textContent =
        "Você precisa aceitar os Termos e Condições para continuar.";

      valido = false;

      primeiroCampoComErro ??= terms;
    }


    // ========================================
    // ERROS NO FORMULÁRIO
    // ========================================

    if (!valido) {

      registerMessage.textContent =
        "Verifique os campos destacados antes de continuar.";

      registerMessage.classList.add("error-message");

      if (primeiroCampoComErro) {
        primeiroCampoComErro.focus();
      }

      return;
    }


    // ========================================
    // CRIAÇÃO DA CONTA NO FIREBASE
    // ========================================

    try {

      submitButton.disabled = true;
      submitButton.textContent = "Criando conta...";

      registerMessage.textContent =
        "Criando sua conta...";


      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          emailValor,
          senhaValor
        );


      const usuario = credencial.user;


      // ======================================
      // E-MAIL DE VERIFICAÇÃO
      // ======================================

      try {

        await sendEmailVerification(usuario);

      } catch (erroVerificacao) {

        console.error(
          "Erro ao enviar verificação:",
          erroVerificacao
        );
      }


      registerMessage.textContent =
        "Conta criada com sucesso! Enviamos um e-mail de confirmação.";

      registerMessage.classList.add(
        "success-message"
      );


      // Usuário já está autenticado pelo Firebase.
      // Agora retornamos para a página inicial.

      setTimeout(() => {

        window.location.href = "index.html";

      }, 1800);


    } catch (erro) {

      console.error(
        "Erro no cadastro:",
        erro
      );

      registerMessage.textContent =
        traduzirErroFirebase(erro.code);

      registerMessage.classList.add(
        "error-message"
      );

      submitButton.disabled = false;
      submitButton.textContent = "Cadastrar";
    }
  });


  // ========================================
  // LIMPAR ERROS ENQUANTO DIGITA
  // ========================================

  email.addEventListener("input", () => {

    emailError.textContent = "";
    email.classList.remove("input-error");
  });


  password.addEventListener("input", () => {

    passwordError.textContent = "";
    password.classList.remove("input-error");
  });


  passwordConfirm.addEventListener("input", () => {

    confirmError.textContent = "";
    passwordConfirm.classList.remove(
      "input-error"
    );
  });


  terms.addEventListener("change", () => {

    if (terms.checked) {
      termsError.textContent = "";
    }
  });

});
