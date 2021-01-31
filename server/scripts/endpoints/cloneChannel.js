class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/cloneChannel', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            
            await this.cloneChannel(req, res, req.body)
            console.log("> cloned channel - " + req.body.id)
        }).bind(this));
    }

    async cloneChannel(req, res, _channel) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _channel.id);
        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(channel.type === 2) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }

        channel.id = this.app.crypto.randomBytes(16).toString("hex");
        channel.createdAt = Date.now();
        channel.author = { id: user.id };

        switch(channel.type) {
            case 0:
            case 1:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, channel.server.id);
                if(server === undefined) {
                    res.send(JSON.stringify({ status: -3 }))
                    return;
                } else if(server.author.id !== user.id) {
                    res.send(JSON.stringify({ status: -4 }))
                    return;
                }
                
                channel.position = server.channels.length;
                server.channels.push(channel.id)
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "createChannel", channel);
                    this.app.epFunc.emitToUser(id, "updateServer", server);
                });

                await this.app.db.db_edit.editServer(this.app.db, server);
                break;
        }
    
        await this.app.db.db_add.addChannel(this.app.db, channel);
        res.send(JSON.stringify(channel))
    }
}

module.exports = Endpoint;