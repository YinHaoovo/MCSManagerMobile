import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/data/repositories/terminal_repository.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

final terminalProvider = StateNotifierProvider<TerminalNotifier, TerminalState>((ref) {
  return TerminalNotifier(ref);
});

class TerminalState {
  final bool isConnected;
  final bool isConnecting;
  final String output;
  final String currentInput;
  final List<String> commandHistory;
  final int historyIndex;
  final String? error;
  final String? serverId;
  
  TerminalState({
    this.isConnected = false,
    this.isConnecting = false,
    this.output = '',
    this.currentInput = '',
    this.commandHistory = const [],
    this.historyIndex = -1,
    this.error,
    this.serverId,
  });
  
  TerminalState copyWith({
    bool? isConnected,
    bool? isConnecting,
    String? output,
    String? currentInput,
    List<String>? commandHistory,
    int? historyIndex,
    String? error,
    String? serverId,
  }) {
    return TerminalState(
      isConnected: isConnected ?? this.isConnected,
      isConnecting: isConnecting ?? this.isConnecting,
      output: output ?? this.output,
      currentInput: currentInput ?? this.currentInput,
      commandHistory: commandHistory ?? this.commandHistory,
      historyIndex: historyIndex ?? this.historyIndex,
      error: error ?? this.error,
      serverId: serverId ?? this.serverId,
    );
  }
}

class TerminalNotifier extends StateNotifier<TerminalState> {
  final Ref ref;
  WebSocketChannel? _channel;
  
  TerminalNotifier(this.ref) : super(TerminalState());
  
  Future<void> connect(String serverId) async {
    state = state.copyWith(isConnecting: true, error: null, serverId: serverId);
    
    try {
      final terminalRepository = ref.read(terminalRepositoryProvider);
      _channel = await terminalRepository.connect(serverId);
      
      _channel!.stream.listen(
        (message) {
          state = state.copyWith(
            output: state.output + message.toString(),
          );
        },
        onError: (error) {
          state = state.copyWith(
            isConnected: false,
            isConnecting: false,
            error: error.toString(),
          );
        },
        onDone: () {
          state = state.copyWith(isConnected: false, isConnecting: false);
        },
      );
      
      state = state.copyWith(isConnected: true, isConnecting: false);
    } catch (e) {
      state = state.copyWith(
        isConnecting: false,
        error: e.toString(),
      );
    }
  }
  
  void disconnect() {
    _channel?.sink.close();
    _channel = null;
    state = state.copyWith(isConnected: false, serverId: null);
  }
  
  void sendCommand(String command) {
    if (state.isConnected && _channel != null) {
      _channel!.sink.add(command);
      
      state = state.copyWith(
        output: state.output + '\n> ' + command + '\n',
        currentInput: '',
        commandHistory: [...state.commandHistory, command],
        historyIndex: -1,
      );
    }
  }
  
  void updateInput(String input) {
    state = state.copyWith(currentInput: input);
  }
  
  String? getPreviousCommand() {
    if (state.commandHistory.isEmpty) return null;
    
    int newIndex;
    if (state.historyIndex == -1) {
      newIndex = state.commandHistory.length - 1;
    } else if (state.historyIndex > 0) {
      newIndex = state.historyIndex - 1;
    } else {
      return state.commandHistory.first;
    }
    
    state = state.copyWith(historyIndex: newIndex);
    return state.commandHistory[newIndex];
  }
  
  String? getNextCommand() {
    if (state.historyIndex == -1) return null;
    
    int newIndex = state.historyIndex + 1;
    if (newIndex >= state.commandHistory.length) {
      state = state.copyWith(historyIndex: -1);
      return '';
    }
    
    state = state.copyWith(historyIndex: newIndex);
    return state.commandHistory[newIndex];
  }
  
  void clearOutput() {
    state = state.copyWith(output: '');
  }
}