# Contexto do Projeto - Economia com Historia

Este documento resume a estrutura, o frontend e o estado atual do projeto para ajudar outras IAs ou desenvolvedores a entenderem rapidamente a aplicacao.

## Visao Geral

`economica_com_historia` e um aplicativo Flutter multiplataforma voltado para conteudo educativo sobre economia com contexto historico angolano.

O codigo atual esta concentrado no frontend/mobile, com telas de onboarding, autenticacao, recuperacao de palavra-passe e uma home com dados mockados. Ainda nao ha integracao real com backend, servico de autenticacao, API, banco de dados ou arquitetura de estado avancada.

## Stack

- Framework: Flutter
- Linguagem: Dart
- UI: Material 3
- Fonte principal: Poppins
- Persistencia local: `shared_preferences`
- Plataformas geradas: Android, iOS, Web, Windows, Linux e macOS
- Configuracao de lint: `flutter_lints`
- Icone do app: `flutter_launcher_icons`

## Estrutura Principal

```text
.
├── android/                 # Projeto Android gerado pelo Flutter
├── ios/                     # Projeto iOS gerado pelo Flutter
├── linux/                   # Projeto Linux gerado pelo Flutter
├── macos/                   # Projeto macOS gerado pelo Flutter
├── web/                     # Artefatos web: index, manifest e icones
├── windows/                 # Projeto Windows gerado pelo Flutter
├── assets/
│   ├── fonts/               # Familia Poppins em varios pesos
│   └── images/              # Logo, fundos e imagens de cards
├── lib/
│   ├── main.dart            # Entrada do app e MaterialApp
│   ├── Screens/             # Telas principais
│   ├── theme/               # Cores e tema global
│   └── widgets/             # Widgets reutilizaveis
├── test/
│   └── widget_test.dart     # Teste padrao do template Flutter
├── pubspec.yaml             # Dependencias, assets, fontes e launcher icons
└── analysis_options.yaml    # Regras de analise/lint
```

Pastas como `.dart_tool/` e `build/` sao geradas por ferramentas e nao devem ser usadas como fonte principal de entendimento do codigo.

## Dependencias Relevantes

No `pubspec.yaml`:

- `flutter`: SDK principal.
- `cupertino_icons`: icones com estilo iOS.
- `shared_preferences`: usado no onboarding/splash para gravar a flag `onboarding_done`.
- `flutter_test`: testes.
- `flutter_lints`: regras recomendadas de lint.
- `flutter_launcher_icons`: geracao de icones do app a partir de `assets/images/Logo.png`.

Assets declarados:

```yaml
assets:
  - assets/images/
```

Fontes declaradas:

```yaml
family: Poppins
weights: 400, 500, 600, 700, 800
```

Observacao: existem mais arquivos Poppins em `assets/fonts/` do que os declarados no `pubspec.yaml`; somente os pesos listados no `pubspec.yaml` estao configurados para uso direto.

## Entrada da Aplicacao

Arquivo: `lib/main.dart`

O app inicializa com:

```dart
WidgetsFlutterBinding.ensureInitialized();
runApp(const EconomiaApp());
```

`EconomiaApp` cria um `MaterialApp` com:

- `debugShowCheckedModeBanner: false`
- `title: 'Economia com História'`
- `theme: AppTheme.lightTheme`
- `home: const LoginScreen()`

Ponto importante: ha importacao e comentario indicando que a `SplashScreen` deveria ser o ponto inicial e decidir o destino apos 2 segundos, mas atualmente a `home` esta definida como `LoginScreen`. Se a intencao for usar onboarding automatico, trocar para:

```dart
home: const SplashScreen(),
```

## Tema e Design System

### `lib/theme/app_colors.dart`

Centraliza as cores do app em `AppColors`.

Cores importantes:

- `primary`: vinho/rosa escuro `0xFF8A3F50`
- `primaryDark`: tom escuro `0xFF534345`
- `background`: branco
- `cardBackground`: branco
- `inputFill`: preenchimento translucido
- `textDark`, `textMedium`, `textLight`: escala de texto
- `borderColor`, `borderSoft`: bordas
- cores do Google: azul, verde, amarelo, vermelho

