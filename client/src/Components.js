import React from 'react';
import { formatDuration } from './public/scripts/DateFormatter';

export class Account extends React.Component {
  render() {
    const user = this.props.getUser(this.props.session.userID)

    return (
      <div className="panel2 headerColor">
        <img alt="" className=" marginleft2 avatar" src={this.props.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.switchDialogState(4); this.props.setSelectedMessage(undefined, e.pageX, e.pageY); e.preventDefault(); }}/>
        <div className="flex marginleft3">
          <div className="text2" style={{color: "white"}}>Username: {user !== -1 ? user.username : "Loading"}</div>
        </div>
      </div>
    );
  }
}

export class ChannelHeader extends React.Component {
  render() {
    let channel = this.props.channels.get(this.props.currentChannel)
    if(channel === undefined) { return null; }

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

    channels = channels.filter(channel => { return ((channel.type === 0 || channel.type === 1) && this.props.channelTypes === 2) || (channel.type === 2 && this.props.channelTypes === 1); })
    const channelList = channels.map((channel, i) => {
      if(i === 0) { this.previousFirstChannel = this.firstChannel; this.firstChannel = channel.id; }
      let channelName = channel.name.length < 12 ? channel.name : channel.name.substring(0, 9) + "..."

      switch(channel.type) {
        case 1:
          if(voiceGroup !== -1) {
            const userList = voiceGroup.users.map((userID, i) => {
              const user = this.props.getUser(userID)
  
              return (
                <div className="voiceUserEntry flex">
                  <img alt="" className="avatar" src={this.props.fileEndpoint + "/" + user.avatar} key={i} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
                  <div className="white headerColor">
                    {user.username}
                  </div>
                </div>
              )
            });

            return (
              <div>
                <div className="white headerColor channel" onClick={(e) => { this.props.switchChannel(e.currentTarget, channel.id) }} onContextMenu={(e) => { this.props.setSelectedChannel(channel, e.pageX, e.pageY); this.props.switchDialogState(10); e.preventDefault(); e.stopPropagation(); } } key={i} ref={i === 0 ? "firstChannelElement" : undefined}>
                  {channel.type === 0 ? "#" : "."}{channelName}
                </div>
                {userList}
              </div>
            )
          }
      }

      return (
        <div className={ this.props.currentChannel === channel.id ? "white headerColor channel selectedChannelColor" : "white headerColor channel" } onClick={(e) => { this.props.switchChannel(e.currentTarget, channel.id) }} onContextMenu={(e) => { this.props.setSelectedChannel(channel, e.pageX, e.pageY); this.props.switchDialogState(10); e.preventDefault(); e.stopPropagation(); } } key={i} ref={i === 0 ? "firstChannelElement" : undefined}>
          {channel.type === 1 ? "." : "#"}{channelName}
        </div>
      )
    });

    const friendRequestsList = friendRequests.map((friendRequest, i) => {
      const author = this.props.getUser(friendRequest.author.id)
      const target = this.props.getUser(friendRequest.target.id)
      var user = author.id === loggedUser.id ? target : author;

      return (
        <div className="friendRequestEntry selectedChannelColor" style={{ height: author.id === this.props.session.userID ? 117 : 81}}>
          <div className="flex">
            <img alt="" className="avatar3 marginleft1 margintop1" src={this.props.fileEndpoint + "/" + user.avatar} key={i} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
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

    const friendList = loggedUser.friendList.map((friendID, i) => {
      const friend = this.props.getUser(friendID);
      if(friend === -1) {
        return null;
      }

      return (
        <div className="friendEntry selectedChannelColor" onContextMenu={(e) => { this.props.setSelectedUser(friend, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }>
          <div className="flex">
            <img alt="" className="avatar3 marginleft1 margintop1" src={this.props.fileEndpoint + "/" + friend.avatar} key={i}/>
            <div className="white marginleft2 margintop1b">
              {friend.username}
            </div>
          </div>
        </div>
      )
    });

    return (
      <div className="flex">
        <div className="channels headerColor">
          <div className={this.props.channelTypes === 3 ? "white headerColor channel selectedChannelColor" : "white headerColor channel"} onClick={() => { this.props.switchChannelTypes(3) }}>
            Friends
          </div>
          <div className={this.props.channelTypes === 1 ? "white headerColor channel selectedChannelColor" : "white headerColor channel"} onClick={() => { this.props.switchChannelTypes(1) }}>
            DMs
          </div>
          <div className={this.props.channelTypes === 2 ? "white headerColor channel selectedChannelColor" : "white headerColor channel"} onClick={() => { this.props.switchChannelTypes(2) }}>
            Global
          </div>
        </div>
        {this.props.channelTypes === 1 || this.props.channelTypes === 2 ?
          <div className="channels headerColor">
            {channelList}
            {voiceGroup !== -1 ? 
              <div className="white headerColor vcInfo selectedChannelColor">
                <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleEdit(e); }}>
                  <p className="white text1">> Disconnect</p>
                </div>
              </div>
            : null}
            {this.props.channelTypes === 2 ?
              <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(1) }}>
              +
              </div>
            : null}
          </div>
        :
        <div className="channels headerColor">
          {friendList}
          {friendRequestsList}
          <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(7) }}>
            Add Friend
          </div>
        </div>}
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
        return <CreateChannelDialog API={this.props.API} switchDialogState={this.props.switchDialogState} />

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
        return <ProfileOptionsBox API={this.props.API} getUser={this.props.getUser} copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedUser={this.props.selectedUser} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session}/>

