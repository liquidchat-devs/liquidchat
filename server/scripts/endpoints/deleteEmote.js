class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/deleteEmote', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.deleteEmote(req, res, req.body)
            console.log("> deleted emote - " + req.body.id)
        }).bind(this));
    }

    async deleteEmote(req, res, _emote) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var emote = await this.app.db.db_fetch.fetchEmote(this.app.db, _emote.id);

        if(emote === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(emote.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }

        switch(emote.type) {
            case 0:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, emote.server.id);
                if(server.emotes.includes(emote.id) === false) {
                    res.send(JSON.stringify({ status: -3 }))
                    return;
                }

                server.emotes.splice(server.emotes.indexOf(emote.id), 1)
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "deleteEmote", emote)
                });

                await this.app.db.db_edit.editServer(this.app.db, server);
                break;

            case 1:
                var user2 = await this.app.db.db_fetch.fetchUser(this.app.db, emote.author.id);
                user2.emotes.splice(user2.emotes.indexOf(emote.id), 1);
                this.app.db.db_edit.editUser(this.app.db, user2);

                this.app.epFunc.emitToUser(user2.id, "deleteEmote", emote);
                this.app.epFunc.emitToUser(user2.id, "updateUser", user2);
                break;
        }

        res.sendStatus(200);
        await this.app.db.db_delete.deleteEmote(this.app.db, emote.id);
    }
}

module.exports = Endpoint;