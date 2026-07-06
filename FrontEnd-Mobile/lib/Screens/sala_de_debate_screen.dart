import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../models/forum.dart';
import '../services/forum_service.dart';
import '../theme/app_colors.dart';
import '../widgets/profile_photo_image.dart';
import 'conteudo_screen.dart';

class SalaDeDebateScreen extends StatefulWidget {
  final Forum? forum;
  final ForumTopic? topic;

  const SalaDeDebateScreen({super.key, this.forum, this.topic});

  @override
  State<SalaDeDebateScreen> createState() => _SalaDeDebateScreenState();
}

class _SalaDeDebateScreenState extends State<SalaDeDebateScreen> {
  final _mensagemController = TextEditingController();
  final _inputFocus = FocusNode();
  final _service = ForumService();
  bool _isLoading = true;
  bool _isSending = false;
  bool _likedByMe = false;
  bool _savedByMe = false;
  bool _isSharing = false;
  bool _isPrivateGate = false;
  bool _isRequestingJoin = false;
  String? _error;
  Forum? _forumDetail;
  ForumTopic? _topicDetail;
  List<ForumTopic> _topics = [];
  List<ForumReply> _replies = [];

  bool get _isTopicMode => widget.topic != null;
  Forum? get _currentForum =>
      _isTopicMode ? _currentTopic?.forum : (_forumDetail ?? widget.forum);
  ForumTopic? get _currentTopic => _topicDetail ?? widget.topic;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _mensagemController.dispose();
    _inputFocus.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
      _isPrivateGate = false;
    });
    try {
      if (_isTopicMode) {
        _topicDetail = await _service.getTopic(widget.topic!.id);
        _replies = await _service.getReplies(widget.topic!.id);
      } else {
        final forum = widget.forum;
        if (forum == null) {
          throw const AppException('Sala inválida.');
        }
        _forumDetail = await _service.getForum(forum.id);
        if (_isPrivateForumGate(_forumDetail)) {
          _topics = [];
          _isPrivateGate = true;
          if (mounted) setState(() {});
          return;
        }
        _topics = await _service.getTopics(forum.id);
      }
      if (mounted) setState(() {});
    } on AppException catch (e) {
      if (!_isTopicMode && _isMembershipDenied(e)) {
        if (mounted) {
          setState(() {
            _isPrivateGate = true;
            _topics = [];
            _error = null;
          });
        }
      } else if (mounted) {
        setState(() => _error = _friendlyForumError(e.message));
      }
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar debate.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  bool _isPrivateForumGate(Forum? forum) {
    return forum?.visibility?.toLowerCase() == 'private' &&
        forum?.canView == false;
  }

  bool _isMembershipDenied(AppException exception) {
    final message = exception.message.toLowerCase();
    return exception is ForbiddenException &&
        (message.contains('forum member') ||
            message.contains('membro') ||
            message.contains('access denied') ||
            message.contains('acesso negado'));
  }

  String _friendlyForumError(String message) {
    final normalized = message.toLowerCase();
    if (normalized.contains('forum member')) {
      return 'Tens de ser membro deste forum para ver os topicos.';
    }
    if (normalized.contains('access denied')) {
      return 'Nao tens permissao para aceder a este forum.';
    }
    return message;
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

  void _toggleLike() {
    setState(() => _likedByMe = !_likedByMe);
    _showSnackBar(_likedByMe ? 'Debate marcado com gosto.' : 'Gosto removido.');
  }

  void _toggleSaved() {
    setState(() => _savedByMe = !_savedByMe);
    _showSnackBar(_savedByMe ? 'Debate guardado.' : 'Debate removido.');
  }

  Future<void> _shareForum() async {
    if (_isSharing) return;
    final forum = _currentForum;
    final topic = _currentTopic;
    final title = _isTopicMode
        ? topic?.title ?? widget.topic?.title ?? 'Debate'
        : forum?.name ?? widget.forum?.name ?? 'Forum';
    final description = _isTopicMode
        ? topic?.content ?? ''
        : forum?.description ?? forum?.rules ?? '';

    setState(() => _isSharing = true);
    try {
      await SharePlus.instance.share(
        ShareParams(text: '$title\n\n$description'.trim()),
      );
    } catch (_) {
      if (mounted) _showSnackBar('Nao foi possivel partilhar o debate.');
    } finally {
      if (mounted) setState(() => _isSharing = false);
    }
  }

  Future<void> _requestJoin() async {
    final forum = _currentForum ?? widget.forum;
    if (forum == null || _isRequestingJoin) return;

    setState(() => _isRequestingJoin = true);
    try {
      final updated = await _service.requestJoin(forum.id);
      if (!mounted) return;
      setState(() => _forumDetail = updated);
      _showSnackBar('Pedido de participacao enviado.');
    } on AppException catch (e) {
      if (mounted) _showSnackBar(_friendlyForumError(e.message));
    } catch (_) {
      if (mounted) _showSnackBar('Nao foi possivel solicitar participacao.');
    } finally {
      if (mounted) setState(() => _isRequestingJoin = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = _isTopicMode
        ? _currentTopic?.title ?? widget.topic!.title
        : _currentForum?.name ?? widget.forum?.name ?? 'Sala';
    final showComposer = !_isPrivateGate;
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
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          SizedBox(
                            height: 420,
                            child: LoadingState(
                              message: 'A carregar debate...',
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
                    : !_isTopicMode && _isPrivateGate && _currentForum != null
                    ? _PrivateForumGate(
                        forum: _currentForum!,
                        isRequesting: _isRequestingJoin,
                        onRequestJoin: _requestJoin,
                      )
                    : _isTopicMode
                    ? _RepliesList(
                        replies: _replies,
                        topic: _currentTopic,
                        forum: _currentForum,
                      )
                    : _TopicsList(
                        topics: _topics,
                        forum: _currentForum,
                        likedByMe: _likedByMe,
                        savedByMe: _savedByMe,
                        isSharing: _isSharing,
                        onLike: _toggleLike,
                        onShare: _shareForum,
                        onSave: _toggleSaved,
                      ),
              ),
            ),
            if (showComposer)
              _BarraInput(
                controller: _mensagemController,
                focusNode: _inputFocus,
                isSending: _isSending,
                hint: _isTopicMode
                    ? 'Escreva uma resposta...'
                    : 'Criar tópico...',
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

class _PrivateForumGate extends StatelessWidget {
  final Forum forum;
  final bool isRequesting;
  final VoidCallback onRequestJoin;

  const _PrivateForumGate({
    required this.forum,
    required this.isRequesting,
    required this.onRequestJoin,
  });

  @override
  Widget build(BuildContext context) {
    final participants = _activeParticipantInitials(forum, const []);
    final overflow = forum.membersCount > participants.length
        ? forum.membersCount - participants.length
        : 0;
    final isPending = forum.accessStatus?.toLowerCase() == 'pending';

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  const _GateBadge(
                    icon: Icons.lock_outline_rounded,
                    label: 'Privado',
                  ),
                  _GateBadge(
                    icon: Icons.category_outlined,
                    label: _forumCategory(forum),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Text(
                forum.name,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  height: 1.08,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _forumDescription(forum),
                style: const TextStyle(
                  fontSize: 13.5,
                  color: AppColors.textMedium,
                  height: 1.55,
                ),
              ),
              const SizedBox(height: 18),
              Wrap(
                spacing: 14,
                runSpacing: 10,
                children: [
                  _ForumMiniStat(
                    icon: Icons.person_outline_rounded,
                    label:
                        'Criado por ${forum.user?.name ?? 'Economia com Historia'}',
                  ),
                  _ForumMiniStat(
                    icon: Icons.groups_rounded,
                    label: '${forum.membersCount} membros',
                  ),
                  _ForumMiniStat(
                    icon: Icons.forum_outlined,
                    label: '${_forumTopicsCount(forum)} debates',
                  ),
                ],
              ),
              const SizedBox(height: 22),
              const _ForumInfoTitle('Por que entrar neste forum?'),
              const SizedBox(height: 8),
              Text(
                _privateForumReason(forum),
                style: const TextStyle(
                  fontSize: 12.5,
                  color: AppColors.textMedium,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 18),
              const _ForumInfoTitle('Membros'),
              const SizedBox(height: 10),
              Row(
                children: [
                  ...participants.map(
                    (participant) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _ForumAvatar(label: participant, size: 38),
                    ),
                  ),
                  if (overflow > 0)
                    _ForumAvatar(label: '+$overflow', size: 38, muted: true),
                ],
              ),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: isPending || isRequesting ? null : onRequestJoin,
                  icon: Icon(
                    isPending
                        ? Icons.schedule_rounded
                        : Icons.person_add_alt_1_rounded,
                    size: 18,
                  ),
                  label: Text(
                    isRequesting
                        ? 'A enviar pedido...'
                        : isPending
                        ? 'Pedido enviado'
                        : 'Solicitar participacao',
                  ),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.cardBackground,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _GateBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _GateBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _TopicsList extends StatelessWidget {
  final List<ForumTopic> topics;
  final Forum? forum;
  final bool likedByMe;
  final bool savedByMe;
  final bool isSharing;
  final VoidCallback onLike;
  final VoidCallback onShare;
  final VoidCallback onSave;

  const _TopicsList({
    required this.topics,
    required this.forum,
    required this.likedByMe,
    required this.savedByMe,
    required this.isSharing,
    required this.onLike,
    required this.onShare,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        if (forum != null) ...[
          _ForumHeroPanel(forum: forum!, topics: topics),
          const SizedBox(height: 12),
          _ForumActionBar(
            likedByMe: likedByMe,
            savedByMe: savedByMe,
            isSharing: isSharing,
            onLike: onLike,
            onShare: onShare,
            onSave: onSave,
          ),
          const SizedBox(height: 12),
          _ForumMetadataPanel(forum: forum!, topics: topics),
          const SizedBox(height: 16),
        ],
        if (topics.isEmpty)
          const EmptyState(message: 'Ainda não há tópicos neste fórum.')
        else
          ...topics.map((topic) => _TopicTile(topic: topic)),
      ],
    );
  }
}

class _ForumHeroPanel extends StatelessWidget {
  final Forum forum;
  final List<ForumTopic> topics;

  const _ForumHeroPanel({required this.forum, required this.topics});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ForumAvatar(label: initials(forum.name), size: 52),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ForumMetadataBadges(forum: forum),
                    const SizedBox(height: 10),
                    Text(
                      forum.name,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                        height: 1.1,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _forumDescription(forum),
            style: const TextStyle(
              fontSize: 13.5,
              color: AppColors.textMedium,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 14,
            runSpacing: 8,
            children: [
              _ForumMiniStat(
                icon: Icons.groups_rounded,
                label: '${forum.membersCount} membros',
              ),
              _ForumMiniStat(
                icon: Icons.forum_outlined,
                label: '${topics.length} debates',
              ),
              _ForumMiniStat(
                icon: Icons.link_rounded,
                label: '${_forumContentCount(forum)} conteudos',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ForumActionBar extends StatelessWidget {
  final bool likedByMe;
  final bool savedByMe;
  final bool isSharing;
  final VoidCallback onLike;
  final VoidCallback onShare;
  final VoidCallback onSave;

  const _ForumActionBar({
    required this.likedByMe,
    required this.savedByMe,
    required this.isSharing,
    required this.onLike,
    required this.onShare,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ForumActionButton(
              icon: likedByMe
                  ? Icons.favorite_rounded
                  : Icons.favorite_border_rounded,
              label: 'Gostar',
              active: likedByMe,
              onTap: onLike,
            ),
          ),
          Expanded(
            child: _ForumActionButton(
              icon: isSharing
                  ? Icons.hourglass_empty_rounded
                  : Icons.share_outlined,
              label: 'Partilhar',
              onTap: isSharing ? null : onShare,
            ),
          ),
          Expanded(
            child: _ForumActionButton(
              icon: savedByMe
                  ? Icons.bookmark_rounded
                  : Icons.bookmark_border_rounded,
              label: 'Guardar',
              active: savedByMe,
              onTap: onSave,
            ),
          ),
        ],
      ),
    );
  }
}

class _ForumActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback? onTap;

  const _ForumActionButton({
    required this.icon,
    required this.label,
    this.active = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primary : AppColors.textMedium;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 21, color: color),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
          ],
        ),
      ),
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
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    topic.title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                _ForumReportMenu(
                  onReport: () => _showForumReportPending(context),
                ),
              ],
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

class _TopicHeader extends StatelessWidget {
  final ForumTopic topic;
  final Forum? forum;

  const _TopicHeader({required this.topic, required this.forum});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  topic.content,
                  style: const TextStyle(
                    fontSize: 13.5,
                    color: AppColors.textMedium,
                    height: 1.45,
                  ),
                ),
              ),
              _ForumReportMenu(
                onReport: () => _showForumReportPending(context),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            '${topic.user?.name ?? 'Utilizador'} - ${timeAgo(topic.createdAt)}',
            style: const TextStyle(fontSize: 12, color: AppColors.textLight),
          ),
          if (forum != null) ...[
            const SizedBox(height: 12),
            _ForumMetadataBadges(forum: forum!),
          ],
        ],
      ),
    );
  }
}

class _ForumMetadataPanel extends StatelessWidget {
  final Forum forum;
  final List<ForumTopic> topics;

  const _ForumMetadataPanel({required this.forum, required this.topics});

  @override
  Widget build(BuildContext context) {
    final participants = _activeParticipantInitials(forum, topics);
    final overflow = forum.membersCount > participants.length
        ? forum.membersCount - participants.length
        : 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _ForumInfoTitle('Sobre este Debate'),
          const SizedBox(height: 8),
          Text(
            _forumDescription(forum),
            style: const TextStyle(
              fontSize: 12.5,
              color: AppColors.textMedium,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 18),
          const _ForumInfoTitle('Moderador Principal'),
          const SizedBox(height: 10),
          Row(
            children: [
              _ForumAvatar(
                label: initials(forum.user?.name ?? forum.name),
                size: 42,
                dark: true,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      forum.user?.name ?? 'Economia com Historia',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _forumCategory(forum),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _ForumInfoTitle(
            'Participantes Ativos (${participants.length + overflow})',
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              ...participants.map(
                (participant) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _ForumAvatar(label: participant, size: 38),
                ),
              ),
              if (overflow > 0)
                _ForumAvatar(label: '+$overflow', size: 38, muted: true),
            ],
          ),
          const SizedBox(height: 18),
          const _ForumInfoTitle('Recursos Partilhados'),
          const SizedBox(height: 10),
          if (forum.contents.isEmpty)
            const Text(
              'Ainda nao ha recursos associados a este debate.',
              style: TextStyle(fontSize: 12, color: AppColors.textLight),
            )
          else ...[
            ...forum.contents
                .take(3)
                .map((content) => _ForumResourceTile(content: content)),
          ],
        ],
      ),
    );
  }
}

