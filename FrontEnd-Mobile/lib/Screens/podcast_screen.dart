import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';
import 'package:economica_com_historia/screens/podcast_selecionado_screen.dart';
import 'package:economica_com_historia/widgets/app_bar_principal.dart';

class PodcastScreen extends StatefulWidget {
  const PodcastScreen({super.key});

  @override
  State<PodcastScreen> createState() => _PodcastScreenState();
}

class _PodcastScreenState extends State<PodcastScreen> {
  int? _categoriaSelecionada;

  static const List<_PodcastItem> _podcasts = [
    _PodcastItem(
      titulo: 'A Rota do Sal em Angola',
      autor: 'Angolano Errante',
      duracao: '45 min',
      imagemAsset: 'assets/images/microfone.png',
      categoria: 'História Económica',
    ),
    _PodcastItem(
      titulo: 'Ciclos de Commodities',
      autor: 'Prof. Almeida',
      duracao: '32 min',
      imagemAsset: 'assets/images/Ciclos_de_commodities.png',
      categoria: 'Mercados',
    ),
    _PodcastItem(
      titulo: 'A Herança Colonial',
      autor: 'Dr. Mbaku',
      duracao: '58 min',
      imagemAsset: 'assets/images/A_herança_colonial.png',
      categoria: 'História Económica',
    ),
    _PodcastItem(
      titulo: 'Futuro Digital Africano',
      autor: 'Inovação Academy',
      duracao: '27 min',
      imagemAsset: 'assets/images/Futuro_digital_colonial.png',
      categoria: 'Geopolítica',
    ),
    _PodcastItem(
      titulo: 'Navegação e Comércio',
      autor: 'Arquivo Histórico',
      duracao: '41 min',
      imagemAsset: 'assets/images/Navegação_e_Comercio.png',
      categoria: 'Entrevistas',
    ),
    _PodcastItem(
      titulo: 'Microeconomia Local',
      autor: 'Vozes do Mercado',
      duracao: '19 min',
      imagemAsset: 'assets/images/Microeconomia_Colonial.png',
      categoria: 'Mercados',
    ),
  ];

  final List<String> _categorias = [
    'Todos',
    'História Económica',
    'Mercados',
    'Entrevistas',
    'Geopolítica',
  ];

  // ── Getter para filtrar podcasts ─────────────────────────────
  List<_PodcastItem> get _podcastsFiltrados {
    if (_categoriaSelecionada == null) {
      return _podcasts;
    }
    final categoriaSelecionada = _categorias[_categoriaSelecionada!];
    return _podcasts
        .where((podcast) => podcast.categoria == categoriaSelecionada)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Podcast',
        mostrarFavoritos: true,
        mostrarNotificacoes: true,
        mostrarPesquisa: true,
      ),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // ── Espaçamento entre AppBar e Filtro ─────────────────
            const SliverToBoxAdapter(child: SizedBox(height: 16)),

            // ── FILTRO DE CATEGORIAS (MOVIDO PARA O TOPO) ────────
            SliverToBoxAdapter(
              child: SizedBox(
                height: 44,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _categorias.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, index) {
                    final selecionado =
                        (index == 0 && _categoriaSelecionada == null) ||
                        (_categoriaSelecionada == index);

                    return InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () {
                        setState(() {
                          if (index == 0) {
                            // "Todos" sempre mostra todos os podcasts
                            _categoriaSelecionada = null;
                          } else {
                            // Outras categorias fazem toggle normal
                            _categoriaSelecionada =
                                _categoriaSelecionada == index ? null : index;
                          }
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: selecionado
                              ? AppColors.primary
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: selecionado
                                ? AppColors.primary
                                : const Color(0xFFD8C1C4),
                          ),
                        ),
                        child: Center(
                          child: Text(
                            _categorias[index],
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: selecionado
                                  ? Colors.white
                                  : AppColors.textMedium,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 20)),

            // ── LISTA DE PODCASTS FILTRADOS ──────────────────────
            SliverPadding(
              padding: const EdgeInsets.symmetric(
                horizontal: PodcastLayout.pagePadding,
              ),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  return Padding(
                    padding: const EdgeInsets.only(
                      bottom: PodcastLayout.cardSpacing,
                    ),
                    child: _PodcastCard(
                      item: _podcastsFiltrados[index],
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PodcastSelecionadoScreen(),
                          ),
                        );
                      },
                    ),
                  );
                }, childCount: _podcastsFiltrados.length),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }
}

class PodcastLayout {
  static const double pagePadding = 16;
  static const double cardRadius = 12;
  static const double cardHeight = 220;
  static const double cardSpacing = 16;
}

class _PodcastItem {
  final String titulo;
  final String autor;
  final String duracao;
  final String imagemAsset;
  final String categoria;

  const _PodcastItem({
    required this.titulo,
    required this.autor,
    required this.duracao,
    required this.imagemAsset,
    required this.categoria,
  });
}

class _PodcastCard extends StatelessWidget {
  final _PodcastItem item;
  final VoidCallback onTap;

  const _PodcastCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(PodcastLayout.cardRadius),
        onTap: onTap,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(PodcastLayout.cardRadius),
          child: SizedBox(
            height: PodcastLayout.cardHeight,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  item.imagemAsset,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) {
                    return Container(color: AppColors.primaryDark);
                  },
                ),

                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(.65),
                      ],
                      stops: const [0.45, 1],
                    ),
                  ),
                ),

                Positioned(
                  left: 16,
                  right: 70,
                  bottom: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        item.titulo,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      const SizedBox(height: 6),

                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              item.autor,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Icon(
                            Icons.access_time_rounded,
                            size: 14,
                            color: Colors.white70,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            item.duracao,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                Positioned(
                  right: 16,
                  bottom: 16,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(.95),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.play_arrow_rounded,
                      color: AppColors.primary,
                      size: 24,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
