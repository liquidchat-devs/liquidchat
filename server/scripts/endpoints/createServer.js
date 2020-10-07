class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/createServer', (async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }
            
            await this.createServer(req, res, req.body)
            console.log("> created server - " + req.body.name)
        }).bind(this));
    }

    async createServer(req, res, _server) {
        if(_server.name.length < 1) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var server = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            name: _server.name,
            avatar: "defaultAvatar.png",
            createdAt: Date.now(),
            author: {
                id: user.id
            },
            channelList: []
        }

        socket.emit("createServer", JSON.stringify(server))
        await this.app.db.db_add.addServer(this.app.db, server);

        user.serverList.push(server.id);
        this.app.epFunc.emitToUser(this.app, user.id, "updateUser", user);
        await this.app.db.db_edit.editUser(this.app.db, user);
    }
}

module.exports = Endpoint;