class _ForumInfoTitle extends StatelessWidget {
  final String label;

  const _ForumInfoTitle(this.label);

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w900,
        color: AppColors.primary,
        letterSpacing: 0.8,
      ),
    );
  }
}

class _ForumResourceTile extends StatelessWidget {
  final Content content;

  const _ForumResourceTile({required this.content});

  @override
  Widget build(BuildContext context) {
    final type = content.contentType?.name ?? 'Conteudo';
    final meta = content.category?.name ?? type;

    return InkWell(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) =>
              ConteudoScreen(contentId: content.id, initialContent: content),
        ),
      ),
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 7),
        child: Row(
          children: [
            Icon(_resourceIcon(type), size: 18, color: AppColors.primary),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    content.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    meta,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textLight,
                    ),
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

class _ForumAvatar extends StatelessWidget {
  final String label;
  final double size;
  final bool dark;
  final bool muted;

  const _ForumAvatar({
    required this.label,
    this.size = 40,
    this.dark = false,
    this.muted = false,
  });

  @override
  Widget build(BuildContext context) {
    final backgroundColor = dark
        ? AppColors.primary
        : muted
        ? AppColors.soft
        : AppColors.blush;
    final foregroundColor = dark
        ? AppColors.cardBackground
        : muted
        ? AppColors.textMedium
        : AppColors.primary;

    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.clip,
        style: TextStyle(
          fontSize: size <= 40 ? 11 : 13,
          fontWeight: FontWeight.w900,
          color: foregroundColor,
        ),
      ),
    );
  }
}

