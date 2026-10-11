/* =====================================================================
   Gardênia Modas — front-end conectado à API Flask (mesma origem: /api/*)
   ===================================================================== */
const MODULES = ['Clientes','Estoque','Vendas','Métricas','Financeiro','Funcionários'];

const state = {
  clients: [],       // resultado da busca atual (view Clientes)
  products: [],
  employees: [],
  sales: [],
  cart: [],           // carrinho é só local até "Finalizar venda"
  financeRows: [],
};

/* ---------- helper de chamada à API ---------- */
async function api(path, options={}){
  const res = await fetch(path, Object.assign(
    { headers: {'Content-Type':'application/json'} }, options
  ));
  if(res.status===401){
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }
  if(!res.ok){
    let msg = 'Erro '+res.status;
    try{ const j = await res.json(); if(j.error) msg = j.error; }catch(e){}
    throw new Error(msg);
  }
  if(res.status===204) return null;
  return res.json();
}

/* ===================== NAVIGATION ===================== */
const titles = {
  inicio:['Início','Terça-feira, 16 de setembro'],
  clientes:['Clientes','Consulta de cadastro e histórico de compras'],
  estoque:['Estoque','Produtos, quantidades e etiquetas'],
  vendas:['Vendas','Caixa da loja'],
  metricas:['Métricas de Vendas','Desempenho em tempo real'],
  financeiro:['Financeiro','Entradas e saídas'],
  funcionarios:['Funcionários','Equipe e permissões'],
};

function navigate(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+view).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===view));
  document.getElementById('header-title').textContent = titles[view][0];
  document.getElementById('header-sub').textContent = titles[view][1];
  window.scrollTo(0,0);
  if(view==='metricas') initMetrics();
}

/* ===================== CLIENTES (busca em tempo real via API) ===================== */
let clientSearchTimer = null;

function onClientSearchInput(){
  clearTimeout(clientSearchTimer);
  const q = document.getElementById('client-search').value.trim();
  clientSearchTimer = setTimeout(()=>fetchClients(q), 150); // debounce leve
}

async function fetchClients(q){
  try{
    const list = await api('/api/clients'+(q ? '?q='+encodeURIComponent(q) : ''));
    state.clients = list;
    renderClients(q);
  }catch(e){ console.error(e); }
}

function renderClients(q){
  const list = document.getElementById('client-list');
  const countEl = document.getElementById('client-count');
  countEl.textContent = q ? state.clients.length+' resultado(s) para "'+q+'"' : state.clients.length+' clientes cadastrados';

  if(state.clients.length===0){
    list.innerHTML = '<div class="empty-state">Nenhum cliente encontrado</div>';
    return;
  }
  list.innerHTML = state.clients.map(c=>{
    const total = c.purchases.reduce((s,p)=>s+p.total,0);
    return `
    <div class="list-row">
      <div>
        <div class="client-name">${c.name}</div>
        <div class="client-meta"><span>${c.phone}</span><span>${c.cpf}</span></div>
      </div>
      <div class="client-spend">
        <div class="amt">R$ ${total.toLocaleString('pt-BR')}</div>
        <div class="lbl">${c.purchases.length} compra(s)</div>
      </div>
    </div>`;
  }).join('');
}

/* ===================== ESTOQUE ===================== */
function renderProducts(){
  const tbody = document.getElementById('product-tbody');
  tbody.innerHTML = state.products.map(p=>`
    <tr>
      <td><strong>${p.name}</strong></td>
      <td style="color:var(--ink-soft);font-size:12px;">${p.sku}</td>
      <td>${p.category}</td>
      <td>${p.size} · ${p.color}</td>
      <td>R$ ${p.price.toFixed(2).replace('.',',')}</td>
      <td>
        <div class="qty-control">
          <button onclick="changeQty('${p.sku}',-1)">−</button>
          <span>${p.qty}</span>
          <button onclick="changeQty('${p.sku}',1)">+</button>
        </div>
      </td>
      <td><button class="btn btn-sm" onclick="openLabel('${p.sku}')">Etiqueta</button></td>
    </tr>
  `).join('');
}

async function changeQty(sku, delta){
  try{
    const updated = await api('/api/products/'+encodeURIComponent(sku), {
      method:'PATCH', body: JSON.stringify({delta})
    });
    const idx = state.products.findIndex(p=>p.sku===sku);
    if(idx>-1) state.products[idx] = updated;
    renderProducts();
    refreshSummary();
  }catch(e){ alert('Não foi possível atualizar o estoque: '+e.message); }
}

