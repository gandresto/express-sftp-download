const fs = require('fs');
const path = require('path');
require('dotenv').config()
const express = require('express');
const app = express();
let Client = require('ssh2-sftp-client');
const { intersectionBy } = require('lodash');

const {getRemoteDirStats, getLocaleDirStats, lookup} = require("./utils");

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
  let sftp = new Client();
  sftp.connect(conf).then(() => {
    return sftp.list(src)
  }).then((data) => {
    res.json(data);
  }).then(()=> {
    sftp.end();
  }).catch(err => {
    console.log(err, 'catch error');
  });
  // getRemoteDirStats(src).then((data) => res.json(data));
});

app.get('/stats/local', function (req, res) {
  res.json(getLocaleDirStats(dst));
});

app.get('/download', function (req, res) {
  let sftp = new Client();
  sftp.connect(conf).then(() => {
    return sftp.downloadDir(src, dst)
  }).then((info) => {
    console.log(info);
    return sftp.list(src)
  }).then((sftpStats) => {
    let localeStats = getLocaleDirStats(dst) 

    // Busco a los que tienen el mismo nombre
    let intersectionByName = intersectionBy(sftpStats, localeStats, 'name'); 
    console.log(intersectionByName);
    // intersectionByName.forEach(stat => {
    //   stat.name
    // });
    // res.json(intersectionByName); 
  }).then(()=> {
    sftp.end();
    res.send('descarga completa')
  }).catch(err => {
    console.log(err, 'catch error');
  });
});

app.listen(3000, function () {
  console.log('Aplicación ejemplo, escuchando el puerto 3000!');
});