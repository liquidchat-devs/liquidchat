class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/deleteChannel', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.deleteChannel(req, res, req.body)
            console.log("> deleted channel - " + req.body.id)
        }).bind(this));
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
            res.sendStatus(200);
        }

        switch(_channel.type) {
            case 0:
            case 1:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, _channel.server.id);
                if(server === undefined) {
                    res.send(JSON.stringify({ status: -2 }))
                    return;
                } else if(server.channels.includes(_channel.id) === false) {
                    res.send(JSON.stringify({ status: -3 }))
                    return;
                }

                server.channels.splice(server.channels.indexOf(_channel.id), 1)
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "deleteChannel", channel)
                });

                await this.app.db.db_edit.editServer(this.app.db, server);
                break;

            case 2:
                channel.members = _channel.members;
                channel.members.forEach(async(id) => {
                    var user2 = await this.app.db.db_fetch.fetchUser(this.app.db, id);
                    user2.dmChannels.splice(user2.dmChannels.indexOf(channel.id), 1);
                    this.app.db.db_edit.editUser(this.app.db, user2);

                    this.app.epFunc.emitToUser(user2.id, "deleteChannel", channel);
                    this.app.epFunc.emitToUser(user2.id, "updateUser", user2);
                });
                break;
        }

        await this.app.db.db_delete.deleteChannel(this.app.db, channel.id);
    }
}

module.exports = Endpoint;