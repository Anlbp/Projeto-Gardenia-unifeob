# Não esqueça de usar o comando: pip install pandas numpy matplotlib seaborn scikit-learn

# ============================================================
# SEGMENTAÇÃO DE CLIENTES COM RFM + K-MEANS
# ============================================================
# Lê o arquivo "compras.csv" na mesma pasta do script
# Gera segmentação de clientes com base em RFM
# ============================================================

# ------------------------------------------------------------
# 0. (OPCIONAL) Deploy do Google Drive — descomente se for Colab
# ------------------------------------------------------------
# from google.colab import drive
# drive.mount('/content/drive')
# CAMINHO = '/content/drive/MyDrive/compras.csv'
CAMINHO = 'compras.csv'


# ------------------------------------------------------------
# 1. IMPORTS
# ------------------------------------------------------------
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score
from sklearn.decomposition import PCA

import warnings
warnings.filterwarnings('ignore')

sns.set(style='whitegrid')
plt.rcParams['figure.figsize'] = (10, 6)
np.random.seed(42)


# ------------------------------------------------------------
# 2. CARREGAMENTO DOS DADOS
# ------------------------------------------------------------
if not os.path.exists(CAMINHO):
    raise FileNotFoundError(f"Arquivo '{CAMINHO}' não encontrado na pasta atual.")

df = pd.read_csv(CAMINHO)
print("=" * 60)
print("CARREGAMENTO DOS DADOS")
print("=" * 60)
print(f"Shape original: {df.shape}")
print(df.head(), "\n")


# ------------------------------------------------------------
# 3. LIMPEZA DOS DADOS
# ------------------------------------------------------------
print("=" * 60)
print("LIMPEZA DOS DADOS")
print("=" * 60)

# 3.1 Converter data
df['data_compra'] = pd.to_datetime(df['data_compra'], errors='coerce')

# 3.2 Remover registros inconsistentes
if 'inconsistente' in df.columns:
    qtd_inc = (df['inconsistente'] == True).sum()
    print(f"Registros marcados como inconsistentes: {qtd_inc}")
    df = df[df['inconsistente'] == False].copy()

# 3.3 Remover quantidades e valores negativos ou zero
antes = df.shape[0]
df = df[(df['quantidade'] > 0) & (df['valor_total'] > 0)]
print(f"Removidos por quantidade/valor inválido: {antes - df.shape[0]}")

# 3.4 Remover datas no futuro
hoje = pd.Timestamp.today()
antes = df.shape[0]
df = df[df['data_compra'] <= hoje]
print(f"Removidos por data futura: {antes - df.shape[0]}")

# 3.5 Remover nulos essenciais
antes = df.shape[0]
df = df.dropna(subset=['cliente_id', 'data_compra', 'valor_total'])
print(f"Removidos por nulos: {antes - df.shape[0]}")

# 3.6 Remover outliers extremos de valor_total (acima do percentil 99)
q99 = df['valor_total'].quantile(0.99)
antes = df.shape[0]
df = df[df['valor_total'] <= q99]
print(f"Removidos por outlier de valor (> p99): {antes - df.shape[0]}")

print(f"\nShape após limpeza: {df.shape}\n")


# ------------------------------------------------------------
# 4. ENGENHARIA DE FEATURES — RFM
# ------------------------------------------------------------
print("=" * 60)
print("ENGENHARIA DE FEATURES (RFM)")
print("=" * 60)

data_ref = df['data_compra'].max() + pd.Timedelta(days=1)
print(f"Data de referência: {data_ref}")

rfm = df.groupby('cliente_id').agg(
    Recencia=('data_compra', lambda x: (data_ref - x.max()).days),
    Frequencia=('id', 'count'),
    Valor=('valor_total', 'sum'),
    TicketMedio=('valor_total', 'mean')
).reset_index()

print(f"Clientes únicos: {rfm.shape[0]}")
print(rfm.head(), "\n")
print(rfm.describe(), "\n")


# ------------------------------------------------------------
# 5. PRÉ-PROCESSAMENTO (PADRONIZAÇÃO)
# ------------------------------------------------------------
features = ['Recencia', 'Frequencia', 'Valor', 'TicketMedio']
X = rfm[features].copy()

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("=" * 60)
print(f"X_scaled shape: {X_scaled.shape}")
print("=" * 60, "\n")


# ------------------------------------------------------------
# 6. ESCOLHA DO NÚMERO DE CLUSTERS (ELBOW + SILHOUETTE)
# ------------------------------------------------------------
print("Avaliando k de 2 a 10...")

