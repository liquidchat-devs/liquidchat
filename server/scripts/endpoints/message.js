module.exports = {
    handle(app) {
        app.post('/message', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.sendMessage(app, req, res, req.body)
            console.log("> received message - " + req.body.text)
        });
    },

    async sendMessage(app, req, res, _message) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var channel = await app.db.db_fetch.fetchChannel(app.db, _message.channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        var message = {
            id: app.crypto.randomBytes(16).toString("hex"),
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
        
        app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("message", JSON.stringify(message))
            }
        })

        await app.db.db_add.addMessage(app.db, message);
    }
}