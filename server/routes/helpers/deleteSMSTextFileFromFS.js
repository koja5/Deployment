const fs = require("fs");
const path = require("path");
const directory = "server/sms/";

async function deleteSMSTextFileFromFS() {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
        console.log("Deleted file: " + file);
      });
    }
  });
}

module.exports = deleteSMSTextFileFromFS;
