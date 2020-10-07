class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/createChannel', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }
            
            await this.createChannel(req, res, req.body)
            console.log("> created channel - " + req.body.name)
        });
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
                channel.server = { id: _channel.server.id };
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

                    this.app.epFunc.emitToUser(this.app, user2.id, "createChannel", channel);
                });
                break;
        }
    
        await this.app.db.db_add.addChannel(this.app.db, channel);
    }
}