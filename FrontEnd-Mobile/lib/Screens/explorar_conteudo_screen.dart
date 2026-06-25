import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';
import 'package:economica_com_historia/widgets/app_bar_principal.dart';
import 'package:economica_com_historia/Screens/conteudo_screen.dart';

class ExplorarConteudoScreen extends StatefulWidget {
  const ExplorarConteudoScreen({super.key});

  @override
  State<ExplorarConteudoScreen> createState() => _ExplorarConteudoScreenState();
}

// Modelo de item de conteúdo
class _ConteudoItem {
  final String categoria;
  final String titulo;
  final String imagemAsset;
  final bool isPodcast;
  final String filtroTag; // 'História', 'Economia', 'Podcasts', etc.

  const _ConteudoItem({
    required this.categoria,
    required this.titulo,
    required this.imagemAsset,
    required this.isPodcast,
    required this.filtroTag,
  });
}

class _ExplorarConteudoScreenState extends State<ExplorarConteudoScreen> {
  int _filtroSelecionado = 0;
  final _filtros = [
    'Todos',
    'História',
    'Economia',
    'Jindungo',
    'Podcasts',
    'Fórum',
    'Quiz',
  ];

  final List<_ConteudoItem> _todosItens = const [
    _ConteudoItem(
      categoria: 'ECONOMIA • 8 MIN',
      titulo: 'O Impacto do Comércio Transatlântico na Moeda Nacional',
      imagemAsset: 'assets/images/Impacto_do_comercio.png',
      isPodcast: false,
      filtroTag: 'Economia',
    ),
    _ConteudoItem(
      categoria: 'HISTÓRIA • 12 MIN',
      titulo: 'Crónicas do Reino do Kongo: Estrutura Social e Política',
      imagemAsset: 'assets/images/Cronicas_do_Reino_do_Congo.png',
      isPodcast: false,
      filtroTag: 'História',
    ),
    _ConteudoItem(
      categoria: 'PODCAST • EPISÓDIO 42',
      titulo: 'Debate: O Futuro da Diversificação Económica em Angola',
      imagemAsset: 'assets/images/Debate_Diversificacao_Economica.png',
      isPodcast: true,
      filtroTag: 'Podcasts',
    ),
  ];

  List<_ConteudoItem> get _itensFiltrados {
    final filtroAtual = _filtros[_filtroSelecionado];
    if (filtroAtual == 'Todos') return List<_ConteudoItem>.from(_todosItens);
    return List<_ConteudoItem>.from(
      _todosItens.where((item) => item.filtroTag == filtroAtual),
    );
  }

  @override
  Widget build(BuildContext context) {
    final itens = _itensFiltrados;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Explorar Conteúdo',
        mostrarFavoritos: true,
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: 16, bottom: 4),
              child: _FiltrosRow(
                filtros: _filtros,
                selecionado: _filtroSelecionado,
                onSelect: (i) => setState(() => _filtroSelecionado = i),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                const SizedBox(height: 24),
                _SectionHeader(
                  titulo: 'Em Alta',
                  acaoLabel: 'Ver tudo',
                  onAcao: () {},
                ),
                const SizedBox(height: 12),
                if (itens.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: Text(
                        'Nenhum conteúdo encontrado\npara "${_filtros[_filtroSelecionado]}".',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textMedium,
                          height: 1.5,
                        ),
                      ),
                    ),
                  )
                else
                  ...List.generate(itens.length, (i) {
                    final item = itens[i];
                    final isFirst =
                        i == 0 && item.filtroTag == 'Economia' ||
                        (_filtros[_filtroSelecionado] == 'Todos' && i == 0);

                    return Column(
                      children: [
                        if (i > 0)
                          const Divider(color: Color(0xFFEEE8E9), height: 1),
                        GestureDetector(
                          onTap: isFirst
                              ? () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const ConteudoScreen(),
                                  ),
                                )
                              : null,
                          child: _TrendingItem(
                            categoria: item.categoria,
                            titulo: item.titulo,
                            imagemAsset: item.imagemAsset,
                            isPodcast: item.isPodcast,
                          ),
                        ),
                      ],
                    );
                  }),
                const SizedBox(height: 28),
                const Text(
                  'Recomendado para ti',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 14),
                _RecomendadoCard(),
                const SizedBox(height: 14),
                _GuiaCard(),
                const SizedBox(height: 32),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _FiltrosRow extends StatelessWidget {
  final List<String> filtros;
  final int selecionado;
  final ValueChanged<int> onSelect;

  const _FiltrosRow({
    required this.filtros,
    required this.selecionado,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: filtros.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final ativo = i == selecionado;
          return GestureDetector(
            onTap: () => onSelect(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: ativo ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: ativo ? AppColors.primary : const Color(0xFFD8C1C4),
                ),
              ),
              child: Text(
                filtros[i],
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: ativo ? Colors.white : AppColors.textMedium,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String titulo;
  final String acaoLabel;
  final VoidCallback onAcao;

  const _SectionHeader({
    required this.titulo,
    required this.acaoLabel,
    required this.onAcao,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          titulo,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
        GestureDetector(
          onTap: onAcao,
          child: Text(
            acaoLabel,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }
}

class _TrendingItem extends StatelessWidget {
  final String categoria;
  final String titulo;
  final String imagemAsset;
  final bool isPodcast;

  const _TrendingItem({
    required this.categoria,
    required this.titulo,
    required this.imagemAsset,
    required this.isPodcast,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        children: [
          if (isPodcast)
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.mic_rounded,
                color: Colors.white,
                size: 24,
              ),
            )
          else
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                imagemAsset,
                width: 52,
                height: 52,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 52,
                  height: 52,
                  color: const Color(0xFFEEE8E9),
                  child: const Icon(
                    Icons.image_outlined,
                    color: AppColors.textLight,
                  ),
                ),
              ),
            ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  categoria,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isPodcast ? AppColors.primary : AppColors.textLight,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  titulo,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textDark,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Icon(
            isPodcast
                ? Icons.play_circle_outline_rounded
                : Icons.chevron_right_rounded,
            color: AppColors.textLight,
            size: 22,
          ),
        ],
      ),
    );
  }
}

class _RecomendadoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
                child: Image.asset(
                  'assets/images/Fundamentos_Micro_Economia.png',
                  width: double.infinity,
                  height: 160,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) =>
                      Container(height: 160, color: const Color(0xFFEEE8E9)),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Novo Conteúdo',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Fundamentos de Microeconomia Aplicada',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Uma análise profunda sobre o comportamento dos agentes económicos no mercado angolano…',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textMedium,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: const [
                    Icon(
                      Icons.star_rounded,
                      color: Color(0xFFB5933A),
                      size: 16,
                    ),
                    SizedBox(width: 4),
                    Text(
                      '4.9',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                      ),
                    ),
                    SizedBox(width: 16),
                    Icon(
                      Icons.access_time_rounded,
                      color: AppColors.textLight,
                      size: 14,
                    ),
                    SizedBox(width: 4),
                    Text(
                      '15 Horas',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textMedium,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GuiaCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F3F4),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            child: Image.asset(
              'assets/images/Logo.png',
              width: 22,
              height: 22,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Guia: Investigação Histórica',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textDark,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Recursos para investigadores académicos',
                  style: TextStyle(fontSize: 12, color: AppColors.textMedium),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.add_circle_outline_rounded,
            color: AppColors.primary,
            size: 24,
          ),
        ],
      ),
    );
  }
}