      case 7:
        return <AddFriendBox API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 8:
        return <ImageBox fileEndpoint={this.props.fileEndpoint} selectedImage={this.props.selectedImage} switchDialogState={this.props.switchDialogState} setSelectedMessage={this.props.setSelectedMessage}/>

      case 9:
        return <ImageBoxOptions fileEndpoint={this.props.fileEndpoint} selectedImage={this.props.selectedImage} switchDialogState={this.props.switchDialogState} copyID={this.copyID} boxX={this.props.boxX} boxY={this.props.boxY} setSelectedMessage={this.props.setSelectedMessage}/>

      case 10:
        return <ChannelOptionsBox API={this.props.API} copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedChannel={this.props.selectedChannel} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session}/>

      case 11:
        return <EditChannelDialog selectedChannel={this.props.selectedChannel} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 12:
        return <InviteFriendsBox fileEndpoint={this.props.fileEndpoint} getUser={this.props.getUser} session={this.props.session} selectedChannel={this.props.selectedChannel} API={this.props.API} switchDialogState={this.props.switchDialogState} />

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
    const res = await this.props.API.API_createChannel(this.state.channelName, this.state.channelType);
    this.setState({
      channelCreationResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
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
            <input className="inputfield1 marginleft2" name="channelName" type="text" placeholder="Name..." required={true} onChange={this.handleChange} /><br />
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

export class InviteFriendsBox extends React.Component {
  inviteUser = async e => {
    e.preventDefault();
    /*const res = await this.props.API.API_editChannel(this.props.selectedChannel.id, this.state.channelName);
    
    if(res === 1) { this.props.switchDialogState(-1); }*/
    return true;
  }

  render() {
    let loggedUser = this.props.getUser(this.props.session.userID);

    const friendList = loggedUser.friendList.map((friendID, i) => {
    const friend = this.props.getUser(friendID);
      if(friend === -1) {
        return null;
      }

      return (
        <div className="friendEntry selectedChannelColor" onContextMenu={(e) => { this.props.setSelectedUser(friend, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }>
          <div className="flex">
            <div className="aligny" style={{ height: 50 }}>
              <img alt="" className="avatar3 marginleft1" src={this.props.fileEndpoint + "/" + friend.avatar} key={i}/>
              <div className="white marginleft2">
                {friend.username}
              </div>
              <a className="button inviteButton" style={{ textDecoration: "none" }} onClick={() => this.inviteUser(friend.id) }>Invite</a>
            </div>
          </div>
        </div>
      )
    });

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">> Invite Friends-</div>
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
          <div className="alignmiddle margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Send request!</div>
          </div>
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

  createChannelDM(id) {
    this.props.API.API_createChannelDM("Channel#" + Math.floor(Math.random() * 1000), [ this.props.session.userID, id ]);
  }

  render() {
    let loggedUser = this.props.getUser(this.props.session.userID);

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: this.props.selectedUser.id === this.props.session.userID ? 30 : 45  }}>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(5); }}>
            <p className="white text1">> Profile</p>
          </div>
          {
            this.props.selectedUser.id !== loggedUser.id && loggedUser.friendList.includes(this.props.selectedUser.id) === false ?
            <div className="button2 alignmiddle chatColor" onClick={() => { this.sendFriendRequest(this.props.selectedUser.id); }}>
              <p className="white text1">> Add Friend</p>
            </div> :
            ""
          }
          {
            loggedUser.friendList.includes(this.props.selectedUser.id) === true ?
            <div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.removeFriend(this.props.selectedUser.id); }}>
                <p className="white text1">> Remove Friend</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.createChannelDM(this.props.selectedUser.id); }}>
                <p className="white text1">> Message</p>
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
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: this.props.selectedChannel.author.id === this.props.session.userID ? 45 : 30  }}>
          {
            this.props.selectedChannel.author.id === this.props.session.userID ?
            <div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(11); }}>
                <p className="white text1">> Edit Channel</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
                <p className="white text1">> Delete Channel</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(12); }}>
                <p className="white text1">> Invite Friends</p>
              </div>
            </div> :
            ""
          }
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.selectedChannel.id); }}>
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
                <div className="marginleft4">
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
          <img alt="" className="absolutepos overlaybox3" src={this.props.fileEndpoint + "/" + this.props.selectedImage.name} style={{ width: "auto", height: "auto", maxWidth: "90%", maxHeight: "90%", borderRadius: 0 }} onContextMenu={(e) => { this.props.switchDialogState(9); this.props.setSelectedMessage(undefined, e.pageX, e.pageY); e.preventDefault(); }}/>
      </div>
    );
  }
}

export class ImageBoxOptions extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
          <img alt="" className="absolutepos overlaybox3" src={this.props.fileEndpoint + "/" + this.props.selectedImage.name} style={{ width: "auto", height: "auto", maxWidth: "90%", maxHeight: "90%", borderRadius: 0 }} onClick={() => { this.props.switchDialogState(8) }} onContextMenu={(e) => { this.props.switchDialogState(9); this.props.setSelectedMessage(undefined, e.pageX, e.pageY); e.preventDefault(); }}/>
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

export default { ChannelHeader, Account, ChannelSelector, CreateChannelDialog };