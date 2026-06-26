import '../core/utils/json_helpers.dart';

class PaginatedResponse<T> {
  final List<T> data;
  final int pageNumber;
  final int pageSize;
  final int totalCount;
  final int totalPages;

  const PaginatedResponse({
    required this.data,
    required this.pageNumber,
    required this.pageSize,
    required this.totalCount,
    required this.totalPages,
  });

  bool get hasMore => pageNumber < totalPages;

  factory PaginatedResponse.fromJson(
    Object? json,
    T Function(Map<String, dynamic>) mapper,
  ) {
    if (json is List) {
      final items = json
          .map(jsonMap)
          .where((item) => item.isNotEmpty)
          .map(mapper)
          .toList();
      return PaginatedResponse(
        data: items,
        pageNumber: 1,
        pageSize: items.length,
        totalCount: items.length,
        totalPages: 1,
      );
    }

    final map = jsonMap(json);
    final data = (map['data'] is List)
        ? (map['data'] as List)
              .map(jsonMap)
              .where((item) => item.isNotEmpty)
              .map(mapper)
              .toList()
        : <T>[];

    final pageNumber =
        jsonInt(map['current_page'] ?? map['pageNumber'] ?? map['page']) ?? 1;
    final pageSize =
        jsonInt(map['per_page'] ?? map['pageSize'] ?? map['perPage']) ??
        data.length;
    final totalCount =
        jsonInt(map['total'] ?? map['totalCount'] ?? map['count']) ??
        data.length;
    final totalPages =
        jsonInt(map['last_page'] ?? map['totalPages']) ??
        (pageSize == 0 ? 1 : (totalCount / pageSize).ceil());

    return PaginatedResponse(
      data: data,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      totalPages: totalPages,
    );
  }
}
