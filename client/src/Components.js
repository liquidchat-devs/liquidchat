import React from 'react';
import { List } from 'react-movable';
import { formatDuration } from './public/scripts/DateFormatter';

export class Account extends React.Component {
  render() {
    const user = this.props.getUser(this.props.session.userID)

    return (
      <div className="panel2 headerColor">
        <img alt="" className=" marginleft2 avatar" src={this.props.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.switchDialogState(4); this.props.setSelectedMessage(undefined, e.pageX, e.pageY); e.preventDefault(); }}/>
        <div className="flex marginleft3">
          <div className="text2" style={{color: "white"}}>Username: {user !== undefined ? user.username : "Loading"}</div>
        </div>
      </div>
    );
  }
}

export class ChannelHeader extends React.Component {
  render() {
    let server = this.props.getServer(this.props.selectedServer)
    let channel = this.props.getChannel(this.props.currentChannel)
    if(channel === undefined || (server !== undefined && server.channels.includes(channel.id) === false) || (channel.type !== 2 && server === undefined)) {
      return null;
    }

    let tip = -1;
    let messages = -1;
    switch(channel.type) {
      case 0:
      case 2:
        messages = channel.messages === undefined ? [] : channel.messages;
        tip = "#" + channel.name + " (" + messages.length + ")";
        break;

      case 1:
        tip = "." + channel.name + " " + (this.props.currentVoiceGroup !== -1 ? this.props.currentVoiceGroup.users.length : "Connecting...");
        break;
    }

    switch(channel.type) {
      case 0:
      case 1:
      case 2:
        return (
          <div className="chatColor fullwidth channelHeader">
            <div className="flex marginleft3">
              <div className="text2" style={{color: "white"}}>{tip}</div>
            </div>
          </div>
        );
    }
  }
}

export class ChannelSelector extends React.Component {
  componentDidUpdate() {
    if(this.firstChannel !== this.previousFirstChannel && this.refs.firstChannelElement !== undefined) {
      this.props.setFirstChannel(this.refs.firstChannelElement, this.firstChannel)
    }
  }

  acceptFriendRequest(id) {
    this.props.API.API_acceptFriendRequest(id);
  }

  declineFriendRequest(id) {
    this.props.API.API_declineFriendRequest(id);
  }

