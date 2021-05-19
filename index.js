require('dotenv').config()
const express = require('express');
const { getLocaleDirStats } = require("./utils");
const Client = require('ssh2-sftp-client');

const app = express();

const conf = {
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USER,
  password: process.env.PASSWORD
}

const src = process.env.SRC_DIR;

app.get('/', function (req, res) {
  res.send('Holis');
});

app.get('/stats/remote', function (req, res) {
  const sftp = new Client();
  sftp.connect(conf)
    .then(() => {
      return sftp.list(src)
    }).then((data) => {
      res.json(data);
      sftp.end();
    }).catch(err => {
      res.status(500).json(err);
    });
});

app.get('/stats/local', function (req, res) {
  res.json(getLocaleDirStats(dst));
});

app.get('/download', function (req, res) {
  const sftp = new Client();
  sftp.client.setMaxListeners(30); // Revisar este número
  sftp.connect(conf).then(() => {
    return sftp.list(src);
  }).then(fileList => {
    Promise.all(fileList.map(file =>
      sftp.get(`${src}/${file.name}`))
    ).then(buffers => {
      const fileInfo = fileList.map((fileName, i) => ({
        name: fileName.name,
        remoteSize: fileName.size,
        bufferLength: buffers[i].length,
        ok: fileName.size === buffers[i].length,
      }));
      res.json(fileInfo);
      sftp.end();
    }).catch(err => {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Ha ocurrido un error",
        data: err
      });
    })
  }).catch(err => {
    console.log(err);
    res.status(500).json({
      code: 500,
      message: "Ha ocurrido un error",
      data: err
    });
  });
});

app.listen(3000, function () {
  console.log('Servidor activo, escuchando el puerto 3000!');
});