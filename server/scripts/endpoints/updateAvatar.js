class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/updateAvatar', (async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.updateAvatar(req, res);
            console.log("> received avatar update - " + req.query.fileName);
        }).bind(this));
    }

    async updateAvatar(req, res) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var form = this.app.formidable({ multiples: true });
        form.uploadDir = this.app.filesStorage;
        form.keepExtensions = true;
    
        var fileName = req.query.fileName;
        var fileID = this.app.crypto.randomBytes(16).toString("hex");
        var fileID2 = fileID + (fileName.substring(fileName.lastIndexOf(".")))
        console.log("> received avatar - " + fileName)
    
        form.parse(req, async function(err, fields, files) {
            this.app.fs.rename(files.fileUploaded.path, this.app.filesStorage + fileID2, function(err) {
                if (err) { throw err; }
            });

            user.avatar = fileID2
            await this.app.epFunc.updateUser(this.app, user, true)
            res.send(JSON.stringify({ status: 1 }))
        }.bind(this));
    }
}

module.exports = Endpoint;