# 🚀 API Fastify com Documentação Swagger

Um servidor HTTP moderno e robusto construído com **Fastify**, **TypeScript**, **Zod** e **Swagger** para documentação automática. Este projeto implementa um sistema completo de Health Check com monitoramento de métricas do sistema e documentação interativa.

## 📚 **Documentação Swagger Interativa**

A API possui documentação automática e interativa acessível em:
```
🔗 http://localhost:3333/docs
```

### **Recursos da Documentação:**
- ✅ **Try it out** - Testar endpoints diretamente na interface
- ✅ **Schema visualization** - Visualização dos modelos de dados  
- ✅ **Response examples** - Exemplos de respostas
- ✅ **Error handling** - Documentação de erros
- ✅ **Validação automática** - Schemas Zod integrados
- ✅ **Type Safety** - Tipagem completa com TypeScript

### **Configuração OpenAPI:**
- **Título**: API Health Check - Fastify + Zod
- **Descrição**: Documentação completa com validação usando Zod e TypeScript
- **Versão**: 1.0.0
- **Tags organizadas**: Root, Health, Usuarios

## 📋 Índice

- [Características](#-características)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Executar](#-como-executar)
- [Endpoints Disponíveis](#-endpoints-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração](#-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Como Foi Desenvolvido](#-como-foi-desenvolvido)
- [Próximos Passos](#-próximos-passos)
- [Documentação Swagger](#-documentação-swagger-interativa)
- [Schemas de Validação](#-schemas-de-validação)

## ✨ Características

- ⚡ **Performance**: Utiliza Fastify, um dos frameworks Node.js mais rápidos
- 🔒 **Type Safety**: Totalmente tipado com TypeScript e validação com Zod
- 🏥 **Health Check**: Endpoints dedicados para monitoramento de saúde
- 📊 **Métricas**: Coleta de métricas de CPU, memória e uptime
- 🌐 **CORS**: Configurado para desenvolvimento e produção
- 📝 **Logs**: Sistema de logging integrado
- 🛡️ **Error Handling**: Tratamento global de erros
- 🔄 **Graceful Shutdown**: Encerramento seguro do servidor
- 🔧 **Hot Reload**: Desenvolvimento com recarregamento automático

## 🛠 Tecnologias Utilizadas

- **[Fastify](https://fastify.dev/)** - Framework web rápido e eficiente
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first
- **[fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod)** - Integração Fastify + Zod
- **[@fastify/cors](https://github.com/fastify/fastify-cors)** - Plugin de CORS para Fastify
- **[tsx](https://github.com/esbuild-kit/tsx)** - Executor TypeScript com hot reload

## 📋 Pré-requisitos

- **Node.js** versão 18 ou superior
- **npm** ou **yarn**

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd server/01
```

2. **Instale as dependências**
```bash
npm install
```

### 📦 Comandos para Instalação de Dependências

#### **Instalar todas de uma vez:**
```bash
npm install
```

#### **Dependências de Produção:**
```bash
npm install fastify @fastify/cors zod fastify-type-provider-zod
```

#### **Dependências de Desenvolvimento:**
```bash
npm install -D typescript @types/node tsx @biomejs/biome
```

#### **Comando completo em uma linha:**
```bash
npm install fastify @fastify/cors zod fastify-type-provider-zod && npm install -D typescript @types/node tsx @biomejs/biome
```

#### **Para projetos novos (do zero):**
```bash
# Inicializar projeto
npm init -y

# Instalar todas as dependências
npm install fastify @fastify/cors zod fastify-type-provider-zod
npm install -D typescript @types/node tsx @biomejs/biome

# Criar configuração TypeScript
npx tsc --init
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as configurações conforme necessário
```

## ▶️ Como Executar

### Modo Desenvolvimento (Recomendado)
```bash
npm run dev
```

### Modo Produção
```bash
# Build do projeto
npm run build

# Executar em produção
npm start
```

### Executar diretamente com tsx
```bash
npx tsx watch src/server.ts
```

### Comandos NPX Úteis
```bash
# Executar TypeScript diretamente (sem build)
npx tsx src/server.ts

# Executar com watch mode (recarrega automaticamente)
npx tsx watch src/server.ts

# Inicializar configuração TypeScript
npx tsc --init

# Compilar TypeScript manualmente
npx tsc

# Verificar versões dos pacotes
npx npm-check-updates

# Executar linter/formatter
npx biome check src/
npx biome format src/
```

## 🎯 Endpoints Disponíveis

### **GET /** 
Rota principal da API
```json
{
  "message": "API está funcionando!",
  "api": "Fastify Server",
  "version": "1.0.0",
  "endpoints": ["/health", "/status"]
}
```

### **GET /health**
Health Check básico
```json
{
  "status": "ok",
  "timestamp": "2025-07-08T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0"
}
```

### **GET /status**
Status detalhado com métricas do sistema
```json
{
  "status": "ok",
  "timestamp": "2025-07-08T10:30:00.000Z",
  "uptime": 123.456,
  "memory": {
    "used": 45678912,
    "total": 134217728,
    "percentage": 34
  },
  "cpu": {
    "usage": 0.0234
  },
  "environment": "development",
  "version": "1.0.0",
  "nodeVersion": "v20.10.0"
}
```

## 📁 Estrutura do Projeto

```
01/
├── src/
│   └── server.ts          # Arquivo principal do servidor
├── dist/                  # Arquivos compilados (gerado pelo build)
├── .env                   # Variáveis de ambiente
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração do TypeScript
└── README.md             # Este arquivo
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# Configurações do servidor
PORT=3333
HOST=localhost
NODE_ENV=development

# Configurações de CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Executa a versão compilada em produção
- `npm test` - Executa os testes (a implementar)

## 🔨 Como Foi Desenvolvido

### 1. **Configuração Inicial**
- Setup do projeto com TypeScript e ESM modules
- Configuração do tsconfig.json para módulos ES
- Instalação das dependências base (Fastify, Zod, TypeScript)

### 2. **Estrutura do Servidor**
- Criação da instância Fastify com logger habilitado
- Configuração do ZodTypeProvider para type safety
- Setup dos compiladores de validação e serialização

### 3. **Implementação dos Endpoints**
- **Rota raiz (/)**: Informações básicas da API
- **Health Check (/health)**: Verificação básica de saúde
- **Status (/status)**: Métricas detalhadas do sistema

### 4. **Funcionalidades Avançadas**
- **CORS**: Configurado para múltiplas origens
- **Error Handling**: Tratamento global de erros
- **Graceful Shutdown**: Encerramento seguro com sinais SIGTERM/SIGINT
- **Métricas**: Coleta de dados de CPU, memória e uptime

### 5. **Validação e Type Safety**
- Schemas Zod para todas as respostas
- Tipagem completa com TypeScript
- Validação automática de requests/responses

### 6. **DevOps e Produção**
- Scripts para desenvolvimento e produção
- Configuração de variáveis de ambiente
- Hot reload para desenvolvimento

## 🔄 Próximos Passos

- [ ] Implementar testes unitários e de integração
- [ ] Adicionar documentação Swagger/OpenAPI
- [ ] Implementar middleware de rate limiting
- [ ] Adicionar autenticação JWT
- [ ] Configurar Docker e Docker Compose
- [ ] Implementar métricas com Prometheus
- [ ] Adicionar logs estruturados
- [ ] Setup de CI/CD

## 🐛 Solução de Problemas

### Erro: "address already in use"
```bash
# Verificar qual processo está usando a porta
netstat -ano | findstr :3333

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# Ou mudar a porta no arquivo .env
PORT=3334
```

## 📝 Licença

Este projeto está sob a licença ISC.

---

**Desenvolvido com ❤️ usando Fastify + TypeScript + Zod**
