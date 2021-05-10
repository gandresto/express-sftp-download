const fs = require('fs');
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

app.get('/', function (req, res) {
  res.send("Holis");
});

app.get('/readSFTP', function (req, res) {
  let sftp = new Client(`${req.ip}-${new Date()}`);
  sftp.connect(conf).then(() => {
    // sftp.on('download', info => {
    //   console.log('Listener:');
    //   console.log(info);
    // });
    // return {
    //   sftpStat: sftp.stat(src), 
    //   dowloadDir: sftp.downloadDir(src, dst)
    // };
    return sftp.list(src)
  }).then((data) => {
    let fullData = {readDir: fs.readdir(dst, {withFileTypes: true}, err => err), listSftp: data};
    res.json(fullData);
    // console.log(fullData);
    return sftp.end();
  }).catch(err => {
    console.log(err, 'catch error');
  });
});

app.listen(3000, function () {
  console.log('Aplicación ejemplo, escuchando el puerto 3000!');
});