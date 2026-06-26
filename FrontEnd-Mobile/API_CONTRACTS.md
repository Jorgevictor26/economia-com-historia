# Contratos da API usados pelo FrontEnd-Mobile

Este documento registra os contratos lidos no BackEnd Laravel e usados pelo app
Flutter. O BackEnd e a fonte da verdade; qualquer divergencia deve ser resolvida
no FrontEnd-Mobile.

## Base

- Prefixo: `/api/v1`
- URL padrao no app: `http://127.0.0.1:8000/api/v1`
- Override em build: `--dart-define=API_BASE_URL=https://host/api/v1`
- Autenticacao: token Sanctum enviado como `Authorization: Bearer {token}`
- Endpoints publicos podem ser consumidos sem login; interacoes exigem login.

## Respostas e erros

O BackEnd mistura respostas diretas, paginadores Laravel e envelopes
`{ success, message, data }`. O `ApiClient.unwrapData` normaliza envelopes para
os servicos.

- `200`: sucesso em listagem/detalhe/atualizacao
- `201`: criacao concluida
- `400`: pedido invalido
- `401`: token ausente ou invalido; o app limpa sessao
- `403`: acesso negado ou conta inativa/suspensa
- `404`: recurso nao encontrado
- `409`: conflito de regra de negocio
- `422`: validacao de campos
- `500+`: erro de servidor

## DTOs principais

### User

Campos usados: `id`, `name`, `email`, `photo`, `bio`, `status`,
`jindungo_subscription_expires_at`, `roles[]`.

### Content

Campos usados: `id`, `user_id`, `category_id`, `content_type_id`, `title`,
`summary`, `content`, `image`, `video`, `image_url`, `video_url`, `audio_url`,
`document_url`, `visibility`, `views_count`, `reactions_count`,
`comments_count`, `liked_by_me`, `user/author`, `category`, `content_type`,
`created_at`, `updated_at`.

### SavedContent

Campos usados: `id`, `user_id`, `content_id`, `content`, `created_at`.

### Comment

Campos usados: `id`, `content_id`, `user_id`, `comment`, `user`, `replies[]`,
`created_at`, `updated_at`.

### Forum

Campos usados: `id`, `user_id`, `name`, `description`, `status`,
`topics_count`, `user`, `topics[]`, `created_at`, `updated_at`.

### ForumTopic

Campos usados: `id`, `forum_id`, `user_id`, `title`, `content`,
`replies_count`, `user`, `replies[]`, `created_at`, `updated_at`.

### Quiz

Campos usados: `id`, `user_id`, `content_id`, `title`, `description`,
`time_limit`, `questions_count`, `user`, `content`, `questions[]`,
`created_at`, `updated_at`.

### Question

Campos usados: `id`, `quiz_id`, `question`, `option_a`, `option_b`,
`option_c`, `option_d`, `correct_option`, `explanation`.

### Notification

Campos usados: `id`, `user_id`, `title`, `message`, `is_read`, `created_at`,
`updated_at`.

## Endpoints

### Autenticacao

`POST /register`

- Body: `name`, `email`, `password`, `password_confirmation`
- Response: `{ success, message, data: { user, token, token_type } }`
- Erros: `400`, `422`

`POST /login`

- Body: `email`, `password`
- Response: `{ success, message, data: { user, token, token_type } }`
- Erros: `400`, `401`, `403`, `422`

`POST /forgot-password`

- Body: `email`
- Erros: `400`, `422`

`POST /reset-password`

- Body: `email`, `token`, `password`, `password_confirmation`
- Erros: `400`, `422`

`POST /logout`

- Autenticacao: Bearer Token
- Erros: `401`

### Perfil

`GET /profile`

- Autenticacao: Bearer Token
- Response: `User`
- Erros: `401`, `403`

`PUT /profile`

- Autenticacao: Bearer Token
- Body: `name`, `bio`, opcional `photo`
- Response: `User`
- Erros: `401`, `403`, `422`

### Taxonomia

`GET /categories`

- Publico
- Response: `[Category]`

`GET /content-types`

- Publico
- Response: `[ContentType]`

### Conteudos

`GET /contents`

- Publico
- Query: `page`, `category_id`, `content_type_id`, `type`, `search`
- Response: paginador Laravel com `data: [Content]`
- Erros: `400`

`GET /contents/{id}`

- Publico
- Response: `Content`
- Erros: `404`

`POST /comments`

- Autenticacao: Bearer Token
- Body: `content_id`, `comment`
- Response: `Comment`
- Erros: `401`, `403`, `422`

`GET /comments/content/{contentId}`

- Publico
- Response: `[Comment]`

`POST /comments/{commentId}/reply`

- Autenticacao: Bearer Token
- Body: `reply`
- Response: `CommentReply`
- Erros: `401`, `403`, `422`

`POST /reactions`

- Autenticacao: Bearer Token
- Body: `content_id`, `reaction_type`
- Response: resultado de toggle
- Erros: `401`, `403`, `409`, `422`

`GET /reactions/content/{contentId}/count`

- Publico
- Response: `[ReactionSummary]`

`GET /my-saved-contents`

- Autenticacao: Bearer Token
- Query: `page`
- Response: paginador Laravel com `data: [SavedContent]`
- Erros: `401`, `403`

`POST /saved-contents`

- Autenticacao: Bearer Token
- Body: `content_id`
- Response: `SavedContent`
- Erros: `401`, `403`, `422`

`DELETE /saved-contents/{contentId}`

- Autenticacao: Bearer Token
- Erros: `401`, `403`, `404`

### Podcasts

