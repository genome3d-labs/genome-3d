document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  const email = document.getElementById("register-email");
  const password = document.getElementById("register-password");
  const passwordConfirm = document.getElementById("register-password-confirm");
  const terms = document.getElementById("accept-terms");

  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const confirmError = document.getElementById("confirm-error");
  const termsError = document.getElementById("terms-error");
  const registerMessage = document.getElementById("register-message");

  function limparErros() {
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";
    termsError.textContent = "";
    registerMessage.textContent = "";

    email.classList.remove("input-error");
    password.classList.remove("input-error");
    passwordConfirm.classList.remove("input-error");
  }

  function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  function mostrarErro(elemento, mensagem, campo) {
    elemento.textContent = mensagem;

    if (campo) {
      campo.classList.add("input-error");
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    limparErros();

    const emailValor = email.value.trim();
    const senhaValor = password.value;
    const confirmacaoValor = passwordConfirm.value;

    let valido = true;
    let primeiroCampoComErro = null;

    // ================================
    // E-MAIL
    // ================================

    if (emailValor === "") {
      mostrarErro(
        emailError,
        "Informe seu e-mail.",
        email
      );

      valido = false;
      primeiroCampoComErro ??= email;
    }

    else if (!emailValido(emailValor)) {
      mostrarErro(
        emailError,
        "Digite um endereço de e-mail válido.",
        email
      );

      valido = false;
      primeiroCampoComErro ??= email;
    }


    // ================================
    // SENHA
    // ================================

    if (senhaValor === "") {
      mostrarErro(
        passwordError,
        "Crie uma senha.",
        password
      );

      valido = false;
      primeiroCampoComErro ??= password;
    }

    else if (senhaValor.length < 6) {
      mostrarErro(
        passwordError,
        "A senha deve possuir pelo menos 6 caracteres.",
        password
      );

      valido = false;
      primeiroCampoComErro ??= password;
    }


    // ================================
    // CONFIRMAÇÃO DA SENHA
    // ================================

    if (confirmacaoValor === "") {
      mostrarErro(
        confirmError,
        "Confirme sua senha.",
        passwordConfirm
      );

      valido = false;
      primeiroCampoComErro ??= passwordConfirm;
    }

    else if (senhaValor !== confirmacaoValor) {
      mostrarErro(
        confirmError,
        "As senhas informadas não coincidem.",
        passwordConfirm
      );

      valido = false;
      primeiroCampoComErro ??= passwordConfirm;
    }


    // ================================
    // TERMOS
    // ================================

    if (!terms.checked) {
      termsError.textContent =
        "Você precisa aceitar os Termos e Condições para continuar.";

      valido = false;

      if (!primeiroCampoComErro) {
        primeiroCampoComErro = terms;
      }
    }


    // ================================
    // EXISTE ALGUM ERRO?
    // ================================

    if (!valido) {
      registerMessage.textContent =
        "Verifique os campos destacados antes de continuar.";

      registerMessage.classList.remove("success-message");
      registerMessage.classList.add("error-message");

      if (primeiroCampoComErro) {
        primeiroCampoComErro.focus();
      }

      return;
    }


    // ================================
    // FORMULÁRIO VALIDADO
    // ================================

    registerMessage.textContent =
      "Dados validados. Cadastro pronto para ser enviado.";

    registerMessage.classList.remove("error-message");
    registerMessage.classList.add("success-message");

    /*
      IMPORTANTE:

      É aqui que vamos conectar o Firebase.

      Quando a conta for realmente criada:
      1. o usuário ficará autenticado;
      2. será redirecionado para index.html;
      3. o site reconhecerá que ele está logado;
      4. o download do Genome 3D será liberado.

      Não redirecionamos ainda porque neste momento
      nenhuma conta real foi criada.
    */
  });


  // ==================================
  // REMOVE ERRO ENQUANTO DIGITA
  // ==================================

  email.addEventListener("input", () => {
    emailError.textContent = "";
    email.classList.remove("input-error");
  });

  password.addEventListener("input", () => {
    passwordError.textContent = "";
    password.classList.remove("input-error");

    if (
      passwordConfirm.value !== "" &&
      password.value === passwordConfirm.value
    ) {
      confirmError.textContent = "";
      passwordConfirm.classList.remove("input-error");
    }
  });

  passwordConfirm.addEventListener("input", () => {
    confirmError.textContent = "";
    passwordConfirm.classList.remove("input-error");
  });

  terms.addEventListener("change", () => {
    if (terms.checked) {
      termsError.textContent = "";
    }
  });
});
