document.addEventListener('DOMContentLoaded', () => {

  /* ---------- alternar entre as abas "Cliente" / "Funcionário" ---------- */
  const tabCliente = document.getElementById('tabCliente');
  const tabFuncionario = document.getElementById('tabFuncionario');
  const panelCliente = document.getElementById('panelCliente');
  const panelFuncionario = document.getElementById('panelFuncionario');

  function showTab(tab){
    const isCliente = tab === 'cliente';
    tabCliente.classList.toggle('active', isCliente);
    tabFuncionario.classList.toggle('active', !isCliente);
    panelCliente.hidden = !isCliente;
    panelFuncionario.hidden = isCliente;
  }
  tabCliente.addEventListener('click', () => showTab('cliente'));
  tabFuncionario.addEventListener('click', () => showTab('funcionario'));

  /* ---------- alternar, dentro da aba Cliente, entre "Entrar" e "Criar cadastro" ---------- */
  const clienteLoginView = document.getElementById('clienteLoginView');
  const clienteCadastroView = document.getElementById('clienteCadastroView');
  const goToCadastro = document.getElementById('goToCadastro');
  const goToClienteLogin = document.getElementById('goToClienteLogin');

  function showClienteView(view){
    const isLogin = view === 'login';
    clienteLoginView.hidden = !isLogin;
    clienteCadastroView.hidden = isLogin;
  }
  goToCadastro.addEventListener('click', (e) => { e.preventDefault(); showClienteView('cadastro'); });
  goToClienteLogin.addEventListener('click', (e) => { e.preventDefault(); showClienteView('login'); });

  /* ---------- helper para mensagens dos formulários ---------- */
  function setMsg(el, text, kind){
    el.textContent = text;
    el.className = 'auth-msg' + (kind ? ' '+kind : '');
  }

  /* ---------- login do cliente ---------- */
  const clienteLoginForm = document.getElementById('clienteLoginForm');
  const clienteLoginMsg = document.getElementById('clienteLoginMsg');

  clienteLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      email: document.getElementById('clEmail').value.trim(),
      senha: document.getElementById('clSenha').value,
    };
    const btn = clienteLoginForm.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!res.ok){
        setMsg(clienteLoginMsg, data.error || 'E-mail ou senha inválidos.', 'error');
        btn.disabled = false;
        return;
      }
      setMsg(clienteLoginMsg, 'Login realizado! Redirecionando...', 'success');
      window.location.href = data.redirect || '/';
    } catch(err){
      setMsg(clienteLoginMsg, 'Erro de conexão com o servidor. Tente novamente.', 'error');
      btn.disabled = false;
    }
  });

  /* ---------- cadastro de cliente ---------- */
  const cadastroForm = document.getElementById('cadastroForm');
  const cadastroMsg = document.getElementById('cadastroMsg');

  cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('cNome').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      birth_date: document.getElementById('cNascimento').value,
      cpf: document.getElementById('cCpf').value.trim(),
      phone: document.getElementById('cTelefone').value.trim(),
      senha: document.getElementById('cSenha').value,
    };

    if(Object.values(payload).some(v => !v)){
      setMsg(cadastroMsg, 'Preencha todos os campos para continuar.', 'error');
      return;
    }
    if(payload.senha.length < 4){
      setMsg(cadastroMsg, 'A senha precisa ter pelo menos 4 caracteres.', 'error');
      return;
    }

    const btn = cadastroForm.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const res = await fetch('/api/clients/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!res.ok){
        setMsg(cadastroMsg, data.error || 'Não foi possível concluir o cadastro.', 'error');
        return;
      }
      setMsg(cadastroMsg, 'Cadastro realizado! Redirecionando para o login...', 'success');
      cadastroForm.reset();
      setTimeout(() => {
        document.getElementById('clEmail').value = payload.email;
        showClienteView('login');
        setMsg(cadastroMsg, '', null);
      }, 1400);
    } catch(err){
      setMsg(cadastroMsg, 'Erro de conexão com o servidor. Tente novamente.', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- login de funcionário ---------- */
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      email: document.getElementById('fEmail').value.trim(),
      senha: document.getElementById('fSenha').value,
    };

    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!res.ok){
        setMsg(loginMsg, data.error || 'E-mail ou senha inválidos.', 'error');
        btn.disabled = false;
        return;
      }
      setMsg(loginMsg, 'Login realizado! Redirecionando...', 'success');
      window.location.href = data.redirect || '/portal';
    } catch(err){
      setMsg(loginMsg, 'Erro de conexão com o servidor. Tente novamente.', 'error');
      btn.disabled = false;
    }
  });

});
