/**
 * Daemon 认证格式全面测试
 * 尝试所有可能的认证格式
 */
const { io } = require('socket.io-client');

const DAEMON_URL = 'http://8.138.240.222:40057';
const API_KEY = '3cbcad4c25e54fd2dd16a89872e437580b9c7abe99e5236';

console.log('=== Daemon 认证格式全面测试 ===');
console.log('URL:', DAEMON_URL);
console.log('API Key:', API_KEY);
console.log('');

// 测试格式列表
const formats = [
  { name: '纯字符串', data: API_KEY },
  { name: '{ key: string }', data: { key: API_KEY } },
  { name: '{ apiKey: string }', data: { apiKey: API_KEY } },
  { name: '{ token: string }', data: { token: API_KEY } },
  { name: 'Packet 格式（带 key）', data: { uuid: generateUUID(), status: 200, event: 'auth', data: { key: API_KEY } } },
  { name: 'Packet 格式（纯字符串）', data: { uuid: generateUUID(), status: 200, event: 'auth', data: API_KEY } },
  { name: 'query 参数', data: null, useQuery: true },
  { name: 'auth 选项', data: null, useAuth: true },
];

let currentTest = 0;

function runNextTest() {
  if (currentTest >= formats.length) {
    console.log('');
    console.log('=== 所有测试完成 ===');
    console.log('❌ 所有认证格式都失败了！');
    console.log('');
    console.log('💡 建议：');
    console.log('  1. 检查 Daemon 日志，查看认证失败原因');
    console.log('  2. 确认 API Key 是否正确（从 Web 端重新复制）');
    console.log('  3. 检查是否有反向代理/负载均衡导致 WebSocket 连接问题');
    process.exit(1);
    return;
  }

  const format = formats[currentTest];
  console.log(`📤 测试 ${currentTest + 1}/${formats.length}: ${format.name}`);
  
  const socketOptions = {
    transports: ['websocket'],
    reconnection: false,
    timeout: 3000,
  };

  if (format.useQuery) {
    socketOptions.query = { key: API_KEY };
  }
  if (format.useAuth) {
    socketOptions.auth = { key: API_KEY };
  }

  const socket = io(DAEMON_URL, socketOptions);

  let testPassed = false;

  socket.on('connect', () => {
    console.log(`   ✅ Socket 连接成功`);
    
    if (format.data) {
      console.log(`   发送数据:`, JSON.stringify(format.data));
      socket.emit('auth', format.data);
    } else {
      console.log(`   认证数据通过 ${format.useQuery ? 'query 参数' : 'auth 选项'}传递`);
    }
  });

  // 监听认证响应
  socket.on('auth', (data) => {
    console.log(`   收到 auth 响应:`, JSON.stringify(data));
    
    if (data === true || (data && data.data === true)) {
      console.log(`   ✅ 认证成功！`);
      testPassed = true;
      socket.disconnect();
      process.exit(0);
    } else {
      console.log(`   ❌ 认证失败`);
      socket.disconnect();
      currentTest++;
      setTimeout(runNextTest, 1000);
    }
  });

  socket.on('connect_error', (error) => {
    console.log(`   ❌ 连接错误: ${error.message}`);
    socket.disconnect();
    currentTest++;
    setTimeout(runNextTest, 1000);
  });

  socket.on('disconnect', (reason) => {
    if (!testPassed && reason === 'io server disconnect') {
      console.log(`   ⚠️  服务器主动断开连接`);
      currentTest++;
      setTimeout(runNextTest, 1000);
    }
  });

  // 超时
  setTimeout(() => {
    if (!testPassed) {
      console.log(`   ⏳ 超时，跳过此格式`);
      socket.disconnect();
      currentTest++;
      setTimeout(runNextTest, 1000);
    }
  }, 5000);
}

runNextTest();

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
