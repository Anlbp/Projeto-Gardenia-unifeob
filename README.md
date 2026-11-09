<div align="center">

# 🌸 Projeto Gardênia

**Sistema de vendas e análise de dados para a loja de roupas Gardênia**

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![R](https://img.shields.io/badge/R-276DC3?logo=r&logoColor=white)](https://cran.r-project.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![OpenTofu](https://img.shields.io/badge/OpenTofu-IaC-FFDA18?logo=opentofu&logoColor=black)](https://opentofu.org/)
[![Ansible](https://img.shields.io/badge/Ansible-automa%C3%A7%C3%A3o-EE0000?logo=ansible&logoColor=white)](https://www.ansible.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Reposit%C3%B3rio-181717?logo=github&logoColor=white)](https://github.com/Anlbp/Projeto-Gardenia-unifeob)

</div>

---

## 📑 Sumário

- [Integrantes](#-integrantes)
- [Descrição](#-descrição)
- [Problema](#-problema)
- [Solução](#-solução)
  - [Arquitetura do pipeline](#arquitetura-do-pipeline)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Como reproduzir o ambiente](#-como-reproduzir-o-ambiente)
  - [Visão geral](#visão-geral)
  - [1. Pré-requisitos](#1-pré-requisitos)
  - [2. Instalação das ferramentas](#2-instalação-das-ferramentas)
  - [3. Provisionamento com OpenTofu](#3-provisionamento-com-opentofu)
  - [4. Configuração com Ansible](#4-configuração-com-ansible)
  - [5. Verificação e logs](#5-verificação-e-logs)
  - [6. Operação e ciclo de vida](#6-operação-e-ciclo-de-vida)
- [Troubleshooting](#-troubleshooting)
- [Demonstração](#-demonstração)
- [Licença](#-licença)

---

## 👥 Integrantes

| RA | Nome |
|:---|:---|
| 24000057 | André Luis Bertelli Pena |
| 24000043 | André Luis Carneiro Filho |
| 24001365 | Caio Fernando Pereira Silva |
| 24001366 | Cléudio de Faria |
| 24000603 | Renan Augusto Cristi Avelar |

---

## 📖 Descrição

O **Projeto Gardênia** é uma solução desenvolvida para a loja de roupas Gardênia com o objetivo de melhorar o processo de vendas, o controle de estoque e o armazenamento das informações da empresa.

O projeto consiste na criação de:

- 🛒 **Site de compras** (retirada na loja), feito em **HTML, CSS e Python**;
- 👔 **Portal de funcionários** com caixa virtual, controle de estoque e pesquisa de clientes;
- 🗄️ **Pipeline de Big Data** para ETL e geração de insights de vendas, com dados persistidos no **MongoDB**;
- 💳 **Sistema de clientes** com identificação por CPF, descontos e benefícios exclusivos.

---

## ❗ Problema

Atualmente, a loja utiliza **arquivamento em papel** para registrar parte das informações e **não possui um sistema centralizado** de armazenamento. Isso gera:

- Dificuldade de consulta e organização das informações;
- Falta de controle de estoque em tempo real;
- Ausência de acompanhamento histórico das vendas;
- **Gasto de oportunidade**: dados valiosos (clientes, preferências, produtos mais vendidos) que nunca são reaproveitados para decisão.

---

## ✅ Solução

A solução proposta é um ecossistema com três camadas:

1. **Operação** — site de compras + portal de funcionários (dados gerados aqui).
2. **Data Lake** — armazenamento do dado bruto, no formato original, como histórico imutável.
3. **Data Warehouse** — dado tratado via **ETL**, modelado dimensionalmente (Fato_Vendas + Dim_Cliente, Dim_Produto, Dim_Data, Dim_Funcionario) para consultas analíticas.

### Arquitetura do pipeline

```mermaid
flowchart LR
    A["🖥️ VM1<br/>Simulador de vendas"] -->|grava bruto| B[("🗃️ Data Lake")]
    B --> C["🧹 VM2<br/>ETL (limpeza + padronização)"]
    C -->|modelo dimensional| D[("📦 Data Warehouse<br/>MongoDB")]
    D --> E["📊 VM3<br/>Análise (Spark / R)"]
```

**Fluxo resumido:**

| Etapa | O que acontece | Exemplo de problema tratado |
|:---:|:---|:---|
| **1. Registro** | Compra do site grava pedido (produto, valor, cliente, data, situação) | — |
| **2. Data Lake** | Dado bruto preservado no formato original | Rastreabilidade histórica |
| **3. ETL (VM2)** | Validação, deduplicação, padronização | CPFs inválidos, valores negativos, produtos inexistentes |
| **4. DW (VM3)** | Dado modelado em Fato + Dimensões | Consultas analíticas rápidas |
| **5. Análise (VM3)** | Spark / R script (RFM, etc.) | Segmentação de clientes |

---

## 📂 Estrutura do projeto

```text
Projeto-Gardenia-unifeob/
├── README.md
├── recursos/
│   └── infraestrutura/          # arquivos OpenTofu (.tf)
│       └── ansible/inventory.ini   # gerado automaticamente
└── ansible/
    ├── playbook.yml
    ├── .vault_pass                  # ⚠️ NÃO commitar
    └── ...
```

---

## 🚀 Como reproduzir o ambiente

### Visão geral

O pipeline roda em **3 VMs** criadas com **Libvirt/QEMU** e provisionadas com **OpenTofu + Ansible**:

| VM | Nome do serviço systemd | Função |
|:---:|:---|:---|
| **VM1** | `gardenia-simulador` | Simula vendas e gera dados brutos |
| **VM2** | `gardenia-vm2` | Executa ETL e carrega o Data Warehouse |
| **VM3** | `gardenia-vm3` | Roda Spark + scripts R de análise; hospeda o MongoDB |

> [!NOTE]
> Os serviços iniciam automaticamente no boot das VMs via `systemd`. **Não é necessário** rodar scripts R manualmente.

### 1. Pré-requisitos

**Máquina hospedeira (obrigatoriamente Linux):**

- CPU com suporte a virtualização (**VT-x** ou **AMD-V** habilitado na BIOS)
- Mínimo: **8 GB de RAM**, **4 vCPUs**, **40 GB de disco livre**
- Kernel Linux com KVM disponível

> [!IMPORTANT]
> O projeto **não funciona** em Windows/macOS nativo. Use **WSL2 com systemd habilitado** (com limitações) ou uma máquina Linux de verdade.

### 2. Instalação das ferramentas
**Debian / Ubuntu:**
```bash
sudo apt update
sudo apt install -y \
  git \
  r-base r-cran-tidyverse r-cran-optparse r-cran-jsonlite r-cran-mongolite \
  openssh-client \
  qemu-kvm libvirt-daemon-system libvirt-clients virt-manager \
  ansible genisoimage \
  --fix-missing
```
**OpenTofu:**
```bash
curl -fsSL https://get.opentofu.org/install-opentofu.sh -o install-opentofu.sh
chmod +x install-opentofu.sh
./install-opentofu.sh --install-method deb
rm install-opentofu.sh
```
**Pool de imagens do Libvirt:**
```bash
sudo mkdir -p /var/lib/libvirt/images
sudo virsh pool-define-as default dir --target /var/lib/libvirt/images
sudo virsh pool-build default 2>/dev/null || true
sudo virsh pool-start default
```

**Adicionar o usuário aos grupos `libvirt` e `kvm`:**

```bash
sudo usermod -aG libvirt "$USER"
sudo usermod -aG kvm "$USER"
```

> [!TIP]
> A forma mais confiável de aplicar os novos grupos é **reiniciar a máquina**. Se quiser evitar o reboot, `newgrp libvirt` **sozinho não basta** — ele troca um grupo por vez. Use `newgrp libvirt` e depois `newgrp kvm` em **terminais separados**, ou apenas faça logout/login.

### 3. Provisionamento com OpenTofu

```bash
cd recursos/infraestrutura/
tofu init
tofu apply -auto-approve
```

> [!WARNING]
> O OpenTofu cria as **3 VMs** no Libvirt e gera automaticamente `ansible/inventory.ini` com os IPs atribuídos pelo DHCP. Confira o arquivo após a execução.

### 4. Configuração com Ansible

**Para uso geral (pede senha do vault interativamente):**

```bash
cd ansible/
ansible-playbook -i inventory.ini playbook.yml --ask-vault-pass
```

**Para desenvolvimento (usa arquivo de senha local):**

```bash
cd ansible/
ansible-playbook -i inventory.ini playbook.yml --vault-password-file .vault_pass
```

> [!CAUTION]
> Nunca versione o arquivo `.vault_pass`. Adicione ao `.gitignore`:
> ```gitignore
> ansible/.vault_pass
> *.env
> ```

### 5. Verificação e logs

<details>
<summary><b>VM1 — Simulador</b></summary>

```bash
ssh debian@<IP_VM1> "sudo systemctl status gardenia-simulador"
# Logs em tempo real:
ssh debian@<IP_VM1> "journalctl -u gardenia-simulador -f"
```
</details>

<details>
<summary><b>VM2 — ETL / Tratamento</b></summary>

```bash
ssh debian@<IP_VM2> "sudo systemctl status gardenia-vm2"
ssh debian@<IP_VM2> "journalctl -u gardenia-vm2 -f"
```
</details>

<details>
<summary><b>VM3 — Big Data / Spark</b></summary>

```bash
ssh debian@<IP_VM3> "sudo systemctl status gardenia-vm3"
ssh debian@<IP_VM3> "journalctl -u gardenia-vm3 -f"
```
</details>

**Validar dados persistidos no MongoDB (VM3):**

```bash
ssh debian@<IP_VM3>
Rscript -e "m <- mongolite::mongo('segmentacao_rfm', 'gardenia'); print(m\$find())"
exit
```

### 6. Operação e ciclo de vida

#### Pausar apenas os scripts (VMs continuam ligadas)

```bash
ssh debian@<IP_VM1> "sudo systemctl stop gardenia-simulador"
ssh debian@<IP_VM2> "sudo systemctl stop gardenia-vm2"
ssh debian@<IP_VM3> "sudo systemctl stop gardenia-vm3"
```

> Para retomar: troque `stop` por `start`.

#### Desligar as VMs (libera RAM)

```bash
# Desligamento gracioso
sudo virsh shutdown vm1-simulador
sudo virsh shutdown vm2-tratamento
sudo virsh shutdown vm3-spark

# Forçado (último recurso)
sudo virsh destroy vm1-simulador
sudo virsh destroy vm2-tratamento
sudo virsh destroy vm3-spark
```

#### Impedir inicialização automática dos scripts no boot

```bash
ssh debian@<IP_VM1> "sudo systemctl disable gardenia-simulador"
ssh debian@<IP_VM2> "sudo systemctl disable gardenia-vm2"
ssh debian@<IP_VM3> "sudo systemctl disable gardenia-vm3"
```

#### Religar o cluster após desligar o host

```bash
# Reativar rede e pool do Libvirt
sudo virsh net-start default 2>/dev/null
sudo virsh pool-start default

# Ligar as VMs
sudo virsh start vm1-simulador
sudo virsh start vm2-tratamento
sudo virsh start vm3-spark
```

**Testar conexão da VM3 com o MongoDB:**

```bash
# ⚠️ Substitua SENHA e o host antes de rodar. NÃO commite credenciais reais.
ssh debian@<IP_VM3> 'Rscript -e "library(mongolite); m <- mongo(\"teste_atlas\", db=\"gardenia\", url=\"mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/\"); m\$insert(data.frame(status=\"Conexão Ok\", data=Sys.time())); print(m\$find())"'
```

---

## 🩺 Troubleshooting

<details>
<summary><b>A rede <code>default</code> do Libvirt não existe / VMs não têm rede</b></summary>

Execute uma única vez:
```bash
sudo virsh net-define /usr/share/libvirt/networks/default.xml
sudo virsh net-start default
sudo virsh net-autostart default
```
</details>

<details>
<summary><b><code>tofu apply</code> falha com "permission denied" no <code>/var/lib/libvirt</code></b></summary>

Confirme que o usuário está no grupo `libvirt` (via `groups`) e faça logout/login antes de tentar novamente.
</details>

<details>
<summary><b>Ansible pede senha do vault mesmo com <code>--vault-password-file</code></b></summary>

Verifique se `.vault_pass` existe **dentro da pasta `ansible/`** e se tem permissão de leitura (`chmod 600 .vault_pass`).
</details>

---

## 🎥 Demonstração

[![](https://markdown-videos-api.jorgenkh.no/youtube/5UptIKxguL0)](https://youtu.be/5UptIKxguL0)

---

<div align="center">

Feito com 💜 pelos alunos do curso de **Ciência da Computação** da UNIFEOB 👨‍💻🎓

<img src="https://s3.sa-east-1.amazonaws.com/lyceum.backups/arquivosimport/logo_branco_atual_2023.png" alt="Logo UNIFEOB" width="200">

</div>