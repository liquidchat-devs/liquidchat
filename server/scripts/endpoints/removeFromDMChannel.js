class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/removeFromDMChannel', (async(req, res) => {
            if(!this.app.isSessionValid(app, req, res)) { return; }

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
            res.send(JSON.stringify({ status: 1 }))
        }

        channel.members.splice(channel.members.indexOf(targetUser.id), 1);
        channel.members.forEach(id => {
            this.app.epFunc.emitToUser(this.app, id, "updateChannel", channel)
        });

        targetUser.dmChannelList.splice(targetUser.dmChannelList.indexOf(channel.id), 1);
        this.app.epFunc.emitToUser(this.app, targetUser.id, "deleteChannel", channel);

        await this.app.db.db_edit.editChannel(this.app.db, channel);
        await this.app.db.db_edit.editUser(this.app.db, targetUser);
    }
}

module.exports = Endpoint;