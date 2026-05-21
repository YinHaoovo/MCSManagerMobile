import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/providers/app_provider.dart';
import 'package:mcsm_app/features/servers/providers/server_provider.dart';
import 'package:mcsm_app/shared/widgets/loading_widget.dart';
import 'package:mcsm_app/shared/widgets/offline_banner.dart';

class ServerDetailPage extends ConsumerStatefulWidget {
  final String serverId;
  
  const ServerDetailPage({super.key, required this.serverId});
  
  @override
  ConsumerState<ServerDetailPage> createState() => _ServerDetailPageState();
}

class _ServerDetailPageState extends ConsumerState<ServerDetailPage> {
  @override
  void initState() {
    super.initState();
    ref.read(serverProvider.notifier).fetchServers();
  }
  
  @override
  Widget build(BuildContext context) {
    final serverState = ref.watch(serverProvider);
    final isOnline = ref.watch(appProvider).isOnline;
    final server = serverState.servers.firstWhere(
      (s) => s.id == widget.serverId,
      orElse: () => ServerModel(id: '', name: 'Loading...'),
    );
    
    return Scaffold(
      appBar: AppBar(
        title: Text(server.name),
      ),
      body: Column(
        children: [
          if (!isOnline) const OfflineBanner(),
          Expanded(
            child: serverState.isLoading
                ? const LoadingWidget()
                : _buildContent(server, isOnline),
          ),
        ],
      ),
    );
  }
  
  Widget _buildContent(ServerModel server, bool isOnline) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildStatusCard(server),
        const SizedBox(height: 24),
        _buildResourceUsage(server),
        const SizedBox(height: 24),
        _buildControls(server, isOnline),
        const SizedBox(height: 24),
        _buildInfoSection(server),
      ],
    );
  }
  
  Widget _buildStatusCard(ServerModel server) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              children: [
                const Icon(Icons.server, size: 48),
                const SizedBox(height: 8),
                Text(server.name),
              ],
            ),
            Column(
              children: [
                _buildStatusBadge(server.status),
                const SizedBox(height: 8),
                if (server.isOnline)
                  Text('${server.playerCount}/${server.maxPlayers} online'),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatusBadge(String status) {
    Color color;
    String text;
    
    switch (status.toLowerCase()) {
      case 'online':
        color = Colors.green;
        text = 'Online';
        break;
      case 'starting':
        color = Colors.orange;
        text = 'Starting';
        break;
      case 'stopping':
        color = Colors.orange;
        text = 'Stopping';
        break;
      default:
        color = Colors.grey;
        text = 'Offline';
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
    );
  }
  
  Widget _buildResourceUsage(ServerModel server) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Resource Usage',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildProgressBar('CPU', server.cpuUsage ?? 0),
            const SizedBox(height: 12),
            _buildProgressBar('Memory', server.memoryUsage ?? 0),
          ],
        ),
      ),
    );
  }
  
  Widget _buildProgressBar(String label, double value) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label),
            Text('${value.toStringAsFixed(1)}%'),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: value / 100,
          backgroundColor: Colors.grey[300],
          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF1565C0)),
        ),
      ],
    );
  }
  
  Widget _buildControls(ServerModel server, bool isOnline) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Controls',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _buildControlButton(
                  icon: Icons.play_arrow,
                  label: 'Start',
                  color: Colors.green,
                  onPressed: server.isOffline && isOnline
                      ? () => ref.read(serverProvider.notifier).startServer(server.id)
                      : null,
                ),
                const SizedBox(width: 12),
                _buildControlButton(
                  icon: Icons.stop,
                  label: 'Stop',
                  color: Colors.red,
                  onPressed: server.isOnline && isOnline
                      ? () => ref.read(serverProvider.notifier).stopServer(server.id)
                      : null,
                ),
                const SizedBox(width: 12),
                _buildControlButton(
                  icon: Icons.refresh,
                  label: 'Restart',
                  color: Colors.blue,
                  onPressed: server.isOnline && isOnline
                      ? () => ref.read(serverProvider.notifier).restartServer(server.id)
                      : null,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback? onPressed,
  }) {
    return Expanded(
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
        ),
        child: Column(
          children: [
            Icon(icon),
            const SizedBox(height: 4),
            Text(label),
          ],
        ),
      ),
    );
  }
  
  Widget _buildInfoSection(ServerModel server) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Server Information',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildInfoRow('Server ID', server.id),
            _buildInfoRow('Type', server.type ?? 'Unknown'),
            _buildInfoRow('IP Address', server.ip ?? 'N/A'),
            _buildInfoRow('Port', server.port?.toString() ?? 'N/A'),
            _buildInfoRow('Node', server.node),
          ],
        ),
      ),
    );
  }
  
  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value),
        ],
      ),
    );
  }
}