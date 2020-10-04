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
        this.app.filesStorage = require("path").join(__dirname, "..", "..", "..", "liquidchat-fileserver/")

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

        this.app.readJSON = path =>
            JSON.parse(this.app.fs.readFileSync(process.cwd() + path))
        
        this.app.config = this.app.readJSON("/data/config_persistent.txt");

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

        this.app.use(this.app.cors({ origin: "http://localhost:3000", credentials: true }))
        this.app.use(this.app.compression());
        this.app.use(this.app.cookieParser());
        this.app.use(this.app.bodyParser.json());
        this.app.use(this.app.bodyParser.urlencoded({
            extended: true
        }));

        this.app.use(this.express.static("../client/public"));
        this.app.use(this.express.json());
        this.app.use(this.express.urlencoded());
    }

    //Setups a http server
    setupServer() {
        const options = {
            key: this.app.fs.readFileSync("./keys/key.pem"),
            cert: this.app.fs.readFileSync("./keys/cert.pem")
        };
        
        this.app.server = this.app.https.createServer(options, this.app).listen(8080);
        console.log("[MAIN_SERVER] Started up https server on port 8080-");
    }

    //Setups a websocket server
    setupSocketServer() {
        this.app.io = require('socket.io')(this.app.server);
        this.app.io.origins((origin, callback) => {  
            if (origin !== 'http://localhost:3000' && origin !== 'file://') {    
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
                await this.updateUser(user, true);

                socket.on('disconnect', async function() {
                    var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
                    user.status = 0;
                    await this.updateUser(user, true);
                }.bind(this));
            } catch(e) {
                console.error(e)
            }
        });

        console.log("[SOCKET_SERVER] Started up socket.io server-");
    }

    //Setups routes for the express app
    setupRoutes() {
        this.app.post('/login', async(req, res) => {
            const data = req.body;
            switch(data.authType) {
                case "autologin":
                    if(!this.app.sessions.has(req.cookies["sessionID"])) {
                        res.send(JSON.stringify({ status: -3 }))
                    } else {
                        res.send(JSON.stringify(this.app.sessions.get(req.cookies["sessionID"])));
                    }
                    break;
        
                case "default":
                    var user = await this.app.db.db_fetch.fetchUserByUsername(this.app.db, data.username, true, true);
                    
                    if(user === undefined) {
                        res.send(JSON.stringify({ status: -2 }))
                    } else if(this.app.bcrypt.compareSync(data.password, user.password.toString()) == false) {
                        res.send(JSON.stringify({ status: -1 }))
                    } else {
                        const sessionID = this.app.crypto.randomBytes(16).toString("hex");
                        const session = {
                            id: sessionID,
                            userID: user.id,
                            status: 1
                        }
                
                        this.app.sessions.set(sessionID, session);
                        if(this.app.userSessions.has(user.id)) {
                            this.app.userSessions.get(user.id).push(sessionID);
                        } else {
                            this.app.userSessions.set(user.id, [ sessionID ]);
                        }

                        res.cookie("sessionID", session.id, {
                            sameSite: "None"
                        });
                        res.send(JSON.stringify(session));  
                    }
                    break;
            }
        })
        
        this.app.post('/register', async(req, res) => {
            const data = req.body;
            var user = await this.app.db.db_fetch.fetchUserByUsername(this.app.db, data.username);

            if(user !== undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else if(data.password !== data.password2) {
                res.send(JSON.stringify({ status: -2 }))
            } else {
                const userID = this.app.crypto.randomBytes(16).toString("hex");
                const sessionID = this.app.crypto.randomBytes(16).toString("hex");
                const passwordHash = this.app.bcrypt.hashSync(data.password, this.app.config.salt)

                const session = {
                    id: sessionID,
                    userID: userID,
                    status: 1
                }

                const user = {
                    id: userID,
                    username: data.username,
                    createdAt: Date.now(),
                    avatar: "defaultAvatar.png",
                    password: passwordHash,
                    friendList: [],
                    dmChannelList: [],
                    status: 0
                }
        
                await this.app.db.db_add.addUser(this.app.db, user);

                this.app.sessions.set(sessionID, session);
                if(this.app.userSessions.has(user.id)) {
                    this.app.userSessions.get(user.id).push(sessionID);
                } else {
                    this.app.userSessions.set(user.id, [ sessionID ]);
                }

                res.cookie("sessionID", session.id, {
                    sameSite: "None"
                });
                res.send(JSON.stringify(session));
            }
        })

        this.app.post('/logout', async(req, res) => {
            const data = req.body;
            res.clearCookie("sessionID");
            res.send(JSON.stringify({ status: 1 }))
        })
        
        this.app.post('/upload', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.uploadFile(req, res)
            console.log("> received file - " + req.query.fileName)
        })

        this.app.post('/updateAvatar', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.updateAvatar(req, res);
            console.log("> received avatar update - " + req.query.fileName);
        });

        this.app.post('/editUser', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.editUser(req, res, req.body);
            console.log("> received user update - " + req.body.email);
        });

        this.app.post('/sendFriendRequest', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.sendFriendRequest(req, res, req.body)
            console.log("> sent friend request - " + req.body.target.username + " (id: " + req.body.target.id + ")")
        });

        this.app.post('/acceptFriendRequest', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.processFriendRequest(req, res, req.body, true)
            console.log("> accepted friend request - " + req.body.id)
        });

        this.app.post('/declineFriendRequest', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.processFriendRequest(req, res, req.body, false)
            console.log("> declined friend request - " + req.body.id)
        });

        this.app.post('/removeFriend', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.removeFriend(req, res, req.body)
            console.log("> removed friend - " + req.body.target.id)
        });

        this.app.post('/message', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.sendMessage(req, res, req.body)
            console.log("> received message - " + req.body.text)
        });

        this.app.post('/editMessage', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.editMessage(req, res, req.body)
            console.log("> received message edit - " + req.body.text)
        });

        this.app.post('/deleteMessage', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.deleteMessage(req, res, req.body)
            console.log("> deleted message - " + req.body.id)
        });

        this.app.post('/createChannel', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            
            await this.createChannel(req, res, req.body)
            console.log("> created channel - " + req.body.name)
        });

        this.app.post('/editChannel', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            
            await this.editChannel(req, res, req.body)
            console.log("> edited channel - " + req.body.id)
        });

        this.app.post('/deleteChannel', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.deleteChannel(req, res, req.body)
            console.log("> deleted channel - " + req.body.id)
        });

        this.app.post('/removeFromDMChannel', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.removeFromDMChannel(req, res, req.body)
            console.log("> removed from dm channel - " + req.body.channel.id + "/" + req.body.user.id)
        });

        this.app.get('/fetchChannels', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            var channels = await this.app.db.db_fetch.fetchChannels(this.app.db);
            res.send(JSON.stringify(channels));
        });

        this.app.get('/fetchDMChannels', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var channels = [];
            user.dmChannelList.forEach(id => {
                channels.push(this.app.db.db_fetch.fetchChannel(this.app.db, id));
            })
            channels = await Promise.all(channels);
            channels = channels.filter(channel => { return channel !== undefined });
            res.send(JSON.stringify(channels));
        });

        this.app.get('/fetchChannelMessages', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            const data = req.query;

            var messages = await this.app.db.db_fetch.fetchMessages(this.app.db, data.id);
            res.send(JSON.stringify(messages));
        });

        this.app.get('/fetchUser', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, data.id, data.containSensitive && session.userID === data.id);

            if(user === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(user))
            }
        });

        this.app.get('/fetchFriendRequest', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            const data = req.query;

            var friendRequest = await this.app.db.db_fetch.fetchFriendRequest(this.app.db, data.id);
            res.send(JSON.stringify(friendRequest));
        });

        this.app.get('/fetchFriendRequests', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 0);
            var friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);
            res.send(JSON.stringify(friendRequests));
        });

        this.app.post('/joinVoiceChannel', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.joinVoiceChannel(req, res, req.body)
            console.log("> received voice connection - " + req.body.channel.id)
        });

        this.app.get('/reset', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            this.app.db.db_delete.deleteAllData(this.app.db);
        });
    }

    //Checks if incoming request is associated with a valid session
    isSessionValid(req, res) {
        if(req.cookies['sessionID'] === undefined || !this.app.sessions.has(req.cookies['sessionID']) || !this.app.sessionSockets.has(req.cookies['sessionID']) ) {
            console.log("> invalid session");
            res.sendStatus(401);
            return false;
        }

        return true;
    }

    async sendMessage(req, res, _message) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _message.channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        var message = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            createdAt: Date.now(),
            author: {
                id: user.id
            },
            channel: {
                id: channel.id
            },
            edited: false,
            text: _message.text
        }
        message.file = _message.file === undefined ? undefined : { name: _message.file.name, size: _message.file.size }
        
        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("message", JSON.stringify(message))
            }
        })

        await this.app.db.db_add.addMessage(this.app.db, message);
    }

    async deleteMessage(req, res, _message) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var message = await this.app.db.db_fetch.fetchMessage(this.app.db, _message.id);

        if(message === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(message.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("deleteMessage", JSON.stringify(message))
            }
        })

        await this.app.db.db_delete.deleteMessage(this.app.db, message.id);
    }

    async editMessage(req, res, _message) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var message = await this.app.db.db_fetch.fetchMessage(this.app.db, _message.id);

        if(message === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(message.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        //Make sure client doesn't overwrite something he's not allowed to
        message.text = _message.text;
        message.edited = true;

        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("editMessage", JSON.stringify(message))
            }
        })

        await this.app.db.db_edit.editMessage(this.app.db, message);
    }

    async createChannel(req, res, _channel) {
        if(_channel.name.length < 1) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            name: _channel.name,
            type: _channel.type,
            createdAt: Date.now(),
            author: {
                id: user.id
            }
        }

        switch(_channel.type) {
            case 0:
            case 1:
                this.app.sessionSockets.forEach(socket => {
                    if(socket.connected) {
                        socket.emit("createChannel", JSON.stringify(channel))
                    }
                })
                break;

            case 2:
                channel.members = _channel.members;
                channel.members.forEach(async(id) => {
                    var user2 = await this.app.db.db_fetch.fetchUser(this.app.db, id);
                    user2.dmChannelList.push(channel.id);
                    this.app.db.db_edit.editUser(this.app.db, user2);

                    this.emitToUser(user2.id, "createChannel", channel);
                });
                break;
        }
    
        await this.app.db.db_add.addChannel(this.app.db, channel);
    }

    async editChannel(req, res, _channel) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(channel.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else if(_channel.name !== undefined && _channel.name.length < 1) {
            res.send(JSON.stringify({ status: -3 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        //Make sure client doesn't overwrite something he's not allowed to
        channel.name = _channel.name !== undefined ? _channel.name : channel.name;

        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("updateChannel", JSON.stringify(channel))
            }
        })

        await this.app.db.db_edit.editChannel(this.app.db, channel);
    }

    async deleteChannel(req, res, _channel) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(channel.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("deleteChannel", JSON.stringify(channel))
            }
        })

        switch(_channel.type) {
            case 2:
                channel.members.forEach(async(id) => {
                    var user2 = await this.app.db.db_fetch.fetchUser(this.app.db, id);
                    user2.dmChannelList.splice(user2.dmChannelList.indexOf(channel.id), 1);
                    this.app.db.db_edit.editUser(this.app.db, user2);
                });
                break;
        }

        await this.app.db.db_delete.deleteChannel(this.app.db, channel.id);
    }

    async removeFromDMChannel(req, res, _data) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _data.channel.id);
        var targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, _data.user.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(targetUser === undefined) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else if(channel.author.id !== user.id) {
            res.send(JSON.stringify({ status: -3 }))
            return;
        } else if(channel.members.includes(targetUser.id) === false) {
            res.send(JSON.stringify({ status: -4 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        channel.members.splice(channel.members.indexOf(targetUser.id), 1);
        channel.members.forEach(id => {
            this.emitToUser(id, "updateChannel", JSON.stringify(channel))
        });

        targetUser.dmChannelList.splice(targetUser.dmChannelList.indexOf(channel.id), 1);
        this.emitToUser(targetUser.id, "deleteChannel", JSON.stringify(channel));

        await this.app.db.db_edit.editChannel(this.app.db, channel);
        await this.app.db.db_edit.editUser(this.app.db, targetUser);
    }

    async joinVoiceChannel(req, res, connection) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, connection.channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        }

        var voiceGroup = -1;
        if(this.app.voiceGroups.has(channel.id) === false) {
            voiceGroup = {
                id: channel.id,
                createdAt: Date.now(),
                author: {
                    id: user.id
                },
                users: [ user.id ]
            }

            this.app.voiceGroups.set(channel.id, voiceGroup);
        } else {
            voiceGroup = this.app.voiceGroups.get(channel.id)
            if(voiceGroup.users.includes(user.id) === false) {
                voiceGroup.users.push(user.id);
            }
        }

        res.send(JSON.stringify({ status: 1 }))
        voiceGroup.users.forEach(id => {
            this.emitToUser(id, "updateVoiceGroup", JSON.stringify(voiceGroup))
        });
    }

    async sendFriendRequest(req, res, _friendRequest) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

        var targetUser = -1;
        if(_friendRequest.target.id !== undefined) {
            targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, _friendRequest.target.id);
        } else {
            targetUser = await this.app.db.db_fetch.fetchUserByUsername(this.app.db, _friendRequest.target.username);
        }

        if(targetUser === undefined) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }

        var friendRequest = await this.app.db.db_fetch.fetchFriendRequestByTarget(this.app.db, targetUser.id);
        if(friendRequest !== undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(user.id === targetUser.id) {
            res.send(JSON.stringify({ status: -3 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        var friendRequest = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            author: {
                id: user.id
            },
            target: {
                id: targetUser.id
            },
            createdAt: Date.now()
        }
        
        await this.app.db.db_add.addFriendRequest(this.app.db, friendRequest);

        if(socket.connected) {
            var friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 0);
            var friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);

            socket.emit("updateFriendRequests", JSON.stringify(friendRequests))

            friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, targetUser.id, 0);
            friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, targetUser.id, 1);
            friendRequests = friendRequestsOut.concat(friendRequestsIn);

            this.emitToUser(targetUser.id, "updateUser", targetUser);
            this.emitToUser(targetUser.id, "updateFriendRequests", friendRequests);
        }
    }

    async processFriendRequest(req, res, _friendRequest, _accept) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var friendRequest = await this.app.db.db_fetch.fetchFriendRequest(this.app.db, _friendRequest.id);

        if(friendRequest === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(friendRequest.target.id !== user.id && friendRequest.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }  else {
            res.send(JSON.stringify({ status: 1 }))
        }

        await this.app.db.db_delete.deleteFriendRequest(this.app.db, friendRequest.id);
        var authorUser = await this.app.db.db_fetch.fetchUser(this.app.db, friendRequest.author.id);
        var targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, friendRequest.target.id);
        user = friendRequest.target.id === user.id ? targetUser : authorUser;

        if(_accept) {
            authorUser.friendList.push(targetUser.id);
            targetUser.friendList.push(authorUser.id);
        }

        await this.app.db.db_edit.editUser(this.app.db, authorUser);
        await this.app.db.db_edit.editUser(this.app.db, targetUser);

        if(socket.connected) {
            var friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 0);
            var friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);

            socket.emit("updateUser", JSON.stringify(user))
            socket.emit("updateFriendRequests", JSON.stringify(friendRequests))

            friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, targetUser.id, 0);
            friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, targetUser.id, 1);
            friendRequests = friendRequestsOut.concat(friendRequestsIn);

            this.emitToUser(targetUser.id, "updateUser", targetUser);
            this.emitToUser(targetUser.id, "updateFriendRequests", friendRequests);
        }
    }

    async removeFriend(req, res, _removalRequest) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

        if(user.friendList.includes(_removalRequest.target.id) === false) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        var targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, _removalRequest.target.id);
        user.friendList.splice(user.friendList.indexOf(targetUser.id), 1);
        targetUser.friendList.splice(targetUser.friendList.indexOf(user.id), 1);

        await this.app.db.db_edit.editUser(this.app.db, user);
        await this.app.db.db_edit.editUser(this.app.db, targetUser);

        if(socket.connected) {
            socket.emit("updateUser", JSON.stringify(user))
            this.emitToUser(targetUser.id, "updateUser", targetUser);
        }
    }

    async editUser(req, res, _user) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        res.send(JSON.stringify({ status: 1 }))

        user.email = _user.email;
        await this.app.db.db_edit.editUser(this.app.db, user);

        if(socket.connected) {
            socket.emit("updateUser", JSON.stringify(user))
        }
    }

    async updateUser(user, broadcast) {
        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("updateUser", JSON.stringify(user))
            }
        })

        await this.app.db.db_edit.editUser(this.app.db, user);
    }

    async updateAvatar(req, res) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var form = this.app.formidable({ multiples: true });
        form.uploadDir = this.app.filesStorage;
        form.keepExtensions = true;
    
        var fileName = req.query.fileName;
        var fileID = this.app.crypto.randomBytes(16).toString("hex");
        var fileID2 = fileID + (fileName.substring(fileName.lastIndexOf(".")))
        console.log("> received avatar - " + fileName)
    
        form.parse(req, async function(err, fields, files) {
            this.app.fs.rename(files.fileUploaded.path, this.app.filesStorage + fileID2, function(err) {
                if (err) { throw err; }
            });

            user.avatar = fileID2
            await this.updateUser(user, true)
            res.send(JSON.stringify({ status: 1 }))
        }.bind(this));
    }

    async uploadFile(req, res) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var form = this.app.formidable({ multiples: true, maxFileSize: 1024 * 1024 * 100 });
        form.uploadDir = this.app.filesStorage;
        form.keepExtensions = true;
    
        var fileName = req.query.fileName;
        var fileSize = -1;
        var sentStartPacket = false;

        var fileID = this.app.crypto.randomBytes(16).toString("hex");
        var fileID2 = fileID + (fileName.substring(fileName.lastIndexOf(".")))
        console.log("> received file - " + fileName)
    
        form.on('progress', function(bytesReceived, bytesExpected) {
            if(!sentStartPacket) {
                sentStartPacket = true;
                fileSize = bytesExpected;
                socket.emit("uploadStart", fileID, fileName);

                //File size check
                if (fileSize >= (1024 * 1024 * 100)) {
                    form.emit('error', new Error(`File is too big-`));
                    socket.emit("uploadFail", fileID, fileName, fileSize);
                    return;
                }
            }

            //File size check
            if (fileSize >= (1024 * 1024 * 100)) {
                return false;
            } else {
                socket.emit("uploadProgress", fileID, fileName, bytesReceived, bytesExpected);
            }
        }.bind(this));
    
        form.parse(req, async function(err, fields, files) {
            if(files.fileUploaded === undefined) { return; }
            this.app.fs.rename(files.fileUploaded.path, this.app.filesStorage + fileID2, function(err) {
                if (err) { throw err; }
            });

            socket.emit("uploadFinish", fileID, fileName);
            
            var message = {
                text: fields.text,
                channel: {
                    id: fields["channel.id"]
                },
                file: {
                    name: fileID2,
                    size: fileSize
                }
            }
            
            await this.sendMessage(req, res, message)
        }.bind(this));
    }

    async emitToUser(id, type, data) {
        if(this.app.userSessions.has(id)) {
            this.app.userSessions.get(id).forEach(sessionID => {
                if(sessionSockets.has(sessionID)) {
                    sessionSockets.get(sessionID).emit(type, JSON.stringify(data));
                }
            })
        }
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