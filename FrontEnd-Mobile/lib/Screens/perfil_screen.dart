import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/quiz.dart';
import '../models/user.dart';
import '../services/perfil_service.dart';
import '../services/quiz_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import '../widgets/profile_photo_image.dart';
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
  QuizUserStats _stats = QuizUserStats.empty;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final perfil = context.read<PerfilService>();
    if (!perfil.isAuthenticated) {
      _redirectToLogin();
      return;
    }

    setState(() {
      _isLoadingResults = true;
      _error = null;
    });

    try {
      await perfil.carregarPerfil();
      var results = <UserQuizResult>[];
      var stats = QuizUserStats.empty;
      try {
        final response = await _quizService.getMyResultsWithStats();
        results = response.results.data;
        stats = response.stats;
      } on NotFoundException {
        results = [];
        stats = QuizUserStats.empty;
      }
      if (!mounted) return;
      setState(() {
        _results = results;
        _stats = stats;
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar perfil.');
    } finally {
      if (mounted) setState(() => _isLoadingResults = false);
    }
  }

  void _redirectToLogin() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final perfil = context.watch<PerfilService>();
    final user = perfil.usuario;
    if (!perfil.isAuthenticated) {
      _redirectToLogin();
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

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
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 8),
                  ...[
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
                    _EstatisticasCard(
                      stats: _stats,
                      isLoading: _isLoadingResults,
                      hasError: _error != null,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Resultados de Quiz',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Acompanha os resultados registados na tua conta.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textMedium,
                      ),
                    ),
                    const SizedBox(height: 14),
                    if (_isLoadingResults)
                      const _ResultadosStateBox(
                        child: LoadingState(
                          message: 'A carregar resultados...',
                        ),
                      )
                    else if (_error != null)
                      _ResultadosStateBox(
                        child: ErrorState(message: _error!, onRetry: _load),
                      )
                    else if (_results.isEmpty)
                      const _ResultadosStateBox(
                        child: EmptyState(
                          message: 'Ainda não há resultados de quiz.',
                          icon: Icons.quiz_outlined,
                        ),
                      )
                    else
                      ..._results.map((result) => _ResultadoQuizCard(result)),
                  ],
                  SizedBox(height: 32 + MediaQuery.paddingOf(context).bottom),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultadosStateBox extends StatelessWidget {
  final Widget child;

  const _ResultadosStateBox({required this.child});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(minHeight: 180),
      child: child,
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
            child: ProfilePhotoImage(
              photo: user?.photo,
              name: name,
              initialsFontSize: 24,
              iconSize: 40,
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
  final QuizUserStats stats;
  final bool isLoading;
  final bool hasError;

  const _EstatisticasCard({
    required this.stats,
    required this.isLoading,
    required this.hasError,
  });

  @override
  Widget build(BuildContext context) {
    final ranking = stats.rankingPosition == null
        ? 'Sem ranking'
        : '#${stats.rankingPosition}';
    final level = stats.level?.trim().isNotEmpty == true
        ? stats.level!.trim()
        : _levelFromXp(stats.totalXp);
    final points = '${stats.totalXp}';

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            _StatItem(
              label: 'RANKING',
              valor: isLoading
                  ? '...'
                  : hasError
                  ? 'Indisp.'
                  : ranking,
              sublabel: 'Geral',
            ),
            const VerticalDivider(color: AppColors.line, width: 1),
            _StatItem(
              label: 'NÍVEL',
              valor: isLoading
                  ? '...'
                  : hasError
                  ? 'Indisp.'
                  : level,
              sublabel: 'Académico',
            ),
            const VerticalDivider(color: AppColors.line, width: 1),
            _StatItem(
              label: 'PONTOS',
              valor: isLoading
                  ? '...'
                  : hasError
                  ? 'Indisp.'
                  : points,
              sublabel: 'XP',
            ),
          ],
        ),
      ),
    );
  }

  String _levelFromXp(int totalXp) {
    if (totalXp >= 2000) return 'Nível 5';
    if (totalXp >= 1000) return 'Nível 4';
    if (totalXp >= 500) return 'Nível 3';
    if (totalXp >= 100) return 'Nível 2';
    return 'Nível 1';
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
        border: Border.all(color: AppColors.line),
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
