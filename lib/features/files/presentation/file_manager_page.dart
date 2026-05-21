import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/providers/app_provider.dart';
import 'package:mcsm_app/data/models/file_model.dart';
import 'package:mcsm_app/features/files/providers/file_provider.dart';
import 'package:mcsm_app/shared/widgets/loading_widget.dart';
import 'package:mcsm_app/shared/widgets/offline_banner.dart';

class FileManagerPage extends ConsumerStatefulWidget {
  final String serverId;
  
  const FileManagerPage({super.key, required this.serverId});
  
  @override
  ConsumerState<FileManagerPage> createState() => _FileManagerPageState();
}

class _FileManagerPageState extends ConsumerState<FileManagerPage> {
  String _searchQuery = '';
  
  @override
  void initState() {
    super.initState();
    ref.read(fileProvider.notifier).listFiles(
      serverId: widget.serverId,
      path: '/',
    );
  }
  
  @override
  Widget build(BuildContext context) {
    final fileState = ref.watch(fileProvider);
    final isOnline = ref.watch(appProvider).isOnline;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('File Manager'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(fileProvider.notifier).listFiles(
              serverId: widget.serverId,
              path: fileState.currentPath,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          if (!isOnline) const OfflineBanner(),
          _buildPathBar(fileState),
          Expanded(
            child: fileState.isLoading
                ? const LoadingWidget()
                : _buildContent(fileState, isOnline),
          ),
        ],
      ),
    );
  }
  
  Widget _buildPathBar(FileState state) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_upward),
            onPressed: state.currentPath != '/' ? () => ref.read(fileProvider.notifier).navigateToParent() : null,
          ),
          Expanded(
            child: Text(state.currentPath),
          ),
        ],
      ),
    );
  }
  
  Widget _buildContent(FileState state, bool isOnline) {
    if (state.error != null) {
      return Center(child: Text(state.error!));
    }
    
    final filteredFiles = state.files.where((file) =>
      file.name.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
    
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            decoration: const InputDecoration(
              hintText: 'Search files...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              setState(() => _searchQuery = value);
            },
          ),
        ),
        Expanded(
          child: filteredFiles.isEmpty
              ? const Center(child: Text('No files found'))
              : ListView.builder(
                  itemCount: filteredFiles.length,
                  itemBuilder: (context, index) => 
                      _buildFileItem(filteredFiles[index], isOnline),
                ),
        ),
      ],
    );
  }
  
  Widget _buildFileItem(FileModel file, bool isOnline) {
    return ListTile(
      leading: Icon(
        file.isDirectory ? Icons.folder : Icons.file,
        color: file.isDirectory ? Colors.blue : Colors.grey,
      ),
      title: Text(file.name),
      subtitle: Text(file.sizeFormatted),
      onTap: () {
        if (file.isDirectory) {
          ref.read(fileProvider.notifier).listFiles(
            serverId: widget.serverId,
            path: file.path,
          );
        } else {
          _openFile(file);
        }
      },
      trailing: !isOnline 
          ? null 
          : PopupMenuButton(
              itemBuilder: (context) => [
                PopupMenuItem(
                  child: const Text('Rename'),
                  onTap: () => _renameFile(file),
                ),
                PopupMenuItem(
                  child: const Text('Delete'),
                  onTap: () => _deleteFile(file),
                ),
              ],
            ),
    );
  }
  
  void _openFile(FileModel file) async {
    try {
      await ref.read(fileProvider.notifier).readFile(
        serverId: widget.serverId,
        path: file.path,
      );
      
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(file.name),
          content: SingleChildScrollView(
            child: TextField(
              controller: TextEditingController(
                text: ref.read(fileProvider).selectedFileContent,
              ),
              maxLines: null,
              decoration: const InputDecoration(border: OutlineInputBorder()),
            ),
          ),
          actions: [
            TextButton(
              child: const Text('Close'),
              onPressed: () {
                ref.read(fileProvider.notifier).clearSelectedContent();
                Navigator.pop(context);
              },
            ),
            TextButton(
              child: const Text('Save'),
              onPressed: () async {
                // Save logic
                Navigator.pop(context);
              },
            ),
          ],
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to open file: $e')),
      );
    }
  }
  
  void _renameFile(FileModel file) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Rename File'),
        content: TextField(
          controller: TextEditingController(text: file.name),
          decoration: const InputDecoration(hintText: 'Enter new name'),
        ),
        actions: [
          TextButton(
            child: const Text('Cancel'),
            onPressed: () => Navigator.pop(context),
          ),
          TextButton(
            child: const Text('Rename'),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
  
  void _deleteFile(FileModel file) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Delete'),
        content: Text('Are you sure you want to delete ${file.name}?'),
        actions: [
          TextButton(
            child: const Text('Cancel'),
            onPressed: () => Navigator.pop(context),
          ),
          TextButton(
            child: const Text('Delete'),
            onPressed: () async {
              try {
                await ref.read(fileProvider.notifier).deleteFile(
                  serverId: widget.serverId,
                  path: file.path,
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('File deleted successfully')),
                );
              } catch (e) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Failed to delete: $e')),
                );
              }
            },
          ),
        ],
      ),
    );
  }
}