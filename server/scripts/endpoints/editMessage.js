module.exports = {
    handle(app) {
        app.post('/editMessage', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.editMessage(app, req, res, req.body)
            console.log("> received message edit - " + req.body.text)
        });
    },

    async editMessage(app, req, res, _message) {
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

        //Make sure client doesn't overwrite something he's not allowed to
        message.text = _message.text;
        message.edited = true;

        app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("editMessage", JSON.stringify(message))
            }
        })

        await app.db.db_edit.editMessage(app.db, message);
    }
}