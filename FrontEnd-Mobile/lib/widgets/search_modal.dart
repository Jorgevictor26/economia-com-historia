import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Abre o modal de pesquisa a partir de qualquer tela.
/// Uso: SearchModal.show(context);
class SearchModal {
  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _SearchModalContent(),
    );
  }
}

class _SearchModalContent extends StatefulWidget {
  const _SearchModalContent();

  @override
  State<_SearchModalContent> createState() => _SearchModalContentState();
}

class _SearchModalContentState extends State<_SearchModalContent> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  String _query = '';

  // Sugestões recentes (mock — substituir por dados reais)
  static const _recentes = [
    'Ciclos Económicos Angola',
    'Reino do Kongo',
    'Balança Comercial',
    'Inflação pós-independência',
  ];

  // Resultados mock filtrados
  static const _todosResultados = [
    _ResultadoItem(
      tipo: 'Artigo',
      titulo: 'O Impacto do Café na Balança Comercial Angolana',
      subtitulo: 'Módulo 4 · 15 min leitura',
      icone: Icons.article_outlined,
    ),
    _ResultadoItem(
      tipo: 'Módulo',
      titulo: 'Ciclos Económicos na África Subsariana',
      subtitulo: 'Módulo 4 · 80% concluído',
      icone: Icons.menu_book_outlined,
    ),
    _ResultadoItem(
      tipo: 'Fórum',
      titulo: 'Debate: Influência holandesa em Luanda',
      subtitulo: 'História Geral de Angola · há 2h',
      icone: Icons.forum_outlined,
    ),
    _ResultadoItem(
      tipo: 'Quiz',
      titulo: 'Quiz: Rotas Comerciais do Kongo',
      subtitulo: 'Módulo 2 · 10 perguntas',
      icone: Icons.quiz_outlined,
    ),
  ];

  List<_ResultadoItem> get _resultadosFiltrados {
    if (_query.isEmpty) return [];
    return _todosResultados
        .where((r) => r.titulo.toLowerCase().contains(_query.toLowerCase()))
        .toList();
  }

  @override
  void initState() {
    super.initState();
    // Foco automático ao abrir
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Handle ───────────────────────────────────────────────
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderSoft,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // ── Campo de pesquisa ─────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.inputFill,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.borderSoft,
                        width: 1.2,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 12),
                          child: Icon(
                            Icons.search_rounded,
                            color: AppColors.textLight,
                            size: 20,
                          ),
                        ),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            focusNode: _focusNode,
                            onChanged: (val) => setState(() => _query = val),
                            style: const TextStyle(
                              fontSize: 15,
                              color: AppColors.textDark,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'Pesquisar módulos, artigos, fóruns...',
                              hintStyle: TextStyle(
                                fontSize: 14,
                                color: AppColors.textLight,
                              ),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                          ),
                        ),
                        if (_query.isNotEmpty)
                          GestureDetector(
                            onTap: () {
                              _searchController.clear();
                              setState(() => _query = '');
                            },
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12),
                              child: Icon(
                                Icons.close_rounded,
                                color: AppColors.textLight,
                                size: 18,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(width: 10),

                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: const Text(
                    'Cancelar',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // ── Conteúdo principal ────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                bottom: bottomInset + 24,
              ),
              child: _query.isEmpty
                  ? _RecentesSection(
                      recentes: _recentes,
                      onTap: (termo) {
                        _searchController.text = termo;
                        setState(() => _query = termo);
                      },
                    )
                  : _ResultadosSection(resultados: _resultadosFiltrados),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECÇÃO: PESQUISAS RECENTES
// ─────────────────────────────────────────────────────────────────────────────

class _RecentesSection extends StatelessWidget {
  final List<String> recentes;
  final void Function(String) onTap;

  const _RecentesSection({required this.recentes, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Pesquisas recentes',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
            ),
            GestureDetector(
              onTap: () {},
              child: const Text(
                'Limpar',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 12),

        ...recentes.map(
          (termo) => GestureDetector(
            onTap: () => onTap(termo),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Row(
                children: [
                  const Icon(
                    Icons.history_rounded,
                    size: 18,
                    color: AppColors.textLight,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      termo,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textMedium,
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.north_west_rounded,
                    size: 16,
                    color: AppColors.textLight,
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 24),

        // Sugestões de categorias
        const Text(
          'Explorar por categoria',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textDark,
          ),
        ),

        const SizedBox(height: 12),

        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: const [
            _CategoriaChip(label: 'Módulos', icone: Icons.menu_book_outlined),
            _CategoriaChip(label: 'Artigos', icone: Icons.article_outlined),
            _CategoriaChip(label: 'Fóruns', icone: Icons.forum_outlined),
            _CategoriaChip(label: 'Quiz', icone: Icons.quiz_outlined),
            _CategoriaChip(label: 'Podcasts', icone: Icons.headphones_outlined),
            _CategoriaChip(
              label: 'Vídeos',
              icone: Icons.play_circle_outline_rounded,
            ),
          ],
        ),
      ],
    );
  }
}

class _CategoriaChip extends StatelessWidget {
  final String label;
  final IconData icone;

  const _CategoriaChip({required this.label, required this.icone});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.borderSoft, width: 1.2),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icone, size: 15, color: AppColors.primary),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textDark,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECÇÃO: RESULTADOS
// ─────────────────────────────────────────────────────────────────────────────

class _ResultadosSection extends StatelessWidget {
  final List<_ResultadoItem> resultados;

  const _ResultadosSection({required this.resultados});

  @override
  Widget build(BuildContext context) {
    if (resultados.isEmpty) {
      return const Padding(
        padding: EdgeInsets.only(top: 48),
        child: Center(
          child: Column(
            children: [
              Icon(
                Icons.search_off_rounded,
                size: 48,
                color: AppColors.borderSoft,
              ),
              SizedBox(height: 12),
              Text(
                'Nenhum resultado encontrado.',
                style: TextStyle(fontSize: 14, color: AppColors.textLight),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${resultados.length} resultado${resultados.length != 1 ? 's' : ''}',
          style: const TextStyle(fontSize: 13, color: AppColors.textLight),
        ),
        const SizedBox(height: 12),
        ...resultados.map((r) => _ResultadoTile(item: r)),
      ],
    );
  }
}

class _ResultadoItem {
  final String tipo;
  final String titulo;
  final String subtitulo;
  final IconData icone;

  const _ResultadoItem({
    required this.tipo,
    required this.titulo,
    required this.subtitulo,
    required this.icone,
  });
}

class _ResultadoTile extends StatelessWidget {
  final _ResultadoItem item;

  const _ResultadoTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.inputFill,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(item.icone, size: 20, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.titulo,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item.subtitulo,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textLight,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.borderSoft,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                item.tipo,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMedium,
                  letterSpacing: 0.3,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
