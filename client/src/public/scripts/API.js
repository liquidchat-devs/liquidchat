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

        socket.on('connect', async() => {
            console.log("> socket.io connected!");
            await this.API_fetchUser(userID, true);
            this.API_fetchUsersForFriends(userID);
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
        socket.on('updateChannel', (channelData) => {
            var _channel = JSON.parse(channelData);

            var newChannels = new Map(this.mainClass.state.channels)
            var channel = newChannels.get(_channel.id);
            channel.name = _channel.name;
            channel.members = _channel.members;
            newChannels.set(channel.id, channel);
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
                uploadFailed: true,
                uploadReceived: 0,
                uploadExpected: fileSize
            });
        });
        socket.on('uploadFinish', (fileID, fileName) => {
            console.log("> upload finish")
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
        socket.on('updateFriendRequests', (friendRequestsData) => {
            var friendRequests = JSON.parse(friendRequestsData);
            this.API_fetchUsersForFriendRequests(friendRequests);
            this.mainClass.setState({
                friendRequests: friendRequests
            });
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
    async API_fetchUser(id, containSensitive) {
        if(this.mainClass.state.users.has(id)) {
          return this.mainClass.state.users.get(id)
        } else {
          //Fetch user
          const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchUser?id=' + id + (containSensitive === true ? "&containSensitive=true" : ""), { withCredentials: true });
          var user = reply.data
    
          //Cache user
          var newUsers = this.mainClass.state.users.set(user.id, user);
          this.mainClass.setState({
            users: newUsers
          });

          return user;
        }
    }

    async API_fetchFriendRequests() {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchFriendRequests', { withCredentials: true }));
        var friendRequests = reply.data

        this.API_fetchUsersForFriendRequests(friendRequests)
        this.mainClass.setState({
            friendRequests: friendRequests
        });
    }
    //#endregion

    //#region Fetching Utils
    async API_fetchUsersForFriendRequests(friendRequests) {
        friendRequests.forEach(friendRequest => {
            var id = friendRequest.author.id === this.mainClass.state.session.userID ? friendRequest.target.id : friendRequest.author.id;
            this.API_fetchUser(id)
        })
    }

    async API_fetchUsersForFriends(userID) {
        var user = this.mainClass.getUser(userID);
        user.friendList.forEach(friendID => {
            this.API_fetchUser(friendID);
        });
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

    async API_fetchUsersForChannelMembers(channel) {
        channel.members.forEach(userID => {
            this.API_fetchUser(userID);
        });
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

    async API_editUser(email) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editUser', {
            email: email
        }, { withCredentials: true });

        if(reply.data.status !== 1) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_sendFriendRequest(userID) {
        await axios.post(this.mainClass.state.APIEndpoint + '/sendFriendRequest', {
            target: {
                id: userID
            }
        }, { withCredentials: true });

        return true;
    }

    async API_removeFriend(userID) {
        await axios.post(this.mainClass.state.APIEndpoint + '/removeFriend', {
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
    async API_getSuitableDMChannel(userID) {
        var suitableChannels = Array.from(this.mainClass.state.channels.values()).filter(channel => { return channel.members !== undefined && channel.members.length === 2 && channel.members.includes(this.mainClass.state.session.userID) && channel.members.includes(userID); });
        var channel = -1;
        if(suitableChannels.length < 1) {
            channel = await this.API_createChannelDM("autogenerated DM", [ this.mainClass.state.session.userID, userID ])
            if(isNaN(channel) === false) {
                return undefined;
            } else {
                suitableChannels = [ channel ]
            }
        }

        return suitableChannels[0];
    }

    async API_sendMessage(message) {
        await axios.post(this.mainClass.state.APIEndpoint + '/message', {
            text: message,
            channel: {
                id: this.mainClass.state.currentChannel
            }
        }, { withCredentials: true });

        return true;
    }

    async API_sendDM(userID, message) {
        var channel = await this.API_getSuitableDMChannel(userID)
        if(channel === undefined) { return false; }

        await axios.post(this.mainClass.state.APIEndpoint + '/message', {
            text: message,
            channel: {
                id: channel.id
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

    async API_createChannelDM(channelName, channelMembers) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createChannel', {
            name: channelName, type: 2, members: channelMembers
        }, { withCredentials: true });

        if(reply.data.status !== 1) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_removeFromDMChannel(channelID, userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/removeFromDMChannel', {
            channel: { id: channelID }, user: { id: userID }
        }, { withCredentials: true });

        if(reply.data.status !== 1) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_editChannel(channelID, channelName) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editChannel', {
            id: channelID, name: channelName
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

    async API_fetchChannels(type) {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + (type === 0 ? '/fetchChannels' : '/fetchDMChannels'), { withCredentials: true }));
        var currentChannels = this.mainClass.state.channels;
        var newChannels = reply.data;
        newChannels = new Map(newChannels.map(obj => [obj.id, obj]));

        newChannels.forEach(async(channel) => {
            const reply2 = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannelMessages?id=' + channel.id, { withCredentials: true }));
            var messages = reply2.data;
            channel.messages = messages;
            currentChannels.set(channel.id, channel);

            if(channel.members !== undefined) { this.API_fetchUsersForChannelMembers(channel); }
            this.API_fetchUsersForMessages(messages)
            this.mainClass.setState({
                channels: currentChannels
            });
        });
    }
    //#endregion
}

export { API }