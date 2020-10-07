module.exports = {
    handle(app) {
        app.post('/createServer', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }
            
            await this.createServer(app, req, res, req.body)
            console.log("> created server - " + req.body.name)
        });
    },

    async createServer(app, req, res, _server) {
        if(_server.name.length < 1) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }
        var socket = app.sessionSockets.get(req.cookies['sessionID']);
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var server = {
            id: app.crypto.randomBytes(16).toString("hex"),
            name: _server.name,
            avatar: "defaultAvatar.png",
            createdAt: Date.now(),
            author: {
                id: user.id
            },
            channelList: []
        }

        socket.emit("createServer", JSON.stringify(server))
        await app.db.db_add.addServer(app.db, server);

        user.serverList.push(server.id);
        app.epFunc.emitToUser(app, user.id, "updateUser", user);
        await app.db.db_edit.editUser(app.db, user);
    }
}