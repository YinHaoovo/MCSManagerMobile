class InstanceModel {
  final String id;
  final String name;
  final String type;
  final String serverId;
  final String? jarPath;
  final String? startupCommand;
  final int? memoryLimit;
  final bool? autoStart;
  final bool? autoRestart;
  final String? workingDirectory;
  final Map<String, dynamic>? environment;
  
  InstanceModel({
    required this.id,
    required this.name,
    required this.type,
    required this.serverId,
    this.jarPath,
    this.startupCommand,
    this.memoryLimit,
    this.autoStart = false,
    this.autoRestart = false,
    this.workingDirectory,
    this.environment,
  });
  
  factory InstanceModel.fromJson(Map<String, dynamic> json) {
    return InstanceModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? 'minecraft',
      serverId: json['serverId'] ?? '',
      jarPath: json['jarPath'],
      startupCommand: json['startupCommand'],
      memoryLimit: json['memoryLimit'],
      autoStart: json['autoStart'] ?? false,
      autoRestart: json['autoRestart'] ?? false,
      workingDirectory: json['workingDirectory'],
      environment: json['environment'] as Map<String, dynamic>?,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'serverId': serverId,
      'jarPath': jarPath,
      'startupCommand': startupCommand,
      'memoryLimit': memoryLimit,
      'autoStart': autoStart,
      'autoRestart': autoRestart,
      'workingDirectory': workingDirectory,
      'environment': environment,
    };
  }
}