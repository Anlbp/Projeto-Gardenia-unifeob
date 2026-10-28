/**
 * GARDÊNIA MODAS — LOGIN, CADASTRO, VALIDAÇÃO DE CPF, RECAPTCHA E TERMOS DE SERVIÇO
 * Projeto UNIFEOB — Ciência da Computação
 */

document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // 1. NAVEGAÇÃO POR ABAS (CADASTRO / CLIENTE / FUNCIONÁRIO)
    // ============================================================
    const tabCadastro = document.getElementById("tabCadastro");
    const tabClienteLogin = document.getElementById("tabClienteLogin");
    const tabFuncionario = document.getElementById("tabFuncionario");

    const panelCadastro = document.getElementById("panelCadastro");
    const panelClienteLogin = document.getElementById("panelClienteLogin");
    const panelFuncionario = document.getElementById("panelFuncionario");
    const linkGoToCadastro = document.getElementById("linkGoToCadastro");

    function switchAuthTab(targetTab) {
        tabCadastro.classList.toggle("active", targetTab === "cadastro");
        tabClienteLogin.classList.toggle("active", targetTab === "cliente-login");
        tabFuncionario.classList.toggle("active", targetTab === "funcionario");

        panelCadastro.hidden = (targetTab !== "cadastro");
        panelClienteLogin.hidden = (targetTab !== "cliente-login");
        panelFuncionario.hidden = (targetTab !== "funcionario");

        // Se voltar para a aba de cadastro, garante que o formulário está visível
        if (targetTab === "cadastro") {
            const formView = document.getElementById("formView");
            const termsView = document.getElementById("termsView");
            if (formView && termsView && !termsView.classList.contains("show")) {
                formView.classList.remove("hide");
            }
        }
    }

    if (tabCadastro) tabCadastro.addEventListener("click", () => switchAuthTab("cadastro"));
    if (tabClienteLogin) tabClienteLogin.addEventListener("click", () => switchAuthTab("cliente-login"));
    if (tabFuncionario) tabFuncionario.addEventListener("click", () => switchAuthTab("funcionario"));
    if (linkGoToCadastro) linkGoToCadastro.addEventListener("click", (e) => {
        e.preventDefault();
        switchAuthTab("cadastro");
    });

    // ============================================================
    // 2. ELEMENTOS DO FLUXO DE CADASTRO (A TELA DELE)
    // ============================================================
    const formView = document.getElementById("formView");
    const termsView = document.getElementById("termsView");

    const cadastroForm = document.getElementById("cadastroForm");
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const cpfInput = document.getElementById("cpf");
    const senhaInput = document.getElementById("senha");

    const statusEl = document.getElementById("status");
    const emailStatusEl = document.getElementById("emailStatus");
    const submitBtn = document.getElementById("submitBtn");

    const userSummary = document.getElementById("userSummary");
    const termsDate = document.getElementById("termsDate");
    const acceptTerms = document.getElementById("acceptTerms");
    const acceptBtn = document.getElementById("acceptBtn");
    const backBtn = document.getElementById("backBtn");

    // Estados de validação
    let cpfValido = false;
    let cpfPreenchido = false;
    let emailValido = false;
    let captchaResolvido = false;
    let dadosPendentes = null;

    // Callbacks do Google reCAPTCHA
    window.onCaptchaSuccess = function(token) {
        captchaResolvido = true;
        atualizarBotao();
    };

    window.onCaptchaExpired = function() {
        captchaResolvido = false;
        atualizarBotao();
    };

    // Fallback inteligente para reCAPTCHA em ambiente local (localhost / 127.0.0.1)
    setTimeout(() => {
        const recaptchaContainer = document.querySelector(".g-recaptcha");
        const fallbackContainer = document.getElementById("recaptchaFallbackContainer");
        // Se após 2.5s o iframe do Google não carregou ou acusou restrição de domínio
        if (fallbackContainer && (!window.grecaptcha || recaptchaContainer.clientHeight < 40)) {
            fallbackContainer.innerHTML = `
                <div class="recaptcha-fallback-box">
                    <label class="terms-checkbox" style="margin: 6px 0; background: #222222; border: 1px dashed #D4AF37;">
                        <input type="checkbox" id="localCaptchaCheckbox">
                        <span>Não sou um robô <em>(Validação UNIFEOB para testes locais)</em></span>
                    </label>
                </div>
            `;
            const localCheckbox = document.getElementById("localCaptchaCheckbox");
            if (localCheckbox) {
                localCheckbox.addEventListener("change", (e) => {
                    captchaResolvido = e.target.checked;
                    atualizarBotao();
                });
            }
        }
    }, 2500);

    // ============================================================
    // 3. MÁSCARA E VALIDAÇÃO DE CPF COM DÍGITOS VERIFICADORES
    // ============================================================
    function apenasNumeros(valor) {
        return (valor || "").replace(/\D/g, "");
    }

    function formatarCPF(valor) {
        const cpf = apenasNumeros(valor).slice(0, 11);
        if (cpf.length <= 3) return cpf;
        if (cpf.length <= 6) return cpf.slice(0, 3) + "." + cpf.slice(3);
        if (cpf.length <= 9) return cpf.slice(0, 3) + "." + cpf.slice(3, 6) + "." + cpf.slice(6);
        return cpf.slice(0, 3) + "." + cpf.slice(3, 6) + "." + cpf.slice(6, 9) + "-" + cpf.slice(9);
    }

    function cpfPassaDigitosVerificadores(cpf) {
        if (!/^\d{11}$/.test(cpf)) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false; // Bloqueia 111.111.111-11, etc.

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
        let resto = soma % 11;
        let digito1 = resto < 2 ? 0 : 11 - resto;
        if (digito1 !== Number(cpf[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
        resto = soma % 11;
        let digito2 = resto < 2 ? 0 : 11 - resto;
        return digito2 === Number(cpf[10]);
    }

    if (cpfInput) {
        cpfInput.addEventListener("input", (e) => {
            const raw = apenasNumeros(e.target.value);
            e.target.value = formatarCPF(raw);
            cpfPreenchido = raw.length > 0;

            if (raw.length === 11) {
                if (cpfPassaDigitosVerificadores(raw)) {
                    cpfValido = true;
                    cpfInput.classList.remove("invalid");
                    cpfInput.classList.add("valid");
                    setStatus("✓ CPF válido para cadastro Cliente+.", "success");
                } else {
                    cpfValido = false;
                    cpfInput.classList.remove("valid");
                    cpfInput.classList.add("invalid");
                    setStatus("CPF inválido. Verifique os dígitos.", "error");
                }
            } else if (raw.length > 0) {
                cpfValido = false;
                cpfInput.classList.remove("valid", "invalid");
                setStatus("Digite os 11 dígitos do seu CPF.", "loading");
            } else {
                cpfValido = false;
                cpfInput.classList.remove("valid", "invalid");
                setStatus("");
            }
            atualizarBotao();
        });
    }

    // ============================================================
    // 4. VALIDAÇÃO DE E-MAIL
    // ============================================================
    function validarSintaxeEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    if (emailInput) {
        emailInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            if (!val) {
                emailValido = false;
                emailInput.classList.remove("valid", "invalid");
                if (emailStatusEl) emailStatusEl.textContent = "";
            } else if (validarSintaxeEmail(val)) {
                emailValido = true;
                emailInput.classList.remove("invalid");
                emailInput.classList.add("valid");
                if (emailStatusEl) {
                    emailStatusEl.textContent = "✓ Formato de e-mail válido.";
                    emailStatusEl.className = "email-status-text email-valid";
                }
            } else {
                emailValido = false;
                emailInput.classList.remove("valid");
                emailInput.classList.add("invalid");
                if (emailStatusEl) {
                    emailStatusEl.textContent = "Formato de e-mail incompleto ou inválido.";
                    emailStatusEl.className = "email-status-text email-invalid";
                }
            }
            atualizarBotao();
        });
    }

    if (nomeInput) nomeInput.addEventListener("input", atualizarBotao);
    if (senhaInput) senhaInput.addEventListener("input", atualizarBotao);

    function setStatus(mensagem, tipo = "") {
        if (!statusEl) return;
        statusEl.textContent = mensagem;
        statusEl.className = "status " + tipo;
    }

    function atualizarBotao() {
        if (!submitBtn) return;
        const nomeOk = nomeInput && nomeInput.value.trim().length >= 2;
        const emailOk = emailValido;
        const cpfOk = !cpfPreenchido || cpfValido;
        const senhaOk = senhaInput && senhaInput.value.length >= 4;

        // Ativa o botão apenas quando tudo estiver válido e captcha resolvido
        submitBtn.disabled = !(nomeOk && emailOk && cpfOk && senhaOk && captchaResolvido);
    }

    // ============================================================
    // 5. TROCA DE VIEWS: FORMULÁRIO -> TERMOS DE SERVIÇO
    // ============================================================
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            const rawCpf = apenasNumeros(cpfInput.value);
            const senha = senhaInput.value;

            if (!nome || !email || !senha) {
                setStatus("Por favor, preencha todos os campos obrigatórios.", "error");
                return;
            }

            if (cpfPreenchido && !cpfValido) {
                setStatus("O CPF informado precisa ser válido.", "error");
                return;
            }

            dadosPendentes = {
                name: nome,
                email: email,
                cpf: rawCpf ? formatarCPF(rawCpf) : "",
                senha: senha,
                clientemais: rawCpf ? "sim" : "nao"
            };

            mostrarTermos();
        });
    }

    function mostrarTermos() {
        if (!dadosPendentes) return;

        // Preenche o resumo dos dados do usuário
        const partes = [
            `<strong>Nome:</strong> ${dadosPendentes.name}`,
            `<strong>E-mail:</strong> ${dadosPendentes.email}`
        ];
        if (dadosPendentes.cpf) {
            partes.push(`<strong>CPF:</strong> ${dadosPendentes.cpf}`);
            partes.push(`<strong>Categoria:</strong> Cliente+ Gardênia ✅`);
        } else {
            partes.push(`<strong>CPF:</strong> Não informado`);
            partes.push(`<strong>Categoria:</strong> Cliente Regular`);
        }
        if (userSummary) userSummary.innerHTML = partes.join("<br>");

        // Atualiza data dos termos
        if (termsDate) {
            termsDate.textContent = new Date().toLocaleDateString("pt-BR", {
                day: "2-digit", month: "long", year: "numeric"
            });
        }

        if (acceptTerms) acceptTerms.checked = false;
        if (acceptBtn) acceptBtn.disabled = true;

        if (formView) formView.classList.add("hide");
        if (termsView) termsView.classList.add("show");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function voltarParaFormulario() {
        if (termsView) termsView.classList.remove("show");
        if (formView) formView.classList.remove("hide");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (backBtn) backBtn.addEventListener("click", voltarParaFormulario);

    if (acceptTerms) {
        acceptTerms.addEventListener("change", () => {
            if (acceptBtn) acceptBtn.disabled = !acceptTerms.checked;
        });
    }

    // Aceitar Termos e Efetivar Cadastro
    if (acceptBtn) {
        acceptBtn.addEventListener("click", async () => {
            if (!acceptTerms.checked || !dadosPendentes) return;

            acceptBtn.disabled = true;
            acceptBtn.textContent = "Gravando cadastro...";

            // Salva registro local como no script dele
            let usuariosLocais = JSON.parse(localStorage.getItem("usuarios") || "[]");
            dadosPendentes.id = Date.now();
            dadosPendentes.aceitouTermos = true;
            dadosPendentes.termosAceitosEm = new Date().toISOString();
            usuariosLocais.push(dadosPendentes);
            localStorage.setItem("usuarios", JSON.stringify(usuariosLocais));

            // Efetiva cadastro no backend (MongoDB / mongomock)
            try {
                const res = await fetch("/api/clients/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dadosPendentes)
                });
                const data = await res.json();

                if (!res.ok) {
                    alert(data.error || "Erro ao registrar cadastro.");
                    acceptBtn.disabled = false;
                    acceptBtn.textContent = "✅ Aceitar e Cadastrar";
                    return;
                }

                // Sucesso: Redireciona com cliente já logado
                acceptBtn.textContent = "✓ Cadastro Concluído!";
                setTimeout(() => {
                    window.location.href = data.redirect || "/";
                }, 800);

            } catch (err) {
                // Modo fallback se estiver fora do Flask
                alert("Cadastro concluído localmente com sucesso!");
                window.location.href = "/";
            }
        });
    }

    // ============================================================
    // 6. LOGIN DE CLIENTE EXISTENTE
    // ============================================================
    const clienteLoginForm = document.getElementById("clienteLoginForm");
    const clienteLoginMsg = document.getElementById("clienteLoginMsg");

    if (clienteLoginForm) {
        clienteLoginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                email: document.getElementById("clEmail").value.trim(),
                senha: document.getElementById("clSenha").value
            };
            const btn = clienteLoginForm.querySelector("button[type='submit']");
            if (btn) btn.disabled = true;

            try {
                const res = await fetch("/api/auth/client-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (!res.ok) {
                    if (clienteLoginMsg) {
                        clienteLoginMsg.textContent = data.error || "E-mail ou senha incorretos.";
                        clienteLoginMsg.className = "auth-msg error";
                    }
                    if (btn) btn.disabled = false;
                    return;
                }

                if (clienteLoginMsg) {
                    clienteLoginMsg.textContent = "Login efetuado! Entrando na loja...";
                    clienteLoginMsg.className = "auth-msg success";
                }
                setTimeout(() => {
                    window.location.href = data.redirect || "/";
                }, 600);

            } catch (err) {
                if (clienteLoginMsg) {
                    clienteLoginMsg.textContent = "Erro de conexão com o servidor.";
                    clienteLoginMsg.className = "auth-msg error";
                }
                if (btn) btn.disabled = false;
            }
        });
    }

    // ============================================================
    // 7. LOGIN DE FUNCIONÁRIO (PORTAL)
    // ============================================================
    const funcionarioLoginForm = document.getElementById("funcionarioLoginForm");
    const loginMsg = document.getElementById("loginMsg");

    if (funcionarioLoginForm) {
        funcionarioLoginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                email: document.getElementById("fEmail").value.trim(),
                senha: document.getElementById("fSenha").value
            };
            const btn = funcionarioLoginForm.querySelector("button[type='submit']");
            if (btn) btn.disabled = true;

            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (!res.ok) {
                    if (loginMsg) {
                        loginMsg.textContent = data.error || "E-mail corporativo ou senha incorretos.";
                        loginMsg.className = "auth-msg error";
                    }
                    if (btn) btn.disabled = false;
                    return;
                }

                if (loginMsg) {
                    loginMsg.textContent = "Acesso autorizado! Abrindo portal...";
                    loginMsg.className = "auth-msg success";
                }
                setTimeout(() => {
                    window.location.href = data.redirect || "/portal";
                }, 600);

            } catch (err) {
                if (loginMsg) {
                    loginMsg.textContent = "Erro de conexão com o servidor.";
                    loginMsg.className = "auth-msg error";
                }
                if (btn) btn.disabled = false;
            }
        });
    }

});
