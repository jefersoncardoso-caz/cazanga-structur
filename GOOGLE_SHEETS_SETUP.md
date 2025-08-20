# Configuração do Google Sheets para Organogramas Cazanga

## Passo a Passo para Configuração

### 1. Criar a Planilha no Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com)
2. Clique em "Criar" e crie uma nova planilha
3. Nomeie a planilha como "Organogramas Cazanga"

### 2. Configurar as Abas Necessárias

Crie as seguintes abas na planilha:

#### Aba: "Funcionarios"
Crie uma aba chamada "Funcionarios" com as seguintes colunas:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **ID** | **Nome** | **Cargo** | **Departamento** | **Equipe** | **Descrição** | **Foto (URL)** | **É Gerente** | **ID do Superior** | **Visível** |
| func-001 | João Silva | Gerente de TI | TI | - | Responsável pela área de TI | https://... | TRUE | - | TRUE |
| func-002 | Maria Santos | Analista de Sistemas | TI | Desenvolvimento | Desenvolve sistemas internos | https://... | FALSE | func-001 | TRUE |

#### Aba: "Departamentos"
Crie uma aba chamada "Departamentos" com as seguintes colunas:

| A | B | C | D |
|---|---|---|---|
| **ID** | **Nome** | **Cor** | **Visível** |
| dept-001 | Tecnologia da Informação | #1f4e78 | TRUE |
| dept-002 | Gente e Gestão | #548235 | TRUE |
| dept-003 | DHO | #e74c3c | TRUE |

#### Aba: "Configuracoes"
Crie uma aba chamada "Configuracoes" com as seguintes linhas:

| A | B |
|---|---|
| **Configuração** | **Valor** |
| companyName | Cazanga |
| primaryColor | #1f4e78 |
| secondaryColor | #548235 |
| introText | Explore nossa estrutura organizacional de forma interativa e detalhada. |
| logo | https://url-do-logo.com/logo.png |
| carouselImages | https://img1.com, https://img2.com, https://img3.com |

#### Aba: "Organogramas"
Crie uma aba chamada "Organogramas" para organogramas personalizados:

| A | B | C | D | E |
|---|---|---|---|---|
| **ID** | **Nome** | **Tipo** | **Dados (JSON)** | **Visível** |
| org-001 | DHO 2025 | team | {"manager": "...", "members": [...]} | TRUE |

### 3. Configurar Permissões

1. Clique em "Compartilhar" no canto superior direito
2. Altere as permissões para "Qualquer pessoa com o link pode visualizar"
3. Copie o link da planilha

### 4. Obter API Key do Google Sheets

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Sheets:
   - Vá para "APIs e Serviços" > "Biblioteca"
   - Procure por "Google Sheets API"
   - Clique em "Ativar"
4. Crie uma chave de API:
   - Vá para "APIs e Serviços" > "Credenciais"
   - Clique em "Criar credenciais" > "Chave de API"
   - Copie a chave gerada

### 5. Configurar no Sistema

1. No painel administrativo, vá para a aba "Google Sheets"
2. Cole a API Key no campo correspondente
3. Cole a URL da planilha no campo correspondente
4. Clique em "Testar Conexão"
5. Se a conexão for bem-sucedida, clique em "Importar Dados"

## Exemplo de Dados para Teste

### Funcionários de Exemplo:
```
func-001 | GERENTE DE GENTE E GESTÃO | Gerente de Gente e Gestão | Gente e Gestão | - | Responsável pela gestão de pessoas | - | TRUE | - | TRUE
func-002 | ANALISTA DE RH PL | Analista de RH Pleno | Gente e Gestão | DHO | Atua na área de recursos humanos | - | FALSE | func-001 | TRUE
func-003 | COORDENADOR DE DEPARTAMENTO PESSOAL | Coordenador | Gente e Gestão | DEPARTAMENTO PESSOAL | Coordena o departamento pessoal | - | TRUE | func-001 | TRUE
```

### Departamentos de Exemplo:
```
dept-001 | Gente e Gestão | #548235 | TRUE
dept-002 | DHO | #e74c3c | TRUE
dept-003 | DEPARTAMENTO PESSOAL | #3498db | TRUE
dept-004 | FACILITIES | #f39c12 | TRUE
dept-005 | SESMT | #9b59b6 | TRUE
dept-006 | SGQ | #1abc9c | TRUE
```

## Estrutura de Pastas Recomendada no Google Drive

```
📁 Cazanga Organogramas/
├── 📄 Organogramas Cazanga.xlsx (planilha principal)
├── 📁 Fotos Funcionários/
│   ├── 🖼️ joao-silva.jpg
│   ├── 🖼️ maria-santos.jpg
│   └── ...
├── 📁 Logos e Imagens/
│   ├── 🖼️ logo-cazanga.png
│   ├── 🖼️ carousel-1.jpg
│   └── ...
└── 📁 Documentos/
    ├── 📄 descricoes-cargos.pdf
    └── ...
```

## Dicas Importantes

1. **URLs das Imagens**: Use links públicos do Google Drive ou outros serviços de hosting
2. **Cores**: Use formato hexadecimal (#1f4e78) para as cores
3. **Booleanos**: Use TRUE/FALSE para campos booleanos
4. **IDs**: Mantenha IDs únicos e consistentes
5. **Backup**: Faça backup regular da planilha
6. **Sincronização**: Sempre importe os dados após fazer alterações na planilha

## Troubleshooting

### Problema: "Erro na conexão"
- Verifique se a API Key está correta
- Confirme se a Google Sheets API está ativada
- Verifique se a planilha está pública

### Problema: "Dados não aparecem"
- Verifique se os nomes das abas estão corretos
- Confirme se as colunas estão na ordem correta
- Verifique se não há células vazias nas primeiras linhas

### Problema: "Imagens não carregam"
- Verifique se as URLs das imagens são públicas
- Use links diretos para as imagens
- Teste as URLs em uma nova aba do navegador