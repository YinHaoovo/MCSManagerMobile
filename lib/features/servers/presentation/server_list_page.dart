import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/features/servers/presentation/server_detail_page.dart';
import 'package:mcsm_app/features/servers/providers/server_provider.dart';
import 'package:mcsm_app/shared/widgets/loading_widget.dart';

class ServerListPage extends ConsumerStatefulWidget {
  const ServerListPage({super.key});
  
  @override
  ConsumerState<ServerListPage> createState() => _ServerListPageState();
}

class _ServerListPageState extends ConsumerState<ServerListPage> {
  String _searchQuery = '';
  
  @override
  Widget build(BuildContext context) {
    final serverState = ref.watch(serverProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Servers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(serverProvider.notifier).fetchServers(),
          ),
        ],
      ),
      body: serverState.isLoading
          ? const LoadingWidget()
          : _buildContent(serverState),
      bottomNavigationBar: _buildBottomNavigation(),
    );
  }
  
  Widget _buildContent(ServerState state) {
    if (state.error != null) {
      return Center(child: Text(state.error!));
    }
    
    final filteredServers = state.servers.where((server) =>
      server.name.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
    
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            decoration: const InputDecoration(
              hintText: 'Search servers...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              setState(() => _searchQuery = value);
            },
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.read(serverProvider.notifier).fetchServers(),
            child: filteredServers.isEmpty
                ? const Center(child: Text('No servers found'))
                : ListView.builder(
                    itemCount: filteredServers.length,
                    itemBuilder: (context, index) => 
                        _buildServerItem(filteredServers[index]),
                  ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildServerItem(ServerModel server) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: _buildStatusIndicator(server.status),
        title: Text(server.name),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Node: ${server.node}'),
            if (server.isOnline)
              Text('${server.playerCount}/${server.maxPlayers} players'),
          ],
        ),
        trailing: _buildStatusText(server.status),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ServerDetailPage(serverId: server.id),
          ),
        ),
      ),
    );
  }
  
  Widget _buildStatusIndicator(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'online':
        color = Colors.green;
        break;
      case 'starting':
        color = Colors.orange;
        break;
      case 'stopping':
        color = Colors.orange;
        break;
      default:
        color = Colors.grey;
    }
    
    return CircleAvatar(
      backgroundColor: color,
      radius: 10,
      child: status.toLowerCase() == 'starting' || status.toLowerCase() == 'stopping'
          ? const SizedBox(
              width: 12,
              height: 12,
              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
            )
          : null,
    );
  }
  
  Widget _buildStatusText(String status) {
    return Text(
      status.toUpperCase(),
      style: TextStyle(
        fontWeight: FontWeight.bold,
        color: switch (status.toLowerCase()) {
          'online' => Colors.green,
          'starting' => Colors.orange,
          'stopping' => Colors.orange,
          _ => Colors.grey,
        },
      ),
    );
  }
  
  Widget _buildBottomNavigation() {
    return BottomNavigationBar(
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.server), label: 'Servers'),
        BottomNavigationBarItem(icon: Icon(Icons.terminal), label: 'Terminal'),
        BottomNavigationBarItem(icon: Icon(Icons.folder), label: 'Files'),
        BottomNavigationBarItem(icon: Icon(Icons.more_horiz), label: 'More'),
      ],
      currentIndex: 1,
      onTap: (index) => _handleNavigation(index),
    );
  }
  
  void _handleNavigation(int index) {
    switch (index) {
      case 0:
        Navigator.pop(context);
        break;
    }
  }
}