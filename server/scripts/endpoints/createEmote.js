class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/createEmote', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.createEmote(req, res, req.query.name + "/" + req.query.serverID + "/" + req.query.type);
            console.log("> created emote - " + req.query.name);
        }).bind(this));
    }

    async createEmote(req, res, emoteName, serverID, type) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var form = this.app.formidable({ multiples: true });

        var emote = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            createdAt: Date.now(),
            author: {
                id: user.id
            },
            name: emoteName,
            type: type
        }

        switch(type) {
            case 0:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, id);

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
                console.log("> received emote - " + fileName)
            
                form.parse(req, async function(err, fields, files) {
                    this.app.fs.rename(files.fileUploaded.path, this.app.filesStorage + fileID2, function(err) {
                        if (err) { throw err; }
                    });
                    
                    emote.file = fileID2;
                    emote.server = { id: serverID }
                    server.emotes.push(emote)
                    await this.app.epFunc.updateServer(server, true)
                    res.sendStatus(200);
                }.bind(this));
                break;

            case 1:
                form.uploadDir = this.app.filesStorage;
                form.keepExtensions = true;
        
                var fileName = req.query.fileName;
                var fileID = this.app.crypto.randomBytes(16).toString("hex");
                var fileID2 = fileID + (fileName.substring(fileName.lastIndexOf(".")))
                console.log("> received emote - " + fileName)
            
                form.parse(req, async function(err, fields, files) {
                    this.app.fs.rename(files.fileUploaded.path, this.app.filesStorage + fileID2, function(err) {
                        if (err) { throw err; }
                    });

                    emote.file = fileID2;
                    user.emotes.push(emote)
                    await this.app.epFunc.updateUser(user, true)
                    res.sendStatus(200);
                }.bind(this));
                break;
        }
    }
}

module.exports = Endpoint;