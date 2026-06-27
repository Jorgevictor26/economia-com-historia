import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/forum.dart';
import '../services/forum_service.dart';
import '../theme/app_colors.dart';

class SalaDeDebateScreen extends StatefulWidget {
  final Forum? forum;
  final ForumTopic? topic;

  const SalaDeDebateScreen({super.key, this.forum, this.topic});

  @override
  State<SalaDeDebateScreen> createState() => _SalaDeDebateScreenState();
}

class _SalaDeDebateScreenState extends State<SalaDeDebateScreen> {
  final _mensagemController = TextEditingController();
  final _service = ForumService();
  bool _isLoading = true;
  bool _isSending = false;
  String? _error;
  List<ForumTopic> _topics = [];
  List<ForumReply> _replies = [];

  bool get _isTopicMode => widget.topic != null;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _mensagemController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      if (_isTopicMode) {
        _replies = await _service.getReplies(widget.topic!.id);
      } else {
        _topics = await _service.getTopics(widget.forum!.id);
      }
      if (mounted) setState(() {});
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar debate.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _send() async {
    final text = _mensagemController.text.trim();
    if (text.isEmpty || _isSending) return;
    setState(() => _isSending = true);
    try {
      if (_isTopicMode) {
        await _service.replyToTopic(topicId: widget.topic!.id, reply: text);
      } else {
        await _service.createTopic(
          forumId: widget.forum!.id,
          title: text.length > 60 ? '${text.substring(0, 60)}...' : text,
          content: text,
        );
      }
      _mensagemController.clear();
      await _load();
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Erro ao enviar mensagem.');
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.primary),
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = _isTopicMode
        ? widget.topic!.title
        : widget.forum?.name ?? 'Sala';
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _AppBar(title: title),
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                onRefresh: _load,
                child: _isLoading
                    ? const LoadingState(message: 'A carregar debate...')
                    : _error != null
                    ? ListView(
                        children: [
                          ErrorState(message: _error!, onRetry: _load),
                        ],
                      )
                    : _isTopicMode
                    ? _RepliesList(replies: _replies)
                    : _TopicsList(topics: _topics),
              ),
            ),
            _BarraInput(
              controller: _mensagemController,
              isSending: _isSending,
              hint: _isTopicMode
                  ? 'Escreva uma resposta...'
                  : 'Criar topico...',
              onSend: _send,
            ),
          ],
        ),
      ),
    );
  }
}

class _AppBar extends StatelessWidget {
  final String title;

  const _AppBar({required this.title});

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
          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TopicsList extends StatelessWidget {
  final List<ForumTopic> topics;

  const _TopicsList({required this.topics});

  @override
  Widget build(BuildContext context) {
    if (topics.isEmpty) {
      return const EmptyState(message: 'Ainda nao ha topicos neste forum.');
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: topics.length,
      itemBuilder: (_, i) => _TopicTile(topic: topics[i]),
    );
  }
}

class _TopicTile extends StatelessWidget {
  final ForumTopic topic;

  const _TopicTile({required this.topic});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => SalaDeDebateScreen(topic: topic)),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFEEE8E9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              topic.title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              topic.content,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textMedium,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${topic.user?.name ?? 'Utilizador'} - ${topic.repliesCount} respostas - ${timeAgo(topic.createdAt)}',
              style: const TextStyle(fontSize: 12, color: AppColors.textLight),
            ),
          ],
        ),
      ),
    );
  }
}

class _RepliesList extends StatelessWidget {
  final List<ForumReply> replies;

  const _RepliesList({required this.replies});

  @override
  Widget build(BuildContext context) {
    if (replies.isEmpty) {
      return const EmptyState(message: 'Ainda nao ha respostas neste topico.');
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: replies.length,
      itemBuilder: (_, i) => _ReplyBubble(reply: replies[i]),
    );
  }
}

class _ReplyBubble extends StatelessWidget {
  final ForumReply reply;

  const _ReplyBubble({required this.reply});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 4),
            child: Text(
              '${reply.user?.name ?? 'Utilizador'} - ${timeAgo(reply.createdAt)}',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
            ),
          ),
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.82,
            ),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFEEE8E9)),
            ),
            child: Text(
              reply.reply,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textMedium,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BarraInput extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final String hint;
  final VoidCallback onSend;

  const _BarraInput({
    required this.controller,
    required this.isSending,
    required this.hint,
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
                hintText: hint,
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