Ponto de atencao: `surface` esta definido como `Color(0xF3F4F5)`. Em Flutter, o formato mais comum e `0xAARRGGBB`; esse valor tem apenas 6 digitos hexadecimais e pode resultar em alpha inesperado. Provavelmente a intencao era:

```dart
static const surface = Color(0xFFF3F4F5);
```

### `lib/theme/app_theme.dart`

Define `AppTheme.lightTheme` com:

- `useMaterial3: true`
- `ColorScheme.fromSeed(seedColor: AppColors.primaryDark)`
- `scaffoldBackgroundColor: AppColors.background`
- `fontFamily: 'Poppins'`

## Telas

### `lib/Screens/splash_screen.dart`

Tela de splash animada com logo.

Responsabilidades:

- define a status bar como transparente com icones claros;
- anima o logo com fade e scale;
- aguarda 2 segundos;
- le `SharedPreferences`;
- consulta `onboarding_done`;
- se `true`, navega para `HomeScreen`;
- se `false`, navega para `OnboardingScreen`.

Estado atual: a tela existe, mas nao e usada como tela inicial porque `main.dart` aponta para `LoginScreen`.

### `lib/Screens/onboarding_screen.dart`

Controla o onboarding em 3 paginas usando `PageView.builder`.

Caracteristicas:

- usa `PageController`;
- bloqueia scroll manual com `NeverScrollableScrollPhysics`;
- avanca somente pelo botao;
- usa `DotIndicator` para progresso;
- ao finalizar:
  - grava `onboarding_done = true`;
  - navega para `CriarContaScreen`;
  - limpa a pilha com `pushAndRemoveUntil`.

Dados das paginas ficam em uma lista `static const paginas`, usando `OnboardingPageData`.

### `lib/Screens/login_screen.dart`

Tela de login.

Elementos:

- `AuthHeader` com logo e titulo;
- campo de e-mail;
- campo de palavra-passe com alternancia de visibilidade;
- link "Esqueceu a senha?";
- botao "Entrar";
- link para criar conta;
- separador "OU ACEDA COM";
- botao Google;
- rodape com Ajuda, Privacidade e Termos.

Comportamento atual:

- valida apenas campos vazios;
- simula loading por 2 segundos;
- ainda nao navega para `HomeScreen` apos sucesso;
- autenticacao real esta marcada como `TODO`.

### `lib/Screens/criar_conta_screen.dart`

Tela de cadastro.

Elementos:

- nome completo;
- e-mail;
- palavra-passe com alternancia de visibilidade;
- checkbox para aceitar termos;
- botao "Proximo";
- link para voltar ao login;
- rodape.

Comportamento atual:

- o botao "Proximo" so habilita quando os termos sao aceitos;
- `onPressed` do botao habilitado ainda esta vazio;
- nao ha validacao de nome/e-mail/senha nem integracao com backend.

### `lib/Screens/esqueceu_senha_screen.dart`

Tela inicial de recuperacao de acesso.

Elementos:

- header;
- texto instrucional;
- campo de e-mail;
- botao "Enviar";
- link para voltar ao login;
- rodape.

Comportamento atual:

- ao clicar em "Enviar", navega diretamente para `ReporPalavraPasseScreen`;
- ainda nao valida e-mail nem envia link real.

### `lib/Screens/repor_palavra_passe.dart`

Tela para definir nova palavra-passe.

Elementos:

- campo "Nova palavra-passe";
- campo "Confirmar palavra-passe";
- alternancia de visibilidade nos dois campos;
- hint de regra minima;
- botao "Enviar";
- link para voltar ao login;
- rodape.

Validacoes atuais:

- campos obrigatorios;
- minimo de 8 caracteres;
- deve conter letras e numeros;
- confirmacao deve coincidir.

Comportamento atual:

- simula envio por 2 segundos;
- mostra snackbar de sucesso;
- nao navega automaticamente para login;
- integracao real esta marcada como `TODO`.

### `lib/Screens/home_screen.dart`

