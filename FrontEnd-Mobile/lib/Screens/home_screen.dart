import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

// ─────────────────────────────────────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────────────────────────────────────

class ModuloItem {
  final String modulo;
  final String titulo;
  final double progresso;
  final String imagemAsset;

  const ModuloItem({
    required this.modulo,
    required this.titulo,
    required this.progresso,
    required this.imagemAsset,
  });
}

class ForumPost {
  final String avatar;
  final String forum;
  final String tempo;
  final String mensagem;

  const ForumPost({
    required this.avatar,
    required this.forum,
    required this.tempo,
    required this.mensagem,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  // Dados mock — substituir por provider/bloc conforme a arquitetura do projeto
  static const _modulos = [
    ModuloItem(
      modulo: 'MÓDULO 4',
      titulo: 'Ciclos Económicos na África Subsariana',
      progresso: 0.80,
      imagemAsset: 'images/macroeconomia_card.png',
    ),
    ModuloItem(
      modulo: 'MÓDULO 2',
      titulo: 'Rotas Comerciais do Antigo Reino do Kongo',
      progresso: 0.35,
      imagemAsset: 'images/historia_card.png',
    ),
  ];

  static const _forumPosts = [
    ForumPost(
      avatar: 'M',
      forum: 'Mercados Emergentes',
      tempo: 'há 5 min',
      mensagem: 'Quais as previsões para a inflação no próximo trimestre?',
    ),
    ForumPost(
      avatar: 'H',
      forum: 'História Geral de Angola',
      tempo: 'há 2h',
      mensagem: 'Debate: A influência holandesa na economia de Luanda.',
    ),
  ];

  static const _filtros = ['Artigos', 'Vídeos', 'Podcasts', 'Jindungo'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // ── AppBar ───────────────────────────────────────────────────
            SliverToBoxAdapter(child: _HomeAppBar()),

            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 20),

                  // ── Saudação ─────────────────────────────────────────
                  _GreetingSection(),

                  const SizedBox(height: 20),

                  // ── Progresso semanal ────────────────────────────────
                  _WeeklyProgressCard(),

                  const SizedBox(height: 28),

                  // ── Continuar a Estudar ──────────────────────────────
                  _SectionHeader(
                    title: 'Continuar a Estudar',
                    actionLabel: 'Ver tudo',
                    onAction: () {},
                  ),
                  const SizedBox(height: 14),
                  _ModulosRow(modulos: _modulos),

                  const SizedBox(height: 28),

                  // ── Explorar Conteúdo ────────────────────────────────
                  const Text(
                    'Explorar Conteúdo',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _FiltrosRow(filtros: _filtros),

                  const SizedBox(height: 28),

                  // ── Destaques do Dia ─────────────────────────────────
                  const Text(
                    'Destaques do Dia',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 14),
                  _DestaqueCard(),

                  const SizedBox(height: 28),

                  // ── Comunidade ───────────────────────────────────────
                  _SectionHeader(
                    title: 'Comunidade',
                    actionLabel: 'Fóruns que segues',
                    onAction: () {},
                    actionIsLabel: true,
                  ),
                  const SizedBox(height: 14),
                  ..._forumPosts.map((post) => _ForumPostTile(post: post)),

                  const SizedBox(height: 32),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// APP BAR
// ─────────────────────────────────────────────────────────────────────────────

class _HomeAppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          // Botão voltar
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.borderSoft,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.chevron_left_rounded,
                color: AppColors.textDark,
                size: 22,
              ),
            ),
          ),

          const SizedBox(width: 12),

          const Text(
            'Home',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textDark,
            ),
          ),

          const Spacer(),

          // Notificações
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.notifications_none_rounded,
              color: AppColors.textDark,
              size: 24,
            ),
          ),

          // Pesquisa
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.search_rounded,
              color: AppColors.textDark,
              size: 24,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAUDAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

