import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/constants/app_constants.dart';
import 'package:mcsm_app/core/constants/websocket_constants.dart';
import 'package:mcsm_app/core/errors/exceptions.dart';
import 'package:mcsm_app/core/utils/secure_storage_util.dart';
import 'package:mcsm_app/data/providers/api_provider.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

final terminalRepositoryProvider = Provider<TerminalRepository>((ref) {
  return TerminalRepository(ref);
});

class TerminalRepository {
  final Ref ref;
  WebSocketChannel? _channel;
  
  TerminalRepository(this.ref);
  
  Future<WebSocketChannel> connect(String serverId) async {
    final baseUrl = ref.read(baseUrlProvider);
    final token = await SecureStorageUtil.getToken();
    
    if (token == null) {
      throw TerminalException(message: 'Not authenticated');
    }
    
    final wsUrl = baseUrl.replaceFirst('http', 'ws') + WebSocketConstants.terminalPath;
    
    try {
      _channel = WebSocketChannel.connect(
        Uri.parse('$wsUrl?serverId=$serverId&token=$token'),
      );
      return _channel!;
    } catch (e) {
      throw TerminalException(message: 'Failed to connect to terminal');
    }
  }
  
  void sendCommand(String command) {
    if (_channel != null && _channel!.closeCode == null) {
      _channel!.sink.add(command);
    } else {
      throw TerminalException(message: 'Terminal not connected');
    }
  }
  
  void disconnect() {
    if (_channel != null) {
      _channel!.sink.close(status.goingAway);
      _channel = null;
    }
  }
  
  bool get isConnected => _channel != null && _channel!.closeCode == null;
}