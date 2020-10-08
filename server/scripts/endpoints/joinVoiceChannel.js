class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/joinVoiceChannel', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.joinVoiceChannel(req, res, req.body)
            console.log("> received voice connection - " + req.body.channel.id)
        }).bind(this));
    }

    async joinVoiceChannel(req, res, connection) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, connection.channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        }

        var voiceGroup = -1;
        if(this.app.voiceGroups.has(channel.id) === false) {
            voiceGroup = {
                id: channel.id,
                createdAt: Date.now(),
                author: {
                    id: user.id
                },
                users: [ user.id ]
            }

            this.app.voiceGroups.set(channel.id, voiceGroup);
        } else {
            voiceGroup = this.app.voiceGroups.get(channel.id)
            if(voiceGroup.users.includes(user.id) === false) {
                voiceGroup.users.push(user.id);
            }
        }

        res.sendStatus(200);
        voiceGroup.users.forEach(id => {
            this.app.epFunc.emitToUser(id, "updateVoiceGroup", voiceGroup)
        });
    }
}

module.exports = Endpoint;