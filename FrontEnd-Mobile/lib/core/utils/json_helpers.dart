int? jsonInt(Object? value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString());
}

double? jsonDouble(Object? value) {
  if (value == null) return null;
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}

bool? jsonBool(Object? value) {
  if (value == null) return null;
  if (value is bool) return value;
  if (value is num) return value != 0;
  final normalized = value.toString().toLowerCase();
  if (normalized == 'true' || normalized == '1') return true;
  if (normalized == 'false' || normalized == '0') return false;
  return null;
}

String? jsonString(Object? value) {
  if (value == null) return null;
  final text = value.toString();
  return text.isEmpty ? null : text;
}

DateTime? jsonDate(Object? value) {
  final text = jsonString(value);
  if (text == null) return null;
  return DateTime.tryParse(text);
}

Map<String, dynamic> jsonMap(Object? value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map((key, val) => MapEntry(key.toString(), val));
  }
  return <String, dynamic>{};
}

List<T> jsonList<T>(Object? value, T Function(Map<String, dynamic>) mapper) {
  if (value is! List) return <T>[];
  return value
      .whereType<Object?>()
      .map(jsonMap)
      .where((item) => item.isNotEmpty)
      .map(mapper)
      .toList();
}
