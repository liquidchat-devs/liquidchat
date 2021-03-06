class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/removeFromDMChannel', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.removeFromDMChannel(req, res, req.body)
            console.log("> removed from dm channel - " + req.body.channel.id + "/" + req.body.user.id)
        }).bind(this));
    }

    async removeFromDMChannel(req, res, _data) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _data.channel.id);
        var targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, _data.user.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(targetUser === undefined) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else if(channel.author.id !== user.id) {
            res.send(JSON.stringify({ status: -3 }))
            return;
        } else if(channel.members.includes(targetUser.id) === false) {
            res.send(JSON.stringify({ status: -4 }))
            return;
        } else {
            res.sendStatus(200);
        }

        channel.members.splice(channel.members.indexOf(targetUser.id), 1);
        channel.members.forEach(id => {
            this.app.epFunc.emitToUser(id, "updateChannel", channel)
        });

        targetUser.dmChannels.splice(targetUser.dmChannels.indexOf(channel.id), 1);
        this.app.epFunc.emitToUser(targetUser.id, "deleteChannel", channel);

        await this.app.db.db_edit.editChannel(this.app.db, channel);
        await this.app.db.db_edit.editUser(this.app.db, targetUser);
        this.app.epFunc.sendSystemMessage({ channel: { id: channel.id }, text: "<@" + targetUser.id + "> was removed by <@" + user.id + ">", type: 2 })
    }
}

module.exports = Endpoint;