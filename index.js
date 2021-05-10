const fs = require('fs');
const path = require('path');
require('dotenv').config()
const express = require('express');
const app = express();
let Client = require('ssh2-sftp-client');

const conf = {
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USER,
  password: process.env.PASSWORD
}

const src = "/upload";
const dst = "./download";

async function downloadDir(sftp) {
  try {
    await sftp.connect(conf);
    // fs.readdir(dst, { withFileTypes: true }, (err, data) => {
    //   if (err)
    //     throw err;
    //   console.log(data);
    // })
    return await sftp.list(src);
  } catch (error) {
    console.log(error)
    throw error
  }
}

app.get('/', function (req, res) {
  res.send("Holis");
});

app.get('/asyncAwaitReadSFTP', function (req, res) {
  let sftp = new Client(`${req.ip}-${new Date()}`);
  downloadDir(sftp)
    .then((data) => res.json(data))
    .catch(err => {
      console.log(err, 'catch error');
      res.json(error)
    });
});

app.get('/stats/remote', function (req, res) {
  let sftp = new Client(`${req.ip}-${new Date()}`);
  sftp.connect(conf).then(() => {
    return sftp.list(src)
  }).then((data) => {
    res.json(data);
  }).then(()=> {
    sftp.end();
  }).catch(err => {
    console.log(err, 'catch error');
  });
});

app.get('/stats/local', function (req, res) {
  let fileStats = []
  let fileNames = fs.readdirSync(dst);
  fileNames.forEach(filename => {
    const filepath = path.join(dst, filename);
    const fileStat = fs.statSync(filepath);
    const isFile = fileStat.isFile();
    if (isFile) {
      fileStats.push({name: filename, ...fileStat});
    }
  });
  res.json(fileStats);
});

app.get('/download', function (req, res) {
  // let sftp = new Client(`${req.ip}-${new Date()}`);
  // sftp.connect(conf).then(() => {
  //   // sftp.on('download', info => {
  //   //   console.log('Listener:');
  //   //   console.log(info);
  //   // });
  //   // return {
  //   //   sftpStat: sftp.stat(src), 
  //   //   dowloadDir: sftp.downloadDir(src, dst)
  //   // };
  //   return sftp.list(src)
  // }).then((data) => {
  //   let fullData = {
  //     readDir: fs.readdir(dst, {withFileTypes: true}, (err, data) => {
  //     if (err) throw err;
  //     console.log(data);
  //   }), listSftp: data};
  //   res.json(fullData);
  //   // console.log(fullData);
  //   return sftp.end();
  // }).catch(err => {
  //   console.log(err, 'catch error');
  // });
  res.send("READ_SFTP")
});

app.listen(3000, function () {
  console.log('Aplicación ejemplo, escuchando el puerto 3000!');
});