module.exports = {
    handle(app) {
        app.post('/deleteChannel', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.deleteChannel(app, req, res, req.body)
            console.log("> deleted channel - " + req.body.id)
        });
    },

    async deleteChannel(app, req, res, _channel) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var channel = await app.db.db_fetch.fetchChannel(app.db, _channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(channel.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("deleteChannel", JSON.stringify(channel))
            }
        })

        switch(_channel.type) {
            case 2:
                channel.members.forEach(async(id) => {
                    var user2 = await app.db.db_fetch.fetchUser(app.db, id);
                    user2.dmChannelList.splice(user2.dmChannelList.indexOf(channel.id), 1);
                    app.db.db_edit.editUser(app.db, user2);
                });
                break;
        }

        await app.db.db_delete.deleteChannel(app.db, channel.id);
    }
}