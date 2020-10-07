module.exports = {
    handle(app) {
        app.post('/logout', async(req, res) => {
            res.clearCookie("sessionID");
            res.send(JSON.stringify({ status: 1 }))
        })
    }
}