import csv
import random
import uuid
import time
from datetime import datetime, timedelta
import threading
import os
import signal
import sys

class SimuladorDados:
    def __init__(self, taxa_consistencia=100, contador_arquivo=1):
        """
        Inicializa o simulador de dados
        
        Args:
            taxa_consistencia (float): Taxa de consistência dos dados (0-100)
                                      0% = todos inconsistentes
                                      100% = nenhum inconsistente
            contador_arquivo (int): Contador para numeração dos arquivos
        """
        self.taxa_consistencia = max(0, min(100, taxa_consistencia))
        self.data_simulacao = datetime.now()
        self.contador_arquivo = contador_arquivo
        self.estatisticas = {
            'clientes': {'total': 0, 'consistentes': 0, 'inconsistentes': 0},
            'produtos': {'total': 0, 'consistentes': 0, 'inconsistentes': 0},
            'compras': {'total': 0, 'consistentes': 0, 'inconsistentes': 0}
        }
        
        # Mapeamento de erros de digitação para status
        self.erros_digitacao_status = {
            "pendente": ["pedente", "pendnete", "pndente", "pendente "],
            "pago": ["pago ", "paguo", "pago0", "pago."],
            "enviado": ["envado", "enviadio", "enviiado", "enviado "],
            "entregue": ["etregue", "entrege", "entregu", "entregue "],
            "cancelado": ["cacelado", "cancelado ", "canceldo", "canceladu"]
        }
    
    def _deve_ser_inconsistente(self):
        """
        Determina se um dado deve ser inconsistente baseado na taxa de consistência
        """
        chance_inconsistencia = (100 - self.taxa_consistencia) / 100
        return random.random() < chance_inconsistencia
    
    def _aplicar_inconsistencia_capitalizacao(self, texto):
        """
        Aplica inconsistências de capitalização a um texto.
        Retorna uma tupla (texto_modificado, tipo_inconsistencia)
        """
        if texto is None or not isinstance(texto, str) or texto.strip() == "":
            return texto, None
        
        tipo = random.choice([
            'capitalizacao_inicial',  # Primeira letra maiúscula
            'full_caps',              # TUDO MAIÚSCULO
            'full_lower',             # tudo minúsculo
            'capitalizacao_aleatoria' # CaPs AlEaTóRiAs
        ])
        
        if tipo == 'capitalizacao_inicial':
            return texto.capitalize(), tipo
        elif tipo == 'full_caps':
            return texto.upper(), tipo
        elif tipo == 'full_lower':
            return texto.lower(), tipo
        else:  # capitalizacao_aleatoria
            return ''.join(
                c.upper() if random.random() > 0.5 else c.lower()
                for c in texto
            ), tipo
    
    def _aplicar_erro_digitacao_status(self, status):
        """
        Aplica erro de digitação a um status de compra.
        Retorna uma tupla (status_modificado, tipo_inconsistencia)
        """
        if status in self.erros_digitacao_status:
            return random.choice(self.erros_digitacao_status[status]), 'erro_digitacao'
        return status, None
    
    def _remover_arroba_email(self, email):
        """
        Remove o @ de um email (mantendo o resto correto)
        """
        if email and '@' in email:
            return email.replace('@', ''), 'arroba_faltando'
        return email, None
    
    def _aplicar_inconsistencia_texto(self, texto):
        """
        Aplica uma inconsistência de texto (capitalização ou erro de digitação).
        Retorna uma tupla (texto_modificado, tipo_inconsistencia)
        """
        if texto is None or not isinstance(texto, str) or texto.strip() == "":
            return texto, None
        
        tipo = random.choice([
            'capitalizacao_inicial',
            'full_caps',
            'full_lower',
            'capitalizacao_aleatoria'
        ])
        
        if tipo == 'capitalizacao_inicial':
            return texto.capitalize(), tipo
        elif tipo == 'full_caps':
            return texto.upper(), tipo
        elif tipo == 'full_lower':
            return texto.lower(), tipo
        else:
            return ''.join(
                c.upper() if random.random() > 0.5 else c.lower()
                for c in texto
            ), tipo
    
    def gerar_clientes(self, quantidade=5000):
        """
        Gera dados de clientes
        """
        clientes = []
        nomes = ["João", "Maria", "Pedro", "Ana", "Carlos", "Julia", "Rafael", "Beatriz", 
                 "Lucas", "Fernanda", "Bruno", "Camila", "Diego", "Larissa", "Thiago"]
        sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", 
                      "Ferreira", "Almeida", "Rodrigues", "Gomes", "Martins"]
        
        for i in range(quantidade):
            # Dados básicos do cliente
            cliente_id = i + 1
            nome = f"{random.choice(nomes)} {random.choice(sobrenomes)}"
            
            # Decide se será inconsistente
            inconsistente = self._deve_ser_inconsistente()
            tipo_inconsistencia = None
            
            if inconsistente:
                # Gera dados inconsistentes
                tipo_inconsistencia = random.choice([
                    'email_invalido', 'idade_invalida', 'telefone_invalido', 
                    'cpf_invalido', 'data_nascimento_futura', 'campos_vazios',
                    'capitalizacao_inicial', 'full_caps', 'full_lower', 
                    'capitalizacao_aleatoria', 'arroba_faltando'
                ])
                
                # Valores padrão iniciais
                email = f"cliente{cliente_id}@email.com"
                idade = random.randint(18, 80)
                telefone = f"({random.randint(11, 99)}) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
                cpf = f"{random.randint(100, 999)}.{random.randint(100, 999)}.{random.randint(100, 999)}-{random.randint(10, 99)}"
                data_nascimento = (datetime.now() - timedelta(days=idade*365 + random.randint(0, 364))).strftime("%Y-%m-%d")
                
                if tipo_inconsistencia == 'email_invalido':
                    email = random.choice([
                        "email_sem_arroba.com", "@sem_dominio", "email@", 
                        "email com espaços@teste.com", "", None
                    ])
                elif tipo_inconsistencia == 'idade_invalida':
                    idade = random.choice([-5, 0, 150, 200, None])
                elif tipo_inconsistencia == 'telefone_invalido':
                    telefone = random.choice(["123", "abcdefgh", "", None, "999999999999999"])
                elif tipo_inconsistencia == 'cpf_invalido':
                    cpf = random.choice(["123", "00000000000", "11111111111111", "", None])
                elif tipo_inconsistencia == 'data_nascimento_futura':
                    data_nascimento = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
                elif tipo_inconsistencia == 'campos_vazios':
                    email = None
                    telefone = None
                    cpf = None
                elif tipo_inconsistencia == 'arroba_faltando':
                    email, _ = self._remover_arroba_email(email)
                elif tipo_inconsistencia in ('capitalizacao_inicial', 'full_caps', 
                                              'full_lower', 'capitalizacao_aleatoria'):
                    # Aplica inconsistência de capitalização ao nome
                    nome, _ = self._aplicar_inconsistencia_capitalizacao(nome)
                
                self.estatisticas['clientes']['inconsistentes'] += 1
            else:
                # Gera dados consistentes
                email = f"cliente{cliente_id}@email.com"
                idade = random.randint(18, 80)
                telefone = f"({random.randint(11, 99)}) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
                cpf = f"{random.randint(100, 999)}.{random.randint(100, 999)}.{random.randint(100, 999)}-{random.randint(10, 99)}"
                data_nascimento = (datetime.now() - timedelta(days=idade*365 + random.randint(0, 364))).strftime("%Y-%m-%d")
                
                self.estatisticas['clientes']['consistentes'] += 1
            
            cliente = {
                "id": cliente_id,
                "nome": nome,
                "email": email,
                "idade": idade,
                "telefone": telefone,
                "cpf": cpf,
                "data_nascimento": data_nascimento,
                "data_cadastro": self.data_simulacao.isoformat(),
                "inconsistente": inconsistente
            }
            clientes.append(cliente)
            self.estatisticas['clientes']['total'] += 1
        
        return clientes
    
    def gerar_produtos(self, quantidade=5000):
        """
        Gera dados de produtos
        """
        produtos = []
        categorias = ["Eletrônicos", "Roupas", "Alimentos", "Livros", "Casa", "Esportes", "Brinquedos"]
        nomes_produtos = ["Smartphone", "Notebook", "Camiseta", "Arroz", "Romance", "Sofá", 
                          "Bola", "Ursinho", "TV", "Calça", "Feijão", "Aventura", "Mesa"]
        
        for i in range(quantidade):
            produto_id = i + 1
            nome = f"{random.choice(nomes_produtos)} {random.choice(['Pro', 'Plus', 'Max', 'Basic', 'Premium'])}"
            categoria = random.choice(categorias)
            
            # Decide se será inconsistente
            inconsistente = self._deve_ser_inconsistente()
            tipo_inconsistencia = None
            
            # Valores padrão
            preco = round(random.uniform(10.0, 1000.0), 2)
            estoque = random.randint(0, 500)
            peso = round(random.uniform(0.1, 50.0), 2)
            satisfacao_media = round(random.uniform(0, 5), 1)
            
            if inconsistente:
                tipo_inconsistencia = random.choice([
                    'preco_negativo', 'estoque_negativo', 'preco_zero', 
                    'nome_vazio', 'categoria_invalida', 'peso_negativo',
                    'satisfacao_invalida', 'capitalizacao_inicial', 
                    'full_caps', 'full_lower', 'capitalizacao_aleatoria'
                ])
                
                if tipo_inconsistencia == 'preco_negativo':
                    preco = round(random.uniform(-100, -0.01), 2)
                elif tipo_inconsistencia == 'estoque_negativo':
                    estoque = random.randint(-100, -1)
                elif tipo_inconsistencia == 'preco_zero':
                    preco = 0.0
                elif tipo_inconsistencia == 'nome_vazio':
                    nome = random.choice(["", " ", None])
                elif tipo_inconsistencia == 'categoria_invalida':
                    categoria = random.choice(["", "Categoria Inexistente", None, 123])
                elif tipo_inconsistencia == 'peso_negativo':
                    peso = round(random.uniform(-10, -0.01), 2)
                elif tipo_inconsistencia == 'satisfacao_invalida':
                    satisfacao_media = random.choice([-1, 6, 10, 100, None])
                elif tipo_inconsistencia in ('capitalizacao_inicial', 'full_caps', 
                                              'full_lower', 'capitalizacao_aleatoria'):
                    # Aplica inconsistência de capitalização ao nome do produto
                    nome, _ = self._aplicar_inconsistencia_capitalizacao(nome)
                
                self.estatisticas['produtos']['inconsistentes'] += 1
            else:
                self.estatisticas['produtos']['consistentes'] += 1
            
            produto = {
                "id": produto_id,
                "nome": nome,
                "categoria": categoria,
                "preco": preco,
                "estoque": estoque,
                "peso": peso,
                "satisfacao_media": satisfacao_media,
                "data_cadastro": self.data_simulacao.isoformat(),
                "inconsistente": inconsistente
            }
            produtos.append(produto)
            self.estatisticas['produtos']['total'] += 1
        
        return produtos
    
    def gerar_compras(self, quantidade=5000, clientes_ids=None, produtos_ids=None):
        """
        Gera dados de compras
        """
        compras = []
        
        if clientes_ids is None:
            clientes_ids = list(range(1, 5001))
        if produtos_ids is None:
            produtos_ids = list(range(1, 5001))
        
        for i in range(quantidade):
            compra_id = i + 1
            cliente_id = random.choice(clientes_ids)
            produto_id = random.choice(produtos_ids)
            
            # Decide se será inconsistente
            inconsistente = self._deve_ser_inconsistente()
            tipo_inconsistencia = None
            
            # Valores padrão
            quantidade_item = random.randint(1, 10)
            valor_total = round(random.uniform(10.0, 5000.0), 2)
            desconto = round(valor_total * random.uniform(0, 0.3), 2)
            data_compra = (self.data_simulacao - timedelta(days=random.randint(0, 365))).isoformat()
            status = random.choice(["pendente", "pago", "enviado", "entregue", "cancelado"])
            satisfacao = random.randint(1, 5)
            
            if inconsistente:
                tipo_inconsistencia = random.choice([
                    'quantidade_negativa', 'valor_negativo', 'cliente_inexistente',
                    'produto_inexistente', 'data_futura', 'desconto_maior_que_valor',
                    'satisfacao_invalida', 'erro_digitacao_status',
                    'capitalizacao_inicial', 'full_caps', 'full_lower', 
                    'capitalizacao_aleatoria'
                ])
                
                if tipo_inconsistencia == 'quantidade_negativa':
                    quantidade_item = random.randint(-10, -1)
                elif tipo_inconsistencia == 'valor_negativo':
                    valor_total = round(random.uniform(-1000, -0.01), 2)
                elif tipo_inconsistencia == 'cliente_inexistente':
                    cliente_id = random.randint(90000, 99999)
                elif tipo_inconsistencia == 'produto_inexistente':
                    produto_id = random.randint(90000, 99999)
                elif tipo_inconsistencia == 'data_futura':
                    data_compra = (datetime.now() + timedelta(days=365)).isoformat()
                elif tipo_inconsistencia == 'desconto_maior_que_valor':
                    valor_total = 100.0
                    desconto = 150.0
                elif tipo_inconsistencia == 'satisfacao_invalida':
                    satisfacao = random.choice([-1, 6, 10, 100, None])
                elif tipo_inconsistencia == 'erro_digitacao_status':
                    status, _ = self._aplicar_erro_digitacao_status(status)
                elif tipo_inconsistencia in ('capitalizacao_inicial', 'full_caps', 
                                              'full_lower', 'capitalizacao_aleatoria'):
                    # Aplica inconsistência de capitalização ao status
                    status, _ = self._aplicar_inconsistencia_capitalizacao(status)
                
                self.estatisticas['compras']['inconsistentes'] += 1
            else:
                self.estatisticas['compras']['consistentes'] += 1
            
            compra = {
                "id": compra_id,
                "cliente_id": cliente_id,
                "produto_id": produto_id,
                "quantidade": quantidade_item,
                "valor_total": valor_total,
                "desconto": desconto,
                "data_compra": data_compra,
                "status": status,
                "satisfacao": satisfacao,
                "inconsistente": inconsistente
            }
            compras.append(compra)
            self.estatisticas['compras']['total'] += 1
        
        return compras
    
    def salvar_csv(self, dados, nome_arquivo):
        """
        Salva os dados em um arquivo CSV
        """
        if not dados:
            return
        
        campos = list(dados[0].keys())
        
        with open(nome_arquivo, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=campos)
            writer.writeheader()
            writer.writerows(dados)
    
    def executar_simulacao(self):
        """
        Executa a simulação completa
        """
        print("=" * 70)
        print(f"SIMULADOR DE DADOS - CICLO #{self.contador_arquivo}")
        print("=" * 70)
        print(f"Data de simulação: {self.data_simulacao.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Taxa de consistência: {self.taxa_consistencia}%")
        print("=" * 70)
        print()
        
        # Inicia contagem de tempo
        tempo_inicio = time.time()
        
        # Gera dados
        print("Gerando clientes...")
        clientes = self.gerar_clientes(5000)
        print(f"  ✓ {len(clientes)} clientes gerados")
        
        print("Gerando produtos...")
        produtos = self.gerar_produtos(5000)
        print(f"  ✓ {len(produtos)} produtos gerados")
        
        print("Gerando compras...")
        clientes_ids = [c['id'] for c in clientes]
        produtos_ids = [p['id'] for p in produtos]
        compras = self.gerar_compras(5000, clientes_ids, produtos_ids)
        print(f"  ✓ {len(compras)} compras geradas")
        
        # Calcula tempo total
        tempo_fim = time.time()
        tempo_total = tempo_fim - tempo_inicio
        
        # Salva arquivos
        print("\nSalvando arquivos CSV...")
        self.salvar_csv(clientes, f"clientes_{self.contador_arquivo}.csv")
        self.salvar_csv(produtos, f"produtos_{self.contador_arquivo}.csv")
        self.salvar_csv(compras, f"compras_{self.contador_arquivo}.csv")
        print(f"  ✓ Arquivos salvos com sucesso (ciclo {self.contador_arquivo})")
        
        # Exibe relatório
        self.exibir_relatorio(tempo_total)
    
    def exibir_relatorio(self, tempo_total):
        """
        Exibe o relatório final da simulação
        """
        print("\n" + "=" * 70)
        print("RELATÓRIO FINAL")
        print("=" * 70)
        
        print(f"\n📅 Data de simulação: {self.data_simulacao.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⏱️  Tempo de geração: {tempo_total:.4f} segundos")
        print(f"📊 Total de registros: {sum(s['total'] for s in self.estatisticas.values())}")
        
        print("\n" + "-" * 70)
        print("ESTATÍSTICAS POR TIPO DE DADO")
        print("-" * 70)
        
        for tipo, stats in self.estatisticas.items():
            print(f"\n{tipo.upper()}:")
            print(f"  Total gerado: {stats['total']}")
            print(f"  ✓ Consistentes: {stats['consistentes']}")
            print(f"  ✗ Inconsistentes: {stats['inconsistentes']}")
            if stats['total'] > 0:
                taxa = (stats['consistentes'] / stats['total']) * 100
                print(f"  Taxa de consistência: {taxa:.2f}%")
        
        # Totais gerais
        total_geral = sum(s['total'] for s in self.estatisticas.values())
        total_consistentes = sum(s['consistentes'] for s in self.estatisticas.values())
        total_inconsistentes = sum(s['inconsistentes'] for s in self.estatisticas.values())
        
        print("\n" + "-" * 70)
        print("TOTAIS GERAIS")
        print("-" * 70)
        print(f"Total de registros: {total_geral}")
        print(f"✓ Total consistentes: {total_consistentes}")
        print(f"✗ Total inconsistentes: {total_inconsistentes}")
        print(f"Taxa de consistência global: {(total_consistentes/total_geral)*100:.2f}%")
        
        print("\n" + "=" * 70)
        print("SIMULAÇÃO CONCLUÍDA")
        print("=" * 70)


