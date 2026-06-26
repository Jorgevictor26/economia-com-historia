String formatDate(DateTime? date) {
  if (date == null) return '';
  final day = date.day.toString().padLeft(2, '0');
  final month = date.month.toString().padLeft(2, '0');
  return '$day/$month/${date.year}';
}

String timeAgo(DateTime? date) {
  if (date == null) return '';
  final diff = DateTime.now().difference(date.toLocal());
  if (diff.inMinutes < 1) return 'agora';
  if (diff.inMinutes < 60) return 'ha ${diff.inMinutes} min';
  if (diff.inHours < 24) return 'ha ${diff.inHours}h';
  if (diff.inDays == 1) return 'ontem';
  if (diff.inDays < 7) return 'ha ${diff.inDays} dias';
  return formatDate(date);
}

String initials(String? name) {
  final cleaned = (name ?? '').trim();
  if (cleaned.isEmpty) return '?';
  final parts = cleaned.split(RegExp(r'\s+'));
  final first = parts.first.isNotEmpty ? parts.first[0] : '';
  final second = parts.length > 1 && parts.last.isNotEmpty ? parts.last[0] : '';
  return (first + second).toUpperCase();
}

String readTime(String? content) {
  final words = (content ?? '').trim().split(RegExp(r'\s+'));
  final count = words.where((word) => word.isNotEmpty).length;
  if (count == 0) return '1 min leitura';
  final minutes = (count / 180).ceil().clamp(1, 999);
  return '$minutes min leitura';
}
