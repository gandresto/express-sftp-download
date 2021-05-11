require('dotenv').config()
const express = require('express');
const app = express();
let Client = require('ssh2-sftp-client');
const { intersectionBy, find } = require('lodash');

const { getLocaleDirStats } = require("./utils");

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

app.get('/stats/remote', function (req, res) {
  let sftp = new Client();
  sftp.connect(conf).then(() => {
    return sftp.list(src)
  }).then((data) => {
    res.json(data);
  }).then(() => {
    sftp.end();
  }).catch(err => {
    res.status(500).json(err);
  });
});

app.get('/stats/local', function (req, res) {
  res.json(getLocaleDirStats(dst));
});

app.get('/download', function (req, res) {
  let sftp = new Client();
  sftp.connect(conf).then(() => {
    return sftp.downloadDir(src, dst)
  }).then((info) => {
    return sftp.list(src)
  }).then((sftpStats) => {
    let localStats = getLocaleDirStats(dst)

    // Busco a los que tienen el mismo nombre
    let intersectionByName = intersectionBy(sftpStats, localStats, 'name');
    intersectionByName = intersectionByName.map(intersectionStat => {
      if (
        find(
          localStats,
          (localStat) =>
            localStat.name == intersectionStat.name
            && localStat.size == intersectionStat.size
        ))
        return {
          name: intersectionStat.name,
          size: intersectionStat.size,
          toBeDeleted: 1
        }
      else
        return {
          name: intersectionStat.name,
          size: intersectionStat.size,
          toBeDeleted: 0
        }
    });
    res.json(intersectionByName);
  }).then(() => {
    sftp.end();
  }).catch(err => {
    res.status(500).json(err);
  });
});

app.listen(3000, function () {
  console.log('Servidor activo, escuchando el puerto 3000!');
});