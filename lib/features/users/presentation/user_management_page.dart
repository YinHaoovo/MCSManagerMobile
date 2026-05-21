import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/providers/app_provider.dart';
import 'package:mcsm_app/data/models/user_model.dart';
import 'package:mcsm_app/features/users/providers/user_provider.dart';
import 'package:mcsm_app/shared/widgets/loading_widget.dart';
import 'package:mcsm_app/shared/widgets/offline_banner.dart';

class UserManagementPage extends ConsumerStatefulWidget {
  const UserManagementPage({super.key});
  
  @override
  ConsumerState<UserManagementPage> createState() => _UserManagementPageState();
}

class _UserManagementPageState extends ConsumerState<UserManagementPage> {
  String _searchQuery = '';
  
  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);
    final isOnline = ref.watch(appProvider).isOnline;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(userProvider.notifier).fetchUsers(),
          ),
          if (isOnline)
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () => _showAddUserDialog(),
            ),
        ],
      ),
      body: Column(
        children: [
          if (!isOnline) const OfflineBanner(),
          Expanded(
            child: userState.isLoading
                ? const LoadingWidget()
                : _buildContent(userState, isOnline),
          ),
        ],
      ),
    );
  }
  
  Widget _buildContent(UserState state, bool isOnline) {
    if (state.error != null) {
      return Center(child: Text(state.error!));
    }
    
    final filteredUsers = state.users.where((user) =>
      user.username.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
    
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            decoration: const InputDecoration(
              hintText: 'Search users...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              setState(() => _searchQuery = value);
            },
          ),
        ),
        Expanded(
          child: filteredUsers.isEmpty
              ? const Center(child: Text('No users found'))
              : ListView.builder(
                  itemCount: filteredUsers.length,
                  itemBuilder: (context, index) => 
                      _buildUserItem(filteredUsers[index], isOnline),
                ),
        ),
      ],
    );
  }
  
  Widget _buildUserItem(UserModel user, bool isOnline) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          child: Text(user.username[0].toUpperCase()),
        ),
        title: Text(user.username),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(user.email ?? 'No email'),
            Text(
              user.role.toUpperCase(),
              style: TextStyle(
                color: switch (user.role) {
                  'admin' => Colors.red,
                  'user' => Colors.blue,
                  _ => Colors.grey,
                },
              ),
            ),
          ],
        ),
        trailing: user.isActive
            ? const Icon(Icons.check_circle, color: Colors.green)
            : const Icon(Icons.cancel, color: Colors.grey),
        onTap: isOnline ? () => _showUserDetail(user) : null,
      ),
    );
  }
  
  void _showUserDetail(UserModel user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(user.username),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Email: ${user.email ?? 'N/A'}'),
            Text('Role: ${user.role}'),
            Text('Active: ${user.isActive}'),
          ],
        ),
        actions: [
          TextButton(
            child: const Text('Close'),
            onPressed: () => Navigator.pop(context),
          ),
          TextButton(
            child: const Text('Edit'),
            onPressed: () {
              Navigator.pop(context);
              _showEditUserDialog(user);
            },
          ),
          TextButton(
            child: const Text('Delete'),
            onPressed: () async {
              await ref.read(userProvider.notifier).deleteUser(user.id);
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
  
  void _showAddUserDialog() {
    final usernameController = TextEditingController();
    final emailController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add User'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: usernameController,
              decoration: const InputDecoration(labelText: 'Username'),
            ),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
          ],
        ),
        actions: [
          TextButton(
            child: const Text('Cancel'),
            onPressed: () => Navigator.pop(context),
          ),
          TextButton(
            child: const Text('Add'),
            onPressed: () async {
              final newUser = UserModel(
                id: DateTime.now().toString(),
                username: usernameController.text,
                email: emailController.text,
                role: 'user',
                isActive: true,
              );
              await ref.read(userProvider.notifier).createUser(newUser);
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
  
  void _showEditUserDialog(UserModel user) {
    final usernameController = TextEditingController(text: user.username);
    final emailController = TextEditingController(text: user.email);
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit User'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: usernameController,
              decoration: const InputDecoration(labelText: 'Username'),
            ),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
          ],
        ),
        actions: [
          TextButton(
            child: const Text('Cancel'),
            onPressed: () => Navigator.pop(context),
          ),
          TextButton(
            child: const Text('Save'),
            onPressed: () async {
              final updatedUser = user.copyWith(
                username: usernameController.text,
                email: emailController.text,
              );
              await ref.read(userProvider.notifier).updateUser(user.id, updatedUser);
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
}