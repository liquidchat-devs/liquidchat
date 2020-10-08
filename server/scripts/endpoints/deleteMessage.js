class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/deleteMessage', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.deleteMessage(req, res, req.body)
            console.log("> deleted message - " + req.body.id)
        }).bind(this));
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
        
        switch(_channel.type) {
            case 0:
            case 1:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, channel.server.id);
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "deleteMessage", message)
                });
                break;

            case 2:
                var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, message.channel.id);
                channel.members.forEach(async(id) => {
                    this.app.epFunc.emitToUser(id, "deleteMessage", message);
                });
                break;
        }

        await this.app.db.db_delete.deleteMessage(this.app.db, message.id);
    }
}

module.exports = Endpoint;