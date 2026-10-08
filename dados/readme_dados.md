---

### 1. MongoDB: A Base da Coleta e Armazenamento (Camada de Origem)

**Contexto no Projeto:** O documento afirma que o sistema usará MongoDB para armazenar dados de produtos, clientes e compras. O site é desenvolvido em Python, o que facilita a integração com o MongoDB (banco NoSQL orientado a documentos).

**Justificativa para Data Science:**
*   **Variedade e Flexibilidade:** O MongoDB é ideal para a **coleta** inicial de dados não estruturados ou semiestruturados. No projeto, os dados de um cliente (CPF, histórico de compras) e de um produto (marca, material, fotos frente/verso) podem ter formatos variados. O MongoDB permite armazenar esses dados sem a rigidez de um banco relacional, facilitando a ingestão rápida.
*   **Pipeline de Dados:** Ele atua como a **fonte de dados operacional (OLTP)**. É a partir dele que os dados brutos serão extraídos para o Data Lake e posteriormente processados via ETL para o Data Warehouse (conforme descrito no texto). Sem o MongoDB, não haveria a base de dados inicial para alimentar o pipeline de Data Science.

### 2. Apache Airflow: Orquestração do Pipeline de Dados (Camada de Processamento)

**Contexto no Projeto:** O texto descreve um fluxo que vai desde a compra no site, passando pelo registro no sistema, envio para o **Data Lake**, processo de **ETL** (verificação de duplicatas, padronização) e finalmente a inserção no **Data Warehouse** (Modelo Dimensional: Fato_Vendas, Dim_Cliente, etc.).

**Justificativa para Data Science:**
*   **Automação e Escalabilidade:** O Airflow é a ferramenta ideal para gerenciar esse fluxo complexo. Ele permite agendar e monitorar as tarefas de ETL que o documento menciona. Por exemplo, uma DAG (Directed Acyclic Graph) no Airflow poderia ser criada para:
    *  Extrair dados do MongoDB.
    *  Carregar no Data Lake (armazenamento histórico).
    *  Executar o script de limpeza (remover compras duplicadas, valores inválidos).
    *  Carregar os dados tratados no Data Warehouse (Fato_Vendas).
*   **Monitoramento:** Como o projeto visa "monitoramento de grandes volumes de informações", o Airflow fornece logs e alertas caso alguma etapa do pipeline falhe (ex: se um produto não for encontrado na base).

### 3. Machine Learning de Segmentação: Análise e Valor de Negócio (Camada de Análise)

**Contexto no Projeto:** O documento menciona que o sistema de clientes permitirá "descontos exclusivos" e que os dados armazenados podem ser usados para "análises e auxiliar nas decisões da loja". Além disso, o modelo dimensional (Dim_Cliente, Fato_Vendas) é perfeito para análises de comportamento.

**Justificativa para Data Science:**
*   **Aplicação Prática:** A segmentação (Clustering) é a técnica de ML que melhor se aplica aqui. Utilizando os dados do Data Warehouse (ex: frequência de compras, valor gasto, produtos preferidos, uso de CPF para descontos), pode-se aplicar um algoritmo como **K-Means** para agrupar os clientes.
*   **Exemplos de Segmentos:**
    *   **Clientes VIP:** Alto valor de compra e alta frequência. Recebem descontos exclusivos e lançamentos.
    *   **Clientes de Oportunidade:** Compram apenas em liquidações. Recebem cupons de desconto direcionados.
    *   **Clientes Inativos:** Não compram há muito tempo. Recebem campanhas de reengajamento.
*   **Retorno para a Loja:** Isso atende diretamente ao objetivo do projeto de "melhorar o processo de vendas" e "conhecer sobre os clientes". A segmentação transforma os dados brutos armazenados (que antes eram em papel) em **inteligência de negócio**, permitindo ações de marketing personalizadas e otimização de estoque.

### Resumo da Integração no Pipeline do Projeto

1.  **Coleta:** O site (Python) grava os dados no **MongoDB**.
2.  **Orquestração:** O **Airflow** agenda a extração desses dados para o Data Lake e o processo de ETL.
3.  **Armazenamento Analítico:** Os dados limpos vão para o Data Warehouse (modelo estrela/floco).
4.  **Análise:** Um modelo de **Machine Learning de Segmentação** é treinado com os dados do Data Warehouse.
5.  **Resultado:** A loja Gardênia obtém insights sobre seus clientes, permitindo oferecer descontos personalizados (via CPF) e tomar decisões estratégicas baseadas em dados, resolvendo a situação-problema do acúmulo de papéis e falta de organização.