class _ForumMiniStat extends StatelessWidget {
  final IconData icon;
  final String label;

  const _ForumMiniStat({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: AppColors.primary),
        const SizedBox(width: 5),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w700,
            color: AppColors.textMedium,
          ),
        ),
      ],
    );
  }
}

class _ForumMetadataBadges extends StatelessWidget {
  final Forum forum;

  const _ForumMetadataBadges({required this.forum});

  @override
  Widget build(BuildContext context) {
    final badges = <Widget>[];
    final category = forum.category?.trim();
    final visibility = forum.visibility?.trim();
    final contentPermission = forum.contentPermission?.trim();

    if (category != null && category.isNotEmpty) {
      badges.add(_ForumBadge(icon: Icons.category_outlined, label: category));
    }

    if (visibility != null && visibility.isNotEmpty) {
      badges.add(
        _ForumBadge(
          icon: visibility.toLowerCase() == 'private'
              ? Icons.lock_outline_rounded
              : Icons.public_rounded,
          label: _visibilityLabel(visibility),
        ),
      );
    }

    if (contentPermission != null && contentPermission.isNotEmpty) {
      badges.add(
        _ForumBadge(
          icon: Icons.verified_user_outlined,
          label: _contentPermissionLabel(contentPermission),
        ),
      );
    }

    badges.add(
      _ForumBadge(
        icon: forum.allowAttachments
            ? Icons.attach_file_rounded
            : Icons.attach_file_outlined,
        label: forum.allowAttachments ? 'Anexos permitidos' : 'Sem anexos',
      ),
    );

    return Wrap(spacing: 8, runSpacing: 8, children: badges);
  }
}