Tela home com conteudo mockado.

Modelos locais:

- `ModuloItem`
  - `modulo`
  - `titulo`
  - `progresso`
  - `imagemAsset`
- `ForumPost`
  - `avatar`
  - `forum`
  - `tempo`
  - `mensagem`

Secoes:

- App bar com voltar, titulo, notificacoes e pesquisa;
- saudacao para "Maria Marta";
- card de progresso semanal;
- "Continuar a Estudar" com cards horizontais;
- "Explorar Conteudo" com filtros/chips;
- "Destaques do Dia";
- "Comunidade" com posts de forum.

Comportamento atual:

- dados estaticos no proprio arquivo;
- filtros mudam somente estado visual local;
- botoes e cards ainda nao possuem acoes reais;
- comentarios indicam que dados devem ser substituidos por Provider/BLoC ou arquitetura futura.

Ponto de atencao em assets: em `HomeScreen`, os cards usam:

```dart
imagemAsset: 'images/macroeconomia_card.png'
imagemAsset: 'images/historia_card.png'
```

Como o `pubspec.yaml` declara `assets/images/`, o caminho esperado em `Image.asset` provavelmente deveria ser:

```dart
assets/images/macroeconomia_card.png
assets/images/historia_card.png
```

Do jeito atual, as imagens podem cair no `errorBuilder`.

## Widgets Reutilizaveis

### `lib/widgets/auth_widgets.dart`

Componentes compartilhados pelas telas de autenticacao:

- `AuthHeader`: logo + titulo.
- `FieldLabel`: label de campo.
- `AppTextField`: wrapper de `TextField` com estilo padrao.
- `BackToLoginLink`: botao de voltar via `Navigator.pop`.
- `LoginLink`: RichText para "Ja possui uma conta? Iniciar Sessao".
- `FooterSection`: links de rodape e copyright.
- `FooterLink`: link visual sem acao real.
- `FooterDot`: separador visual.

Observacoes:

- `AppTextField` usa `TextField`, nao `TextFormField`; portanto nao ha suporte nativo a `Form`/validators.
- links de rodape ainda nao possuem navegacao real.

### `lib/widgets/onboarding_page.dart`

Define:

- `OnboardingPageData`: modelo dos dados de cada pagina do onboarding.
- `OnboardingPage`: widget visual da pagina.

O layout varia conforme flags:

- `textoNoTopo`: layout da primeira pagina;
- `mostrarIcone`: layout da terceira pagina;
- caso contrario: layout da segunda pagina.

Usa imagem de fundo, overlay branco translucido e botao de avancar.

### `lib/widgets/dot_indicator.dart`

Indicador animado de paginas do onboarding.

Recebe:

- `total`
- `atual`

Renderiza pontos, com o ativo mais largo.

## Fluxos de Navegacao

Fluxo pretendido com splash:

```text
SplashScreen
├── se onboarding_done == false -> OnboardingScreen -> CriarContaScreen
└── se onboarding_done == true  -> HomeScreen
```

Fluxo atual definido em `main.dart`:

```text
LoginScreen
├── "Criar conta"        -> CriarContaScreen
├── "Esqueceu a senha?"  -> EsqueceuSenhaScreen -> ReporPalavraPasseScreen
└── "Entrar"             -> valida campos e simula loading, mas nao navega
```

Fluxo de cadastro atual:

```text
CriarContaScreen
└── "Iniciar Sessao" -> LoginScreen
```

Fluxo de recuperacao:

```text
EsqueceuSenhaScreen
└── "Enviar" -> ReporPalavraPasseScreen
```

## Estado e Persistencia

O unico estado persistido atualmente e:

```text
SharedPreferences key: onboarding_done
Tipo: bool
Uso: decidir se onboarding ja foi concluido
```

Estados de UI sao locais aos widgets:

- controllers de texto;
- loading de login/repor senha;
- visibilidade de senha;
- aceite de termos;
- pagina atual do onboarding;
- filtro selecionado na home.

Ainda nao existe:

