import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/data/models/server_model.dart';
import 'package:mcsm_app/data/repositories/server_repository.dart';

final serverProvider = StateNotifierProvider<ServerNotifier, ServerState>((ref) {
  return ServerNotifier(ref);
});

class ServerState {
  final bool isLoading;
  final List<ServerModel> servers;
  final String? error;
  final String? selectedServerId;
  
  ServerState({
    this.isLoading = false,
    this.servers = const [],
    this.error,
    this.selectedServerId,
  });
  
  ServerState copyWith({
    bool? isLoading,
    List<ServerModel>? servers,
    String? error,
    String? selectedServerId,
  }) {
    return ServerState(
      isLoading: isLoading ?? this.isLoading,
      servers: servers ?? this.servers,
      error: error ?? this.error,
      selectedServerId: selectedServerId ?? this.selectedServerId,
    );
  }
}

class ServerNotifier extends StateNotifier<ServerState> {
  final Ref ref;
  
  ServerNotifier(this.ref) : super(ServerState()) {
    fetchServers();
  }
  
  Future<void> fetchServers() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final serverRepository = ref.read(serverRepositoryProvider);
      final servers = await serverRepository.getServers();
      
      state = state.copyWith(
        isLoading: false,
        servers: servers,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  Future<void> startServer(String id) async {
    try {
      final serverRepository = ref.read(serverRepositoryProvider);
      await serverRepository.startServer(id);
      updateServerStatus(id, 'starting');
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
  
  Future<void> stopServer(String id) async {
    try {
      final serverRepository = ref.read(serverRepositoryProvider);
      await serverRepository.stopServer(id);
      updateServerStatus(id, 'stopping');
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
  
  Future<void> restartServer(String id) async {
    try {
      final serverRepository = ref.read(serverRepositoryProvider);
      await serverRepository.restartServer(id);
      updateServerStatus(id, 'starting');
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
  
  void updateServerStatus(String serverId, String status) {
    state = state.copyWith(
      servers: state.servers.map((s) => 
        s.id == serverId ? ServerModel.fromJson({...s.toJson(), 'status': status}) : s
      ).toList(),
    );
  }
  
  void selectServer(String? id) {
    state = state.copyWith(selectedServerId: id);
  }
}