module.exports = {
    handle(app) {
        app.post('/createChannel', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }
            
            await this.createChannel(app, req, res, req.body)
            console.log("> created channel - " + req.body.name)
        });
    },

    async createChannel(app, req, res, _channel) {
        if(_channel.name.length < 1) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }
        var socket = app.sessionSockets.get(req.cookies['sessionID']);
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var channel = {
            id: app.crypto.randomBytes(16).toString("hex"),
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
                channel.server = { id: _channel.server.id };
                app.sessionSockets.forEach(socket => {
                    if(socket.connected) {
                        socket.emit("createChannel", JSON.stringify(channel))
                    }
                })
                break;

            case 2:
                channel.members = _channel.members;
                channel.members.forEach(async(id) => {
                    var user2 = await app.db.db_fetch.fetchUser(app.db, id);
                    user2.dmChannelList.push(channel.id);
                    app.db.db_edit.editUser(app.db, user2);

                    app.epFunc.emitToUser(app, user2.id, "createChannel", channel);
                });
                break;
        }
    
        await app.db.db_add.addChannel(app.db, channel);
    }
}