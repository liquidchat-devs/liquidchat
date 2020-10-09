class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/createInvite', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            
            await this.createInvite(req, res, req.body)
            console.log("> created invite - " + req.body.server.id)
        }).bind(this));
    }

    async createInvite(req, res, _invite) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var server = await this.app.db.db_fetch.fetchServer(this.app.db, _channel.server.id);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if (server.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }

        var invite = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            createdAt: Date.now(),
            server: {
                id: _invite.server.id
            },
            author: {
                id: user.id
            }
        }

        server.invites.push(invite);
        channel.members.forEach(async(id) => {
            this.app.epFunc.emitToUser(id, "updateServer", server);
        });
    
        await this.app.db.db_add.addInvite(this.app.db, invite);
        res.send(JSON.stringify(invite))
    }
}

module.exports = Endpoint;