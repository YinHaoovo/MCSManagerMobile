import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/providers/app_provider.dart';
import 'package:mcsm_app/core/utils/network_util.dart';

final connectivityProvider = Provider<ConnectivityNotifier>((ref) {
  return ConnectivityNotifier(ref);
});

class ConnectivityNotifier {
  final Ref ref;
  
  ConnectivityNotifier(this.ref) {
    _init();
  }
  
  void _init() {
    NetworkUtil.connectivityStream.listen((result) {
      final isOnline = result != ConnectivityResult.none;
      ref.read(appProvider.notifier).setOnlineStatus(isOnline);
    });
  }
  
  Future<bool> checkConnection() async {
    return await NetworkUtil.isConnected();
  }
}