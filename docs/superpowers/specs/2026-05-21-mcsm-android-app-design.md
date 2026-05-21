# MCSManager Android App Design Specification

**Document Version:** 1.0  
**Date:** 2026-05-21  
**Project:** MCSManager Mobile Application  
**Framework:** Flutter 3.x  
**Target Platforms:** Android, iOS

---

## 1. Project Overview

### 1.1 Project Purpose

Develop a full-featured mobile application for MCSManager (Minecraft Server Manager) that provides complete parity with the web-based management panel. The app enables administrators to manage game servers (Minecraft, Steam, etc.) directly from their mobile devices with real-time monitoring, terminal access, and file management capabilities.

### 1.2 Target Users

- Game server administrators
- Server hosting providers
- Multi-server operators
- Technical users managing remote game servers

### 1.3 Connection Architecture

**Remote Server Direct Connection**
- Users input server address (IP/domain), port, username, and password
- Supports multiple MCSManager instances
- Configuration stored securely on device

---

## 2. Technical Architecture

### 2.1 Overall Architecture

```
┌─────────────────────────────────────────────────┐
│              Flutter App (Android/iOS)           │
├─────────────────────────────────────────────────┤
│  UI Layer (Flutter Widgets)                     │
│  - Login Page                                   │
│  - Dashboard                                    │
│  - Server List                                  │
│  - Terminal Console                             │
│  - File Manager                                 │
│  - User Management                              │
├─────────────────────────────────────────────────┤
│  Business Logic Layer (Riverpod Providers)      │
│  - Service Management Logic                     │
│  - Terminal Interaction Logic                   │
│  - File Operation Logic                         │
│  - Offline Detection Logic                     │
│  - Authentication & Authorization Logic        │
│  - Read-Only Mode Switching Logic              │
├─────────────────────────────────────────────────┤
│  Data Layer                                     │
│  - REST API Client (Dio)                       │
│  - WebSocket Client (Real-time Terminal)       │
│  - Local Cache (Hive)                          │
│  - Encrypted Storage (flutter_secure_storage)  │
└─────────────────────────────────────────────────┘
            ↕ REST API / WebSocket
            ↓
┌─────────────────────────────────────────────────┐
│         MCSManager Server Infrastructure         │
├─────────────────────────────────────────────────┤
│  Panel Service (Port 23333)                     │
│  - User Authentication                         │
│  - User Management                             │
│  - API Services                                 │
├─────────────────────────────────────────────────┤
│  Daemon Service (Port 24444)                    │
│  - Server Instance Control                      │
│  - File Operations                              │
│  - Real-time Terminal                          │
│  - Docker Container Management                  │
└─────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Flutter | 3.x | Cross-platform UI framework |
| **Language** | Dart | 3.x | Type-safe development |
| **State Management** | Riverpod | 2.x | Reactive state management |
| **HTTP Client** | Dio | 5.x | REST API communication |
| **WebSocket** | web_socket_channel | 2.x | Real-time terminal communication |
| **Local Storage** | Hive | 2.x | Offline data caching |
| **Secure Storage** | flutter_secure_storage | 9.x | Encrypted credential storage |
| **Terminal Emulator** | xterm | 4.x | Terminal UI rendering |
| **File Operations** | file_picker, path_provider | Latest | Cross-platform file handling |
| **Biometrics** | local_auth | 2.x | Fingerprint/Face ID support |
| **Network Detection** | connectivity_plus | 5.x | Network status monitoring |

### 2.3 Project Structure

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   │   ├── api_constants.dart
│   │   └── app_constants.dart
│   ├── theme/
│   │   └── app_theme.dart
│   ├── utils/
│   │   ├── secure_storage_util.dart
│   │   └── network_util.dart
│   └── errors/
│       └── exceptions.dart
├── data/
│   ├── models/
│   │   ├── server_model.dart
│   │   ├── user_model.dart
│   │   ├── instance_model.dart
│   │   └── file_model.dart
│   ├── repositories/
│   │   ├── auth_repository.dart
│   │   ├── server_repository.dart
│   │   ├── terminal_repository.dart
│   │   └── file_repository.dart
│   └── providers/
│       ├── api_provider.dart
│       ├── auth_provider.dart
│       └── cache_provider.dart
├── features/
│   ├── auth/
│   │   ├── presentation/
│   │   │   └── login_page.dart
│   │   └── providers/
│   │       └── auth_provider.dart
│   ├── dashboard/
│   │   ├── presentation/
│   │   │   └── dashboard_page.dart
│   │   └── providers/
│   │       └── dashboard_provider.dart
│   ├── servers/
│   │   ├── presentation/
│   │   │   ├── server_list_page.dart
│   │   │   └── server_detail_page.dart
│   │   └── providers/
│   │       └── server_provider.dart
│   ├── terminal/
│   │   ├── presentation/
│   │   │   └── terminal_page.dart
│   │   ├── providers/
│   │   │   └── terminal_provider.dart
│   │   └── widgets/
│   │       ├── terminal_view.dart
│   │       └── command_shortcuts.dart
│   ├── files/
│   │   ├── presentation/
│   │   │   └── file_manager_page.dart
│   │   ├── providers/
│   │   │   └── file_provider.dart
│   │   └── widgets/
│   │       └── file_list_widget.dart
│   └── users/
│       ├── presentation/
│       │   └── user_management_page.dart
│       └── providers/
│           └── user_provider.dart
└── shared/
    ├── widgets/
    │   ├── loading_widget.dart
    │   ├── error_widget.dart
    │   └── offline_banner.dart
    └── providers/
        ├── connectivity_provider.dart
        └── offline_mode_provider.dart
```

