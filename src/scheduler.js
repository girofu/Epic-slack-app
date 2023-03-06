const schedule = require('node-schedule');

// 每小時執行一次 'npm run backup'
schedule.scheduleJob('*/5 * * * *', function () {
  console.log('Running epic bot...');
  // 執行 'npm run backup' 命令
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
