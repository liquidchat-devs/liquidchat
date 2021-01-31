import React from 'react';

export default class Functions {
    constructor(_main) {
        this.mainClass = _main;
    }

    setFirstChannel = (_e, _channelID) => {
        this.mainClass.setState({
            firstChannel: _channelID,
            firstChannelElement: _e,
        }, () => {
            this.mainClass.state.firstChannelElement.click();
        });
    }

    switchChannel = (_channelID) => {
        this.mainClass.setState({
            previousChannel: this.mainClass.state.currentChannel,
            currentChannel: _channelID
        });

        let channel = this.mainClass.state.channels.get(_channelID)
        if(channel === undefined) { return; }

        switch(channel.type) {
            case 1:
                this.mainClass.state.API.API_joinVoiceChannel(channel.id)
                break;
        }

        let chat = document.getElementById('chat-container');
        if(chat !== null) { chat.scrollTop = chat.scrollHeight; }
    }

    switchFormState = () => {
        this.mainClass.setState({
            formState: this.mainClass.state.formState === 0 ? 1 : 0,
        });
    }

    switchDialogState = (id) => {
        console.log("Switching dialog state from " + this.mainClass.state.dialogState + " > " + id);

        this.mainClass.setState({
            dialogState: id
        });
    }

    switchChannelTypes = (id) => {
        this.mainClass.setState({
            channelTypes: id,
            selectedServer: -1,
        });

        this.switchChannel(-1);
    }

    setSelectedMessage = (message) => {
        this.mainClass.setState({
            selectedMessage: message
        });
    }

    startEditingMessage = (message) => {
        this.mainClass.setState({
            editingMessage: message
        });
    }

    endEditingMessage = () => {
        this.mainClass.setState({
            editingMessage: -1
        });
    }

    setEditedMessage = val => {
        this.mainClass.setState({
            editedMessage: val
        });
    }

    setSelectedImage = val => {
        this.mainClass.setState({
            selectedImage: val
        });
    }

    setSelectedServer = val => {
        if(this.mainClass.state.selectedServer !== val) { this.switchChannel(-1); }
        this.mainClass.setState({
            channelTypes: 2,
            selectedServer: val
        });
    }

    setSelectedChannel =  (channel) => {
        this.mainClass.setState({
            selectedChannel: channel
        });
    }

    setSelectedAvatar =  (avatar) => {
        this.mainClass.setState({
            selectedAvatar: avatar
        });
    }

    setSelectedBanner =  (banner) => {
        this.mainClass.setState({
            selectedBanner: banner
        });
    }

    setBox = (x, y) => {
        this.mainClass.setState({
            boxX: x,
            boxY: y
        });
    }

    setSelectedUser = (user) => {
        this.mainClass.setState({
            selectedUser: user
        });
    }

    moveChannel = (channels, oldIndex, newIndex) => {
        //Sort the channels
        channels.splice(newIndex, 0, channels.splice(oldIndex, 1)[0]);
        channels.forEach((c, index) => {
            c.position = index;
            this.mainClass.state.API.API_editChannel({
                id: c.id,
                position: index
            });
        });
    }

    getUser = (id) => {
        return this.mainClass.state.users.get(id);
    }

    getChannel = (id) => {
        return this.mainClass.state.channels.get(id);
    }

    getServer = (id) => {
        return this.mainClass.state.servers.get(id);
    }

    getOwnServers = () => {
        let servers = new Map();
        this.mainClass.state.servers.forEach(server => {
          if(server.members.includes(this.mainClass.state.session.userID)) {
            servers.set(server.id, server);
          }
        })
    
        return servers;
    }

    isInChannel = () => {
        let server = this.getServer(this.mainClass.state.selectedServer)
        let channel = this.getChannel(this.mainClass.state.currentChannel)
        return !(channel === undefined || (server !== undefined && server.channels.includes(channel.id) === false) || (channel.type !== 2 && server === undefined) || channel.type === 1);
    }

    isInServer = (id) => {
        return this.getOwnServers().has(id);
    }

    copyID = (id) => {
        navigator.clipboard.writeText(id);
        this.mainClass.setState({
          copiedID: id
        }, () => { this.switchDialogState(3); });
    };

}