module.exports = {
    handle(app) {
        app.post('/updateAvatar', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.updateAvatar(app, req, res);
            console.log("> received avatar update - " + req.query.fileName);
        });
    },

    async updateAvatar(app, req, res) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var form = app.formidable({ multiples: true });
        form.uploadDir = app.filesStorage;
        form.keepExtensions = true;
    
        var fileName = req.query.fileName;
        var fileID = app.crypto.randomBytes(16).toString("hex");
        var fileID2 = fileID + (fileName.substring(fileName.lastIndexOf(".")))
        console.log("> received avatar - " + fileName)
    
        form.parse(req, async function(err, fields, files) {
            app.fs.rename(files.fileUploaded.path, app.filesStorage + fileID2, function(err) {
                if (err) { throw err; }
            });

            user.avatar = fileID2
            await app.epFunc.updateUser(app, user, true)
            res.send(JSON.stringify({ status: 1 }))
        }.bind(this));
    }
}