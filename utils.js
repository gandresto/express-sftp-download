let Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const conf = {
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USER,
  password: process.env.PASSWORD
}

module.exports = {
  getRemoteDirStats: function (remotePath) {
    let sftp = new Client();
    return sftp.connect(conf).then(() => {
      return sftp.list(remotePath)
    }).then((data) => {
      sftp.end();
      return data;
    }).catch(err => {
      console.log(err, 'catch error');
    });
  },
  getLocaleDirStats: function (localPath) {
    let fileStats = []
    let fileNames = fs.readdirSync(localPath);
    fileNames.forEach(filename => {
      const filepath = path.join(localPath, filename);
      const fileStat = fs.statSync(filepath);
      const isFile = fileStat.isFile();
      if (isFile) {
        fileStats.push({ name: filename, ...fileStat });
      }
    });
    return fileStats
  },
  // lookup: function (list1, list2) {
  //   list1.filter((set => a => set.has(a.name))(new Set(list2.map(b => b.name))))
  // },

}