function openProductModal(){ document.getElementById('modal-product').classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

async function saveProduct(){
  const name = document.getElementById('np-name').value.trim();
  if(!name){ alert('Digite o nome do produto.'); return; }
  const payload = {
    name,
    sku: document.getElementById('np-sku').value.trim(),
    category: document.getElementById('np-cat').value,
    size: document.getElementById('np-size').value,
    color: document.getElementById('np-color').value,
    price: parseFloat(document.getElementById('np-price').value)||0,
    qty: parseInt(document.getElementById('np-qty').value)||0,
  };
  try{
    const created = await api('/api/products', {method:'POST', body: JSON.stringify(payload)});
    state.products.push(created);
    ['np-name','np-sku','np-size','np-color','np-price','np-qty'].forEach(id=>document.getElementById(id).value='');
    closeModal('modal-product');
    renderProducts();
    renderCatalog();
    refreshSummary();
  }catch(e){ alert('Não foi possível salvar o produto: '+e.message); }
}

function openLabel(sku){
  const p = state.products.find(pr=>pr.sku===sku);
  if(!p) return;
  document.getElementById('etiqueta-content').innerHTML = `
    <div class="loja">GARDÊNIA MODAS</div>
    <div class="nome">${p.name} — ${p.size}</div>
    <div class="preco">R$ ${p.price.toFixed(2).replace('.',',')}</div>
    <svg id="barcode-svg"></svg>
  `;
  document.getElementById('modal-label').classList.add('open');
  try{ JsBarcode('#barcode-svg', p.sku, {format:'CODE128', height:42, width:1.6, fontSize:11, margin:0}); }catch(e){}
}

/* ===================== VENDAS / CAIXA ===================== */
function renderCatalog(){
  document.getElementById('catalog-grid').innerHTML = state.products.map(p=>`
    <div class="catalog-chip" onclick="addToCart('${p.sku}')">
      ${p.name}<span class="sku">R$ ${p.price.toFixed(2).replace('.',',')} · ${p.sku}</span>
    </div>
  `).join('');
}

function scanAdd(){
  const input = document.getElementById('scan-input');
  const code = input.value.trim();
  const msg = document.getElementById('scan-msg');
  if(!code) return;
  const found = addToCart(code);
  msg.textContent = found ? 'Adicionado: '+found : 'Produto não encontrado para o código "'+code+'"';
  msg.className = 'scan-msg '+(found?'ok':'err');
  input.value = '';
  input.focus();
}

function addToCart(sku){
  const p = state.products.find(pr=>pr.sku===sku);
  if(!p) return null;
  const existing = state.cart.find(c=>c.sku===sku);
  if(existing) existing.qty++;
  else state.cart.push({sku:p.sku, name:p.name, price:p.price, qty:1});
  renderCart();
  return p.name;
}

function removeFromCart(i){ state.cart.splice(i,1); renderCart(); }

function renderCart(){
  const tbody = document.getElementById('cart-tbody');
  if(state.cart.length===0){
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Carrinho vazio — escaneie um produto para começar</td></tr>';
  } else {
    tbody.innerHTML = state.cart.map((c,i)=>`
      <tr>
        <td>${c.name}</td>
        <td>${c.qty}</td>
        <td>R$ ${c.price.toFixed(2).replace('.',',')}</td>
        <td>R$ ${(c.qty*c.price).toFixed(2).replace('.',',')}</td>
        <td><button class="btn btn-sm btn-ghost btn-danger" onclick="removeFromCart(${i})">Remover</button></td>
      </tr>
    `).join('');
  }
  const total = state.cart.reduce((s,c)=>s+c.qty*c.price,0);
  document.getElementById('cart-total').textContent = 'R$ '+total.toFixed(2).replace('.',',');
}

function clearCart(){ state.cart=[]; renderCart(); }

async function finalizeSale(){
  if(state.cart.length===0) return;
  const payload = { items: state.cart.map(c=>({sku:c.sku, qty:c.qty})) };
  const msg = document.getElementById('scan-msg');
  try{
    const sale = await api('/api/sales', {method:'POST', body: JSON.stringify(payload)});
    state.sales.unshift(sale);
    state.products = await api('/api/products'); // sincroniza estoque após a baixa
    clearCart();
    renderProducts();
    renderCatalog();
    refreshSummary();
    if(document.getElementById('view-metricas').classList.contains('active')){
      await refreshMetricLists();
      await refreshCharts();
    }
    msg.textContent = 'Venda finalizada: R$ '+sale.total.toFixed(2).replace('.',',');
    msg.className = 'scan-msg ok';
  }catch(e){
    msg.textContent = 'Não foi possível fechar a venda: '+e.message;
    msg.className = 'scan-msg err';
  }
}

/* ===================== MÉTRICAS ===================== */
let metricsLoaded = false;

async function initMetrics(){
  await refreshMetricLists();
  await refreshCharts();
  metricsLoaded = true;
}

async function refreshMetricLists(){
  try{
    const [recent, top] = await Promise.all([
      api('/api/metrics/recent-sales'),
      api('/api/metrics/top-products'),
    ]);
    document.getElementById('recent-sales').innerHTML = recent.map(s=>`
      <div class="list-row" style="cursor:default;">
        <div><div class="client-name" style="font-size:13px;">${s.label}</div><div class="client-meta"><span>${s.items} item(ns)</span><span>${s.time}</span></div></div>
        <div class="client-spend"><div class="amt">R$ ${s.total.toFixed(2).replace('.',',')}</div></div>
      </div>
    `).join('') || '<div class="empty-state">Sem vendas registradas ainda</div>';

    document.getElementById('top-products').innerHTML = top.map(t=>`
      <div class="list-row" style="cursor:default;">
        <div class="client-name" style="font-size:13px;">${t.name}</div>
        <div class="client-spend"><div class="amt">${t.qty}×</div></div>
      </div>
    `).join('') || '<div class="empty-state">Sem vendas registradas ainda</div>';
  }catch(e){ console.error(e); }
}

async function refreshCharts(){
  if(typeof Chart==='undefined') return;
  try{
    const [week, cats] = await Promise.all([
      api('/api/metrics/week'),
      api('/api/metrics/categories'),
    ]);

    if(!window.weekChart){
      window.weekChart = new Chart(document.getElementById('chart-week'), {
        type:'bar',
        data:{labels:week.labels, datasets:[{data:week.data, backgroundColor:'#6d9c62', borderRadius:6}]},
        options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, grid:{color:'#e5efe1'}}, x:{grid:{display:false}}}}
      });
    } else {
      window.weekChart.data.labels = week.labels;
      window.weekChart.data.datasets[0].data = week.data;
      window.weekChart.update();
    }

    const palette = ['#6d9c62','#9dc691','#cfe3c8','#3f6338','#b5793f','#c8583f'];
    if(!window.catChart){
      window.catChart = new Chart(document.getElementById('chart-cat'), {
        type:'doughnut',
        data:{labels:cats.labels, datasets:[{data:cats.data, backgroundColor:palette}]},
        options:{plugins:{legend:{position:'bottom', labels:{boxWidth:10,font:{size:11}}}}}
      });
    } else {
      window.catChart.data.labels = cats.labels;
      window.catChart.data.datasets[0].data = cats.data;
      window.catChart.update();
    }
  }catch(e){ console.error(e); }
}

