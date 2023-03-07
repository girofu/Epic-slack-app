const schedule = require('node-schedule');

// 每5分鐘執行一次 'node ./src/index.js'
schedule.scheduleJob('*/5 * * * *', function () {
  console.log('Running epic bot...');
  // 執行 'node ./src/index.js' 命令
  const { exec } = require('child_process');
  const options = { maxBuffer: 100 * 1024 * 1024 }; // 設定緩衝區大小上限為 100 MB
  exec('node ./src/index.js', options,  (error, stdout, stderr) => {
    if (error) {
      console.error(`bot failed: ${error}`);
      return;
    }
    console.log(`bot running successful: ${stdout}`);
  });
});
