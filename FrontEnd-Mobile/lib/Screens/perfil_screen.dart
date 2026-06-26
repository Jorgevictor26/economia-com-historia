import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/quiz.dart';
import '../models/user.dart';
import '../service/perfil_service.dart';
import '../services/quiz_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import 'editar_perfil_screen.dart';
import 'login_screen.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  final _quizService = QuizService();
  bool _isLoadingResults = true;
  String? _error;
  List<UserQuizResult> _results = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final perfil = context.read<PerfilService>();
    if (!perfil.isAuthenticated) {
      setState(() {
        _isLoadingResults = false;
        _error = null;
        _results = [];
      });
      return;
    }

    setState(() {
      _isLoadingResults = true;
      _error = null;
    });

    try {
      await perfil.carregarPerfil();
      final response = await _quizService.getMyResults();
      if (!mounted) return;
      setState(() => _results = response.data);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar perfil.');
    } finally {
      if (mounted) setState(() => _isLoadingResults = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final perfil = context.watch<PerfilService>();
    final user = perfil.usuario;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        mostrarFavoritos: true,
        titulo: 'Perfil',
        mostrarVoltar: true,
        mostrarNotificacoes: true,
        mostrarPesquisa: true,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 8),
                  if (!perfil.isAuthenticated)
                    _LoginPrompt(
                      onLogin: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const LoginScreen(),
                          ),
                        );
                      },
                    )
                  else ...[
                    _CabecalhoPerfil(user: user),
                    const SizedBox(height: 16),
                    Center(
                      child: SizedBox(
                        height: 44,
                        width: 160,
                        child: ElevatedButton.icon(
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => EditarPerfilScreen(
                                nomeInicial: user?.name,
                                bioInicial: user?.bio,
                              ),
                            ),
                          ).then((_) => _load()),
                          icon: const Icon(Icons.edit_outlined, size: 16),
                          label: const Text('Editar Perfil'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                            textStyle: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const _EstatisticasCard(),
                    const SizedBox(height: 24),
                    const Text(
                      'Progresso dos Cursos',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Acompanha os teus módulos ativos.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textMedium,
                      ),
                    ),
                    const SizedBox(height: 14),
                    if (_isLoadingResults)
                      const SizedBox(
                        height: 180,
                        child: LoadingState(message: 'A carregar progresso...'),
                      )
                    else if (_error != null)
                      SizedBox(
                        height: 180,
                        child: ErrorState(message: _error!, onRetry: _load),
                      )
                    else if (_results.isEmpty)
                      const SizedBox(
                        height: 180,
                        child: EmptyState(
                          message: 'Ainda não há progresso registado.',
                          icon: Icons.quiz_outlined,
                        ),
                      )
                    else
                      ..._results.map((result) => _ResultadoQuizCard(result)),
                  ],
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

class _LoginPrompt extends StatelessWidget {
  final VoidCallback onLogin;

  const _LoginPrompt({required this.onLogin});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: Column(
        children: [
          const Icon(Icons.person_outline, color: AppColors.primary, size: 42),
          const SizedBox(height: 12),
          const Text(
            'Inicia sessao para ver e editar o teu perfil.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textMedium, height: 1.4),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Iniciar sessao'),
          ),
        ],
      ),
    );
  }
}

class _CabecalhoPerfil extends StatelessWidget {
  final User? user;

  const _CabecalhoPerfil({required this.user});

  @override
  Widget build(BuildContext context) {
    final name = user?.name ?? 'Utilizador';
    final bio = user?.bio ?? '';

    return Column(
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.primary, width: 2),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: user?.photo == null || user!.photo!.isEmpty
                ? Container(
                    color: const Color(0xFFEEE8E9),
                    child: Center(
                      child: Text(
                        initials(name),
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  )
                : Image.network(
                    user!.photo!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => Container(
                      color: const Color(0xFFEEE8E9),
                      child: const Icon(
                        Icons.person_rounded,
                        size: 40,
                        color: AppColors.textLight,
                      ),
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          name,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.textDark,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          user?.email ?? '',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: AppColors.textLight),
        ),
        if (bio.isNotEmpty) ...[
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              bio,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textMedium,
                height: 1.45,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _EstatisticasCard extends StatelessWidget {
  const _EstatisticasCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            const _StatItem(label: 'RANKING', valor: '--', sublabel: 'Geral'),
            const VerticalDivider(color: Color(0xFFEEE8E9), width: 1),
            const _StatItem(
              label: 'NÍVEL',
              valor: 'Nível 1',
              sublabel: 'Académico',
            ),
            const VerticalDivider(color: Color(0xFFEEE8E9), width: 1),
            const _StatItem(label: 'PONTOS', valor: '0', sublabel: 'XP'),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String valor;
  final String sublabel;

  const _StatItem({
    required this.label,
    required this.valor,
    required this.sublabel,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppColors.textLight,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            valor,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            sublabel,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: AppColors.textMedium),
          ),
        ],
      ),
    );
  }
}

class _ResultadoQuizCard extends StatelessWidget {
  final UserQuizResult result;

  const _ResultadoQuizCard(this.result);

  @override
  Widget build(BuildContext context) {
    final quizTitle = result.quiz?.title ?? 'Quiz #${result.quizId}';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: Row(
        children: [
          const Icon(Icons.quiz_outlined, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  quizTitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${result.score}/${result.totalQuestions} - ${result.percentage.toStringAsFixed(0)}% - ${timeAgo(result.completedAt)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMedium,
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