/* ===================== FINANCEIRO ===================== */
async function loadFinance(){
  state.financeRows = await api('/api/finance');
  renderFinance();
}

function renderFinance(){
  const tbody = document.getElementById('finance-tbody');
  tbody.innerHTML = state.financeRows.map((r,i)=>`
    <tr>
      <td contenteditable="true" onblur="editFinance(${i},'date',this.textContent)">${r.date}</td>
      <td contenteditable="true" onblur="editFinance(${i},'desc',this.textContent)">${r.desc}</td>
      <td contenteditable="true" onblur="editFinance(${i},'cat',this.textContent)">${r.cat}</td>
      <td contenteditable="true" onblur="editFinance(${i},'in',this.textContent)" style="color:var(--sage-600);">${r.in? 'R$ '+r.in.toFixed(2).replace('.',','):''}</td>
      <td contenteditable="true" onblur="editFinance(${i},'out',this.textContent)" style="color:var(--danger);">${r.out? 'R$ '+r.out.toFixed(2).replace('.',','):''}</td>
      <td><button class="btn btn-sm btn-ghost btn-danger" onclick="removeFinance(${i})">Remover</button></td>
    </tr>
  `).join('');
  const balance = state.financeRows.reduce((s,r)=>s+r.in-r.out,0);
  const balEl = document.getElementById('finance-balance');
  balEl.textContent = 'R$ '+balance.toFixed(2).replace('.',',');
  balEl.style.color = balance>=0 ? 'var(--sage-600)' : 'var(--danger)';
}

async function editFinance(i,field,val){
  const row = state.financeRows[i];
  if(!row) return;
  if(field==='in'||field==='out'){ row[field] = parseFloat(val.replace(/[^\d,.-]/g,'').replace(',','.'))||0; }
  else row[field]=val.trim();
  renderFinance();
  try{ await api('/api/finance/'+row.id, {method:'PUT', body: JSON.stringify(row)}); }
  catch(e){ console.error(e); }
}

async function addFinanceRow(){
  try{
    const row = await api('/api/finance', {method:'POST', body: JSON.stringify({date:'',desc:'',cat:'',in:0,out:0})});
    state.financeRows.push(row);
    renderFinance();
  }catch(e){ alert('Não foi possível criar a linha: '+e.message); }
}

