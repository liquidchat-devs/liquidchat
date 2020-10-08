class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/updateServerAvatar', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.updateServerAvatar(req, res, req.query.serverID);
            console.log("> received server avatar update - " + req.query.serverID);
        }).bind(this));
    }

    async updateServerAvatar(req, res, serverID) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var form = this.app.formidable({ multiples: true });
        var server = await this.app.db.db_fetch.fetchServer(this.app.db, serverID);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if (server.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }

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

            server.avatar = fileID2
            await this.app.epFunc.updateServer(server, true)
            res.sendStatus(200);
        }.bind(this));
    }
}

module.exports = Endpoint;