class _GreetingSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        Text(
          'Olá, Maria Marta',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.textDark,
          ),
        ),
        SizedBox(height: 4),
        Text(
          'Sua jornada intelectual continua hoje.',
          style: TextStyle(fontSize: 13.5, color: AppColors.textMedium),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE PROGRESSO SEMANAL
// ─────────────────────────────────────────────────────────────────────────────

class _WeeklyProgressCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSoft, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Linha superior: meta + percentagem
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                'Meta semanal: 12h',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDark,
                ),
              ),
              Text(
                '75% concluído',
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Barra de progresso
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: 0.75,
              minHeight: 7,
              backgroundColor: AppColors.borderSoft,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.primary,
              ),
            ),
          ),

          const SizedBox(height: 8),

          // Hint motivacional
          Row(
            children: const [
              Icon(
                Icons.trending_up_rounded,
                size: 13,
                color: AppColors.textLight,
              ),
              SizedBox(width: 4),
              Text(
                'Estás a estudar 15% mais do que na semana passada.',
                style: TextStyle(fontSize: 11.5, color: AppColors.textLight),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  final String actionLabel;
  final VoidCallback onAction;
  final bool actionIsLabel;

  const _SectionHeader({
    required this.title,
    required this.actionLabel,
    required this.onAction,
    this.actionIsLabel = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.textDark,
          ),
        ),
        GestureDetector(
          onTap: onAction,
          child: Row(
            children: [
              Text(
                actionLabel,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.primary,
                ),
              ),
              if (!actionIsLabel) ...[
                const SizedBox(width: 4),
                const Icon(
                  Icons.arrow_forward_rounded,
                  size: 15,
                  color: AppColors.primary,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROW DE MÓDULOS (scroll horizontal)
// ─────────────────────────────────────────────────────────────────────────────

class _ModulosRow extends StatelessWidget {
  final List<ModuloItem> modulos;

  const _ModulosRow({required this.modulos});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 200,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: modulos.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) => _ModuloCard(item: modulos[index]),
      ),
    );
  }
}

class _ModuloCard extends StatelessWidget {
  final ModuloItem item;

  const _ModuloCard({required this.item});

  @override
  Widget build(BuildContext context) {
    // largura responsiva: ~42% da tela
    final cardWidth = (MediaQuery.of(context).size.width - 40 - 14) / 2;

    return GestureDetector(
      onTap: () {},
      child: SizedBox(
        width: cardWidth,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagem com badge de progresso
            SizedBox(
              height: 105,
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.asset(
                      item.imagemAsset,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        decoration: BoxDecoration(
                          color: AppColors.borderSoft,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.image_outlined,
                            color: AppColors.textLight,
                          ),
                        ),
                      ),
                    ),
                  ),
                  // Badge módulo + progresso
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(12),
                          bottomRight: Radius.circular(12),
                        ),
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.65),
                          ],
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            item.modulo,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white70,
                              letterSpacing: 0.4,
                            ),
                          ),
                          Text(
                            '${(item.progresso * 100).toInt()}%',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Barra de progresso
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: item.progresso,
                minHeight: 4,
                backgroundColor: AppColors.borderSoft,
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppColors.primary,
                ),
              ),
            ),

            const SizedBox(height: 6),

            // Título do módulo
            Text(
              item.titulo,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: AppColors.textDark,
                height: 1.35,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTROS (chips de conteúdo)
// ─────────────────────────────────────────────────────────────────────────────

class _FiltrosRow extends StatefulWidget {
  final List<String> filtros;

  const _FiltrosRow({required this.filtros});

  @override
  State<_FiltrosRow> createState() => _FiltrosRowState();
}

class _FiltrosRowState extends State<_FiltrosRow> {
  int _selected = 0;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(widget.filtros.length, (i) {
          final isActive = i == _selected;
          return GestureDetector(
            onTap: () => setState(() => _selected = i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(right: 10),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isActive ? AppColors.primary : AppColors.borderSoft,
                  width: 1.2,
                ),
              ),
              child: Text(
                widget.filtros[i],
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isActive ? Colors.white : AppColors.textMedium,
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DESTAQUE DO DIA
// ─────────────────────────────────────────────────────────────────────────────

class _DestaqueCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            top: -10,
            child: Opacity(
              opacity: 0.08,
              child: Icon(
                Icons.monetization_on_rounded,
                size: 140,
                color: Colors.white,
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badge recomendado
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFB5933A),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'RECOMENDADO',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                const Text(
                  'O Impacto do Café na Balança Comercial Angolana (1960-1974)',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    height: 1.35,
                  ),
                ),

                const SizedBox(height: 14),

                // Metadados
                Row(
                  children: const [
                    Icon(
                      Icons.access_time_rounded,
                      size: 14,
                      color: Colors.white70,
                    ),
                    SizedBox(width: 4),
                    Text(
                      '15 min leitura',
                      style: TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                    SizedBox(width: 16),
                    Icon(
                      Icons.remove_red_eye_outlined,
                      size: 14,
                      color: Colors.white70,
                    ),
                    SizedBox(width: 4),
                    Text(
                      '2.4k vistas',
                      style: TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Botão
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white54, width: 1.2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      textStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    child: const Text('Ler Artigo Completo'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FORUM POST TILE
// ─────────────────────────────────────────────────────────────────────────────

class _ForumPostTile extends StatelessWidget {
  final ForumPost post;

  const _ForumPostTile({required this.post});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar + fórum + tempo
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.primary,
                child: Text(
                  post.avatar,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  post.forum,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                ),
              ),
              Text(
                post.tempo,
                style: const TextStyle(
                  fontSize: 11.5,
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Mensagem
          Text(
            post.mensagem,
            style: const TextStyle(
              fontSize: 13.5,
              color: AppColors.textMedium,
              height: 1.45,
            ),
          ),

          const SizedBox(height: 10),

          // Ações
          Row(
            children: [
              GestureDetector(
                onTap: () {},
                child: const Icon(
                  Icons.chat_bubble_outline_rounded,
                  size: 18,
                  color: AppColors.textLight,
                ),
              ),
              const SizedBox(width: 16),
              GestureDetector(
                onTap: () {},
                child: const Icon(
                  Icons.favorite_border_rounded,
                  size: 18,
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Divisor
          const Divider(color: AppColors.borderSoft, thickness: 1, height: 1),
        ],
      ),
    );
  }
}
