module.exports = {
    handle(app) {
        app.post('/removeFromDMChannel', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.removeFromDMChannel(app, req, res, req.body)
            console.log("> removed from dm channel - " + req.body.channel.id + "/" + req.body.user.id)
        });
    },

    async removeFromDMChannel(app, req, res, _data) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var channel = await app.db.db_fetch.fetchChannel(app.db, _data.channel.id);
        var targetUser = await app.db.db_fetch.fetchUser(app.db, _data.user.id);

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
            app.epFunc.emitToUser(app, id, "updateChannel", channel)
        });

        targetUser.dmChannelList.splice(targetUser.dmChannelList.indexOf(channel.id), 1);
        app.epFunc.emitToUser(app, targetUser.id, "deleteChannel", channel);

        await app.db.db_edit.editChannel(app.db, channel);
        await app.db.db_edit.editUser(app.db, targetUser);
    }
}