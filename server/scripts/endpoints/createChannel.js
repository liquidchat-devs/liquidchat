class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/createChannel', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            
            await this.createChannel(req, res, req.body)
            console.log("> created channel - " + req.body.name)
        }).bind(this));
    }

    async createChannel(req, res, _channel) {
        if(_channel.name.length < 1) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        }

        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            name: _channel.name,
            description: _channel.description,
            nsfw: _channel.nsfw === undefined ? false : _channel.nsfw,
            type: _channel.type,
            createdAt: Date.now(),
            author: {
                id: user.id
            }
        }

        switch(_channel.type) {
            case 0:
            case 1:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, _channel.server.id);
                if(server === undefined) {
                    res.send(JSON.stringify({ status: -2 }))
                    return;
                } else if(server.author.id !== user.id) {
                    res.send(JSON.stringify({ status: -4 }))
                    return;
                }

                channel.server = { id: _channel.server.id };
                channel.position = server.channels.length;
                server.channels.push(channel.id)
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "createChannel", channel);
                    this.app.epFunc.emitToUser(id, "updateServer", server);
                });

                await this.app.db.db_edit.editServer(this.app.db, server);
                break;

            case 2:
                channel.members = _channel.members;
                channel.members.forEach(async(id) => {
                    var user2 = await this.app.db.db_fetch.fetchUser(this.app.db, id);
                    user2.dmChannels.push(channel.id);
                    this.app.db.db_edit.editUser(this.app.db, user2);

                    this.app.epFunc.emitToUser(user2.id, "createChannel", channel);
                    this.app.epFunc.emitToUser(user2.id, "updateUser", user2);
                });
                break;
        }
    
        await this.app.db.db_add.addChannel(this.app.db, channel);
        res.send(JSON.stringify(channel))
    }
}

module.exports = Endpoint;