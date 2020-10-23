<p align="center">
  <img src="https://github.com/jasscod/liquidchat/blob/master/liquidchat_githublogo.png?raw=true">
</p>

<p align="center">
Open-source chat application similar to Discord-
</p>

<p align="center" style="display :flex;">
<img src="https://travis-ci.org/LamkasDev/liquidchat.svg?branch=master"/>
<img src="https://david-dm.org/LamkasDev/liquidchat.svg"/>
<img src="http://hits.dwyl.com/LamkasDev/liquidchat.svg"/>
</p>

<p align="center">
💛 Official website: <a href="https://nekonetwork.net">https://nekonetwork.net</a>
<br/>
✔️ Releases: <a href="https://github.com/LamkasDev/liquidchat/releases  ">https://github.com/LamkasDev/liquidchat/releases</a>  
</p>

<p align="center">
📓 Documentation: <a href="https://nekonetwork.net/docs">https://nekonetwork.net/docs</a>
<br/>
🔥 API: <a href="https://github.com/LamkasDev/liquidchat.js">https://github.com/LamkasDev/liquidchat.js</a>  
<br/>
🔴 Found a bug or want to contribute?:
<a href="https://github.com/LamkasDev/liquidchat/pulls">[Open a pull request]</a>
</p>


🏁 **Features:**
- [x] Servers with Text Channels
- [x] DM Channels 
- [x] Group Chats
- [x] File Support (up to 100MB by default)
- [x] Personal Emotes (max. 500) 
- [x] Server Emotes (max. 400)
- [x] Idle/DND/Invisible Status 
- [x] Friend Features (Adding/Removing friends)  
- [ ] Better Server Management (Built-in bans, mutes, assigning server moderators) 
- [ ] Server Discovery
- [ ] Voice Channels
- [ ] Custom Statuses 
- [ ]  a lot more...


### Build instructions:
##### a) How to build client (Windows)
<pre>
run <b>npm run createproduction-win</b>
the installer will be built into /client/dist
</pre>

##### c) How to test client (Windows)
<pre>
run <b>yarn start</b>
</pre>

##### d) How to host server yourself
<pre>
1) Setup your folder structure to look like the following:

<a href="https://pastebin.com/1pNnc6EA">lc-full.sh</a>
/lc
   <a href="https://github.com/LamkasDev/liquidchat/archive/master.zip">/liquidchat<a/>
      /client
      /server
   /liquidchat-fileserver
      /public
      /keys
      <a href="https://pastebin.com/VWsgQmCP">simpleserver.js</a>
   /liquidchat-web
      /public
      /keys
      <a href="https://pastebin.com/zXxF1PGx">server.js</a>
  
 2) Get a certificate and key for your server's domain, if you don't have one already
 3) Put key.pem and cert.pem into each /keys directories
 4) Run <b>sudo lc-full.sh /home/YOUR_USERNAME/lc/</b>
</pre>

##### d) How to deploy web versions
<pre>
1) On your local machine, in the /client directory run <b>npm run build</b>
2) Zip all the files in the /client/build folder (not the folder) into a file named build.zip
3) Place this file into /lc folder on your server
4) Restart your server (that'll unpack the assets from build.zip and place them into /liquidchat-web/public)
</pre>

##### f) Additional setup
<pre>
change <b>APIEndpoint</b> in /client/App.js to your server's domain:8080  
change <b>fileEnpoint</b> in /client/App.js to your server's domain:8081  
change <b>filesStorage</b> in /server/server.js to directory where you run your file server 
</pre>

### Example Screenshots:  
> Client (2020/10/11)
![example1](https://qtlamkas.why-am-i-he.re/4h4YAh.png)

> Documentation (2020/10/11)
![example2](https://qtlamkas.why-am-i-he.re/3LsFwA.png)