  render() {
    let channels = Array.from(this.props.channels.values());
    let friendRequests = Array.from(this.props.friendRequests.values());
    let voiceGroup = this.props.currentVoiceGroup;
    let loggedUser = this.props.getUser(this.props.session.userID);
    channels = channels.filter(channel => { return ((channel.type === 0 || channel.type === 1) && this.props.channelTypes === 2 && channel.server.id === this.props.selectedServer) || (channel.type === 2 && this.props.channelTypes === 1); })
    channels = channels.sort((a, b) => a.position - b.position)

    const friendRequestsList = friendRequests.map((friendRequest, i) => {
      const author = this.props.getUser(friendRequest.author.id)
      const target = this.props.getUser(friendRequest.target.id)
      if(author === undefined || target === undefined) { return; }
      var user = author.id === loggedUser.id ? target : author;

      return (
        <div key={i} className="friendRequestEntry selectedChannelColor" style={{ height: author.id === this.props.session.userID ? 117 : 81}}>
          <div className="flex">
            <img alt="" className="avatar3 marginleft1 margintop1" src={this.props.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
            <div className="white marginleft2 margintop1b">
              {user.username}
            </div>
          </div>
          {author.id === this.props.session.userID ? 
          <div>
            <div className="flex">
              <div className="white channel pendingColor">
                Pending
              </div>
            </div>
            <div className="flex">
            <div className="white channel declineColor" onClick={() => { this.declineFriendRequest(friendRequest.id); }}>
                Cancel
              </div>
            </div>
          </div>
          :
          <div className="flex">
            <div className="white channel acceptColor" onClick={() => { this.acceptFriendRequest(friendRequest.id); }}>
              Accept
            </div>
            <div className="white channel declineColor" onClick={() => { this.declineFriendRequest(friendRequest.id); }}>
              Decline
            </div>
          </div>}
        </div>
      )
    });

    const friendList = loggedUser.friends.map((friendID, i) => {
      const friend = this.props.getUser(friendID);
      if(friend === undefined) {
        return null;
      }

      return (
        <div key={i} className="friendEntry selectedChannelColor" onContextMenu={(e) => { this.props.setSelectedUser(friend, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }>
          <div className="flex">
            <img alt="" className="avatar3 marginleft1 margintop1" src={this.props.fileEndpoint + "/" + friend.avatar}/>
            <div className="white marginleft2 margintop1b">
              {friend.username}
            </div>
          </div>
        </div>
      )
    });

    const serverList = loggedUser.servers.map((serverID, i) => {
      const server = this.props.getServer(serverID);
      if(server === undefined) {
        return null;
      }
      
      let serverName = server.name.length < 12 ? server.name : server.name.substring(0, 9) + "..."
      return (
        <div key={i}>
          <div className={this.props.selectedServer === server.id ? "white headerColor server selectedChannelColor" : "white headerColor server"} onClick={() => { this.props.setSelectedServer(server.id); }} onContextMenu={(e) => { this.props.setSelectedServer(server.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(17); e.preventDefault(); e.stopPropagation(); } }>
            <img alt="" className="avatar4 marginright2" src={this.props.fileEndpoint + "/" + server.avatar}/>
            <div className="white text8">
              {serverName}
            </div>
          </div>
        </div>
      )
    });

    let i = 0;
    return (
      <div className="flex">
        <div className="servers headerColor" style={{ height: this.props.pageHeight - 128 - this.props.pageHeightOffset }}>
          <div className={this.props.channelTypes === 3 ? "white headerColor server2 selectedChannelColor" : "white headerColor server2"} onClick={() => { this.props.switchChannelTypes(3) }}>
            Friends
          </div>
          <div className={this.props.channelTypes === 1 ? "white headerColor server2 selectedChannelColor" : "white headerColor server2"} onClick={() => { this.props.switchChannelTypes(1) }}>
            DMs
          </div>
          {serverList}
          <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(16) }}>
            + Server
          </div>
        </div>
        {this.props.channelTypes === 1 || this.props.channelTypes === 2 ?
          <div className="channels headerColor" style={{ height: this.props.pageHeight - 128 - this.props.pageHeightOffset }}>
            <List
            onChange={({ oldIndex, newIndex }) =>
              this.props.moveChannel(channels, oldIndex, newIndex)
            }
            values={channels}
            beforeDrag={({ index }) =>
              this.props.switchChannel(channels[index].id)
            }
            renderList={({ children, props }) => <div {...props}>{children}</div>}
            renderItem={({ value, index, props }) => {
              if(index === 0) { this.previousFirstChannel = this.firstChannel; this.firstChannel = value.id; }
              let channelName = value.name.length < 12 ? value.name : value.name.substring(0, 9) + "..."

              switch(value.type) {
                case 1:
                  if(voiceGroup !== -1) {
                    const userList = voiceGroup.users.map((userID, i) => {
                      const user = this.props.getUser(userID)
          
                      return (
                        <div className="voiceUserEntry flex">
                          <img alt="" className="avatar" src={this.props.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
                          <div className="white headerColor">
                            {user.username}
                          </div>
                        </div>
                      )
                    });

                    return (
                      <div>
                        <div className="white headerColor channel" onClick={(e) => { this.props.switchChannel(value.id) }} onContextMenu={(e) => { this.props.setSelectedChannel(value.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(10); e.preventDefault(); e.stopPropagation(); } }>
                          {value.type === 0 ? "#" : "."}{channelName}
                        </div>
                        {userList}
                      </div>
                    )
                  }
              }

              return (
                <div {...props} key={index} className={ this.props.currentChannel === value.id ? "white headerColor channel selectedChannelColor" : "white headerColor channel" } onContextMenu={(e) => { this.props.setSelectedChannel(value.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(10); e.preventDefault(); e.stopPropagation(); } }>
                  {value.type === 1 ? "." : "#"}{channelName}
                </div>
              )
              }}>
            </List>
            {voiceGroup !== -1 ? 
              <div className="white headerColor vcInfo selectedChannelColor">
                <div className="button2 alignmiddle chatColor" onClick={(e) => {  }}>
                  <p className="white text1">> Disconnect</p>
                </div>
              </div>
            : null}
            {this.props.channelTypes === 2 ?
              <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(1) }}>
              + Channel
              </div>
            : null}
          </div>
        :
        <div className="channels headerColor" style={{ height: this.props.pageHeight - 128 - this.props.pageHeightOffset }}>
          {friendList}
          {friendRequestsList}
          <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(7) }}>
            Add Friend
          </div>
        </div>}
        <div className="accountSettings chatColor aligny">
            <div className="button settingsButton marginleft2" style={{ width: 28, height: 28, position: "relative" }} onClick={() => { this.props.switchDialogState(13) }}>⚙️</div>
        </div>
      </div>
    );
  }
}

export class DialogManager extends React.Component {
  state = {
    copiedID: -1
  };

