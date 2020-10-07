module.exports = {
    handle(app) {
        app.post('/editChannel', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }
            
            await this.editChannel(app, req, res, req.body)
            console.log("> edited channel - " + req.body.id)
        });
    },

    async editChannel(app, req, res, _channel) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var channel = await app.db.db_fetch.fetchChannel(app.db, _channel.id);

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

        app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("updateChannel", JSON.stringify(channel))
            }
        })

        await app.db.db_edit.editChannel(app.db, channel);
    }
}