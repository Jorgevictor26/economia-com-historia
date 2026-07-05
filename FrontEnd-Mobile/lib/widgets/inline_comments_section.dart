import 'package:flutter/material.dart';

import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/comment.dart';
import '../models/content.dart';
import '../theme/app_colors.dart';
import 'profile_photo_image.dart';

class InlineCommentsSection extends StatelessWidget {
  final Content content;
  final bool expanded;
  final bool alwaysExpanded;
  final List<Comment> comments;
  final bool hasMoreComments;
  final bool isLoading;
  final bool isSending;
  final String? error;
  final TextEditingController controller;
  final TextEditingController replyController;
  final VoidCallback onToggle;
  final VoidCallback onSend;
  final VoidCallback onRetry;
  final VoidCallback onLoadMore;
  final ValueChanged<int> onToggleReply;
  final ValueChanged<int> onSendReply;
  final int? replyingToCommentId;
  final bool isSendingReply;

  const InlineCommentsSection({
    super.key,
    required this.content,
    required this.expanded,
    this.alwaysExpanded = false,
    required this.comments,
    required this.hasMoreComments,
    required this.isLoading,
    required this.isSending,
    required this.error,
    required this.controller,
    required this.replyController,
    required this.onToggle,
    required this.onSend,
    required this.onRetry,
    required this.onLoadMore,
    required this.onToggleReply,
    required this.onSendReply,
    required this.replyingToCommentId,
    required this.isSendingReply,
  });

  @override
  Widget build(BuildContext context) {
    final shouldShowBody = alwaysExpanded || expanded;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (alwaysExpanded)
          Text(
            'Comentarios (${content.commentsCount})',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.textDark,
            ),
          )
        else
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onToggle,
              icon: Icon(
                expanded
                    ? Icons.keyboard_arrow_up_rounded
                    : Icons.chat_bubble_outline_rounded,
              ),
              label: Text(
                expanded
                    ? 'Ocultar comentarios'
                    : 'Ver comentarios (${content.commentsCount})',
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
              ),
            ),
          ),
        if (shouldShowBody) ...[
          const SizedBox(height: 18),
          _InlineCommentComposer(
            controller: controller,
            isSending: isSending,
            onSend: onSend,
          ),
          const SizedBox(height: 18),
          if (isLoading)
            const _InlineCommentsLoading()
          else if (error != null)
            ErrorState(message: error!, onRetry: onRetry)
          else if (comments.isEmpty)
            const EmptyState(message: 'Ainda nao ha comentarios.')
          else ...[
            ...comments.map(
              (comment) => _InlineCommentTile(
                comment: comment,
                replyController: replyController,
                isReplying: replyingToCommentId == comment.id,
                isSendingReply: isSendingReply,
                onToggleReply: () => onToggleReply(comment.id),
                onSendReply: () => onSendReply(comment.id),
              ),
            ),
            if (hasMoreComments) ...[
              const SizedBox(height: 8),
              Center(
                child: TextButton(
                  onPressed: onLoadMore,
                  child: const Text('Carregar mais comentarios'),
                ),
              ),
            ],
          ],
        ],
      ],
    );
  }
}

class _InlineCommentsLoading extends StatelessWidget {
  const _InlineCommentsLoading();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2,
            ),
          ),
          SizedBox(width: 10),
          Text(
            'A carregar comentarios...',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textMedium,
            ),
          ),
        ],
      ),
    );
  }
}

class _InlineCommentComposer extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;

  const _InlineCommentComposer({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: controller,
            minLines: 1,
            maxLines: 3,
            style: const TextStyle(fontSize: 14, color: AppColors.textDark),
            decoration: InputDecoration(
              hintText: 'Adicionar comentario...',
              hintStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textLight,
              ),
              filled: true,
              fillColor: AppColors.soft,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(22),
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
    );
  }
}

class _InlineCommentTile extends StatelessWidget {
  final Comment comment;
  final TextEditingController replyController;
  final bool isReplying;
  final bool isSendingReply;
  final VoidCallback onToggleReply;
  final VoidCallback onSendReply;

  const _InlineCommentTile({
    required this.comment,
    required this.replyController,
    required this.isReplying,
    required this.isSendingReply,
    required this.onToggleReply,
    required this.onSendReply,
  });

  @override
  Widget build(BuildContext context) {
    final name = comment.user?.name ?? 'Utilizador';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipOval(
            child: SizedBox(
              width: 36,
              height: 36,
              child: ProfilePhotoImage(
                photo: comment.user?.photo,
                name: name,
                initialsFontSize: 12,
                iconSize: 18,
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
                      timeAgo(comment.createdAt),
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  comment.comment,
                  style: const TextStyle(
                    fontSize: 13.5,
                    color: AppColors.textMedium,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: onToggleReply,
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: EdgeInsets.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    minimumSize: const Size(0, 30),
                  ),
                  icon: Icon(
                    isReplying ? Icons.close_rounded : Icons.reply_rounded,
                    size: 16,
                  ),
                  label: Text(
                    isReplying ? 'Cancelar' : 'Responder',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                if (isReplying) ...[
                  const SizedBox(height: 8),
                  _InlineReplyComposer(
                    controller: replyController,
                    isSending: isSendingReply,
                    onCancel: onToggleReply,
                    onSend: onSendReply,
                  ),
                ],
                if (comment.replies.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  ...comment.replies.map(
                    (reply) => _InlineReplyTile(reply: reply),
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

class _InlineReplyComposer extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onCancel;
  final VoidCallback onSend;

  const _InlineReplyComposer({
    required this.controller,
    required this.isSending,
    required this.onCancel,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.soft,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        children: [
          TextField(
            controller: controller,
            minLines: 1,
            maxLines: 3,
            style: const TextStyle(fontSize: 13, color: AppColors.textDark),
            decoration: const InputDecoration(
              hintText: 'Escreve uma resposta...',
              hintStyle: TextStyle(fontSize: 13, color: AppColors.textLight),
              border: InputBorder.none,
              isDense: true,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: isSending ? null : onCancel,
                child: const Text('Cancelar'),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: isSending ? null : onSend,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.cardBackground,
                ),
                child: Text(isSending ? 'A responder...' : 'Responder'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InlineReplyTile extends StatelessWidget {
  final CommentReply reply;

  const _InlineReplyTile({required this.reply});

  @override
  Widget build(BuildContext context) {
    final name = reply.user?.name ?? 'Utilizador';
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 2,
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.line,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          ClipOval(
            child: SizedBox(
              width: 28,
              height: 28,
              child: ProfilePhotoImage(
                photo: reply.user?.photo,
                name: name,
                initialsFontSize: 10,
                iconSize: 14,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.soft,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.line),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          name,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      Text(
                        timeAgo(reply.createdAt),
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textLight,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  Text(
                    reply.reply,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: AppColors.textMedium,
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
