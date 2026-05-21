import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/providers/app_provider.dart';
import 'package:mcsm_app/features/terminal/providers/terminal_provider.dart';
import 'package:mcsm_app/shared/widgets/offline_banner.dart';

class TerminalPage extends ConsumerStatefulWidget {
  const TerminalPage({super.key});
  
  @override
  ConsumerState<TerminalPage> createState() => _TerminalPageState();
}

class _TerminalPageState extends ConsumerState<TerminalPage> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  final List<String> _quickCommands = [
    '/help', '/list', '/tp', '/give', '/kick',
    '/op', '/deop', '/ban', '/pardon',
    '/say', '/msg', '/tell',
  ];
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }
  
  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    ref.read(terminalProvider.notifier).disconnect();
    super.dispose();
  }
  
  void _scrollToBottom() {
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }
  
  void _handleSend() {
    final command = _inputController.text.trim();
    if (command.isNotEmpty) {
      ref.read(terminalProvider.notifier).sendCommand(command);
      _inputController.clear();
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    }
  }
  
  void _handleQuickCommand(String command) {
    _inputController.text = command;
  }
  
  @override
  Widget build(BuildContext context) {
    final terminalState = ref.watch(terminalProvider);
    final isOnline = ref.watch(appProvider).isOnline;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terminal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear),
            onPressed: () => ref.read(terminalProvider.notifier).clearOutput(),
          ),
          if (terminalState.isConnected)
            IconButton(
              icon: const Icon(Icons.disconnect),
              onPressed: () => ref.read(terminalProvider.notifier).disconnect(),
            ),
        ],
      ),
      body: Column(
        children: [
          if (!isOnline) const OfflineBanner(),
          Expanded(
            child: _buildTerminalOutput(terminalState),
          ),
          if (isOnline) _buildQuickCommands(),
          _buildInputBar(terminalState, isOnline),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigation(),
    );
  }
  
  Widget _buildTerminalOutput(TerminalState state) {
    if (state.isConnecting) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (state.error != null) {
      return Center(child: Text('Error: ${state.error}'));
    }
    
    return Container(
      color: Colors.black,
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        controller: _scrollController,
        child: Text(
          state.output.isNotEmpty ? state.output : 'Terminal ready. Connect to a server to begin.',
          style: const TextStyle(color: Colors.green, fontFamily: 'Monospace'),
        ),
      ),
    );
  }
  
  Widget _buildQuickCommands() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: _quickCommands.map((cmd) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: ElevatedButton(
                onPressed: () => _handleQuickCommand(cmd),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[800],
                  foregroundColor: Colors.green,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                child: Text(cmd),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
  
  Widget _buildInputBar(TerminalState state, bool isOnline) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: Colors.grey[300]!)),
      ),
      child: Row(
        children: [
          const Text('> ', style: TextStyle(color: Colors.green)),
          Expanded(
            child: TextField(
              controller: _inputController,
              decoration: const InputDecoration(
                hintText: 'Enter command...',
                border: InputBorder.none,
              ),
              onSubmitted: (_) => _handleSend(),
              enabled: state.isConnected && isOnline,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: state.isConnected && isOnline ? _handleSend : null,
          ),
        ],
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
      currentIndex: 2,
      onTap: (index) => _handleNavigation(index),
    );
  }
  
  void _handleNavigation(int index) {
    switch (index) {
      case 0:
        Navigator.popUntil(context, (route) => route.isFirst);
        break;
      case 1:
        Navigator.pop(context);
        break;
    }
  }
}