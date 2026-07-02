import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/comment.dart';
import '../models/content.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';

class DiscussaoScreen extends StatefulWidget {
  final Content? content;
  final int? contentId;
  final String? title;

  const DiscussaoScreen({super.key, this.content, this.contentId, this.title});

  @override
  State<DiscussaoScreen> createState() => _DiscussaoScreenState();
}

class _DiscussaoScreenState extends State<DiscussaoScreen> {
  final _comentarioController = TextEditingController();
  final _service = ContentService();

  bool _isLoading = true;
  bool _isSending = false;
  String? _error;
  List<Comment> _comentarios = [];

  int get _contentId => widget.contentId ?? widget.content?.id ?? 0;
  String get _title => widget.title ?? widget.content?.title ?? 'Discussão';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _comentarioController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (_contentId == 0) {
      setState(() {
        _isLoading = false;
        _error = 'Conteúdo inválido.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final comments = await _service.getComments(_contentId);
      if (!mounted) return;
      setState(() => _comentarios = comments);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar comentários.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _enviarComentario() async {
    final texto = _comentarioController.text.trim();
    if (texto.isEmpty || _isSending) return;
    setState(() => _isSending = true);
    try {
      await _service.addComment(contentId: _contentId, comment: texto);
      _comentarioController.clear();
      await _load();
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Erro ao enviar comentário.');
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const _AppBar(),
            _CabecalhoArtigo(title: _title, count: _comentarios.length),
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                onRefresh: _load,
                child: _isLoading
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          SizedBox(
                            height: 420,
                            child: LoadingState(
                              message: 'A carregar comentários...',
                            ),
                          ),
                        ],
                      )
                    : _error != null
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          ErrorState(message: _error!, onRetry: _load),
                        ],
                      )
                    : _comentarios.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          EmptyState(message: 'Ainda não há comentários.'),
                        ],
                      )
                    : ListView.separated(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                        itemCount: _comentarios.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 4),
                        itemBuilder: (_, i) =>
                            _ComentarioTile(comentario: _comentarios[i]),
                      ),
              ),
            ),
            _BarraComentario(
              controller: _comentarioController,
              isSending: _isSending,
              onSend: _enviarComentario,
            ),
          ],
        ),
      ),
    );
  }
}

class _AppBar extends StatelessWidget {
  const _AppBar();

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
            'Discussão',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _CabecalhoArtigo extends StatelessWidget {
  final String title;
  final int count;

  const _CabecalhoArtigo({required this.title, required this.count});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFEEE8E9))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '$count comentários',
            style: const TextStyle(fontSize: 13, color: AppColors.textMedium),
          ),
        ],
      ),
    );
  }
}

class _ComentarioTile extends StatelessWidget {
  final Comment comentario;

  const _ComentarioTile({required this.comentario});

  @override
  Widget build(BuildContext context) {
    final name = comentario.user?.name ?? 'Utilizador';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary,
            child: Text(
              initials(name),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textDark,
                        ),
                      ),
                    ),
                    Text(
                      timeAgo(comentario.createdAt),
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  comentario.comment,
                  style: const TextStyle(
                    fontSize: 13.5,
                    color: AppColors.textMedium,
                    height: 1.5,
                  ),
                ),
                if (comentario.replies.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  ...comentario.replies.map(
                    (reply) => Padding(
                      padding: const EdgeInsets.only(bottom: 8, left: 12),
                      child: Text(
                        '${reply.user?.name ?? 'Utilizador'}: ${reply.reply}',
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: AppColors.textMedium,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BarraComentario extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;

  const _BarraComentario({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFEEE8E9))),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              style: const TextStyle(fontSize: 14, color: AppColors.textDark),
              decoration: InputDecoration(
                hintText: 'Adicionar comentário...',
                hintStyle: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textLight,
                ),
                filled: true,
                fillColor: const Color(0xFFF7F3F4),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: isSending ? null : onSend,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: isSending ? AppColors.textLight : AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                isSending ? Icons.hourglass_empty_rounded : Icons.send_rounded,
                color: Colors.white,
                size: 18,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