class _ForumBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _ForumBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.16)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

String _visibilityLabel(String value) {
  switch (value.toLowerCase()) {
    case 'private':
      return 'Privado';
    case 'public':
      return 'Público';
    default:
      return value;
  }
}

String _contentPermissionLabel(String value) {
  switch (value.toLowerCase()) {
    case 'subscribers':
      return 'Subscritores';
    case 'public':
      return 'Conteúdo público';
    default:
      return value;
  }
}

int _forumContentCount(Forum forum) {
  return forum.contentsCount > 0 ? forum.contentsCount : forum.contents.length;
}

int _forumTopicsCount(Forum forum) {
  return forum.topicsCount > 0 ? forum.topicsCount : forum.topics.length;
}

String _forumCategory(Forum forum) {
  final value = forum.category?.trim();
  return value == null || value.isEmpty ? 'Forum' : value;
}

String _forumDescription(Forum forum) {
  final value = (forum.description ?? forum.rules ?? '').trim();
  return value.isEmpty ? 'Sem descricao.' : value;
}

String _privateForumReason(Forum forum) {
  final description = _forumDescription(forum);
  if (description != 'Sem descricao.') return description;
  return 'Este forum e privado para manter uma discussao focada entre membros aprovados.';
}

List<String> _activeParticipantInitials(Forum forum, List<ForumTopic> topics) {
  final values = <String>[
    initials(forum.user?.name ?? forum.name),
    ...topics.map((topic) => initials(topic.user?.name ?? 'Utilizador')),
  ];
  final unique = <String>[];

  for (final value in values) {
    if (value.trim().isNotEmpty && !unique.contains(value)) {
      unique.add(value);
    }
  }

  return unique.take(4).toList();
}

