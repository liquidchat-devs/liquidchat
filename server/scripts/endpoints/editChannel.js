class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/editChannel', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            
            await this.editChannel(req, res, req.body)
            console.log("> edited channel - " + req.body.id)
        }).bind(this));
    }

    async editChannel(req, res, _channel) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(channel.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else if(_channel.name !== undefined && _channel.name.length < 1) {
            res.send(JSON.stringify({ status: -3 }))
            return;
        }

        //Make sure client doesn't overwrite something he's not allowed to
        channel.name = _channel.name !== undefined ? _channel.name : channel.name;

        switch(channel.type) {
            case 0:
            case 1:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, _channel.server.id);
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "updateChannel", channel)
                });
                break;

            case 2:
                channel.members.forEach(async(id) => {
                    this.app.epFunc.emitToUser(id, "updateChannel", channel)
                });
                break;
        }

        await this.app.db.db_edit.editChannel(this.app.db, channel);
        res.send(JSON.stringify(channel))
    }
}

module.exports = Endpoint;