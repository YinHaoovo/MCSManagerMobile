import 'package:mcsm_app/core/constants/status_constants.dart';

class ServerModel {
  final String id;
  final String name;
  final String status;
  final String node;
  final int? port;
  final int? playerCount;
  final int? maxPlayers;
  final double? cpuUsage;
  final double? memoryUsage;
  final String? ip;
  final String? type;
  final DateTime? lastStarted;
  final DateTime? lastStopped;
  
  ServerModel({
    required this.id,
    required this.name,
    this.status = StatusConstants.offline,
    this.node = 'default',
    this.port,
    this.playerCount = 0,
    this.maxPlayers = 0,
    this.cpuUsage = 0.0,
    this.memoryUsage = 0.0,
    this.ip,
    this.type,
    this.lastStarted,
    this.lastStopped,
  });
  
  factory ServerModel.fromJson(Map<String, dynamic> json) {
    return ServerModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      status: json['status'] ?? StatusConstants.offline,
      node: json['node'] ?? 'default',
      port: json['port'],
      playerCount: json['playerCount'] ?? 0,
      maxPlayers: json['maxPlayers'] ?? 0,
      cpuUsage: (json['cpuUsage'] as num?)?.toDouble() ?? 0.0,
      memoryUsage: (json['memoryUsage'] as num?)?.toDouble() ?? 0.0,
      ip: json['ip'],
      type: json['type'],
      lastStarted: json['lastStarted'] != null ? DateTime.parse(json['lastStarted']) : null,
      lastStopped: json['lastStopped'] != null ? DateTime.parse(json['lastStopped']) : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'status': status,
      'node': node,
      'port': port,
      'playerCount': playerCount,
      'maxPlayers': maxPlayers,
      'cpuUsage': cpuUsage,
      'memoryUsage': memoryUsage,
      'ip': ip,
      'type': type,
      'lastStarted': lastStarted?.toIso8601String(),
      'lastStopped': lastStopped?.toIso8601String(),
    };
  }
  
  bool get isOnline => status == StatusConstants.online;
  bool get isStarting => status == StatusConstants.starting;
  bool get isStopping => status == StatusConstants.stopping;
  bool get isOffline => status == StatusConstants.offline;
}