  copyID = (id) => {
    navigator.clipboard.writeText(id);
    this.setState({
      copiedID: id
    }, () => { this.props.switchDialogState(3); });
  };

  render() {
    switch(this.props.dialogState) {
      case 1:
        return <CreateChannelDialog selectedServer={this.props.selectedServer} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 2:
        return <MessageOptionsBox API={this.props.API} switchDialogState={this.props.switchDialogState} startEditingMessage={this.props.startEditingMessage}
        boxX={this.props.boxX} boxY={this.props.boxY} selectedMessage={this.props.selectedMessage} session={this.props.session} copyID={this.copyID} fileEndpoint={this.props.fileEndpoint} setEditedMessage={this.props.setEditedMessage}/>

      case 3:
        return <CopiedIDBox switchDialogState={this.props.switchDialogState} boxX={this.props.boxX} boxY={this.props.boxY} copiedID={this.state.copiedID}/>

      case 4:
        return <AccountOptionsBox API={this.props.API} getUser={this.props.getUser} switchDialogState={this.props.switchDialogState} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session} copyID={this.copyID} setSelectedUser={this.props.setSelectedUser}/>
        
      case 5:
        return <ProfileBox API={this.props.API} fileEndpoint={this.props.fileEndpoint} switchDialogState={this.props.switchDialogState} session={this.props.session} selectedUser={this.props.selectedUser}/>

      case 6:
        return <ProfileOptionsBox getChannel={this.props.getChannel} getServer={this.props.getServer} currentChannel={this.props.currentChannel} selectedServer={this.props.selectedServer} switchChannelTypes={this.props.switchChannelTypes} switchChannel={this.props.switchChannel} API={this.props.API} getUser={this.props.getUser} copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedUser={this.props.selectedUser} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session}/>

      case 7:
        return <AddFriendBox API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 8:
        return <ImageBox fileEndpoint={this.props.fileEndpoint} selectedImage={this.props.selectedImage} switchDialogState={this.props.switchDialogState} setSelectedMessage={this.props.setSelectedMessage}/>

      case 9:
        return <ImageBoxOptions fileEndpoint={this.props.fileEndpoint} selectedImage={this.props.selectedImage} switchDialogState={this.props.switchDialogState} copyID={this.copyID} boxX={this.props.boxX} boxY={this.props.boxY} setSelectedMessage={this.props.setSelectedMessage}/>

      case 10:
        return <ChannelOptionsBox getChannel={this.props.getChannel} API={this.props.API} copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedChannel={this.props.selectedChannel} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session}/>

      case 11:
        return <EditChannelDialog selectedChannel={this.props.selectedChannel} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 12:
        return <InviteFriendsBox fileEndpoint={this.props.fileEndpoint} getChannel={this.props.getChannel} getServer={this.props.getServer} selectedServer={this.props.selectedServer} getUser={this.props.getUser} session={this.props.session} selectedChannel={this.props.selectedChannel} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 13:
        return <SettingsBox fileEndpoint={this.props.fileEndpoint} API={this.props.API} switchDialogState={this.props.switchDialogState} session={this.props.session} getUser={this.props.getUser}/>

      case 14:
        return <AccountEditBox API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 15:
        return <ForgottenPasswordBox API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 16:
        return <CreateServerBox setSelectedAvatar={this.props.setSelectedAvatar} fileEndpoint={this.props.fileEndpoint} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 17:
        return <ServerOptionsBox getServer={this.props.getServer} API={this.props.API} copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedServer={this.props.selectedServer} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session}/>

      case 18:
        return <EditServerDialog setSelectedAvatar={this.props.setSelectedAvatar} fileEndpoint={this.props.fileEndpoint} getServer={this.props.getServer} selectedServer={this.props.selectedServer} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 19:
        return <CropImageDialog fileEndpoint={this.props.fileEndpoint} API={this.props.API} switchDialogState={this.props.switchDialogState} selectedAvatar={this.props.selectedAvatar}/>

      default:
        return null;
    }
  }
}

