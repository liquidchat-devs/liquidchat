class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/deleteChannel', (async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

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
}

module.exports = Endpoint;