# Gardênia Modas — Loja + Portal do Funcionário (backend pronto pro MongoDB)

Projeto único com dois "lados":

- **Loja** (pública): catálogo de produtos, sacola, checkout, login/cadastro de cliente.
- **Portal do Funcionário** (privado, exige login): Clientes, Estoque, Vendas, Métricas, Financeiro e Funcionários.

O backend foi organizado em módulos — pensado pra você plugar a connection string do seu MongoDB Atlas e já sair funcionando, sem quebrar.

## Estrutura de pastas
 
```
gardenia-final/
├── backend/
│   ├── app.py                 ← só monta o app e registra os módulos (bem curto)
│   ├── config.py              ← lê o .env
│   ├── db.py                  ← ÚNICO lugar que sabe que existe MongoDB
│   ├── auth_utils.py          ← sessão do funcionário/cliente, decorators de proteção
│   ├── utils.py                ← funções pequenas (gerar id, data, etc.)
│   ├── seed_db.py              ← popula o banco com dados de demonstração
│   ├── .env                    ← ⚠️ PREENCHA AQUI com sua connection string
│   ├── .env.example
│   ├── requirements.txt
│   ├── routes/                  ← um arquivo por assunto, cada um um Blueprint do Flask
│   │   ├── storefront.py        ← "/"
│   │   ├── auth_routes.py       ← "/login", "/logout", cadastro e login
│   │   ├── portal.py            ← "/portal"
│   │   ├── clients.py           ← GET /api/clients
│   │   ├── products.py          ← /api/products (estoque)
│   │   ├── sales.py             ← /api/sales (caixa)
│   │   ├── finance.py           ← /api/finance
│   │   ├── employees.py         ← /api/employees
│   │   └── metrics.py           ← /api/metrics/*
│   └── seed_data/                ← JSON só usado pra popular o Mongo na primeira vez
│       ├── products.json, estoque.json, clients.json, employees.json, sales.json, finance.json
│
└── frontend/
    ├── templates/                ← index.html, login.html, portal.html
    └── static/
        ├── css/                   ← style.css (loja), login.css, portal.css
        └── js/                    ← script.js (loja), login.js, portal.js
```

**Por que separar assim:** se quiser mexer só no Estoque, você abre só `routes/products.py`. Se um dia trocar de banco (Mongo → outro), só mexe em `db.py` — nenhum outro arquivo sabe que existe um banco por trás.

## Como conectar no MongoDB Atlas

1. No [Atlas](https://cloud.mongodb.com), abra seu cluster → **Connect** → **Drivers** → copie a connection string (algo como `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/`).
2. Abra `backend/.env` e cole no lugar de `MONGODB_URI`.
3. Em **Network Access**, libere o seu IP (ou `0.0.0.0/0` pra testar).
4. Em **Database Access**, confirme que o usuário/senha têm permissão de leitura e escrita.

## Como rodar

```bash
cd backend
pip install -r requirements.txt

# edite o .env com sua connection string antes desse passo
python seed_db.py      # popula o banco com os dados de demonstração (rode 1 vez)

python app.py
```

Abre em **http://127.0.0.1:5000**

Se o `.env` ainda estiver com o valor de exemplo, o site mostra uma mensagem explicando o que falta, em vez de quebrar com um erro feio.

## O que garante que "não quebra" ao ligar o Mongo

- **Conexão preguiçosa** (`db.py`): o servidor sobe mesmo sem o banco configurado; cada rota avisa com uma mensagem clara em vez de um erro técnico.
- **Índices únicos no banco** pra e-mail de clientes e de funcionários — é o próprio MongoDB que recusa duplicata, mesmo que dois cadastros cheguem ao mesmo tempo (uma checagem só em Python não garante isso sozinha).
- **Erro de duplicata tratado**: se mesmo assim o Mongo recusar (`DuplicateKeyError`), a API devolve uma mensagem amigável (400), não um erro 500.
- **senha_hash nunca é devolvido** pelo front-end, nem na lista de funcionários, nem na busca de clientes do Portal.

## Login de teste (depois de rodar o seed_db.py)

| E-mail                        | Senha  | Tipo | Observação |
|--------------------------------|--------|------|------------|
| camila@gardeniamodas.com       | 123456 | Funcionário | Gerente (acesso total ao Portal) |
| rodrigo@gardeniamodas.com      | 123456 | Funcionário | Caixa (Vendas + Clientes) |
| sofia@gardeniamodas.com        | 123456 | Funcionário | Estoquista (só Estoque) |
| marina.costa@email.com         | 123456 | Cliente | Fica na loja depois de logar |

**Troque essas senhas antes de usar de verdade**, e troque também `SECRET_KEY` no `.env`.

## Como os dados ficam organizados no Mongo

| Coleção     | Chave natural (`_id`) | Índice único extra |
|-------------|------------------------|---------------------|
| `products`  | `id` (número)          | —                   |
| `estoque`   | `sku`                  | —                   |
| `clients`   | `cpf`                  | `email`             |
| `employees` | `id` gerado            | `email`             |
| `sales`     | `id` gerado            | —                   |
| `finance`   | `id` gerado            | —                   |

## Próximos passos sugeridos

- Enforçar as permissões também por rota no backend (hoje elas só escondem o menu no front-end).
- Paginar `/api/clients` e `/api/sales` quando o volume de dados crescer muito (hoje traz tudo de uma vez).
- Um logger de verdade (hoje os erros só aparecem no terminal em modo debug).
