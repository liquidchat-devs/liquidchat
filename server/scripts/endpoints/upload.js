class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/upload', (async(req, res) => {
            if(!this.app.isSessionValid(app, req, res)) { return; }

            await this.uploadFile(req, res)
            console.log("> received file - " + req.query.fileName)
        }).bind(this))
    }

    async uploadFile(req, res) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var form = this.app.formidable({ multiples: true, maxFileSize: 1024 * 1024 * 100 });
        form.uploadDir = this.app.filesStorage;
        form.keepExtensions = true;
    
        var fileName = req.query.fileName;
        var fileSize = -1;
        var sentStartPacket = false;

        var fileID = this.app.crypto.randomBytes(16).toString("hex");
        var fileID2 = fileID + (fileName.substring(fileName.lastIndexOf(".")))
        console.log("> received file - " + fileName)
    
        form.on('progress', function(bytesReceived, bytesExpected) {
            if(!sentStartPacket) {
                sentStartPacket = true;
                fileSize = bytesExpected;
                socket.emit("uploadStart", fileID, fileName);

                //File size check
                if (fileSize >= (1024 * 1024 * 100)) {
                    form.emit('error', new Error(`File is too big-`));
                    socket.emit("uploadFail", fileID, fileName, fileSize);
                    return;
                }
            }

            //File size check
            if (fileSize >= (1024 * 1024 * 100)) {
                return false;
            } else {
                socket.emit("uploadProgress", fileID, fileName, bytesReceived, bytesExpected);
            }
        }.bind(this));
    
        form.parse(req, async function(err, fields, files) {
            if(files.fileUploaded === undefined) { return; }
            this.app.fs.rename(files.fileUploaded.path, this.app.filesStorage + fileID2, function(err) {
                if (err) { throw err; }
            });

            socket.emit("uploadFinish", fileID, fileName);
            
            var message = {
                text: fields.text,
                channel: {
                    id: fields["channel.id"]
                },
                file: {
                    name: fileID2,
                    size: fileSize
                }
            }
            
            await this.sendMessage(req, res, message)
        }.bind(this));
    }
}

module.exports = Endpoint;