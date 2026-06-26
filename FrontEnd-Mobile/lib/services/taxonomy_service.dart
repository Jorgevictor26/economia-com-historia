import '../core/utils/api_client.dart';
import '../core/utils/json_helpers.dart';
import '../models/taxonomy.dart';

class TaxonomyService {
  final ApiClient _api;

  TaxonomyService({ApiClient? api}) : _api = api ?? ApiClient();

  Future<List<Category>> getCategories({String? search}) async {
    final response = await _api.get('/categories', query: {'search': search});
    final data = ApiClient.unwrapData(response);
    if (data is List) return data.map(jsonMap).map(Category.fromJson).toList();
    return <Category>[];
  }

  Future<List<ContentType>> getContentTypes({String? search}) async {
    final response = await _api.get(
      '/content-types',
      query: {'search': search},
    );
    final data = ApiClient.unwrapData(response);
    if (data is List) {
      return data.map(jsonMap).map(ContentType.fromJson).toList();
    }
    return <ContentType>[];
  }
}
