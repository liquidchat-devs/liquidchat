const { readSync } = require("fs");

class Util {
    constructor(app, express) {
        this.app = app;
        this.express = express;
    }

    //Setups the express app and all adjacent modules
    setupApp() {
        this.app.sessions = new Map();
        this.app.userSessions = new Map();
        this.app.sessionSockets = new Map();
        this.app.voiceGroups = new Map();
        this.app.filesStorage = require("path").join(__dirname, "..", "..", "..", "liquidchat-fileserver", "public/")

        this.app.crypto = require("crypto")
        this.app.cookieParser = require('cookie-parser');
        this.app.bodyParser = require('body-parser');
        this.app.argv = require("process");
        this.app.compression = require('compression');
        this.app.cookie = require("cookie");
        this.app.formidable = require("formidable")
        this.app.fs = require("fs-extra")
        this.app.cors = require("cors")
        this.app.bcrypt = require('bcrypt');
        this.app.sql = require('mysql2');
        this.app.https = require("https");
        this.app.path = require("path");
        this.app.mediasoup = require("mediasoup");
        this.app.isSessionValid = this.isSessionValid;

        var Endpoint = require('./utils/epFunc');
        this.app.epFunc = new Endpoint(this.app);
        var Endpoint2 = require('./utils/mediaFunc');
        this.app.mediaFunc = new Endpoint2(this.app);

        this.app.readJSON = path =>
            JSON.parse(this.app.fs.readFileSync(require("path").join(__dirname + path)))
        
        this.app.config = this.app.readJSON("/../data/config_persistent.txt");

        //SQL Setup
        const conn = this.app.sql.createConnection({
            host: "localhost",
            user: "root",
            password: this.app.config.sqlPassword,
            database: "liquidchat",
            charset: 'utf8mb4'
        });

        conn.promise().connect()
        .then((res, err) => {
            if (err) { throw err; }
            console.log("[SQL_SERVER] Connected-");
        });
        
        this.app.DatabaseManager = require('./data/db_manager');
        this.app.db = new this.app.DatabaseManager(this.app, this.app.sql, conn);

        var origins = ["http://localhost:3000", "http://nekonetwork.net", "https://nekonetwork.net"]
        var corsOptionsDelegate = function (req, callback) {
            var corsOptions;
            if (origins.indexOf(req.header('Origin')) !== -1) {
              corsOptions = { origin: true, credentials: true }
            } else {
              corsOptions = { origin: false, credentials: true }
            }
            callback(null, corsOptions)
        }

        this.app.use(this.app.cors(corsOptionsDelegate))
        this.app.use(this.app.compression());
        this.app.use(this.app.cookieParser());
        this.app.use(this.app.bodyParser.json());
        this.app.use(this.app.bodyParser.urlencoded({
            extended: true
        }));

        this.app.use(this.express.static("../client/public"));
        this.app.use(this.express.json());
        this.app.use(this.express.urlencoded());

        //Mediasoup Workers
        this.app.mediaWorkers = [];
        this.app.voiceGroupRouters = new Map();
        this.app.voiceGroupTransports = new Map();
        this.app.mediaFunc.setupMediaWorker();
    }

    //Setups a http server
    setupServer() {
        const options = {
            key: this.app.fs.readFileSync(require("path").join(__dirname, "/../keys/key.pem")),
            cert: this.app.fs.readFileSync(require("path").join(__dirname, "/../keys/cert.pem"))
        };
        
        this.app.server = this.app.https.createServer(options, this.app).listen(8080);
        console.log("[MAIN_SERVER] Started up https server on port 8080-");
    }

    //Setups a websocket server
    setupSocketServer() {
        this.app.io = require('socket.io')(this.app.server);
        this.app.io.origins((origin, callback) => {  
            if (origin !== 'http://localhost:3000' && origin !== 'http://nekonetwork.net' && origin !== 'https://nekonetwork.net' && origin !== 'file://') {    
                return callback('origin not allowed', false);  
            }  
           callback(null, true);
       });
        this.app.io.on('connect', async(socket) => {
            try {
                var cookies = this.app.cookie.parse(socket.handshake.headers.cookie);
                if(cookies['sessionID'] === undefined || !this.app.sessions.has(cookies['sessionID'])) {
                    console.log("> invalid socket.io session");
                    return;
                }

                this.app.sessionSockets.set(cookies['sessionID'], socket);
                console.log("> new socket.io session");

                var session = this.app.sessions.get(cookies['sessionID']);
                var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
                user.status = 1;
                await this.app.epFunc.updateUser(user, true);

                socket.on('disconnect', async function() {
                    var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
                    user.status = 0;
                    await this.app.epFunc.updateUser(user, true);
                }.bind(this));
            } catch(e) {
                console.error(e)
            }
        });

        console.log("[SOCKET_SERVER] Started up socket.io server-");
    }

    //Setups routes for the express app
    setupRoutes() {
        var normalizedPath = this.app.path.join(__dirname, "endpoints");
        this.app.fs.readdirSync(normalizedPath).forEach(function(file) {
            var Endpoint = require("./endpoints/" + file);
            var ep = new Endpoint(this.app);
            ep.handle();
        }.bind(this));
    }

    //Checks if incoming request is associated with a valid session
    isSessionValid(app, req, res) {
        if(req.cookies['sessionID'] === undefined || !app.sessions.has(req.cookies['sessionID']) || !app.sessionSockets.has(req.cookies['sessionID']) ) {
            console.log("> invalid session");
            res.sendStatus(401);
            return false;
        }

        return true;
    }

    convertTime(time) {
        var timeString = "";
        var timeLeft = time;
    
        var ms = timeLeft % 1000;
        timeLeft = (timeLeft - ms) / 1000;
        var secs = timeLeft % 60;
        timeLeft = (timeLeft - secs) / 60;
        var mins = timeLeft % 60;
        timeLeft = (timeLeft - mins) / 60;
        var hrs = timeLeft % 24;
        timeLeft = (timeLeft - hrs) / 24;
        var days = timeLeft % 30;
        timeLeft = (timeLeft - days) / 30;
        var months = timeLeft % 12;
        timeLeft = (timeLeft - months) / 12;
        var years = timeLeft;

        timeString += years > 0 ? years + "y " : "";
        timeString += months > 0 ? months + "mon " : "";
        timeString += days > 0 ? days + "d " : "";
        timeString += hrs > 0 ? hrs + "h " : "";
        timeString += mins > 0 ? mins + "m " : "";
        timeString += secs > 0 ? secs + "s " : "";
        timeString = timeString.substring(0, timeString.length - 1);
        
        return timeString;
    }
}

module.exports = Util;