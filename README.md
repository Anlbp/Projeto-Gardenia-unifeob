# Projeto Gardênia - UNIFEOB (Equipe 1)
[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com)
![](/github/last-commit/vladkens/macmon)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![GitHub latest commit](https://badgen.net/github/last-commit/Anlbp/Projeto-Gardenia-unifeob)](https://badgen.net/github/last-commit/Anlbp/Projeto-Gardenia-unifeob)
[![made-with-python](https://img.shields.io/badge/Made%20with-Python-1f425f.svg)](https://www.python.org/)
[![R](https://img.shields.io/badge/-script-276DC3.svg?style=flat&logo=R)](https://cran.r-project.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green)]()

Sistema de vendas e análise de dados para a loja de roupas **Gardênia**, com site de compras (retirada na loja), portal de funcionários e pipeline de Big Data para geração de insights.

## Sumário

- [Integrantes](#integrantes)
- [Descrição](#descrição)
- [Problema](#problema)
- [Solução](#solução)
- [Como reproduzir o ambiente](#como-reproduzir-o-ambiente)
- [Demonstração](#demonstração)

## Integrantes

| RA | Nome |
| - | - |
| 24000057 | Andre Luis Bertelli Pena |
| 24000043 | André Luis Carneiro Filho |
| 24001365 | Caio Fernando Pereira Silva | 
| 24001366 | Cleudio de Faria | 
| 24000603 | Renan Augusto Cristi Avelar |

## Descrição

O **Projeto Gardênia** é uma solução desenvolvida para a loja de roupas Gardênia, com o objetivo de melhorar o processo de vendas, o controle de estoque e o armazenamento das informações da empresa. O projeto consiste na criação de um site de compras para retirada na loja, desenvolvido com **HTML, CSS e Python**, utilizando o **MongoDB** para armazenamento dos dados.

O sistema permitirá que os clientes consultem os produtos disponíveis, visualizem as roupas pela frente e pelo verso e tenham acesso a informações como marca e material. Também haverá um sistema de clientes, no qual o comprador poderá informar seu **CPF** para ter acesso a descontos e benefícios exclusivos do site e da loja.

## Problema

Atualmente, a loja utiliza **arquivamento em papel** para registrar algumas de suas informações e não possui um sistema centralizado para armazenar os dados de cada compra. Isso dificulta a consulta e organização das informações, além de prejudicar o controle de estoque, o acompanhamento das vendas e o conhecimento sobre os clientes.

A falta de armazenamento adequado dos dados também representa um **gasto de oportunidade**, pois informações importantes sobre as compras e os clientes deixam de ser aproveitadas para gerar análises e auxiliar nas decisões da loja.

## Solução

Como solução, será desenvolvido um **site de compras para retirada na loja**, permitindo que os clientes consultem os produtos e realizem seus pedidos de forma digital. O sistema contará também com um **portal para funcionários**, oferecendo recursos como análise de vendas, caixa virtual, pesquisa de clientes e controle de estoque.

Os dados de **produtos, clientes e compras** serão armazenados no MongoDB, permitindo que as informações sejam organizadas, consultadas e utilizadas posteriormente. O sistema de clientes também permitirá identificar compradores por meio do CPF e oferecer descontos exclusivos.

A arquitetura proposta será integrada ao funcionamento do sistema da Gardênia de forma que os dados gerados durante as operações da loja possam ser aproveitados tanto para o funcionamento do site quanto para análises futuras. Quando um cliente realizar uma compra pelo site, os dados relacionados ao pedido serão registrados no sistema operacional. Essas informações poderão incluir o produto escolhido, quantidade, preço, desconto, cliente, data e situação do pedido.

Após o registro da compra, os dados poderão ser enviados para o Data Lake, onde permanecerão armazenados em seu formato original. Esse processo permitirá manter um histórico das operações realizadas no sistema, mesmo que os dados sejam posteriormente modificados ou tratados para utilização analítica. Dessa forma, o Data Lake funcionará como uma camada de armazenamento histórico e flexível.

Os dados armazenados passarão posteriormente pelo processo de ETL. Durante essa etapa, serão realizadas verificações para garantir a qualidade das informações. Por exemplo, poderão ser identificadas compras duplicadas, valores inválidos, produtos inexistentes ou dados cadastrais inconsistentes. Os dados também poderão ser padronizados para que informações semelhantes possuam o mesmo formato antes de serem inseridas no Data Warehouse.

Após o tratamento, os dados serão organizados de acordo com o modelo dimensional definido para o projeto. A tabela Fato_Vendas será responsável por armazenar os registros das vendas, enquanto as dimensões Dim_Cliente, Dim_Produto, Dim_Data e Dim_Funcionario fornecerão os contextos necessários para a análise. Essa separação permitirá realizar consultas específicas sem a necessidade de analisar diretamente os dados brutos armazenados no Data Lake.

Com a implementação da solução, a loja poderá reduzir a dependência de registros em papel, melhorar a organização das informações, facilitar o processo de compra e utilizar os dados armazenados para obter uma visão mais clara das vendas, clientes e estoque.

## Como reproduzir o ambiente:

### 1. Pré-requisitos (Máquina Hospedeira):

Antes de iniciar, garanta que a máquina local possua:
* CPU com suporte a virtualização (VT-x / AMD-V habilitado na BIOS)
* No mínimo 8GB de RAM, 4 vCPUs, 40GB de disco livre
* Sistema Linux - obrigatório para Ansible, Libvirt/QEMU e OpenTofu

**Linux: (Debian/Ubuntu):**
```bash
    sudo apt update
    sudo apt install -y git r-base r-cran-tidyverse r-cran-optparse r-cran-jsonlite openssh-client qemu-kvm libvirt-daemon-system libvirt-clients virt-manager ansible genisoimage --fix-missing
    curl -fsSL https://get.opentofu.org/install-opentofu.sh -o install-opentofu.sh
    chmod +x install-opentofu.sh
    ./install-opentofu.sh --install-method deb
    rm install-opentofu.sh
    sudo mkdir -p /var/lib/libvirt/images
    sudo virsh pool-define-as default dir --target /var/lib/libvirt/images
    sudo virsh pool-build default 2>/dev/null || true
    sudo virsh pool-start default
```
Adicionar permissões às ferramentas:
```bash
        sudo usermod -aG libvirt $USER
        sudo usermod -aG kvm $USER
```
Em seguida reinicie o computador **OU** execute:
```bash
        newgrp libvirt
```
### 2. Provisionamento da Infraestrutura (OpenTofu):

A partir da raiz do projeto, execute:
```bash
    cd ./recursos/infraestrutura/
    tofu init
    tofu apply -auto-approve
```
> ⚠️ **Atenção:**<br>O OpenTofu criará as 3 VMs no Libvirt e gerará automaticamente o arquivo ansible/inventory.ini com os IPs atribuídos pelo DHCP.
#
### 3. Configuração, instalações e tarefas das virtualizações:

```bash
    cd ./ansible/
    ansible-playbook -i inventory.ini playbook.yml
```
### 4. Execução das VMs:

> ⚙️ **Automação Ativa:**<br>Os serviços do pipeline R e do MongoDB já iniciam e se sincronizam automaticamente no boot das VMs via systemd.<br>Não é necessário rodar os scripts R manualmente.

Para verificar o status ou acompanhar os logs em tempo real, conecte-se à VM desejada (utilize o IP presente no ```inventory.ini```)

**VM1 (Simulador):**
```bash
    ssh debian@<IP_VM1> "sudo systemctl status gardenia-simulador"
```
e para acompanhar os logs em tempo real:
```bash
    ssh debian@<IP_VM1> "journalctl -u gardenia-simulador -f"
```

**VM2 (Tratamento e Limpeza):**
```bash
    ssh debian@<IP_VM2> "sudo systemctl status gardenia-vm2"
```
e para acompanhar os logs em tempo real:
```bash
    ssh debian@<IP_VM2> "journalctl -u gardenia-vm2 -f"
```

**VM3 (Big Data / Spark):**
```bash
    ssh debian@<IP_VM3> "sudo systemctl status gardenia-vm3"
```
e para acompanhar os logs em tempo real:
```bash
    ssh debian@<IP_VM3> "journalctl -u gardenia-vm3 -f"
```
### 5. Validação dos dados salvos no MongoDB (VM3)
```bash
    ssh debian@<IP_VM3>
    Rscript -e "m <- mongolite::mongo('segmentacao_rfm', 'gardenia'); print(m$find())"
    exit
```
### 6. Pausar, interromper ou desligar as VMs:
Como o Apache Spark e os serviços em segundo plano consomem memória RAM de forma contínua, você pode pausar ou desligar as VMs conforme necessário:
#### Opção A: Parar apenas os scripts (sem desligar as VMs)
```bash
    ssh debian@<IP_VM1> "sudo systemctl stop gardenia-simulador"
    ssh debian@<IP_VM2> "sudo systemctl stop gardenia-vm2"
    ssh debian@<IP_VM3> "sudo systemctl stop gardenia-vm3"
```
> **Dica:**<br>Para reativar o pipeline a qualquer momento, troque stop por start nos comandos acima.
#### Opção B: Desligar as VMs para liberar RAM no computador hospedeiro
* Desligamento recomendado:
```bash
    sudo virsh shutdown vm1-simulador
    sudo virsh shutdown vm2-tratamento
    sudo virsh shutdown vm3-spark
```
* Desligamento forçado / imediato
```bash
    sudo virsh destroy vm1-simulador
    sudo virsh destroy vm2-tratamento
    sudo virsh destroy vm3-spark
```
#### Opção C: Impedir que os scripts iniciem automaticamente no boot das VMs
```bash
    ssh debian@<IP_VM1> "sudo systemctl disable gardenia-simulador"
    ssh debian@<IP_VM2> "sudo systemctl disable gardenia-vm2"
    ssh debian@<IP_VM3> "sudo systemctl disable gardenia-vm3"
```
### 7. Religar o cluster após o desligamento/boot do host:

Ativa a rede virtual do libvirt:
```bash
    sudo virsh net-start default 2>/dev/null
    sudo virsh pool-start default
``` 
Liga as três VMs do cluster
```bash
    sudo virsh start vm1-simulador
    sudo virsh start vm2-tratamento
    sudo virsh start vm3-spark
```
Comando para ver se a VM3 está conectando ao MongoDB
```bash
ssh debian@<IP_VM3> 'Rscript -e "library(mongolite); m <- mongo(\"teste_atlas\", db=\"gardenia\", url=\"mongodb+srv://andrelpena:SENHA@cluster0.dziebk1.mongodb.net/\"); m\$insert(data.frame(status=\"Conexão Ok\", data=Sys.time())); print(m\$find())"'
```
## Demonstração
Um video para demonstrar as VMs funcionando:<br>
<br>
[![](https://markdown-videos-api.jorgenkh.no/youtube/5UptIKxguL0)](https://youtu.be/5UptIKxguL0)
#
<b>Feitos pelos alunos do curso de Ciência da Computação da UNIFEOB.</b> 👨‍💻🎓
<br><p align="center"><img src="https://s3.sa-east-1.amazonaws.com/lyceum.backups/arquivosimport/logo_branco_atual_2023.png" alt="Logo UNIFEOB" width="256"></p> teste
