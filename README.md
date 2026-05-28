# Economia com História – Angola

Plataforma educativa digital desenvolvida no âmbito da disciplina de Engenharia de Software, com foco na aprendizagem da história e economia de Angola através de conteúdos interativos, quizzes, fóruns e participação ativa dos utilizadores.

A solução é composta por:

* 🌐 Frontend Web em Angular
* 📱 Aplicação Mobile em Flutter
* ⚙️ Backend REST API em Laravel
* 🗄️ Base de Dados MySQL

---

# 📚 Objetivo do Projeto

O projeto “Economia com História – Angola” tem como objetivo disponibilizar uma plataforma moderna de aprendizagem digital, permitindo que estudantes, professores e utilizadores em geral possam acessar conteúdos históricos e económicos de forma organizada, interativa e dinâmica.

A plataforma foi concebida para incentivar:

* Aprendizagem ativa
* Pensamento crítico
* Participação em discussões
* Avaliação contínua através de quizzes
* Compartilhamento de conhecimento

---

# 🏗️ Arquitetura da Solução

O sistema segue uma arquitetura distribuída em camadas:

```txt id="j7j3ew"
Frontend Web (Angular)
            ↓
Frontend Mobile (Flutter)
            ↓
REST API (Laravel)
            ↓
MySQL Database
```

---

# 🚀 Tecnologias Utilizadas

## Frontend Web

* Angular
* TypeScript
* RxJS
* Angular Router
* Angular HttpClient

---

## Mobile

* Flutter
* Dart

---

## Backend

* PHP 8+
* Laravel 12
* Laravel Sanctum
* REST API
* DTO Pattern
* Repository Pattern
* Service Layer

---

## Base de Dados

* MySQL

---

# 🧩 Funcionalidades Principais

## 👤 Gestão de Utilizadores

* Registro
* Login
* Logout
* Gestão de perfil
* Sistema de roles

---

## 📚 Conteúdos Educativos

* Criação de conteúdos
* Organização por categorias
* Conteúdos públicos e privados
* Upload de imagens e vídeos

---

## 💬 Interações

* Comentários
* Respostas
* Reações
* Fóruns de discussão

---

## 🧠 Quizzes

* Perguntas de múltipla escolha
* Correção automática
* Feedback imediato
* Controle de tempo
* Resultados e pontuação

---

## 🔔 Notificações

* Novos comentários
* Reações
* Novos seguidores
* Atualizações da plataforma

---

# 🏛️ Arquitetura Backend

O backend segue arquitetura em camadas:

```txt id="b33q4q"
Controller
   ↓
Service
   ↓
Repository
   ↓
Model
   ↓
Database
```

Estrutura principal:

```txt id="g4l4qs"
app/
├── DTOs/
├── Http/
│   ├── Controllers/
│   └── Requests/
├── Models/
├── Repositories/
├── Services/
```

---

# 🔐 Segurança

O sistema utiliza:

* Laravel Sanctum
* Autenticação via Bearer Token
* Proteção de rotas
* Validação de dados
* Middleware de autenticação

---

# 🗄️ Base de Dados

Principais entidades:

* users
* roles
* user_roles
* categories
* contents
* comments
* reactions
* quizzes
* questions
* quiz_answers
* notifications
* forums
* forum_topics
* forum_replies

---

# ⚙️ Instalação do Backend

## 1. Clonar repositório

```bash id="7m89r7"
git clone https://github.com/SEU_USUARIO/economia-historia-api.git
```

---

## 2. Entrar na pasta

```bash id="p2ydln"
cd economia-historia-api
```

---

## 3. Instalar dependências

```bash id="fdf0yv"
composer install
```

---

## 4. Configurar ambiente

```bash id="vf7m0m"
cp .env.example .env
```

---

## 5. Gerar chave da aplicação

```bash id="nmphh6"
php artisan key:generate
```

---

## 6. Configurar MySQL no `.env`

```env id="m3b2n9"
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=economia_historia
DB_USERNAME=root
DB_PASSWORD=
```

---

## 7. Executar migrations

```bash id="0mp10s"
php artisan migrate
```

---

## 8. Rodar servidor

```bash id="lj07l9"
php artisan serve
```

Servidor:

```txt id="g4e2kr"
http://127.0.0.1:8000
```

---

# 🔗 API Endpoints

## Auth

| Método | Endpoint         |
| ------ | ---------------- |
| POST   | /api/v1/register |
| POST   | /api/v1/login    |
| POST   | /api/v1/logout   |

---

## Categories

| Método | Endpoint                |
| ------ | ----------------------- |
| GET    | /api/v1/categories      |
| POST   | /api/v1/categories      |
| GET    | /api/v1/categories/{id} |

---

## Contents

| Método | Endpoint              |
| ------ | --------------------- |
| GET    | /api/v1/contents      |
| POST   | /api/v1/contents      |
| GET    | /api/v1/contents/{id} |

---

# 🧪 Testes da API

A API pode ser testada utilizando:

* Postman
* Insomnia
* CURL

---

# 📱 Aplicação Mobile

A aplicação mobile em Flutter será integrada diretamente à API Laravel, consumindo os mesmos endpoints utilizados pelo frontend web Angular.

---

# 🌐 Frontend Web

O frontend Angular será responsável por:

* Interface do utilizador
* Feed de conteúdos
* Gestão de estado
* Comunicação com API
* Navegação e experiência do utilizador

---

# 📌 Estado Atual

🚧 Projeto em desenvolvimento (MVP)

---

# 👨‍💻 Equipa

Projeto académico desenvolvido no âmbito da disciplina de Engenharia de Software.

| Nome         | GitHub                        |
| ------------ | ----------------------------- |
| Jorge Victor | https://github.com/Jorgevictor26|
| Helena Panzo | https://github.com/MariaHPanzo |
| David Jaspe  | https://github.com/jasped265 |

