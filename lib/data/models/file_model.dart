import 'dart:io';

enum FileType { file, directory, symlink, unknown }

class FileModel {
  final String name;
  final String path;
  final FileType type;
  final int? size;
  final DateTime? modifiedAt;
  final DateTime? createdAt;
  
  FileModel({
    required this.name,
    required this.path,
    required this.type,
    this.size,
    this.modifiedAt,
    this.createdAt,
  });
  
  factory FileModel.fromJson(Map<String, dynamic> json) {
    FileType fileType;
    switch (json['type']?.toLowerCase()) {
      case 'file':
        fileType = FileType.file;
        break;
      case 'directory':
        fileType = FileType.directory;
        break;
      case 'symlink':
        fileType = FileType.symlink;
        break;
      default:
        fileType = FileType.unknown;
    }
    
    return FileModel(
      name: json['name'] ?? '',
      path: json['path'] ?? '',
      type: fileType,
      size: json['size'],
      modifiedAt: json['modifiedAt'] != null ? DateTime.parse(json['modifiedAt']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    String typeString;
    switch (type) {
      case FileType.file:
        typeString = 'file';
        break;
      case FileType.directory:
        typeString = 'directory';
        break;
      case FileType.symlink:
        typeString = 'symlink';
        break;
      default:
        typeString = 'unknown';
    }
    
    return {
      'name': name,
      'path': path,
      'type': typeString,
      'size': size,
      'modifiedAt': modifiedAt?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }
  
  bool get isFile => type == FileType.file;
  bool get isDirectory => type == FileType.directory;
  bool get isSymlink => type == FileType.symlink;
  
  String get sizeFormatted {
    if (size == null) return 'N/A';
    final bytes = size!;
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }
}