async function removeFinance(i){
  const row = state.financeRows[i];
  if(!row) return;
  try{
    await api('/api/finance/'+row.id, {method:'DELETE'});
    state.financeRows.splice(i,1);
    renderFinance();
  }catch(e){ alert('Não foi possível remover: '+e.message); }
}

/* ===================== FUNCIONÁRIOS ===================== */
function renderEmployees(){
  document.getElementById('employee-tbody').innerHTML = state.employees.map((e,i)=>`
    <tr>
      <td><strong>${e.name}</strong><div style="color:var(--ink-soft);font-size:11.5px;">${e.email}</div></td>
      <td>${e.role}</td>
      <td>${e.perms.map(p=>'<span class="chip">'+p+'</span>').join('')}</td>
      <td><button class="btn btn-sm btn-ghost btn-danger" onclick="removeEmployee(${i})">Remover</button></td>
    </tr>
  `).join('');
}

async function removeEmployee(i){
  const emp = state.employees[i];
  if(!emp) return;
  try{
    await api('/api/employees/'+emp.id, {method:'DELETE'});
    state.employees.splice(i,1);
    renderEmployees();
  }catch(e){ alert('Não foi possível remover: '+e.message); }
}

function openEmployeeModal(){
  document.getElementById('ne-perms').innerHTML = MODULES.map(m=>`
    <label class="perm-toggle"><input type="checkbox" value="${m}"> ${m}</label>
  `).join(' ');
  document.getElementById('modal-employee').classList.add('open');
}

async function saveEmployee(){
  const name = document.getElementById('ne-name').value.trim();
  const senha = document.getElementById('ne-senha').value;
  if(!name){ alert('Digite o nome do funcionário.'); return; }
  if(!senha || senha.length<4){ alert('Defina uma senha com pelo menos 4 caracteres.'); return; }
  const perms = Array.from(document.querySelectorAll('#ne-perms input:checked')).map(c=>c.value);
  const payload = {
    name, email: document.getElementById('ne-email').value.trim(), senha,
    role: document.getElementById('ne-role').value, perms
  };
  try{
    const created = await api('/api/employees', {method:'POST', body: JSON.stringify(payload)});
    state.employees.push(created);
    ['ne-name','ne-email','ne-senha'].forEach(id=>document.getElementById(id).value='');
    closeModal('modal-employee');
    renderEmployees();
  }catch(e){ alert('Não foi possível salvar: '+e.message); }
}

/* ===================== DASHBOARD STATS ===================== */
async function refreshSummary(){
  try{
    const s = await api('/api/metrics/summary');
    document.getElementById('stat-vendas-hoje').textContent = 'R$ '+s.vendas_hoje.toLocaleString('pt-BR');
    document.getElementById('stat-estoque').textContent = s.estoque_total.toLocaleString('pt-BR');
    document.getElementById('stat-estoque-baixo').textContent = s.estoque_baixo+' itens em falta';
    document.getElementById('tag-estoque').textContent = s.estoque_baixo+' em falta';
    document.getElementById('stat-clientes').textContent = s.clientes_total.toLocaleString('pt-BR');
    document.getElementById('stat-ticket').textContent = 'R$ '+Math.round(s.ticket_medio).toLocaleString('pt-BR');
  }catch(e){ console.error(e); }
}

/* ===================== AUTENTICAÇÃO / SESSÃO ===================== */
function initials(name){
  return (name||'').trim().split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase() || '—';
}

async function loadSession(){
  const me = await api('/api/me'); // redireciona pra /login sozinho se não estiver logado (401)
  document.getElementById('user-name').textContent = me.name;
  document.getElementById('user-role').textContent = me.role;
  document.getElementById('user-avatar').textContent = initials(me.name);

  // Esconde no menu lateral os módulos que esse funcionário não tem permissão de acessar
  const viewToModule = {clientes:'Clientes', estoque:'Estoque', vendas:'Vendas', metricas:'Métricas', financeiro:'Financeiro', funcionarios:'Funcionários'};
  document.querySelectorAll('.nav-item[data-view]').forEach(btn=>{
    const modName = viewToModule[btn.dataset.view];
    if(modName && !me.perms.includes(modName)){
      btn.style.display = 'none';
    }
  });
  return me;
}

/* ===================== INIT ===================== */
async function boot(){
  await loadSession();

  const [products, employees] = await Promise.all([
    api('/api/products'),
    api('/api/employees'),
  ]);
  state.products = products;
  state.employees = employees;

  renderProducts();
  renderCatalog();
  renderCart();
  renderEmployees();
  await loadFinance();
  await fetchClients('');   // carrega a lista completa de clientes
  await refreshSummary();

  document.getElementById('client-search').addEventListener('input', onClientSearchInput);
}

boot();
