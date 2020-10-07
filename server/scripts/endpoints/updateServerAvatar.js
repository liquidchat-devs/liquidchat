module.exports = {
    handle(app) {
        app.post('/updateServerAvatar', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.updateServerAvatar(app, req, res);
            console.log("> received server avatar update - " + req.query.serverID);
        });
    },

    async updateServerAvatar(app, req, res, serverID) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var form = app.formidable({ multiples: true });
        var server = await app.db.db_fetch.fetchUser(app.db, serverID);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if (server.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }

        form.uploadDir = app.filesStorage;
        form.keepExtensions = true;

        var fileID = app.crypto.randomBytes(16).toString("hex");
        var fileID2 = fileID + ".png"
        console.log("> received avatar - " + fileName)
    
        form.parse(req, async function(err, fields, files) {
            app.fs.rename(files.fileUploaded.path, app.filesStorage + fileID2, function(err) {
                if (err) { throw err; }
            });

            server.avatar = fileID2
            await app.epFunc.updateServer(app, server, true)
            res.send(JSON.stringify({ status: 1 }))
        }.bind(this));
    }
}