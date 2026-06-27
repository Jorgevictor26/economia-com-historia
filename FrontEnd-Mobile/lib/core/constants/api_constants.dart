class ApiConstants {
  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8000/api/v1',
  );

  static const requestTimeout = Duration(seconds: 20);

  static Uri uri(String path, [Map<String, Object?> query = const {}]) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    final base = Uri.parse(baseUrl);
    final queryParameters = <String, String>{};

    for (final entry in query.entries) {
      final value = entry.value;
      if (value == null) continue;
      if (value is String && value.trim().isEmpty) continue;
      queryParameters[entry.key] = value.toString();
    }

    return base.replace(
      path: '${base.path}$normalizedPath',
      queryParameters: queryParameters.isEmpty ? null : queryParameters,
    );
  }

  static String? mediaUrl(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    final raw = value.trim();
    final parsed = Uri.tryParse(raw);
    if (parsed != null && parsed.hasScheme) return raw;

    final base = Uri.parse(baseUrl);
    final origin = base.replace(path: '', query: '', fragment: '');
    final normalized = raw.startsWith('/') ? raw : '/storage/$raw';
    return origin.replace(path: normalized).toString();
  }
}
