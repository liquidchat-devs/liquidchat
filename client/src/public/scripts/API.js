import axios from 'axios';
import io from "socket.io-client";

class API {
    constructor(_main) {
        this.mainClass = _main;
        this.socket = -1;
        this.wrtc = -1;
    }

    async API_initWebsockets(userID) {
        //Setups the websocket client
        const socket = io(this.mainClass.state.APIEndpoint, {
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log("> socket.io connected!");
            this.API_fetchUser(userID)
        });
        
        socket.on('message', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);
            channel.messages.push(message);

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });

            this.API_fetchUsersForMessages([ message ])
        });
        socket.on('editMessage', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);

            var i = -1;
            channel.messages.forEach((m, _i) => {
                if(m.id === message.id) {
                    i = _i
                }
            });
            channel.messages[i] = message

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });
        socket.on('deleteMessage', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);

            var i = -1;
            channel.messages.forEach((m, _i) => {
                if(m.id === message.id) {
                    i = _i
                }
            });
            channel.messages.splice(i, 1)

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });

        socket.on('createChannel', (channelData) => {
            var channel = JSON.parse(channelData);
            channel.messages = [];
            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });
        socket.on('deleteChannel', (channelData) => {
            var channel = JSON.parse(channelData);

            var newChannels = new Map(this.mainClass.state.channels)
            newChannels.delete(channel.id);
            this.mainClass.setState({
                channels: newChannels
            });
        });

        socket.on('uploadStart', (fileID, fileName) => {
            console.log("> upload start")
            this.mainClass.setState({
                uploadFileID: fileID,
                uploadFileName: fileName,
                uploadFailed: false
            });
        });
        socket.on('uploadProgress', (fileID, fileName, bytesReceived, bytesExpected) => {
            console.log("> upload progress")
            this.mainClass.setState({
                uploadReceived: bytesReceived,
                uploadExpected: bytesExpected
            });
        });
        socket.on('uploadFail', (fileID, fileName, fileSize) => {
            console.log("> upload fail")
            this.mainClass.setState({
                uploadFailed: true
            });
        });

        socket.on('updateUser', (userData) => {
            var user = JSON.parse(userData);
            if(this.mainClass.state.users.has(user.id)) {
                var newUsers = this.mainClass.state.users.set(user.id, user);
                this.mainClass.setState({
                    users: newUsers
                });
            }
        });

        socket.on('updateVoiceGroup', (voiceGroupData) => {
            var voiceGroup = JSON.parse(voiceGroupData);
            this.mainClass.setState({
                currentVoiceGroup: voiceGroup
            });
        });

        socket.on('uploadFinish', (fileID, fileName) => {
            console.log("> upload finish")
        });
        
        //Setups the WebRTC Client
        const wrtc = require('electron-webrtc')()
        wrtc.on('error', function (err) { console.log(err) })

        const config = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
        var pc = new wrtc.RTCPeerConnection(config)
        pc.onconnectionstatechange = function(event) {
            switch(pc.connectionState) {
                case "connected":
                    console.log("> WebRTC connected!")
                    break;

                case "closed":
                    console.log("> WebRTC closed-")
                    break;
            }
        }

        this.socket = socket;
        this.wrtc = wrtc;
        this.pc = pc;
    }
    
    //#region Fetching
    async API_fetchUser(id) {
        if(this.mainClass.state.users.has(id)) {
          return this.mainClass.state.users.get(id)
        } else {
          //Fetch user
          const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchUser?id=' + id, { withCredentials: true });
          var user = reply.data
    
          //Cache user
          var newUsers = this.mainClass.state.users.set(user.id, user);
          this.mainClass.setState({
            users: newUsers
          });
          return user;
        }
    }

    async API_fetchUsersForMessages(messages) {
        const queue = new Map();
        messages.forEach(message => {
          if(!queue.has(message.author.id)) {
            this.API_fetchUser(message.author.id)
            queue.set(message.author.id, 1)
          }
        })
    }

    async API_fetchFriendRequests() {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchFriendRequests?authorID=' + this.mainClass.state.session.userID, { withCredentials: true }));
        var friendRequests = reply.data

        this.API_fetchUsersForMessages(friendRequests)
        this.mainClass.setState({
            friendRequests: friendRequests
        });
    }

    async API_fetchUsersForFriendRequests(friendRequests) {
        const queue = new Map();
        friendRequests.forEach(friendRequest => {
          if(!queue.has(friendRequest.target.id)) {
            this.API_fetchUser(friendRequest.author.id)
            queue.set(friendRequest.target.id, 1)
          }
        })
    }
    //#endregion

    //#region User Actions
    async API_updateAvatar(file) {
        var data = new FormData();
        data.append("fileUploaded", file)

        await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/updateAvatar?fileName=' + file.name,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        return true;
    }

    async API_sendFriendRequest(userID) {
        await axios.post(this.mainClass.state.APIEndpoint + '/sendFriendRequest', {
            target: {
                id: userID
            }
        }, { withCredentials: true });

        return true;
    }

    async API_sendFriendRequestByUsername(username) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/sendFriendRequest', {
            target: {
                username: username
            }
        }, { withCredentials: true });

        return reply.data.status;
    }

    async API_acceptFriendRequest(id) {
        await axios.post(this.mainClass.state.APIEndpoint + '/acceptFriendRequest', {
            id: id
        }, { withCredentials: true });

        return true;
    }

    async API_declineFriendRequest(id) {
        await axios.post(this.mainClass.state.APIEndpoint + '/declineFriendRequest', {
            id: id
        }, { withCredentials: true });

        return true;
    }
    //#endregion

    //#region Authorization
    async API_login(_username, _password, _type) {
        this.mainClass.setState({
          waitingForSession: true
        })
    
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/login', {
          authType: _type,
          username: _username,
          password: _password
        }, { withCredentials: true });
    
        if(reply.data.status !== 1) {
          return reply.data.status;
        } else {
          this.mainClass.setState({
            session: reply.data
          })
    
          setTimeout(() => {
            this.mainClass.setState({
              waitingForSession: false
            })
          }, 3000)

          this.API_initWebsockets(reply.data.userID);
          return reply.data;
        }
    }

    async API_register(_username, _password, _password2) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/register', {
            username: _username,
            password: _password,
            password2: _password2
        }, { withCredentials: true });

        if(reply.data.status !== 1) {
            return reply.data.status;
        } else {
            this.mainClass.setState({
                session: reply.data
            });

            setTimeout(() => {
                this.mainClass.setState({
                  waitingForSession: false
                })
            }, 3000)

            this.API_initWebsockets(reply.data.userID);
            return reply.data;
        }
    }

    async API_logout() {
        await axios.post(this.mainClass.state.APIEndpoint + '/logout', {}, { withCredentials: true });
        window.location.reload(false);
        return true;
    }
    //#endregion

    //#region Messages
    async API_sendMessage(message) {
        await axios.post(this.mainClass.state.APIEndpoint + '/message', {
            text: message,
            channel: {
                id: this.mainClass.state.currentChannel
            }
        }, { withCredentials: true });

        return true;
    }

    async API_sendFile(file, message) {
        var data = new FormData();
        data.append("fileUploaded", file)
        data.append("text", message)
        data.append("channel.id", this.mainClass.state.currentChannel)

        await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/upload?fileName=' + file.name,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        return true;
    }

    async API_editMessage(originalMessage, newText) {
        await axios.post(this.mainClass.state.APIEndpoint + '/editMessage', {
            id: originalMessage.id,
            text: newText,
            channel: {
                id: this.mainClass.state.currentChannel
            }
        }, { withCredentials: true });

        return true;
    }

    async API_deleteMessage(message) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/deleteMessage', {
            id: message.id,
            channel: {
                id: message.channel.id
            }
        }, { withCredentials: true });

        return reply.data.status;
    }

    async API_joinVoiceChannel(channel) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/joinVoiceChannel', {
            channel: {
                id: channel.id
            }
        }, { withCredentials: true });

        return reply.data.status;
    }

    async API_leaveVoiceChannel(channel) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/leaveVoiceChannel', {
            channel: {
                id: channel.id
            }
        }, { withCredentials: true });

        return reply.data.status;
    }
    //#endregion

    //#region Channels
    async API_createChannel(channelName, channelType) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createChannel', {
            name: channelName, type: channelType
        }, { withCredentials: true });

        if(reply.data.status !== 1) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_deleteChannel(channel) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/deleteChannel', {
            id: channel.id
        }, { withCredentials: true });

        return reply.data.status;
    }

    async API_fetchChannels() {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannels', { withCredentials: true }));
        var channels = reply.data
        channels = new Map(channels.map(obj => [obj.id, obj]));
        channels.forEach(async(channel) => {
            const reply2 = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannelMessages?id=' + channel.id, { withCredentials: true }));
            var messages = reply2.data
            channel.messages = messages
            channels.set(channel.id, channel);

            this.API_fetchUsersForMessages(messages)
            this.mainClass.setState({
                channels: channels
            });
        });
    }
    //#endregion
}

export { API }