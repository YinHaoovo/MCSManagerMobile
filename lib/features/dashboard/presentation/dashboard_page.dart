import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/providers/app_provider.dart';
import 'package:mcsm_app/features/auth/providers/auth_provider.dart';
import 'package:mcsm_app/features/dashboard/providers/dashboard_provider.dart';
import 'package:mcsm_app/features/servers/presentation/server_list_page.dart';
import 'package:mcsm_app/shared/widgets/loading_widget.dart';
import 'package:mcsm_app/shared/widgets/offline_banner.dart';

class DashboardPage extends ConsumerStatefulWidget {
  const DashboardPage({super.key});
  
  @override
  ConsumerState<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends ConsumerState<DashboardPage> {
  @override
  void initState() {
    super.initState();
    ref.read(dashboardProvider.notifier).fetchServers();
  }
  
  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);
    final isOnline = ref.watch(appProvider).isOnline;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(dashboardProvider.notifier).fetchServers(),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _handleLogout(),
          ),
        ],
      ),
      body: Column(
        children: [
          if (!isOnline) const OfflineBanner(),
          Expanded(
            child: dashboardState.isLoading
                ? const LoadingWidget()
                : _buildContent(dashboardState),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigation(),
    );
  }
  
  Widget _buildContent(DashboardState state) {
    if (state.error != null) {
      return Center(child: Text(state.error!));
    }
    
    return RefreshIndicator(
      onRefresh: () => ref.read(dashboardProvider.notifier).fetchServers(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildStatsCards(state),
          const SizedBox(height: 24),
          _buildQuickActions(),
          const SizedBox(height: 24),
          _buildServerOverview(state),
        ],
      ),
    );
  }
  
  Widget _buildStatsCards(DashboardState state) {
    return Row(
      children: [
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green),
                  const SizedBox(height: 8),
                  Text(
                    '${state.onlineCount}',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const Text('Online'),
                ],
              ),
            ),
          ),
        ),
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Icon(Icons.close_circle, color: Colors.red),
                  const SizedBox(height: 8),
                  Text(
                    '${state.offlineCount}',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const Text('Offline'),
                ],
              ),
            ),
          ),
        ),
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Icon(Icons.server, color: Colors.blue),
                  const SizedBox(height: 8),
                  Text(
                    '${state.servers.length}',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const Text('Total'),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ServerListPage()),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.server),
                    SizedBox(width: 8),
                    Text('Manage Servers'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildServerOverview(DashboardState state) {
    if (state.servers.isEmpty) {
      return const Center(child: Text('No servers found'));
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Server Status',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ...state.servers.take(5).map((server) => _buildServerCard(server)),
      ],
    );
  }
  
  Widget _buildServerCard(ServerModel server) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: server.isOnline ? Colors.green : Colors.grey,
          child: const Icon(Icons.server, color: Colors.white),
        ),
        title: Text(server.name),
        subtitle: Text('${server.node} - ${server.status.toUpperCase()}'),
        trailing: server.isOnline
            ? Text('${server.playerCount}/${server.maxPlayers} players')
            : null,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ServerListPage()),
        ),
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
      currentIndex: 0,
      onTap: (index) => _handleNavigation(index),
    );
  }
  
  void _handleNavigation(int index) {
    switch (index) {
      case 1:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ServerListPage()),
        );
        break;
    }
  }
  
  Future<void> _handleLogout() async {
    await ref.read(authProvider.notifier).logout();
  }
}