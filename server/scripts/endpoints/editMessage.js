class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/editMessage', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

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

        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, message.channel.id);
        switch(channel.type) {
            case 0:
            case 1:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, _channel.server.id);
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "editMessage", message)
                });
                break;

            case 2:
                channel.members.forEach(async(id) => {
                    this.app.epFunc.emitToUser(id, "editMessage", message)
                });
                break;
        }

        await this.app.db.db_edit.editMessage(this.app.db, message);
    }
}

module.exports = Endpoint;