export class CreateChannelDialog extends React.Component {
  state = {
    channelName: "",
    channelType: 0,
    channelCreationResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleChangeType = val => {
    this.setState({
      channelType: val,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_createChannel(this.props.selectedServer, this.state.channelName, this.state.channelType);
    this.setState({
      channelCreationResult: res,
    });
    
    if(isNaN(res)) { this.props.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      case -1:
        return "Channel name is too short-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Create new channel-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <input className="inputfield1 marginleft2" name="channelName" type="text" placeholder="Name..." required={true} onChange={this.handleChange} /><br />
            <div className="aligny marginleft2b" style={{ width: "50%" }}>
              <div className={this.state.channelType === 0 ? "button2 alignmiddle chatColor" : "button2 alignmiddle"} onClick={(e) => { this.handleChangeType(0); }}>
                <p className="white text1">Text</p>
              </div>
              <div className={this.state.channelType === 1 ? "button2 alignmiddle chatColor" : "button2 alignmiddle"} onClick={(e) => { this.handleChangeType(1); }}>
                <p className="white text1">Voice</p>
              </div>
            </div>
          </form>
          <div className="alignmiddle margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Create!</div>
          </div>
          {
            (this.getErrorText(this.state.channelCreationResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.channelCreationResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}

export class CreateServerBox extends React.Component {
  state = {
    serverName: "",
    serverAvatar: "defaultAvatar.png",
    serverCreationResult: 0
  };

  handleAvatar = async (box, e) => {
    if(e.target.files.length < 1) { return; }
    
    var file = e.target.files[0];
    e.target.value = ""
    this.setState({
      serverAvatar: file,
    });

    var reader = new FileReader();
    reader.onload = function(e) {
      box.refs["serverImage"].src = e.target.result;
    }
    reader.readAsDataURL(file);
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    let res = await this.props.API.API_createServer(this.state.serverName);
    this.setState({
      serverCreationResult: res,
    });
    
    if(isNaN(res)) {
      if(this.state.serverAvatar !== -1) {
        res = await this.props.API.API_updateServerAvatar(res.id, this.state.serverAvatar)
        this.setState({
          serverCreationResult: res,
        });
      }
    }
    
    if(isNaN(res)) {
      this.props.switchDialogState(-1);
      return true;
    } else {
      this.setState({
        serverCreationResult: res,
      });
    }
  }

  getErrorText(code) {
    switch(code) {
      case -1:
        return "Server name is too short-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Create new server-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <img alt="" className="avatar2 marginleft4 marginright2" ref="serverImage" src={this.props.fileEndpoint + "/defaultAvatar.png"} onMouseEnter={() => this.refs["serverEditOverlay"].style = "display: flex;" }/>
            <div className="cropButton alignmiddle" onClick={() => { this.props.setSelectedAvatar(this.state.serverAvatar); this.props.switchDialogState(19) }}>
                <div className="white text7">Crop</div>
            </div>
            <label for="avatar-input">
              <div className="avatar2 avatarOverlay marginleft4 alignmiddle" ref="serverEditOverlay" onMouseLeave={() => this.refs["serverEditOverlay"].style = "display: none;" }>
                <div className="white text4 nopointer">Change Icon</div>
              </div>
            </label>
            <input id="avatar-input" className="hide" onChange={(e) => this.handleAvatar(this, e) } type='file' name="fileUploaded"/>
            <input className="inputfield1 marginleft2 margintop1" name="serverName" type="text" placeholder="Name..." required={true} onChange={this.handleChange} /><br />
          </form>
          <div className="alignmiddle margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Create!</div>
          </div>
          {
            (this.getErrorText(this.state.serverCreationResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.serverCreationResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}

export class EditChannelDialog extends React.Component {
  state = {
    channelName: "",
    channelEditResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_editChannel(this.props.selectedChannel.id, this.state.channelName);
    this.setState({
      channelEditResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      case -2:
        return "You're not this channel's author-";

      case -3:
        return "Channel name is too short-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Edit channel-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <input className="inputfield1 marginleft2" name="channelName" type="text" placeholder="Name..." required={true} value={this.state.channelName} onChange={this.handleChange} /><br />
          </form>
          <div className="alignmiddle margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }} value="vsvsd">Edit!</div>
          </div>
          {
            (this.getErrorText(this.state.channelEditResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.channelEditResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}

export class EditServerDialog extends React.Component {
  state = {
    serverName: "",
    serverAvatar: -1,
    serverEditResult: 0,
    avatarChangeResult: 0
  };

  componentDidMount = () => {
    const server = this.props.getServer(this.props.selectedServer);
    if(server !== undefined) {
      this.setState({
        serverName: server.name
      })
    }
  }

  handleAvatar = async (box, e) => {
    if(e.target.files.length < 1) { return; }
    
    var file = e.target.files[0];
    e.target.value = ""
    this.setState({
      serverAvatar: file,
    });

    var reader = new FileReader();
    reader.onload = function(e) {
      box.refs["serverImage"].src = e.target.result;
    }
    reader.readAsDataURL(file);
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    let res = await this.props.API.API_editServer(this.props.selectedServer, this.state.serverName);
    this.setState({
      serverEditResult: res,
    });

    if(isNaN(res)) {
      if(this.state.serverAvatar !== -1) {
        res = await this.props.API.API_updateServerAvatar(this.props.selectedServer, this.state.serverAvatar)
        this.setState({
          serverEditResult: res,
        });
      }
    }
    
    if(isNaN(res)) {
      this.props.switchDialogState(-1);
      return true;
    } else {
      this.setState({
        serverEditResult: res,
      });
    }
  }

  getErrorText(code) {
    switch(code) {
      case -2:
        return "You're not this server's author-";

      case -3:
        return "Server name is too short-";

      default:
        return "";
    }
  }

  render() {
    const server = this.props.getServer(this.props.selectedServer);
    if(server === undefined) {
      return null;
    }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Edit server-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <img alt="" className="avatar2 marginleft4 marginright2" ref="serverImage" src={this.props.fileEndpoint + "/" + server.avatar} onMouseEnter={() => this.refs["serverEditOverlay"].style = "display: flex;" }/>
            <div className="cropButton alignmiddle" onClick={() => { this.props.setSelectedAvatar(server.avatar); this.props.switchDialogState(19) }}>
                <div className="white text7">Crop</div>
            </div>
            <label for="avatar-input">
              <div className="avatar2 avatarOverlay marginleft4 alignmiddle" ref="serverEditOverlay" onMouseLeave={() => this.refs["serverEditOverlay"].style = "display: none;" }>
                <div className="white text4 nopointer">Change Icon</div>
              </div>
            </label>
            <input id="avatar-input" className="hide" onChange={(e) => this.handleAvatar(this, e) } type='file' name="fileUploaded"/>
            <input className="inputfield1 marginleft2 margintop1" name="serverName" type="text" placeholder="Name..." required={true} value={this.state.serverName} onChange={this.handleChange} /><br />
          </form>
          <div className="alignmiddle margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }} value="vsvsd">Edit!</div>
          </div>
          {
            (this.getErrorText(this.state.serverEditResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.serverEditResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}

export class CropImageDialog extends React.Component {
  componentDidMount = () => {
    if(typeof this.props.selectedAvatar !== "string") {
      var reader = new FileReader();
      reader.onload = function(e) {
        this.refs["serverImage"].src = e.target.result;
      }.bind(this);

      reader.readAsDataURL(this.props.selectedAvatar);
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox5 alignmiddle">
          <div style={{ width: "90%", height: "90%", position: "relative" }}>
            <img alt="" className="avatar5" ref="serverImage" src={this.props.fileEndpoint + "/" + this.props.selectedAvatar}/>
            <div className="cropOverlay"></div>
          </div>
        </div>
      </div>
    );
  }
}

export class InviteFriendsBox extends React.Component {
  state = {
    invitationResult: 0
  };

  inviteUser = async (id, userID, type) => {
    let res = -1;
    switch(type) {
      case 0:
        res = await this.props.API.API_addToDMChannel(id, userID);
        break;

      case 1:
        res = await this.props.API.API_createInvite(id);
        if(isNaN(res)) {
          res = await this.props.API.API_sendDM(userID, 'http://nekonetwork.net/invite/' + res.id);
          this.setState({
            invitationResult: res,
          });
        }

        if(isNaN(res)) {
          return true;
        } else {
          this.setState({
            invitationResult: res,
          });
        }
        break;
    }
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    let loggedUser = this.props.getUser(this.props.session.userID);
    let server = this.props.getServer(this.props.selectedServer);
    let channel = this.props.getChannel(this.props.selectedChannel);
    let target = channel === undefined || channel.members === undefined ? server : channel;
    let type = channel === undefined || channel.members === undefined ? 1 : 0;

    const friendList = loggedUser.friends.map((friendID, i) => {
    const friend = this.props.getUser(friendID);
      if(friend === undefined) {
        return null;
      }

      return (
        <div key={i} className="friendEntry selectedChannelColor" onContextMenu={(e) => { this.props.setSelectedUser(friend, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }>
          <div className="flex">
            <div className="aligny" style={{ height: 55 }}>
              <img alt="" className="avatar3 marginleft2" src={this.props.fileEndpoint + "/" + friend.avatar}/>
              <div className="white marginleft2">
                {friend.username}
              </div>
              {
                target.members.includes(friend.id) ?
                  <a className="button inviteButton" style={{ textDecoration: "none", right: 0, color: "#b3b3b3", border: "1px solid #b3b3b3", cursor: "default" }}>Joined!</a>
                : <a className="button inviteButton" style={{ textDecoration: "none", right: 0 }} onClick={(e) => { this.inviteUser(target.id, friend.id, type); e.preventDefault(); } }>Invite</a>
              }
            </div>
          </div>
        </div>
      )
    });

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Add Friends-</div>
          {friendList}
        </div>
      </div>
    );
  }
}

export class AddFriendBox extends React.Component {
  state = {
    friendUsername: "",
    friendRequestResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_sendFriendRequestByUsername(this.state.friendUsername);
    this.setState({
      friendRequestResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      case -1:
        return "You already sent a request to this user-";

      case -2:
        return "Nobody with this username found-";

      case -3:
        return "You can't send friend requests to yourself-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Add a friend-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <input className="inputfield1 marginleft2" name="friendUsername" type="text" placeholder="Username..." required={true} onChange={this.handleChange} /><br />
          </form>
          <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Send request!</div>
          {
            (this.getErrorText(this.state.friendRequestResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.friendRequestResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}

export class AccountEditBox extends React.Component {
  state = {
    email: "",
    accountEditResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_editUser(this.state.email);
    this.setState({
      accountEditResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Manage Account-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <input className="inputfield1 marginleft2" name="email" type="text" placeholder="Email..." required={true} onChange={this.handleChange} /><br />
          </form>
          <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Edit!</div>
          {
            (this.getErrorText(this.state.accountEditResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.accountEditResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}

export class SettingsBox extends React.Component {
  render() {
    let loggedUser = this.props.getUser(this.props.session.userID);

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox4">
          <div className="white text3 marginleft2b margintop1a">My Account</div>
          <div className="accountBox">
            <div className="flex">
              <img alt="" className="avatar2 margintop3 marginleft3" src={this.props.fileEndpoint + "/" + loggedUser.avatar}/>
              <div>
                <div className="margintop4 marginleft2b" style={{ height: 40 }}>
                  <p className="profileTooltipColor text6 margintop0 marginbot0">Username</p>
                  <p className="white text5 margintop0 margintop0b">{loggedUser.username}</p>
                </div>
                <div className="margintop1c marginleft2b" style={{ height: 40 }}>
                  <p className="profileTooltipColor text6 margintop0 marginbot0">Email</p>
                  {loggedUser.email === null ? 
                  <p className="text5 margintop0 margintop0b link" onClick={() => { this.props.switchDialogState(14); }}>Set an email-</p>
                  : <p className="white text5 margintop0 margintop0b">{loggedUser.email}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class MessageOptionsBox extends React.Component {
  state = {
    messageDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteMessage(this.props.selectedMessage);
    this.setState({
      messageDeletionResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  handleEdit = async e => {
    e.preventDefault();
    const res = 1
    this.props.setEditedMessage(this.props.selectedMessage.text == null ? "" : this.props.selectedMessage.text);
    this.props.startEditingMessage(this.props.selectedMessage);
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: this.props.selectedMessage.author.id === this.props.session.userID ? 90 : 30 }}>
          {
            this.props.selectedMessage.author.id === this.props.session.userID ?
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
              <p className="white text1">> Delete</p>
            </div> :
            ""
          }
          {
            this.props.selectedMessage.author.id === this.props.session.userID ?
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleEdit(e); }}>
              <p className="white text1">> Edit</p>
            </div> :
            ""
          }
          {
            this.props.selectedMessage.file == null ? "" :
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.props.copyID(this.props.fileEndpoint + "/" + this.props.selectedMessage.file.name); }}>
              <p className="white text1">> Copy link to file</p>
            </div>
          }
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.selectedMessage.id); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}

export class ProfileOptionsBox extends React.Component {
  sendFriendRequest(id) {
    this.props.API.API_sendFriendRequest(id);
  }

  removeFriend(id) {
    this.props.API.API_removeFriend(id);
  }

  removeFromDMChannel(channelID, id) {
    this.props.API.API_removeFromDMChannel(channelID, id);
  }

  removeFromServer(serverID, id) {
    this.props.API.API_kickFromServer(serverID, id);
  }

  async dmUser(id) {
    var channel = await this.props.API.API_getSuitableDMChannel(id);
    if(channel !== undefined) {
      this.props.switchDialogState(0);
      this.props.switchChannelTypes(1);
      this.props.switchChannel(channel.id);
    }
  }

  render() {
    let loggedUser = this.props.getUser(this.props.session.userID);
    let currentChannel = this.props.getChannel(this.props.currentChannel)
    let currentServer = this.props.getServer(this.props.selectedServer)

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: this.props.selectedUser.id === this.props.session.userID ? 30 : 45  }}>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(5); }}>
            <p className="white text1">> Profile</p>
          </div>
          {
            this.props.selectedUser.id !== loggedUser.id && loggedUser.friends.includes(this.props.selectedUser.id) === false ?
            <div className="button2 alignmiddle chatColor" onClick={() => { this.sendFriendRequest(this.props.selectedUser.id); }}>
              <p className="white text1">> Add Friend</p>
            </div> :
            ""
          }
          {
            loggedUser.friends.includes(this.props.selectedUser.id) === true ?
            <div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.removeFriend(this.props.selectedUser.id); }}>
                <p className="white text1">> Remove Friend</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.dmUser(this.props.selectedUser.id); }}>
                <p className="white text1">> Message</p>
              </div>
            </div> :
            ""
          }
          {
            currentChannel !== undefined && currentChannel.type === 2 && currentChannel.author.id === loggedUser.id && this.props.selectedUser.id !== loggedUser.id ?
            <div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.removeFromDMChannel(currentChannel.id ,this.props.selectedUser.id); }}>
                <p className="white text1">> Remove from group</p>
              </div>
            </div> :
            ""
          }
          {
            currentServer !== undefined && currentServer.author.id === loggedUser.id && this.props.selectedUser.id !== loggedUser.id ?
            <div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.removeFromServer(currentServer.id ,this.props.selectedUser.id); }}>
                <p className="white text1">> Kick from server</p>
              </div>
            </div> :
            ""
          }
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.selectedUser.id); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}

export class ChannelOptionsBox extends React.Component {
  state = {
    channelDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteChannel(this.props.selectedChannel);
    this.setState({
      channelDeletionResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    const channel = this.props.getChannel(this.props.selectedChannel)
    if(channel === undefined) {  return null; }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: channel.author.id === this.props.session.userID ? 45 : 30  }}>
          {
            channel.author.id === this.props.session.userID ?
            <div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(11); }}>
                <p className="white text1">> Edit Channel</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
                <p className="white text1">> Delete Channel</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(12); }}>
                <p className="white text1">> Add Friends</p>
              </div>
            </div> :
            ""
          }
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.selectedChannel); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}

export class ServerOptionsBox extends React.Component {
  state = {
    serverDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteServer(this.props.selectedServer);
    this.setState({
      serverDeletionResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    const server = this.props.getServer(this.props.selectedServer)
    if(server === undefined) {  return null; }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: server.author.id === this.props.session.userID ? 45 : 30  }}>
          {
            server.author.id === this.props.session.userID ?
            <div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(18); }}>
                <p className="white text1">> Edit Server</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
                <p className="white text1">> Delete Server</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(12); }}>
                <p className="white text1">> Invite Friends</p>
              </div>
            </div> :
            ""
          }
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.API.API_leaveServer(server.id); }}>
            <p className="white text1">> Leave Server</p>
          </div>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(server.id); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}

export class AccountOptionsBox extends React.Component {
  state = {
    avatarChangeResult: 0
  };

  handleAvatar = async e => {
    if(e.target.files.length < 1) { return; }
    
    var file = e.target.files[0];
    e.target.value = ""
    const res = await this.props.API.API_updateAvatar(file)
    this.setState({
      avatarChangeResult: res,
    });

    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    const user = this.props.getUser(this.props.session.userID)

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: 80 }}>
          <div className="button2 alignmiddle chatColor" onClick={(e) => { this.props.setSelectedUser(user, 0, 0); this.props.switchDialogState(5); }}>
            <p className="white text1">> Profile</p>
          </div>
          <label for="avatar-input">
            <div className="button2 alignmiddle chatColor">
              <p className="white text1">> Change Avatar</p>
            </div>
          </label>
          <input id="avatar-input" className="hide" onChange={this.handleAvatar} type='file' name="fileUploaded"/>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.session.userID); }}>
            <p className="white text1">> Copy ID</p>
          </div>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.API.API_logout(); }}>
            <p className="white text1">> Logout</p>
          </div>
        </div>
      </div>
    );
  }
}

export class ProfileBox extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox3">
            <div className="section chatColor">
              <div className="flex marginleft3 paddingtop3">
                <img alt="" className="avatar2" src={this.props.fileEndpoint + "/" + this.props.selectedUser.avatar}/>
                <div style={{ marginLeft: -28, marginTop: 75, backgroundColor: (this.props.selectedUser.status === 1 ? "#3baf3b" : "#f15252"), borderRadius: "50%", width: 24, height: 24 }}/>
                <div className="marginleft3">
                  <div className="flex margintop1">
                    <p className="profileTooltipColor text5 marginleft2 margintop0 marginbot0">> Username: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{this.props.selectedUser.username}</p>
                  </div>
                  <div className="flex margintop1a">
                    <p className="profileTooltipColor text5 marginleft2 margintop0 marginbot0">> Created: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{formatDuration(this.props.selectedUser.createdAt, Date.now())} ago</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
}

export class ImageBox extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
          <img alt="" className="absolutepos overlaybox3" src={this.props.selectedImage.link === undefined ? this.props.fileEndpoint + "/" + this.props.selectedImage.name : this.props.selectedImage.link} style={{ width: "auto", height: "auto", maxWidth: "90%", maxHeight: "90%", borderRadius: 0 }} onContextMenu={(e) => { this.props.switchDialogState(9); this.props.setSelectedMessage(undefined, e.pageX, e.pageY); e.preventDefault(); }}/>
      </div>
    );
  }
}

export class ImageBoxOptions extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
          <img alt="" className="absolutepos overlaybox3" src={this.props.selectedImage.link === undefined ? this.props.fileEndpoint + "/" + this.props.selectedImage.name : this.props.selectedImage.link} style={{ width: "auto", height: "auto", maxWidth: "90%", maxHeight: "90%", borderRadius: 0 }} onClick={() => { this.props.switchDialogState(8) }} onContextMenu={(e) => { this.props.switchDialogState(9); this.props.setSelectedMessage(undefined, e.pageX, e.pageY); e.preventDefault(); }}/>
          <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: 40 }}>
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.props.copyID(this.props.fileEndpoint + "/" + this.props.selectedImage.name); }}>
              <p className="white text1">> Copy Link</p>
            </div>
            <div className="button2 alignmiddle chatColor" onClick={() => { window.open(this.props.fileEndpoint + "/" + this.props.selectedImage.name); }}>
              <p className="white text1">> Open Link</p>
            </div>
          </div>
      </div>
    );
  }
}

