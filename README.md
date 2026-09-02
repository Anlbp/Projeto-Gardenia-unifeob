# Projeto-Gardenia-unifeob
# Projeto Gardênia - UNIFEOB

## Descrição

O **Projeto Gardênia** é uma solução desenvolvida para a loja de roupas Gardênia, com o objetivo de melhorar o processo de vendas, o controle de estoque e o armazenamento das informações da empresa. O projeto consiste na criação de um site de compras para retirada na loja, desenvolvido com **HTML, CSS e Python**, utilizando o **MongoDB** para armazenamento dos dados.

O sistema permitirá que os clientes consultem os produtos disponíveis, visualizem as roupas pela frente e pelo verso e tenham acesso a informações como marca e material. Também haverá um sistema de clientes, no qual o comprador poderá informar seu **CPF** para ter acesso a descontos e benefícios exclusivos do site e da loja.

## Situação-problema

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


