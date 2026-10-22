# Projeto Gardênia - UNIFEOB (Equipe 1)
[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com)
![](/github/last-commit/vladkens/macmon)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![GitHub latest commit](https://badgen.net/github/last-commit/Anlbp/Projeto-Gardenia-unifeob)](https://badgen.net/github/last-commit/Anlbp/Projeto-Gardenia-unifeob)
[![R](https://img.shields.io/badge/-script-276DC3.svg?style=flat&logo=R)](https://cran.r-project.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green)]()

Sistema de vendas e análise de dados para a loja de roupas **Gardênia**, com site de compras (retirada na loja), portal de funcionários e pipeline de Big Data para geração de insights.

## Sumário

- [Integrantes](#integrantes)
- [Descrição](#descrição)
- [Problema](#situação-problema)
- [Solução](#solução)
- [Como reproduzir o ambiente](#como-reproduzir-o-ambiente)

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
    sudo apt install -y git r-base r-cran-tidyverse r-cran-optparse r-cran-jsonlite openssh-client qemu-kvm libvirt-daemon-system libvirt-clients virt-manager ansible
    curl -fsSL https://get.opentofu.org/install-opentofu.sh -o install-opentofu.sh
    chmod +x install-opentofu.sh
    ./install-opentofu.sh --install-method deb
    rm install-opentofu.sh
```
Adicionar permissões às ferramentas:
```bash
        sudo usermod -aG libvirt $USER
        sudo usermod -aG kvm $USER
```
Em seguida reinicie o computador ou execute:
```bash
        newgrp libvirt
```
#
### 2. Provisionamento da Infraestrutura (OpenTofu):

A partir da raiz do projeto, execute:
```bash
    cd ./infraestrutura/
    tofu init
    tofu apply -auto-approve
```
#
### 3. Identificas as IP atribuidas as VMs
```bash
    sudo virsh net-dhcp-leases default
```
#
### 4. Configuração do Ambiente e Aplicação (Ansible):

Copie os IPv4 exibidos no passo anterior e cole no arquivo "/ansible/inventory.ini" para cada VM. Em seguida, execute:
```bash
    cd ./ansible/
    ansible-playbook -i inventory.ini playbook.yml
```
#
### 5. Execução das VMs:

> ⚠️ **Atenção!**<br>Execute cada VM em um **terminal separado**, e **nesta ordem**: primeiro a VM1, depois a VM2, depois a VM3. A VM2 lê a saída da VM1, e a VM3 lê a saída da VM2.

**VM1 (Simulador):**
```bash
    ssh debian@192.168.122.XXX
    cd ./simulador
    Rscript simulador.R --ciclos 0 --intervalo 10
    exit
```

**VM2 (Tratamento e Limpeza):**
```bash
    ssh debian@192.168.122.XXX
    cd ./gardenia
    Rscript pipeline_vm2.R -o debian@<IP_VM1>:/home/debian/simulador/saida -i 15
    exit
```

**VM3 (Big Data / Spark):**
```bash
    ssh debian@192.168.122.XXX
    cd ./spark_work
    Rscript pipeline_vm3.R -o debian@<IP_VM2>:/home/debian/gardenia/saida -i 30
    exit
```
#
### 6. Ligar a VM novamente após o boot:

Ativa a rede virtual do libvirt:
```bash
    sudo virsh net-start default 2>/dev/null
``` 
Liga as três VMs do cluster
```bash
    sudo virsh start vm1-simulador
    sudo virsh start vm2-tratamento
    sudo virsh start vm3-spark
```
#
<b>Feitos pelos alunos do curso de Ciência da Computação da UNIFEOB.</b> 👨‍💻🎓
<br><p align="center"><img src="https://s3.sa-east-1.amazonaws.com/lyceum.backups/arquivosimport/logo_branco_atual_2023.png" alt="Logo UNIFEOB" width="256"></p>