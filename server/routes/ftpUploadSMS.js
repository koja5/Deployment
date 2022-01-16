require("dotenv").config();
const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

var FTPAccessData = {
  host: process.env.ftp_host,
  port: process.env.ftp_port,
  user: process.env.ftp_user,
  password: process.env.ftp_password
};

async function ftpUploadSMS(pathFile, fileName) {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: FTPAccessData.host,
      port: FTPAccessData.port,
      user: FTPAccessData.user,
      password: FTPAccessData.password,
    });
    await client.ensureDir("smsupload");
    await client.uploadFrom(pathFile, fileName);
    fs.unlink(path.join("server/sms/", fileName), (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.log(err);
  }
  client.close();
}

module.exports = ftpUploadSMS;