- Provider;
- Riverpod;
- BLoC;
- GetX;
- servicos;
- repositorios;
- camada de API;
- modelos globais de dominio;
- injecao de dependencias.

## Assets

### Imagens

Local: `assets/images/`

- `Logo.png`
- `Fundo_splashScreen.png`
- `Google.png`
- `historia_card.png`
- `Imagem_perfil.png`
- `macroeconomia_card.png`

### Fontes

Local: `assets/fonts/`

Varias variantes da fonte Poppins. No `pubspec.yaml`, o app registra principalmente:

- Regular
- Medium
- SemiBold
- Bold
- ExtraBold

## Padroes de Codigo

- Telas estao em `lib/Screens/`, com `S` maiusculo.
- Tema fica em `lib/theme/`.
- Widgets reutilizaveis ficam em `lib/widgets/`.
- Muitas telas usam `StatefulWidget` por causa de controllers e estados visuais.
- Navegacao e feita diretamente com `Navigator.push`, `pushReplacement` e `pushAndRemoveUntil`.
- Ainda nao ha rotas nomeadas.
- Ainda nao ha separacao formal de camadas como `data/`, `domain/`, `services/` ou `providers/`.
- Ha varios comentarios em portugues explicando seções do layout.

## Comandos Uteis

Instalar dependencias:

```bash
flutter pub get
```

Analisar codigo:

```bash
flutter analyze
```

Rodar testes:

```bash
flutter test
```

Rodar no Chrome:

```bash
flutter run -d chrome
```

Rodar em dispositivo/emulador:

```bash
flutter run
```

Gerar icones depois de mudar `flutter_launcher_icons`:

```bash
dart run flutter_launcher_icons
```

## Testes

`test/widget_test.dart` ainda e o teste padrao do template Flutter, procurando contador e botao `+`.

Como o app atual nao possui contador, esse teste provavelmente falha. O ideal e substituir por testes coerentes com o app, por exemplo:

- renderizar `EconomiaApp`;
- verificar presenca do texto "Bem-Vindo a";
- testar validacao de login vazio;
- testar navegacao para criar conta;
- testar fluxo de recuperacao de senha;
- testar validacoes de `ReporPalavraPasseScreen`.

## Pontos de Atencao Para Futuras IAs

1. `main.dart` importa `SplashScreen`, mas inicia em `LoginScreen`. Confirmar qual fluxo e desejado antes de alterar.
2. `HomeScreen` usa caminhos de assets possivelmente incorretos (`images/...` em vez de `assets/images/...`).
3. `AppColors.surface` provavelmente deveria ser `0xFFF3F4F5`.
4. Login, Google Sign-In, cadastro e recuperacao ainda sao mockados/TODO.
5. `CriarContaScreen` tem botao "Proximo" sem implementacao real.
6. `FooterLink` nao possui navegacao real.
7. `BackToLoginLink` usa `Navigator.pop`; em fluxos com pilha limpa, isso pode nao voltar para login.
8. O teste atual ainda e o smoke test de contador do template.
9. Nao ha backend nem contratos de API definidos neste projeto.
10. A pasta `lib/Screens` usa maiuscula; manter consistencia ou migrar com cuidado para evitar problemas em sistemas case-sensitive.

## Sugestao de Evolucao Arquitetural

Para crescer o projeto sem baguncar o frontend atual, uma evolucao natural seria:

```text
lib/
├── app/
│   ├── app.dart
│   └── routes.dart
├── core/
│   ├── theme/
│   ├── constants/
│   └── widgets/
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── models/
│   │   └── services/
│   ├── onboarding/
│   └── home/
└── main.dart
```

Essa mudanca ainda nao foi feita; o projeto atual permanece simples e adequado para prototipagem visual.

## Resumo Mental Rapido

Este e um app Flutter educativo em fase de prototipo frontend. O visual ja tem identidade propria: cor primaria vinho, fonte Poppins, telas limpas e foco em autenticacao/onboarding/home. A camada de negocio ainda nao existe. O que ha hoje sao telas, estados locais, alguns dados mockados e uma pequena persistencia local para saber se o onboarding foi concluido.