---

## 3. Feature Specifications

### 3.1 Authentication & Connection

**Server Connection Configuration**
- Input fields: Server Address (IP/Domain), Port, Username, Password
- Connection testing before saving
- Support for self-signed certificates (optional bypass)
- Multiple server profile management

**Security Features**
- Credentials encrypted using flutter_secure_storage
- Biometric authentication (Fingerprint/Face ID) for app unlock
- Session timeout with configurable duration
- Automatic logout on security events

**API Endpoints Integration**
- Panel API: `http://{host}:{port}/api/`
- Daemon API: `http://{host}:{port}/api/`
- Authentication via login endpoint with credentials
- Token-based session management

### 3.2 Dashboard

**Overview Features**
- Real-time server status overview
- CPU/Memory usage indicators
- Online player count display
- Alert notifications panel
- Quick action buttons

**Real-time Updates**
- WebSocket connection for live status
- Automatic reconnection on network issues
- Status polling fallback mechanism

### 3.3 Server Management

**Server List**
- Grouped by nodes
- Status indicators (Online/Offline/Starting/Stopping)
- Quick actions: Start/Stop/Restart
- Search and filter functionality

**Server Details**
- Instance configuration viewing
- Start/Stop/Restart controls
- Configuration file editing
- Backup management
- Docker container status (if applicable)
- Resource usage statistics

**Online Mode Capabilities**
- Start/Stop/Restart server instances
- Edit configuration files
- Create/delete backups
- Modify instance settings

**Offline Mode Capabilities**
- View server status
- View configuration (read-only)
- View backup list

### 3.4 Terminal Console (Core Feature)

**Terminal Features**
- Real-time command input/output
- WebSocket-based bidirectional communication
- Command history (up/down arrows)
- Command auto-completion
- Scrollback buffer

**Mobile-Optimized Interface**
- Virtual keyboard with command shortcuts bar
- Quick command buttons (Minecraft common commands):
  - `/help`, `/list`, `/tp`, `/give`, `/kick`
  - `/op`, `/deop`, `/ban`, `/pardon`
  - `/say`, `/msg`, `/tell`
  - Ctrl+C (interrupt), Ctrl+V (paste), Ctrl+A (select all)
- Touch cursor positioning
- Pinch to zoom
- Swipe to scroll history

**Shortcut Command Categories**
- **Minecraft Commands**: Most used game commands
- **Admin Commands**: Operator-level commands
- **Custom Commands**: User-defined shortcuts
- **System Commands**: Ctrl+C, Ctrl+Z, clear screen

**Online Mode**
- Full terminal interaction enabled
- Real-time command execution
- Live output streaming

**Offline Mode**
- Terminal access disabled
- Display message: "Terminal requires network connection"
- Show last known session status

### 3.5 File Manager

**File Browser**
- Directory tree navigation
- File list with icons by type
- Sort by name/date/size/type
- Search within current directory

**File Operations**
- Create new files/folders
- Edit file contents (text files)
- Upload files to server
- Download files to device
- Delete files/folders
- Rename files/folders
- Copy/Move files

**Online Mode Capabilities**
- All CRUD operations enabled
- File upload/download
- File content editing

**Offline Mode Capabilities**
- Browse cached directory structure
- View file metadata (read-only)
- File operations disabled

### 3.6 User Management

**User List**
- Display all users with roles
- User activity status
- Permission levels

**User Administration**
- Create new users
- Edit user roles/permissions
- Delete users
- Reset passwords

**Online Mode**
- All user management features enabled

**Offline Mode**
- View user list (read-only)
- View permissions (read-only)
- Modification operations disabled

---

## 4. Offline & Security Design

### 4.1 Network Detection

**Connectivity Monitoring**
- Real-time network status via connectivity_plus
- Automatic online/offline mode switching
- Visual indicator of connection status

