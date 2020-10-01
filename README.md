# liquidchat
⭐ Open-source chat application similar to Discord-  

🚩 **Planned features:**  
> Group Chats
> Personal Emotes  
> Profile Status

🏁 **Features:**  
> Global Message Channels  
> File Support  
> Friend Features (Adding/Removing friends)  
> DM Channels

✔️ Releases: https://github.com/LamkasDev/liquidchat/releases  
🔥 API: https://github.com/LamkasDev/liquidchat.js  
💛 Official website: (soon)™️  
🔴 Found a bug or want to contribute?: [Open a pull request!](https://github.com/LamkasDev/liquidchat/pulls)

### Build instructions:
##### a) How to build client (Windows)
> run `npm run buildproduction`  
> the installer will be built into `client/dist`

##### b) How to test client (Windows)
> run `yarn start`  

##### c) How to host server yourself
> run `node server.js`
> run `http-server -p 8081` in a separate directory outside `/server`

##### e) Additional setup
> change `APIEndpoint` in `App.js` to your server's adress:8080  
> change `fileEnpoint` in `App.js` to your server's adress:8081  
> change `filesStorage` in `server.js` to directory where you run your file server
