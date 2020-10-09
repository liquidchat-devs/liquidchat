class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/createServer', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            
            await this.createServer(req, res, req.body)
            console.log("> created server - " + req.body.name)
        }).bind(this));
    }

    async createServer(req, res, _server) {
        if(_server.name.length < 1) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        }
        
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var server = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            name: _server.name,
            avatar: "defaultAvatar.png",
            createdAt: Date.now(),
            author: {
                id: user.id
            },
            channels: [],
            members: [ user.id ],
            invites: []
        }

        server.members.forEach(async(id) => {
            var user2 = await this.app.db.db_fetch.fetchUser(this.app.db, id);
            user2.servers.push(server.id);
            this.app.db.db_edit.editUser(this.app.db, user2);

            this.app.epFunc.emitToUser(user2.id, "createServer", server);
            this.app.epFunc.emitToUser(user2.id, "updateUser", user2);
        });

        await this.app.db.db_add.addServer(this.app.db, server);
        res.send(JSON.stringify(server))
    }
}

module.exports = Endpoint;