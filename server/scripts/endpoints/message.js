class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/message', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.sendMessage(req, res, req.body)
            console.log("> received message - " + req.body.text)
        });
    }

    async sendMessage(req, res, _message) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _message.channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        var message = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
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
        
        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("message", JSON.stringify(message))
            }
        })

        await this.app.db.db_add.addMessage(this.app.db, message);
    }
}

module.exports = Endpoint;