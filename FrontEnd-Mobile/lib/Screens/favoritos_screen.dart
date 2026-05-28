import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';

class FavoritosScreen extends StatefulWidget {
  const FavoritosScreen({super.key});

  @override
  State<FavoritosScreen> createState() => _FavoritosScreenState();
}

class _FavoritosScreenState extends State<FavoritosScreen> {
  int _filtroSelecionado = 0;
  final _filtros = ['Todos', 'Artigos', 'Podcasts', 'Arquivos'];

  static const _itens = [
    _FavoritoItem(
      tipo: 'ARTIGO ACADÊMICO',
      titulo: 'A Evolução das Rotas Comerciais no Planalto Central',
      meta: 'Salvo em 12 Out',
      icone: Icons.article_outlined,
      isPremium: false,
      isPodcast: false,
    ),
    _FavoritoItem(
      tipo: 'PODCAST PREMIUM',
      titulo: 'História Bancária: Do Kwanza ao Digital',
      meta: '45 min',
      icone: Icons.podcasts_rounded,
      isPremium: true,
      isPodcast: true,
    ),
    _FavoritoItem(
      tipo: 'DOCUMENTO HISTÓRICO',
      titulo: 'Tratado de Comércio de 1885 - Análise Econômica',
      meta: 'PDF • 2.4 MB',
      icone: Icons.description_outlined,
      isPremium: false,
      isPodcast: false,
    ),
    _FavoritoItem(
      tipo: 'ANÁLISE DE MERCADO',
      titulo: 'Políticas Monetárias e o Impacto no Consumo Regional',
      meta: 'Salvo em 05 Out',
      icone: Icons.bar_chart_rounded,
      isPremium: false,
      isPodcast: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _AppBar(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  SizedBox(height: 8),
                  Text(
                    'Favoritos',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Sua curadoria pessoal de conhecimento acadêmico.',
                    style: TextStyle(fontSize: 13, color: AppColors.textMedium),
                  ),
                  SizedBox(height: 16),
                ],
              ),
            ),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _filtros.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final ativo = i == _filtroSelecionado;
                  return GestureDetector(
                    onTap: () => setState(() => _filtroSelecionado = i),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: ativo ? AppColors.primary : Colors.transparent,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: ativo
                              ? AppColors.primary
                              : const Color(0xFFD8C1C4),
                        ),
                      ),
                      child: Text(
                        _filtros[i],
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
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _itens.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, i) => _FavoritoCard(item: _itens[i]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0x4DD8C1C4),
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
            'Favoritos',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textDark,
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.notifications_none_rounded,
              color: AppColors.textDark,
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.search_rounded, color: AppColors.textDark),
          ),
        ],
      ),
    );
  }
}

class _FavoritoItem {
  final String tipo;
  final String titulo;
  final String meta;
  final IconData icone;
  final bool isPremium;
  final bool isPodcast;

  const _FavoritoItem({
    required this.tipo,
    required this.titulo,
    required this.meta,
    required this.icone,
    required this.isPremium,
    required this.isPodcast,
  });
}

class _FavoritoCard extends StatelessWidget {
  final _FavoritoItem item;

  const _FavoritoCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: item.isPremium
              ? AppColors.primary.withOpacity(0.4)
              : const Color(0xFFEEE8E9),
          width: item.isPremium ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: item.isPremium
                  ? AppColors.primary.withOpacity(0.1)
                  : const Color(0xFFF0EAEA),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              item.icone,
              color: item.isPremium ? AppColors.primary : AppColors.textLight,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.tipo,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: item.isPremium
                        ? AppColors.primary
                        : AppColors.textLight,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.titulo,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textDark,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(
                      item.isPodcast
                          ? Icons.access_time_rounded
                          : Icons.bookmark_border_rounded,
                      size: 13,
                      color: AppColors.textLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      item.meta,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(
            Icons.bookmark_rounded,
            color: AppColors.primary,
            size: 20,
          ),
        ],
      ),
    );
  }
}