export class CopiedIDBox extends React.Component {
  componentDidMount() {
    setTimeout(() => { this.props.switchDialogState(-1); }, 3000)
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: 30, width: 180 + (this.props.copiedID.length * 5) }}>
          <div className="button2 alignmiddle chatColor">
            <p className="white text1">Copied {this.props.copiedID}!</p>
          </div>
        </div>
      </div>
    );
  }
}

export class ForgottenPasswordBox extends React.Component {
  state = {
    state: 0,
    code: "",
    passwordRecoveryResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    /*const res = await this.props.API.API_editUser(this.state.email);
    this.setState({
      accountEditResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }*/
    return true;
  }

  getErrorText(code) {
    switch(code) {
      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2b margintop1a">Password Recovery</div>
          {this.state.state === 1 ?
            <div>
              <form onSubmit={this.handleSubmit} className="flex margintop0b">
                <input className="inputfield1 marginleft2b" name="code" type="text" placeholder="Verification code..." required={true} onChange={this.handleChange} /><br />
              </form>
              <div onClick={this.handleSubmit} className="button button1 marginleft2b" style={{ marginTop: 15 }}>Enter-</div>
              {
                (this.getErrorText(this.state.passwordRecoveryResult).length > 0 ?
                <div className="marginleft2 margintop1 errorColor">
                  {this.getErrorText(this.state.passwordRecoveryResult)}
                </div>
                : "")
              }
            </div>
          :
            <div>
              <div className="marginleft2b" style={{ height: 40 }}>
                <p className="white text5 margintop0 margintop0b" onClick={() => { this.props.switchDialogState(14); }}>To recover your account enter a code that was sent to your email-</p>
              </div>
              <div onClick={this.handleSubmit} className="button button1 marginleft2b" style={{ marginTop: 15 }} onClick={() => { this.setState({ state: 1 }) }}>I'm ready!</div>
              {
                (this.getErrorText(this.state.passwordRecoveryResult).length > 0 ?
                <div className="marginleft2 margintop1 errorColor">
                  {this.getErrorText(this.state.passwordRecoveryResult)}
                </div>
                : "")
              }
            </div>
          }
        </div>
      </div>
    );
  }
}

export default { ChannelHeader, Account, ChannelSelector };