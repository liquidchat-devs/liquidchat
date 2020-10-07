module.exports = {
    handle(app) {
        app.post('/joinVoiceChannel', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }

            await this.joinVoiceChannel(app, req, res, req.body)
            console.log("> received voice connection - " + req.body.channel.id)
        });
    },

    async joinVoiceChannel(app, req, res, connection) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var channel = await app.db.db_fetch.fetchChannel(app.db, connection.channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        }

        var voiceGroup = -1;
        if(app.voiceGroups.has(channel.id) === false) {
            voiceGroup = {
                id: channel.id,
                createdAt: Date.now(),
                author: {
                    id: user.id
                },
                users: [ user.id ]
            }

            app.voiceGroups.set(channel.id, voiceGroup);
        } else {
            voiceGroup = app.voiceGroups.get(channel.id)
            if(voiceGroup.users.includes(user.id) === false) {
                voiceGroup.users.push(user.id);
            }
        }

        res.send(JSON.stringify({ status: 1 }))
        voiceGroup.users.forEach(id => {
            app.epFunc.emitToUser(app, id, "updateVoiceGroup", voiceGroup)
        });
    }
}