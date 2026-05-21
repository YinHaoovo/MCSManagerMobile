# MCSManager Mobile App

A full-featured mobile application for MCSManager (Minecraft Server Manager) that provides complete parity with the web-based management panel.

## Features

- **Server Management**: Start, stop, and restart game servers
- **Real-time Terminal**: WebSocket-based terminal access with command shortcuts
- **File Manager**: Browse, edit, upload, and manage server files
- **User Management**: Manage users and permissions
- **Dashboard**: Real-time server status overview
- **Offline Mode**: Read-only access when offline
- **Secure Authentication**: Token-based authentication with biometric support

## Technology Stack

- **Framework**: Flutter 3.x
- **State Management**: Riverpod 2.x
- **HTTP Client**: Dio 5.x
- **WebSocket**: web_socket_channel
- **Local Storage**: Hive + flutter_secure_storage
- **Network Detection**: connectivity_plus
- **Biometrics**: local_auth

## Project Structure

```
lib/
├── main.dart                 # Application entry point
├── app.dart                  # Main application widget
├── core/                     # Core utilities and constants
│   ├── constants/            # API and app constants
│   ├── theme/                # App themes
│   ├── utils/                # Utility functions
│   ├── errors/               # Custom exceptions
│   └── providers/            # App-level providers
├── data/                     # Data layer
│   ├── models/               # Data models
│   ├── repositories/         # API repositories
│   └── providers/            # Data providers
├── features/                 # Feature modules
│   ├── auth/                 # Authentication
│   ├── dashboard/            # Dashboard overview
│   ├── servers/              # Server management
│   ├── terminal/             # Terminal console
│   ├── files/                # File manager
│   └── users/                # User management
└── shared/                   # Shared components
    ├── widgets/              # Reusable widgets
    └── providers/            # Shared providers
```

## Getting Started

### Prerequisites

- Flutter 3.x installed
- Dart 3.x installed

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcsm_app

# Install dependencies
flutter pub get

# Run the app
flutter run
```

## Usage

1. **Connect to Server**: Enter your MCSManager server address, port, username, and password
2. **Dashboard**: View real-time server status and statistics
3. **Manage Servers**: Start, stop, or restart server instances
4. **Terminal**: Access real-time terminal with command shortcuts
5. **File Manager**: Browse and manage server files
6. **User Management**: Manage users and permissions

## API Integration

The app connects to MCSManager's Panel API (port 23333) and Daemon API (port 24444) for server management operations.

## License

This project is licensed under the MIT License.