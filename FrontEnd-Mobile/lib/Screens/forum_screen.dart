import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';
import 'package:economica_com_historia/Screens/sala_de_debate_screen.dart';
import 'package:economica_com_historia/Screens/criar_sala_debate_screen.dart';
import 'package:economica_com_historia/widgets/app_bar_principal.dart';

class ForumScreen extends StatefulWidget {
  const ForumScreen({super.key});

  @override
  State<ForumScreen> createState() => _ForumScreenState();
}

class _ForumScreenState extends State<ForumScreen> {
  int _filtroSelecionado = 0;
  final _filtros = ['Públicos', 'Privados', 'Seguidos'];

  static const _salas = [
    _SalaItem(
      titulo: 'Agronegócio e Desenvolvimento',
      membros: '856 membros',
      tempo: 'há 12 min',
      isPrivado: false,
      destaque: false,
    ),
    _SalaItem(
      titulo: 'Conselho Académico Especial',
      membros: '24 membros',
      tempo: 'ontem',
      isPrivado: true,
      destaque: false,
    ),
    _SalaItem(
      titulo: 'Microeconomia das ZEEs',
      membros: '2.1k membros',
      tempo: 'agora',
      isPrivado: false,
      destaque: false,
    ),
    _SalaItem(
      titulo: 'História da Rota da Seda',
      membros: '442 membros',
      tempo: 'há 4h',
      isPrivado: false,
      destaque: true,
    ),
  ];

  @override
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Fórum',
        mostrarFavoritos: true,
      ), // ← SUBSTITUIU _AppBar()
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const CriarSalaDebateScreen()),
        ),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add_rounded, color: Colors.white),
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
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
                _SectionHeader(),
                const SizedBox(height: 14),
                _DebateDestaque(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SalaDeDebateScreen(),
                    ),
                  ),
                ),
                const SizedBox(height: 28),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Salas de Debate',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                      ),
                    ),
                    GestureDetector(
                      onTap: () {},
                      child: Row(
                        children: const [
                          Text(
                            'Ver todos',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: AppColors.primary,
                            ),
                          ),
                          SizedBox(width: 2),
                          Icon(
                            Icons.chevron_right_rounded,
                            color: AppColors.primary,
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                ..._salas.map(
                  (s) => _SalaCard(
                    sala: s,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const SalaDeDebateScreen(),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _AppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: const Icon(
              Icons.arrow_back_rounded,
              color: AppColors.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          const Text(
            'Fórum',
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
    return Row(
      children: List.generate(filtros.length, (i) {
        final ativo = i == selecionado;
        return Padding(
          padding: EdgeInsets.only(right: i < filtros.length - 1 ? 10 : 0),
          child: GestureDetector(
            onTap: () => onSelect(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: ativo ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
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
          ),
        );
      }),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        SizedBox(
          width: 4,
          height: 22,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.secondary,
              borderRadius: BorderRadius.all(Radius.circular(2)),
            ),
          ),
        ),
        SizedBox(width: 10),
        Text(
          'Debates em Destaque',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }
}

class _DebateDestaque extends StatelessWidget {
  final VoidCallback onTap;

  const _DebateDestaque({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: SizedBox(
          height: 180,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // IMAGEM (camada inferior)
              Image.asset(
                'assets/images/História_da_Moeda.png',
                fit: BoxFit.cover,
                alignment: Alignment.center,
                errorBuilder: (_, __, ___) =>
                    Container(color: AppColors.primaryDark),
              ),

              // OVERLAY BORDÔ (camada intermédia)
              Container(color: const Color(0xFF601722).withOpacity(0.48)),

              // CONTEÚDO (camada superior)
              Positioned(
                top: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD1AF45),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'HISTÓRIA MONETÁRIA',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),

              Positioned(
                left: 16,
                right: 16,
                bottom: 18,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'A Evolução do Kwanza no\nContexto Regional',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.15,
                      ),
                    ),

                    const SizedBox(height: 8),

                    Row(
                      children: const [
                        Icon(
                          Icons.people_outline_rounded,
                          size: 15,
                          color: Colors.white70,
                        ),
                        SizedBox(width: 5),
                        Text(
                          '1.2k participantes',
                          style: TextStyle(fontSize: 12, color: Colors.white70),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SalaItem {
  final String titulo;
  final String membros;
  final String tempo;
  final bool isPrivado;
  final bool destaque;

  const _SalaItem({
    required this.titulo,
    required this.membros,
    required this.tempo,
    required this.isPrivado,
    required this.destaque,
  });
}

class _SalaCard extends StatelessWidget {
  final _SalaItem sala;
  final VoidCallback onTap;

  const _SalaCard({required this.sala, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: sala.destaque
                ? AppColors.primary.withOpacity(0.4)
                : const Color(0xFFEEE8E9),
            width: sala.destaque ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          sala.titulo,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      if (sala.isPrivado) ...[const SizedBox(width: 6)],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.people_outline_rounded,
                        size: 13,
                        color: AppColors.textLight,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        sala.membros,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMedium,
                        ),
                      ),
                      const SizedBox(width: 14),
                      const Icon(
                        Icons.access_time_rounded,
                        size: 13,
                        color: AppColors.textLight,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        sala.tempo,
                        style: const TextStyle(
                          fontSize: 12,
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
      ),
    );
  }
}
