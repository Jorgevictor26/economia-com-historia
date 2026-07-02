import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../services/perfil_service.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import '../widgets/content_card.dart';
import '../widgets/filter_chip_bar.dart';
import 'conteudo_screen.dart';
import 'login_screen.dart';
import 'podcast_selecionado_screen.dart';

class FavoritosScreen extends StatefulWidget {
  const FavoritosScreen({super.key});

  @override
  State<FavoritosScreen> createState() => _FavoritosScreenState();
}

class _FavoritosScreenState extends State<FavoritosScreen> {
  final _service = ContentService();
  final _filtros = const ['Todos', 'Artigos', 'Podcasts', 'Jindungo'];

  int _filtroSelecionado = 0;
  bool _isLoading = true;
  String? _error;
  List<SavedContent> _itens = [];

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
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _service.getSavedContents();
      if (!mounted) return;
      setState(() => _itens = response.data);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar favoritos.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _remover(SavedContent item) async {
    try {
      await _service.removeSavedContent(item.contentId);
      if (!mounted) return;
      setState(() => _itens.removeWhere((saved) => saved.id == item.id));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Conteúdo removido dos favoritos.')),
      );
    } on AppException catch (e) {
      if (mounted) _showError(e.message);
    } catch (_) {
      if (mounted) _showError('Erro ao remover favorito.');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.primary),
    );
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

  List<SavedContent> get _filtrados {
    final filtro = _filtros[_filtroSelecionado];
    if (filtro == 'Todos') return _itens;
    return _itens.where((item) {
      final content = item.content;
      if (content == null) return false;
      if (filtro == 'Podcasts') return content.isPodcast;
      if (filtro == 'Jindungo') return content.isJindungo;
      return !content.isPodcast && !content.isJindungo;
    }).toList();
  }

  void _abrirConteudo(Content content) {
    final route = content.isPodcast
        ? MaterialPageRoute(
            builder: (_) => PodcastSelecionadoScreen(
              contentId: content.id,
              initialContent: content,
            ),
          )
        : MaterialPageRoute(
            builder: (_) =>
                ConteudoScreen(contentId: content.id, initialContent: content),
          );
    Navigator.push(context, route);
  }

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = context.watch<PerfilService>().isAuthenticated;
    if (!isAuthenticated) {
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
        titulo: 'Favoritos',
        mostrarVoltar: true,
        mostrarFavoritos: false,
        mostrarNotificacoes: true,
        mostrarPesquisa: true,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            const Text(
              'Favoritos',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Conteúdos guardados na tua conta.',
              style: TextStyle(fontSize: 13, color: AppColors.textMedium),
            ),
            const SizedBox(height: 16),
            AppFilterChipBar(
              options: _filtros
                  .map((filtro) => FilterChipOption(id: filtro, label: filtro))
                  .toList(),
              selectedId: _filtros[_filtroSelecionado],
              onSelected: (id) {
                final index = _filtros.indexOf(id);
                if (index == -1) return;
                setState(() => _filtroSelecionado = index);
              },
              padding: EdgeInsets.zero,
            ),
            const SizedBox(height: 18),
            if (_isLoading)
              const SizedBox(
                height: 340,
                child: LoadingState(message: 'A carregar favoritos...'),
              )
            else if (_error != null)
              SizedBox(
                height: 340,
                child: ErrorState(message: _error!, onRetry: _load),
              )
            else if (_filtrados.isEmpty)
              const SizedBox(
                height: 340,
                child: EmptyState(
                  message: 'Ainda não há favoritos guardados.',
                  icon: Icons.bookmark_border_rounded,
                ),
              )
            else
              ..._filtrados.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: item.content == null
                      ? const SizedBox.shrink()
                      : AppContentCard(
                          content: item.content!,
                          variant: ContentCardVariant.horizontal,
                          footerLabel: timeAgo(item.createdAt).isEmpty
                              ? 'guardado'
                              : timeAgo(item.createdAt),
                          onTap: () => _abrirConteudo(item.content!),
                          onRemove: () => _remover(item),
                        ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
