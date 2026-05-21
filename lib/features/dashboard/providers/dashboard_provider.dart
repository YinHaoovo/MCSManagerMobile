import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/data/models/server_model.dart';
import 'package:mcsm_app/data/repositories/server_repository.dart';

final dashboardProvider = StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  return DashboardNotifier(ref);
});

class DashboardState {
  final bool isLoading;
  final List<ServerModel> servers;
  final String? error;
  final int onlineCount;
  final int offlineCount;
  
  DashboardState({
    this.isLoading = false,
    this.servers = const [],
    this.error,
    this.onlineCount = 0,
    this.offlineCount = 0,
  });
  
  DashboardState copyWith({
    bool? isLoading,
    List<ServerModel>? servers,
    String? error,
    int? onlineCount,
    int? offlineCount,
  }) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      servers: servers ?? this.servers,
      error: error ?? this.error,
      onlineCount: onlineCount ?? this.onlineCount,
      offlineCount: offlineCount ?? this.offlineCount,
    );
  }
}

class DashboardNotifier extends StateNotifier<DashboardState> {
  final Ref ref;
  
  DashboardNotifier(this.ref) : super(DashboardState()) {
    fetchServers();
  }
  
  Future<void> fetchServers() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final serverRepository = ref.read(serverRepositoryProvider);
      final servers = await serverRepository.getServers();
      
      final onlineCount = servers.where((s) => s.isOnline).length;
      final offlineCount = servers.where((s) => s.isOffline).length;
      
      state = state.copyWith(
        isLoading: false,
        servers: servers,
        onlineCount: onlineCount,
        offlineCount: offlineCount,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  void updateServerStatus(String serverId, String status) {
    state = state.copyWith(
      servers: state.servers.map((s) => 
        s.id == serverId ? ServerModel.fromJson({...s.toJson(), 'status': status}) : s
      ).toList(),
    );
  }
}