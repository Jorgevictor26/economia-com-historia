import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';
import 'package:economica_com_historia/widgets/app_bar_principal.dart';

class NotificacoesScreen extends StatefulWidget {
  const NotificacoesScreen({super.key});

  @override
  State<NotificacoesScreen> createState() => _NotificacoesScreenState();
}

class _NotificacoesScreenState extends State<NotificacoesScreen> {
  int _filtroSelecionado = 0;
  final _filtros = ['Todas', 'Conteúdo Novo', 'Fóruns', 'Sistema'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        // ← SUBSTITUIU _AppBar()
        titulo: 'Notificações',
        mostrarVoltar: true,
        mostrarNotificacoes: false,
        mostrarPesquisa: false,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 44,
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
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _SecaoLabel(label: 'Recentes'),
                const SizedBox(height: 12),
                _NotificacaoCard(
                  titulo: 'Nova Aula Disponível',
                  descricao:
                      'O módulo "A Economia do Café no Século XIX" foi publicado na sua biblioteca.',
                  tempo: '2 min atrás',
                  icone: Icons.play_circle_outline_rounded,
                  cor: AppColors.primary,
                ),
                const SizedBox(height: 10),
                _NotificacaoCard(
                  titulo: 'Resposta no Fórum',
                  descricao:
                      'O Professor Dr. Kiluanje respondeu ao seu comentário sobre a inflação histórica.',
                  tempo: '45 min atrás',
                  icone: Icons.forum_outlined,
                  cor: AppColors.primary,
                ),
                const SizedBox(height: 24),
                _SecaoLabel(label: 'Anteriores'),
                const SizedBox(height: 12),
                _NotificacaoCard(
                  titulo: 'Segurança da Conta',
                  descricao:
                      'O seu acesso foi validado com sucesso a partir de um novo dispositivo em Luanda.',
                  tempo: 'Ontem',
                  icone: Icons.shield_outlined,
                  cor: AppColors.primary,
                ),
                const SizedBox(height: 10),
                _NotificacaoCard(
                  titulo: 'Novo Podcast',
                  descricao:
                      'Episódio Especial: Os Ciclos do Diamante e o Desenvolvimento Sustentável.',
                  tempo: '2 dias atrás',
                  icone: Icons.podcasts_rounded,
                  cor: AppColors.primary,
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SecaoLabel extends StatelessWidget {
  final String label;

  const _SecaoLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w800,
        color: AppColors.textDark,
      ),
    );
  }
}

class _NotificacaoCard extends StatelessWidget {
  final String titulo;
  final String descricao;
  final String tempo;
  final IconData icone;
  final Color cor;

  const _NotificacaoCard({
    required this.titulo,
    required this.descricao,
    required this.tempo,
    required this.icone,
    required this.cor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEEE8E9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      titulo,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: cor,
                      ),
                    ),
                    Text(
                      tempo,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  descricao,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textMedium,
                    height: 1.45,
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