IconData _resourceIcon(String type) {
  final normalized = type.toLowerCase();
  if (normalized.contains('video')) return Icons.play_circle_outline_rounded;
  if (normalized.contains('podcast')) return Icons.headphones_rounded;
  if (normalized.contains('quiz')) return Icons.quiz_outlined;
  return Icons.description_outlined;
}

class _RepliesList extends StatelessWidget {
  final List<ForumReply> replies;
  final ForumTopic? topic;
  final Forum? forum;

  const _RepliesList({
    required this.replies,
    required this.topic,
    required this.forum,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        if (topic != null) ...[
          _TopicHeader(topic: topic!, forum: forum),
          const SizedBox(height: 12),
        ],
        if (replies.isEmpty)
          const EmptyState(message: 'Ainda não há respostas neste tópico.')
        else
          ...replies.map((reply) => _ReplyBubble(reply: reply)),
      ],
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
            padding: const EdgeInsets.only(left: 4, bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                ClipOval(
                  child: SizedBox(
                    width: 30,
                    height: 30,
                    child: ProfilePhotoImage(
                      photo: reply.user?.photo,
                      name: reply.user?.name ?? 'Utilizador',
                      initialsFontSize: 10,
                      iconSize: 15,
                    ),
                  ),
                ),
                const SizedBox(width: 9),
                Expanded(
                  child: Text(
                    '${reply.user?.name ?? 'Utilizador'} - ${timeAgo(reply.createdAt)}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                ),
                _ForumReportMenu(
                  onReport: () => _showForumReportPending(context),
                ),
              ],
            ),
          ),
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.82,
            ),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.line),
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

