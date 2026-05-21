import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/data/models/file_model.dart';
import 'package:mcsm_app/data/repositories/file_repository.dart';

final fileProvider = StateNotifierProvider<FileNotifier, FileState>((ref) {
  return FileNotifier(ref);
});

class FileState {
  final bool isLoading;
  final List<FileModel> files;
  final String currentPath;
  final String? error;
  final String? serverId;
  final String? selectedFileContent;
  
  FileState({
    this.isLoading = false,
    this.files = const [],
    this.currentPath = '/',
    this.error,
    this.serverId,
    this.selectedFileContent,
  });
  
  FileState copyWith({
    bool? isLoading,
    List<FileModel>? files,
    String? currentPath,
    String? error,
    String? serverId,
    String? selectedFileContent,
  }) {
    return FileState(
      isLoading: isLoading ?? this.isLoading,
      files: files ?? this.files,
      currentPath: currentPath ?? this.currentPath,
      error: error ?? this.error,
      serverId: serverId ?? this.serverId,
      selectedFileContent: selectedFileContent ?? this.selectedFileContent,
    );
  }
}

class FileNotifier extends StateNotifier<FileState> {
  final Ref ref;
  
  FileNotifier(this.ref) : super(FileState());
  
  Future<void> listFiles({
    required String serverId,
    required String path,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final fileRepository = ref.read(fileRepositoryProvider);
      final files = await fileRepository.listFiles(
        serverId: serverId,
        path: path,
      );
      
      state = state.copyWith(
        isLoading: false,
        files: files,
        currentPath: path,
        serverId: serverId,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  Future<String> readFile({
    required String serverId,
    required String path,
  }) async {
    try {
      final fileRepository = ref.read(fileRepositoryProvider);
      final content = await fileRepository.readFile(
        serverId: serverId,
        path: path,
      );
      
      state = state.copyWith(selectedFileContent: content);
      return content;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
  
  Future<void> writeFile({
    required String serverId,
    required String path,
    required String content,
  }) async {
    try {
      final fileRepository = ref.read(fileRepositoryProvider);
      await fileRepository.writeFile(
        serverId: serverId,
        path: path,
        content: content,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
  
  Future<void> deleteFile({
    required String serverId,
    required String path,
  }) async {
    try {
      final fileRepository = ref.read(fileRepositoryProvider);
      await fileRepository.deleteFile(
        serverId: serverId,
        path: path,
      );
      await listFiles(serverId: serverId, path: state.currentPath);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
  
  Future<void> renameFile({
    required String serverId,
    required String oldPath,
    required String newPath,
  }) async {
    try {
      final fileRepository = ref.read(fileRepositoryProvider);
      await fileRepository.renameFile(
        serverId: serverId,
        oldPath: oldPath,
        newPath: newPath,
      );
      await listFiles(serverId: serverId, path: state.currentPath);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
  
  void navigateToParent() {
    if (state.currentPath != '/') {
      final parts = state.currentPath.split('/')..removeLast();
      final parentPath = parts.join('/') == '' ? '/' : parts.join('/');
      listFiles(serverId: state.serverId!, path: parentPath);
    }
  }
  
  void clearSelectedContent() {
    state = state.copyWith(selectedFileContent: null);
  }
}