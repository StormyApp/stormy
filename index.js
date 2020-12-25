const { homedir } = require('os')
const path = require('path')
var fs = require('fs')
const axios = require('axios');
const URL = 'http://stormyserver20-env.eba-p6m3muhi.ap-south-1.elasticbeanstalk.com/logs'


const getLogDirPath = () => {
    var logDirectory = ""
    if (process.platform == 'win32'){
        // C:\Users\rabans\AppData\Roaming\npm-cache\_logs
        logDirectory = path.join(homedir(),'AppData','Roaming','npm-cache','_logs' )
    } else {
        // /home/agkc8gt50dyyzy2v2vzq9dkdr06btaz/.npm/_logs
        logDirectory = path.join(homedir(),'.npm','_logs')
    }
    return logDirectory
}

// { file: 'db-2020-08-03-12:13.sql', mtime: 2020-08-03T16:13:46.000Z }
const getMostRecentFile = (dir) => {
    const files = orderReccentFiles(dir);
    return files.length ? files[0] : undefined;
};
  
const orderReccentFiles = (dir) => {
    return fs.readdirSync(dir)
      .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
      .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};

const getLogFile = () => {
    const logDir = getLogDirPath()
    const mostRecentFile = getMostRecentFile(logDir)
    const logFilePath = path.join(logDir, mostRecentFile[0].file)
    return {content: fs.readFileSync(logFilePath, 'utf8'), mtime: mostRecentFile[0].mtime}
}

const readConfigJson = (configLocation) => {
    let result = fs.existsSync(configLocation);
    if (!result)
        return {}
    const configString = fs.readFileSync(configLocation, {encoding: 'utf8', flag: 'r'})
    return JSON.parse(configString || '{}')
}


const makeid = (length) => {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return 'a' + result;
}

const sendFileToServer = () => {
    const {uuid} = readConfigJson('.stormy/config.json')
    var logFile = getLogFile()
    return axios({
        method: 'post',
        url: URL,
        data: {
          logs: logFile.content,
          mtime: logFile.mtime,
          uuid: uuid || 'logs' + makeid(20)
        }
    })
}

sendFileToServer()