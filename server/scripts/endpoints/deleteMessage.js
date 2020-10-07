class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/deleteMessage', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.deleteMessage(req, res, req.body)
            console.log("> deleted message - " + req.body.id)
        });
    }

    async deleteMessage(req, res, _message) {
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

        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("deleteMessage", JSON.stringify(message))
            }
        })

        await this.app.db.db_delete.deleteMessage(this.app.db, message.id);
    }
}

module.exports = Endpoint;