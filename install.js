let exec = require('child_process').exec;

exec('sh install.sh -s -- --git diggerhq/baelte', (error, stdout, stderr) => {
  console.log(stderr);
});