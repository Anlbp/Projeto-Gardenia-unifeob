import csv
import random
import uuid
from datetime import datetime

# Substitua pelas variáveis do seu Projeto Integrado
def gerar_dados(quantidade=10):
    registros = []
    for _ in range(quantidade):
        registro = {
            "id": str(uuid.uuid4())[:8],                    # Identificador único
            "timestamp": datetime.now().isoformat(),         # Informação temporal
            "temperatura": round(random.uniform(20.0, 35.0), 2), # Variável 1
            "umidade": round(random.uniform(30.0, 80.0), 2),    # Variável 2
            "pressao": round(random.uniform(980.0, 1020.0), 2)  # Variável 3
        }
        registros.append(registro)
    return registros

def salvar_csv(registros, caminho_arquivo="dados_simulados.csv"):
    campos = ["id", "timestamp", "temperatura", "umidade", "pressao"]
    
    # Escreve ou adiciona novos registros sem apagar os antigos
    with open(caminho_arquivo, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=campos)
        if f.tell() == 0:
            writer.writeheader()
        writer.writerows(registros)

if __name__ == "__main__":
    dados = gerar_dados(10) # Garante pelo menos 10 registros
    salvar_csv(dados)
    print(f"Sucesso: {len(dados)} registros gerados e salvos.")