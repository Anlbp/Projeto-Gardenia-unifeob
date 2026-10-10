# Simulador de Dados - Gardênia

Simulador de dados para o projeto da loja de roupas Gardênia.

O programa gera dados fictícios de clientes, produtos e compras em formato CSV. Os dados possuem informações temporais e inconsistências controladas para simular um cenário de dados brutos que posteriormente pode ser utilizado em processos de ETL, Data Lake e Data Warehouse.

## Requisitos

É necessário ter o Python 3.10 ou superior instalado.

O projeto não utiliza bibliotecas externas. Os módulos utilizados fazem parte da biblioteca padrão do Python:

* `csv`
* `random`
* `uuid`
* `time`
* `datetime`
* `threading`
* `os`
* `signal`
* `sys`

Não é necessário instalar:

* MySQL
* MongoDB
* Pandas
* NumPy
* outras bibliotecas externas
* conexão com a internet

## Instalação

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd NOME_DA_PASTA
```

Não é necessário executar `pip install`, pois o simulador não possui dependências externas.

## Verificando o Python

Execute:

```bash
python --version
```

No Windows, caso o comando acima não funcione, tente:

```bash
py --version
```

O resultado deverá apresentar uma versão do Python igual ou superior à 3.10.

## Execução

Execute o simulador pelo terminal:

```bash
python simulador.py
```

No Windows, também pode ser utilizado:

```bash
py simulador.py
```

O programa não possui interface gráfica e deve ser executado diretamente pelo terminal.

Ao iniciar, o simulador solicita ao usuário a **taxa de consistência** desejada, um valor entre 0 e 100, onde:

* `100` = todos os dados gerados são consistentes (nenhuma inconsistência inserida)
* `0` = todos os dados gerados são inconsistentes
* Valores intermediários (ex.: `70`) geram uma mistura proporcional de dados consistentes e inconsistentes

Após a configuração, o simulador entra em um **loop contínuo de geração**. A cada ciclo, um novo conjunto de arquivos CSV é criado com um número sequencial no nome, e o programa aguarda 3 segundos antes de iniciar o próximo ciclo. Para interromper a execução, pressione `CTRL + C`.

## Arquivos gerados

Após a execução, serão criados automaticamente três arquivos por ciclo, numerados sequencialmente conforme o contador de ciclos:

```text
clientes_1.csv
produtos_1.csv
compras_1.csv
clientes_2.csv
produtos_2.csv
compras_2.csv
...
```

### clientes_N.csv

Contém informações dos clientes, como:

* identificador (`id`)
* nome
* e-mail
* idade
* telefone
* CPF
* data de nascimento
* data de cadastro
* indicador de inconsistência (`inconsistente`)

### produtos_N.csv

Contém informações dos produtos, como:

* identificador (`id`)
* nome
* categoria
* preço
* estoque
* peso
* satisfação média (`satisfacao_media`)
* data de cadastro
* indicador de inconsistência (`inconsistente`)

### compras_N.csv

Contém informações das compras, como:

* identificador da compra (`id`)
* identificador do cliente (`cliente_id`)
* identificador do produto (`produto_id`)
* quantidade
* valor total
* desconto
* data da compra
* status
* satisfação (`satisfacao`)
* indicador de inconsistência (`inconsistente`)

## Dados inconsistentes

O simulador também gera inconsistências propositalmente para representar dados brutos de um sistema real. A quantidade de inconsistências é controlada pela taxa de consistência informada no início da execução.

Entre os problemas simulados estão:

**Clientes:**
* e-mails inválidos (sem arroba, sem domínio, com espaços, vazios ou nulos)
* e-mails com arroba faltando (`cliente1email.com` em vez de `cliente1@email.com`)
* idades inválidas (negativas, zero, acima de 150 ou nulas)
* telefones inválidos (curtos, com letras, vazios, nulos ou muito longos)
* CPFs inválidos (curtos, repetidos, vazios ou nulos)
* datas de nascimento futuras
* campos vazios ou nulos
* nomes com capitalização inconsistente:
  * capitalização inicial (`João silva` em vez de `João Silva`)
  * tudo maiúsculo (`JOÃO SILVA`)
  * tudo minúsculo (`joão silva`)
  * capitalização aleatória (`jOãO sIlVa`)

**Produtos:**
* preços negativos
* preços iguais a zero
* estoques negativos
* nomes vazios ou nulos
* categorias inválidas (vazias, inexistentes ou com tipo incorreto)
* pesos negativos
* satisfação média inválida (negativa, acima de 5, muito alta ou nula)
* nomes com capitalização inconsistente:
  * capitalização inicial (`Smartphone pro` em vez de `Smartphone Pro`)
  * tudo maiúsculo (`SMARTPHONE PRO`)
  * tudo minúsculo (`smartphone pro`)
  * capitalização aleatória (`sMaRtPhOnE pRo`)

**Compras:**
* quantidades negativas
* valores totais negativos
* clientes inexistentes (IDs fora do intervalo gerado)
* produtos inexistentes (IDs fora do intervalo gerado)
* datas de compra futuras
* descontos maiores que o valor total da compra
* satisfação inválida (negativa, acima de 5, muito alta ou nula)
* erros de digitação no status (`cacelado`, `etregue`, `pedente`, `paguo`, `envado`, entre outros)
* status com capitalização inconsistente:
  * capitalização inicial (`Pendente` em vez de `pendente`)
  * tudo maiúsculo (`PENDENTE`)
  * tudo minúsculo (`pendente`)
  * capitalização aleatória (`PeNdEnTe`)

Essas inconsistências podem posteriormente ser identificadas e corrigidas durante o processo de ETL. Vale destacar que inconsistências de capitalização e erros de digitação não invalidam semanticamente os dados — eles continuam representando a mesma informação, apenas com formatação divergente, exigindo etapas de normalização e padronização no pipeline de dados.

## Quantidade de dados

A configuração padrão do simulador produz, a cada ciclo:

```text
5.000 clientes
5.000 produtos
5.000 compras
```

Totalizando aproximadamente **15.000 registros por ciclo**. Como o simulador opera em loop contínuo, o volume final de dados depende de quantos ciclos forem executados antes da interrupção.

## Data e hora da geração

Cada ciclo de simulação registra a data e hora em que foi executado, tanto no console quanto no campo `data_cadastro` dos registros de clientes e produtos, e no campo `data_compra` das compras.

Exemplo de data de simulação exibida no console:

```text
2026-09-23 16:45:32
```

Além disso, os registros possuem outras informações temporais específicas, como `data_compra`, `data_cadastro` e `data_nascimento`.

## Relatório final

Ao final de cada ciclo, o simulador exibe um relatório com:

* Data e hora da simulação
* Tempo total de geração (em segundos)
* Total de registros gerados
* Estatísticas por tipo de dado (clientes, produtos e compras):
  * Total gerado
  * Quantidade de registros consistentes
  * Quantidade de registros inconsistentes
  * Taxa de consistência por tipo
* Totais gerais:
  * Total de registros
  * Total de consistentes
  * Total de inconsistentes
  * Taxa de consistência global

## Estrutura do projeto

```text
simulador/
│
├── simulador.py
├── requirements.txt
├── README.md
│
├── clientes_1.csv
├── produtos_1.csv
├── compras_1.csv
├── clientes_2.csv
├── produtos_2.csv
├── compras_2.csv
└── ...
```

Os arquivos CSV são criados automaticamente após a execução do `simulador.py`, com numeração sequencial a cada ciclo.

## Resumo da execução

```text
Python 3
    ↓
