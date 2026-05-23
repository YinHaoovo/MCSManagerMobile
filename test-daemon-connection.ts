/**
 * Daemon 连接测试脚本
 * 测试目标：http://8.138.240.222:40057
 * API Key: 3cbcad4c25e54fd2dd16a89872e437580b9c7abe99e5236
 */
import { io, type Socket } from 'socket.io-client';

const DAEMON_URL = 'http://8.138.240.222:40057';
const API_KEY = '3cbcad4c25e54fd2dd16a89872e437580b9c7abe99e5236';

console.log('=== Daemon 连接测试 ===');
console.log('URL:', DAEMON_URL);
console.log('API Key:', API_KEY.substring(0, 10) + '...');
console.log('');

const socket: Socket = io(DAEMON_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  timeout: 10000,
});

// 连接成功
socket.on('connect', () => {
  console.log('✅ [1/4] Socket.io 连接成功！');
  console.log('   Socket ID:', socket.id);
  console.log('   已连接:', socket.connected);
  console.log('');

  // 立即发送认证
  console.log('⏳ [2/4] 发送认证...');
  const authData = { key: API_KEY };
  console.log('   认证数据格式:', JSON.stringify(authData));
  socket.emit('auth', authData);
});

// 认证成功
socket.on('auth:success', (data) => {
  console.log('✅ [3/4] 认证成功！');
  console.log('   返回数据:', JSON.stringify(data, null, 2));
  console.log('');

  // 认证成功后，测试获取实例列表
  console.log('⏳ [4/4] 测试获取实例列表...');
  const uuid = generateUUID();
  const packet = {
    uuid,
    status: 200,
    event: 'instance/list',
    data: null,
  };
  console.log('   发送请求:', JSON.stringify(packet));

  socket.emit('instance/list', packet);

  // 监听响应
  socket.onAny((eventName, raw) => {
    const packet = raw as any;
    if (packet.uuid === uuid) {
      console.log('✅ 收到响应！');
      console.log('   Event:', eventName);
      console.log('   Status:', packet.status);
      console.log('   Data:', JSON.stringify(packet.data, null, 2));
      console.log('');
      console.log('=== 测试完成 ===');
      socket.disconnect();
      process.exit(0);
    }
  });

  // 超时处理
  setTimeout(() => {
    console.error('❌ 请求超时！');
    socket.disconnect();
    process.exit(1);
  }, 5000);
});

// 认证失败
socket.on('auth:fail', (data) => {
  console.error('❌ [3/4] 认证失败！');
  console.error('   返回数据:', JSON.stringify(data, null, 2));
  socket.disconnect();
  process.exit(1);
});

// 连接错误
socket.on('connect_error', (error) => {
  console.error('❌ 连接错误！');
  console.error('   错误信息:', error.message);
  console.error('   错误类型:', error.type);
  console.error('');
  console.error('可能的原因：');
  console.error('  1. Daemon URL 不正确');
  console.error('  2. Daemon 未运行或不可访问');
  console.error('  3. 防火墙阻止了连接');
  console.error('  4. 网络不通');
  process.exit(1);
});

// 断开连接
socket.on('disconnect', (reason) => {
  console.log('⚠️  连接断开:', reason);
});

// 连接超时
setTimeout(() => {
  if (!socket.connected) {
    console.error('❌ 连接超时（10秒）！');
    console.error('');
    console.error('建议检查：');
    console.error('  1. Daemon 是否正在运行？');
    console.error('  2. 端口 40057 是否开放？');
    console.error('  3. 服务器防火墙是否允许入站连接？');
    console.error('  4. 本地网络是否可以访问该 IP？');
    socket.disconnect();
    process.exit(1);
  }
}, 10000);

// 生成 UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