Nao existe controller dedicado de podcasts no BackEnd. O mobile consome
podcasts via conteudos:

`GET /contents?type=podcast`

- Publico
- Response: paginador Laravel com `data: [Content]`
- Observacao: se o BackEnd nao cadastrar `type=podcast`, a tela exibe estado
  vazio. Conteudos com `audio_url` tambem sao tratados como audio no modelo.

### Forums

`GET /forums`

- Publico
- Response: `[Forum]`

`POST /forums`

- Autenticacao: Bearer Token
- Body: `name`, `description`
- Response: `Forum`
- Erros: `401`, `403`, `422`

`GET /forums/{id}`

- Publico
- Response: `Forum`
- Erros: `404`

`GET /forums/{forumId}/topics`

- Publico
- Response: `[ForumTopic]`

`POST /forums/{forumId}/topics`

- Autenticacao: Bearer Token
- Body: `title`, `content`
- Response: `ForumTopic`
- Erros: `401`, `403`, `422`

`GET /topics/{id}`

- Publico
- Response: `ForumTopic`

`GET /topics/{topicId}/replies`

- Publico
- Response: `[ForumReply]`

`POST /topics/{topicId}/replies`

- Autenticacao: Bearer Token
- Body: `reply`
- Response: `ForumReply`
- Erros: `401`, `403`, `422`

### Quizzes

`GET /quizzes`

- Publico
- Query: `page`, `search`
- Response: paginador Laravel com `data: [Quiz]`

`GET /quizzes/{id}`

- Publico
- Response: `Quiz`

`GET /quizzes/{id}/questions`

- Publico
- Response: `[Question]`

`POST /quizzes/{id}/submit`

- Autenticacao: Bearer Token
- Body: `started_at`, `answers: [{ question_id, selected_option }]`
- Response: `QuizResult`
- Erros: `401`, `403`, `422`

`GET /quizzes/{id}/result`

- Autenticacao: Bearer Token
- Response: `QuizResult`
- Erros: `401`, `403`, `404`

`GET /my-results`

- Autenticacao: Bearer Token
- Query: `page`
- Response: paginador Laravel com `data: [UserQuizResult]`

### Notificacoes

`GET /notifications`

- Autenticacao: Bearer Token
- Response: `[Notification]`
- Erros: `401`, `403`

`PATCH /notifications/{id}/read`

- Autenticacao: Bearer Token
- Response: `Notification`
- Erros: `401`, `403`, `404`

## Mapeamento tela -> endpoints

| Tela | Endpoint(s) | Dados consumidos |
| --- | --- | --- |
| `SplashScreen` | `GET /profile` | sessao/token existente |
| `LoginScreen` | `POST /login` | email, senha, user, token |
| `CriarContaScreen` | `POST /register` | nome, email, senha, user, token |
| `EsqueceuSenhaScreen` | `POST /forgot-password` | email |
| `ReporPalavraPasseScreen` | `POST /reset-password` | email, token, senha |
| `HomeScreen` | `GET /contents`, `GET /forums` | destaques, recentes, debates |
| `ExplorarConteudoScreen` | `GET /content-types`, `GET /contents` | filtros e conteudos |
| `ConteudoScreen` | `GET /contents/{id}`, `POST /reactions`, `POST /saved-contents`, `DELETE /saved-contents/{id}` | detalhe, reacoes, favoritos |
| `DiscussaoScreen` | `GET /comments/content/{id}`, `POST /comments` | comentarios |
| `PodcastScreen` | `GET /contents?type=podcast` | podcasts |
| `PodcastSelecionadoScreen` | `GET /contents/{id}`, `GET /contents?type=podcast` | detalhe e relacionados |
| `FavoritosScreen` | `GET /my-saved-contents`, `DELETE /saved-contents/{id}` | conteudos guardados |
| `ForumScreen` | `GET /forums` | salas aprovadas |
| `CriarSalaDebateScreen` | `POST /forums` | criacao de sala |
| `SalaDeDebateScreen` | `GET /forums/{id}/topics`, `POST /forums/{id}/topics`, `GET /topics/{id}/replies`, `POST /topics/{id}/replies` | topicos e respostas |
| `SelecaoQuizScreen` | `GET /quizzes` | quizzes disponiveis |
| `PraticarQuizScreen` | `GET /quizzes/{id}/questions`, `POST /quizzes/{id}/submit` | perguntas, envio, resultado |
| `PerfilScreen` | `GET /profile`, `GET /my-results`, `POST /logout` | dados do utilizador e historico de quizzes |
| `EditarPerfilScreen` | `PUT /profile` | nome e biografia |
| `NotificacoesScreen` | `GET /notifications`, `PATCH /notifications/{id}/read` | notificacoes |
| `SearchModal` | `GET /contents?search=`, `GET /forums`, `GET /quizzes?search=` | pesquisa global |

## Regras de negocio no mobile

- Conteudos publicos, quizzes publicos e forums publicos carregam sem login.
- Comentarios, reacoes, favoritos, notificacoes, perfil e submissao de quiz
  exigem token.
- 401 limpa a sessao local e leva o utilizador de volta ao fluxo de login nas
  telas protegidas.
- 403 mostra mensagem amigavel; conta suspensa/inativa impede acesso apos login.
- O mobile nao cria telas de Admin/SuperAdmin. Todos veem as mesmas telas.
- `role` so controla visibilidade/acoes especificas, como criacao de conteudo
  quando a funcionalidade existir para Writer/Admin/SuperAdmin.
- Conteudo Jindungo e identificado por `content_type.slug == jindungo`; a UI
  mostra o estado da subscricao do perfil quando o campo existe.