class _ForumReportMenu extends StatelessWidget {
  final VoidCallback onReport;

  const _ForumReportMenu({required this.onReport});

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      tooltip: 'Mais opcoes',
      color: AppColors.cardBackground,
      surfaceTintColor: AppColors.cardBackground,
      icon: const Icon(
        Icons.more_vert_rounded,
        color: AppColors.textLight,
        size: 20,
      ),
      onSelected: (value) {
        if (value == 'report') onReport();
      },
      itemBuilder: (context) => const [
        PopupMenuItem(
          value: 'report',
          child: Row(
            children: [
              Icon(Icons.flag_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 10),
              Text(
                'Denunciar',
                style: TextStyle(
                  color: AppColors.textBordeaux,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

void _showForumReportPending(BuildContext context) {
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text(
        'A denuncia de topicos e respostas do forum ainda nao e suportada pela API.',
      ),
      backgroundColor: AppColors.primary,
      behavior: SnackBarBehavior.floating,
    ),
  );
}

class _BarraInput extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isSending;
  final String hint;
  final VoidCallback onSend;

  const _BarraInput({
    required this.controller,
    required this.focusNode,
    required this.isSending,
    required this.hint,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        border: Border(top: BorderSide(color: AppColors.line)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              focusNode: focusNode,
              style: const TextStyle(fontSize: 14, color: AppColors.textDark),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textLight,
                ),
                filled: true,
                fillColor: AppColors.soft,
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
                color: AppColors.cardBackground,
                size: 18,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