### 4.2 Offline Mode Behavior

**Data Caching Strategy**
- Cache dashboard data on app launch
- Cache server list and basic info
- Cache file directory structure
- Cache user list

**Read-Only Mode Enforcement**
- UI indicators showing offline mode
- Disable all write operations:
  - Server start/stop/restart buttons disabled
  - Terminal input disabled
  - File upload/delete/edit disabled
  - User modification disabled
- Show "Last synced: [timestamp]" information

**Sync Behavior**
- Automatic data refresh on reconnection
- Conflict resolution: Server data takes precedence
- Show sync progress indicator

### 4.3 Security Implementation

**Credential Storage**
- Use AES-256 encryption via flutter_secure_storage
- Never store plain-text passwords
- Secure keychain integration (Android Keystore / iOS Keychain)

**Session Management**
- Token-based authentication
- Configurable session timeout (default: 30 minutes)
- Automatic token refresh
- Secure logout with token invalidation

**Biometric Authentication**
- Optional fingerprint/Face ID unlock
- Fallback to password entry
- Re-authentication for sensitive operations

---

## 5. API Integration Specification

### 5.1 Authentication Flow

```
1. User enters credentials
2. App sends POST to /api/login
3. Server returns auth token
4. App stores token securely
5. Token included in all subsequent requests
6. Token refresh on expiration
```

### 5.2 Terminal Communication

**WebSocket Connection**
```
1. Establish WebSocket to ws://host:port/api/terminal
2. Send authentication token
3. Send instance UUID for target server
4. Bidirectional command/response streaming
5. Handle reconnection on disconnect
```

### 5.3 File Operations

**API Endpoints**
- GET /api/files/list - List directory contents
- GET /api/files/read - Read file content
- POST /api/files/write - Write file content
- POST /api/files/upload - Upload file
- GET /api/files/download - Download file
- POST /api/files/delete - Delete file/folder

---

## 6. UI/UX Design Principles

### 6.1 Navigation Structure

**Bottom Navigation Bar**
- Dashboard (Home)
- Servers (List)
- Terminal (Quick access to last server)
- Files (File manager)
- More (Users, Settings)

### 6.2 Design Language

**Material Design 3**
- Consistent component usage
- Adaptive color schemes
- Dark/Light theme support

**Color Scheme**
- Primary: Deep Blue (#1565C0)
- Secondary: Orange (#FF9800) for actions
- Success: Green (#4CAF50)
- Error: Red (#F44336)
- Warning: Amber (#FFC107)

### 6.3 Responsive Layout

**Phone Layout**
- Single column layouts
- Bottom navigation
- Full-width cards
- Collapsible panels

**Tablet Layout (Future)**
- Side navigation drawer
- Multi-column layouts
- Split-view terminal

### 6.4 Accessibility

- Semantic labels for screen readers
- Sufficient color contrast
- Touch target minimum 48x48dp
- Support for system font scaling

---

## 7. Error Handling

### 7.1 Network Errors
- Connection timeout: Show retry option
- Server unreachable: Display offline mode prompt
- Authentication failed: Clear credentials, prompt re-login

### 7.2 API Errors
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Show permission denied message
- 404 Not Found: Display resource unavailable
- 500 Server Error: Show error details, suggest retry

### 7.3 Terminal Errors
- WebSocket disconnect: Auto-reconnect with exponential backoff
- Command timeout: Display timeout message
- Invalid command: Show error from server

---

## 8. Performance Considerations

### 8.1 Data Optimization
- Lazy loading for large server lists
- Pagination for file listings
- Efficient terminal rendering with viewport management

### 8.2 Memory Management
- Dispose WebSocket connections properly
- Clear cached data on logout
- Limit terminal scrollback buffer

### 8.3 Battery Optimization
- Reduce polling frequency when app backgrounded
- Wake lock only during active terminal session
- Optimize network requests

---

## 9. Future Enhancements (Out of Scope)

- Multi-language support
- Widget for home screen
- Push notifications (Firebase)
- Dark mode optimization
- iPad/tablet optimized layouts
- Apple Watch companion app

---

## 10. Acceptance Criteria

1. ✅ User can add and manage multiple MCSManager server connections
2. ✅ User can view real-time server status on dashboard
3. ✅ User can start/stop/restart server instances
4. ✅ User can access terminal with command shortcuts
5. ✅ User can browse and manage server files
6. ✅ User can manage users and permissions
7. ✅ App works offline with read-only access
8. ✅ Credentials are securely encrypted
9. ✅ App supports biometric authentication
10. ✅ All write operations disabled in offline mode

---

**Document Status:** Final  
**Approved:** Pending User Review  
**Next Step:** Implementation Planning