simulador.py
    ↓
Configuração da taxa de consistência
    ↓
Loop de simulação
    ↓
Simulação dos dados (5.000 clientes, 5.000 produtos, 5.000 compras)
    ↓
Inserção de inconsistências controladas
    ↓
clientes_N.csv
produtos_N.csv
compras_N.csv
    ↓
Aguarda 3 segundos
    ↓
Próximo ciclo (N + 1)
    ↓
CTRL + C para interromper
```

## Principais alterações realizadas nesta edição:

1. **`produtos_N.csv`**: adicionado o campo `satisfacao_media` na descrição das colunas.
2. **`compras_N.csv`**: adicionado o campo `satisfacao` na descrição das colunas.
3. **Inconsistências de Clientes**: incluídas as novas categorias — arroba faltando em e-mails e variações de capitalização em nomes.
4. **Inconsistências de Produtos**: incluída a satisfação média inválida e as variações de capitalização em nomes.
5. **Inconsistências de Compras**: incluída a satisfação inválida, os erros de digitação no status (`cacelado`, `etregue`, `pedente`, etc.) e as variações de capitalização no status.
6. **Nota explicativa** sobre inconsistências de capitalização e erros de digitação não invalidarem semanticamente os dados, reforçando a necessidade de etapas de normalização no ETL.
