import '../core/utils/api_client.dart';
import '../core/utils/json_helpers.dart';
import '../models/app_notification.dart';

class NotificationService {
  final ApiClient _api;

  NotificationService({ApiClient? api}) : _api = api ?? ApiClient();

  Future<List<AppNotification>> getNotifications({String? search}) async {
    final response = await _api.get(
      '/notifications',
      query: {'search': search},
    );
    final data = ApiClient.unwrapData(response);
    if (data is List) {
      return data.map(jsonMap).map(AppNotification.fromJson).toList();
    }
    return <AppNotification>[];
  }

  Future<AppNotification> markAsRead(int id) async {
    final response = await _api.patch('/notifications/$id/read');
    return AppNotification.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }
}
