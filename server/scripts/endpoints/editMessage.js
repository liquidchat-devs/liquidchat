class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/editMessage', (async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.editMessage(req, res, req.body)
            console.log("> received message edit - " + req.body.text)
        }).bind(this));
    }

    async editMessage(req, res, _message) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var message = await this.app.db.db_fetch.fetchMessage(this.app.db, _message.id);

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

        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("editMessage", JSON.stringify(message))
            }
        })

        await this.app.db.db_edit.editMessage(this.app.db, message);
    }
}

module.exports = Endpoint;