class GerenciadorSimulacao:
    def __init__(self, taxa_consistencia):
        self.taxa_consistencia = taxa_consistencia
        self.rodando = False
        self.contador = 1
    
    def iniciar_loop(self):
        """Inicia o loop de simulação"""
        self.rodando = True
        print("\n" + "=" * 70)
        print("INICIANDO LOOP DE SIMULAÇÃO")
        print("=" * 70)
        print("Pressione CTRL + C para parar o loop")
        print("=" * 70 + "\n")
        
        while self.rodando:
            try:
                simulador = SimuladorDados(
                    taxa_consistencia=self.taxa_consistencia,
                    contador_arquivo=self.contador
                )
                simulador.executar_simulacao()
                
                self.contador += 1
                
                if self.rodando:
                    print(f"\n⏳ Aguardando 3 segundos para próximo ciclo...")
                    print(f"💡 Pressione CTRL + C para parar\n")
                    
                    for _ in range(30):
                        if not self.rodando:
                            break
                        time.sleep(0.1)
                        
            except KeyboardInterrupt:
                self.parar()
                break
            except Exception as e:
                print(f"\n❌ Erro durante a simulação: {e}")
                if self.rodando:
                    time.sleep(3)
    
    def parar(self):
        """Para o loop de simulação"""
        self.rodando = False
        print("\n" + "=" * 70)
        print("LOOP DE SIMULAÇÃO PARADO")
        print("=" * 70)
        print(f"Total de ciclos executados: {self.contador - 1}")
        print("=" * 70)


def main():
    """
    Função principal
    """
    print("\n" + "=" * 70)
    print("CONFIGURAÇÃO DA SIMULAÇÃO")
    print("=" * 70)
    
    while True:
        try:
            taxa = float(input("\nDigite a taxa de consistência (0-100): "))
            if 0 <= taxa <= 100:
                break
            else:
                print("Por favor, digite um valor entre 0 e 100.")
        except ValueError:
            print("Por favor, digite um número válido.")
    
    gerenciador = GerenciadorSimulacao(taxa_consistencia=taxa)
    gerenciador.iniciar_loop()


if __name__ == "__main__":
    main()
