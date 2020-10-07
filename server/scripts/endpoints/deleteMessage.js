module.exports = {
    handle(app) {
        app.post('/deleteMessage', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.deleteMessage(app, req, res, req.body)
            console.log("> deleted message - " + req.body.id)
        });
    },

    async deleteMessage(app, req, res, _message) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var message = await app.db.db_fetch.fetchMessage(app.db, _message.id);

        if(message === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(message.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("deleteMessage", JSON.stringify(message))
            }
        })

        await app.db.db_delete.deleteMessage(app.db, message.id);
    }
}