inercias = []
silhuetas = []
K_range = range(2, 11)

for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    inercias.append(km.inertia_)
    silhuetas.append(silhouette_score(X_scaled, labels))

fig, ax = plt.subplots(1, 2, figsize=(14, 5))
ax[0].plot(list(K_range), inercias, marker='o')
ax[0].set_title('Método Elbow (Inércia)')
ax[0].set_xlabel('k')
ax[0].set_ylabel('Inércia')

ax[1].plot(list(K_range), silhuetas, marker='o', color='green')
ax[1].set_title('Silhouette Score')
ax[1].set_xlabel('k')
ax[1].set_ylabel('Score')

plt.tight_layout()
plt.savefig('avaliacao_k.png', dpi=120)
plt.show()

print("\nInércias:", [round(i, 2) for i in inercias])
print("Silhuetas:", [round(s, 4) for s in silhuetas], "\n")


# ------------------------------------------------------------
# 7. TREINO DO MODELO FINAL
# ------------------------------------------------------------
K_ESCOLHIDO = 4  # ajuste conforme os gráficos acima

print("=" * 60)
print(f"TREINANDO K-MEANS COM k = {K_ESCOLHIDO}")
print("=" * 60)

kmeans = KMeans(n_clusters=K_ESCOLHIDO, random_state=42, n_init=10)
rfm['Cluster'] = kmeans.fit_predict(X_scaled)

sil = silhouette_score(X_scaled, rfm['Cluster'])
db = davies_bouldin_score(X_scaled, rfm['Cluster'])
print(f"Silhouette Score: {sil:.4f}")
print(f"Davies-Bouldin:   {db:.4f}\n")


# ------------------------------------------------------------
# 8. INTERPRETAÇÃO DOS CLUSTERS
# ------------------------------------------------------------
print("=" * 60)
print("PERFIL DOS CLUSTERS")
print("=" * 60)

perfil = rfm.groupby('Cluster')[features].mean().round(2)
perfil['QtdClientes'] = rfm.groupby('Cluster').size()
print(perfil, "\n")


# ------------------------------------------------------------
# 9. VISUALIZAÇÕES
# ------------------------------------------------------------
# 9.1 PCA — visualização 2D dos clusters
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

plt.figure(figsize=(10, 6))
sns.scatterplot(x=X_pca[:, 0], y=X_pca[:, 1],
                hue=rfm['Cluster'], palette='Set2', s=60)
plt.title('Clusters de Clientes (PCA)')
plt.xlabel('Componente 1')
plt.ylabel('Componente 2')
plt.legend(title='Cluster')
plt.tight_layout()
plt.savefig('clusters_pca.png', dpi=120)
plt.show()

# 9.2 Boxplots por cluster
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
for ax, col in zip(axes.flatten(), features):
    sns.boxplot(data=rfm, x='Cluster', y=col, ax=ax, palette='Set2')
    ax.set_title(col)
plt.tight_layout()
plt.savefig('boxplots_clusters.png', dpi=120)
plt.show()


# ------------------------------------------------------------
# 10. INSIGHTS DE NEGÓCIO
# ------------------------------------------------------------
print("=" * 60)
print("INSIGHTS DE NEGÓCIO")
print("=" * 60)
print("""
Com base no perfil dos clusters, classifique cada grupo:
  - Cluster VIP:        baixa recência, alta frequência, alto valor
                        -> Programa de fidelidade / atendimento premium
  - Cluster Em Risco:   alta recência, baixa frequência
                        -> Campanha de reativação
  - Cluster Promissor:  recente, mas baixo valor
                        -> Upsell / cross-sell
  - Cluster Inativo:    alta recência, baixo valor
                        -> E-mail de win-back ou descarte
""")


# ------------------------------------------------------------
# 11. EXPORTAÇÃO DOS RESULTADOS
# ------------------------------------------------------------

# ------------------------------------------------------------
# 11. EXPORTAÇÃO DOS RESULTADOS
# ------------------------------------------------------------
rfm['Valor'] = rfm['Valor'].round(2)
rfm['TicketMedio'] = rfm['TicketMedio'].round(2)

rfm.to_csv('resultado_segmentacao.csv', index=False)
perfil.to_csv('perfil_clusters.csv')

print("Arquivos salvos:")
print("  - resultado_segmentacao.csv")
print("  - perfil_clusters.csv")
print("  - avaliacao_k.png")
print("  - clusters_pca.png")
print("  - boxplots_clusters.png")
