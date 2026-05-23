/**
 * Daemon 连接详细测试脚本
 * 监听所有事件，找出认证失败的原因
 */
const { io } = require('socket.io-client');

const DAEMON_URL = 'http://8.138.240.222:40057';
const API_KEY = '3cbcad4c25e54fd2dd16a89872e437580b9c7abe99e5236';

console.log('=== Daemon 连接详细测试 ===');
console.log('URL:', DAEMON_URL);
console.log('API Key:', API_KEY);
console.log('');

const socket = io(DAEMON_URL, {
  transports: ['websocket', 'polling'],
  reconnection: false,  // 禁用自动重连，方便调试
  timeout: 15000,
});

// 监听所有事件（用于调试）
socket.onAny((eventName, ...args) => {
  console.log(`📨 收到事件 [${eventName}]:`, JSON.stringify(args, null, 2));
});

// 连接成功
socket.on('connect', () => {
  console.log('✅ Socket.io 连接成功！');
  console.log('   Socket ID:', socket.id);
  console.log('   已连接:', socket.connected);
  console.log('');

  // 测试不同的认证格式
  console.log('📤 测试认证格式 1: { key: API_KEY }');
  socket.emit('auth', { key: API_KEY });

  // 3 秒后测试格式 2
  setTimeout(() => {
    console.log('');
    console.log('📤 测试认证格式 2: 纯字符串');
    socket.emit('auth', API_KEY);
  }, 3000);

  // 6 秒后测试格式 3
  setTimeout(() => {
    console.log('');
    console.log('📤 测试认证格式 3: { apiKey: API_KEY }');
    socket.emit('auth', { apiKey: API_KEY });
  }, 6000);
});

// 认证成功
socket.on('auth:success', (data) => {
  console.log('');
  console.log('✅ 认证成功！');
  console.log('   返回数据:', JSON.stringify(data, null, 2));
  console.log('');
  console.log('=== 测试完成 ===');
  socket.disconnect();
  process.exit(0);
});

// 认证失败
socket.on('auth:fail', (data) => {
  console.error('');
  console.error('❌ 认证失败！');
  console.error('   返回数据:', JSON.stringify(data, null, 2));
});

// 连接错误
socket.on('connect_error', (error) => {
  console.error('');
  console.error('❌ 连接错误！');
  console.error('   错误信息:', error.message);
  process.exit(1);
});

// 断开连接
socket.on('disconnect', (reason, description) => {
  console.log('');
  console.log('⚠️  连接断开:');
  console.log('   原因:', reason);
  console.log('   描述:', description);
  
  if (reason === 'io server disconnect') {
    console.error('');
    console.error('💡 服务器主动断开连接，可能的原因：');
    console.error('   1. 认证失败（API Key 错误）');
    console.error('   2. 认证格式不正确');
    console.error('   3. 认证超时（未在 6 秒内发送认证）');
    console.error('   4. Daemon 配置不允许此 IP 连接');
  }
  
  process.exit(1);
});

// 连接超时
setTimeout(() => {
  if (!socket.connected) {
    console.error('');
    console.error('❌ 连接超时（15秒）！');
    socket.disconnect();
    process.exit(1);
  }
}, 15000);

console.log('⏳ 正在连接...');
