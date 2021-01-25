import React from 'react';
import { List } from 'react-movable';

export default class ChannelSelector extends React.Component {
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
    let channels = Array.from(this.props.state.channels.values());
    let friendRequests = Array.from(this.props.state.friendRequests.values());
    let voiceGroup = this.props.state.currentVoiceGroup;
    let loggedUser = this.props.getUser(this.props.state.session.userID);
    channels = channels.filter(channel => { return ((channel.type === 0 || channel.type === 1) && this.props.state.channelTypes === 2 && channel.server.id === this.props.state.selectedServer) || (channel.type === 2 && this.props.state.channelTypes === 1); })
    channels = channels.sort((a, b) => a.position - b.position)

    const friendRequestsList = friendRequests.map((friendRequest, i) => {
      const author = this.props.getUser(friendRequest.author.id)
      const target = this.props.getUser(friendRequest.target.id)
      if(author === undefined || target === undefined) { return null; }
      var user = author.id === loggedUser.id ? target : author;

      return (
        <div key={i} className="friendRequestEntry selectedColor" style={{ height: author.id === this.props.state.session.userID ? 117 : 81}}>
          <div className="flex">
            <img alt="" className="avatar marginleft2 margintop1" src={this.props.state.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.setSelectedUser(user.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
            <div className="white marginleft2 margintop1b">
              {user.username}
            </div>
          </div>
          {author.id === this.props.state.session.userID ? 
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
        <div key={i} className="friendEntry selectedColor" onContextMenu={(e) => { this.props.setSelectedUser(friend.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }>
          <div className="aligny fullheight">
            <img alt="" className="avatar marginleft2" src={this.props.state.fileEndpoint + "/" + friend.avatar}/>
            <div className="white marginleft2">
              {friend.username}
            </div>
          </div>
        </div>
      )
    });

    const serverList = Array.from(this.props.getOwnServers().values()).map((server, i) => {
      let serverName = server.name.length < 12 ? server.name : server.name.substring(0, 9) + "..."
      return (
        <div key={i}>
          <div className={this.props.state.selectedServer === server.id ? "white headerColor server selectedColor" : "white headerColor server"} onClick={() => { this.props.setSelectedServer(server.id); }} onContextMenu={(e) => { this.props.setSelectedServer(server.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(17); e.preventDefault(); e.stopPropagation(); } }>
            <img alt="" className="avatar4 marginright2" src={this.props.state.fileEndpoint + "/" + server.avatar}/>
            <div className="white text8">
              {serverName}
            </div>
          </div>
        </div>
      )
    });

    let voiceGroupChannel = voiceGroup !== -1 ? this.props.getChannel(voiceGroup.id) : undefined;
    let voiceGroupServer = voiceGroupChannel !== undefined ? this.props.getServer(voiceGroupChannel.server.id) : undefined;

    return (
      <div className="flex">
        <div className="servers headerColor" style={{ height: this.props.state.pageHeight - 83 - this.props.state.pageHeightOffset }}>
          <div className={this.props.state.channelTypes === 3 ? "white headerColor server2 selectedColor" : "white headerColor server2"} onClick={() => { this.props.switchChannelTypes(3) }}>
            Friends
          </div>
          <div className={this.props.state.channelTypes === 1 ? "white headerColor server2 selectedColor" : "white headerColor server2"} onClick={() => { this.props.switchChannelTypes(1) }}>
            DMs
          </div>
          {serverList}
          <div className="white headerColor server2" onClick={() => { this.props.switchDialogState(16) }}>
            + Server
          </div>
        </div>
        {this.props.state.channelTypes === 1 || this.props.state.channelTypes === 2 ?
        <div>
          <div className="channels headerColor" style={{ height: this.props.state.pageHeight - 83 - this.props.state.pageHeightOffset - (voiceGroup !== -1 ? 83 : 0) }}>
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
                  let userList = null;
                  if(voiceGroup !== -1 && voiceGroupChannel !== undefined && voiceGroupChannel.id === value.id) {
                    userList = voiceGroup.users.map((userID, i) => {
                      const user = this.props.getUser(userID)
          
                      return (
                        <div key={i} className="voiceUserEntry aligny">
                          <img alt="" className="avatar marginleft1" src={this.props.state.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.setSelectedUser(user.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
                          <div className="white headerColor marginleft2">
                            {user.username}
                          </div>
                        </div>
                      )
                    });
                  }

                  return (
                    <div key={index}>
                      <div {...props} className="white headerColor channel" style={{ backgroundColor: (voiceGroup !== -1 && voiceGroupChannel.id === value.id ? "#67b167" : "var(--color4)") }} onContextMenu={(e) => { this.props.setSelectedChannel(value.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(10); e.preventDefault(); e.stopPropagation(); } }>
                        .{channelName}
                      </div>
                      {userList}
                    </div>
                  )
              }

              return (
                <div {...props} key={index} className={this.props.state.currentChannel === value.id ? "white headerColor channel selectedColor" : "white headerColor channel"} onContextMenu={(e) => { this.props.setSelectedChannel(value.id); this.props.setBox(e.pageX, e.pageY); this.props.switchDialogState(10); e.preventDefault(); e.stopPropagation(); } }>
                  #{channelName}
                  {value.nsfw ?
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginTop: 20, marginLeft: -10 }}><path fill="currentColor" d="M21.025 5V4C21.025 2.88 20.05 2 19 2C17.95 2 17 2.88 17 4V5C16.4477 5 16 5.44772 16 6V9C16 9.55228 16.4477 10 17 10H19H21C21.5523 10 22 9.55228 22 9V5.975C22 5.43652 21.5635 5 21.025 5ZM20 5H18V4C18 3.42857 18.4667 3 19 3C19.5333 3 20 3.42857 20 4V5Z"></path></svg>
                  : ""}
                </div>
              )
              }}>
            </List>
            {this.props.state.channelTypes === 2 ?
              <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(1) }}>
              + Channel
              </div>
            : null}
          </div>
          {
            voiceGroup !== -1 && voiceGroupChannel !== undefined ?
            <div className="white chatColor vcInfo">
              <div className="white chatColor vcInfo2 prspace">
                <div className="flex vcInfo3 aligny">
                  <p className="white text1 margin0 marginleft2">Connected to </p>
                  <p className="tooltipColor text1 margin0">.{voiceGroupChannel.name}</p>
                </div>
                {
                  voiceGroupServer !== undefined ?
                  <div className="flex vcInfo3 aligny">
                    <p className="white text1 margin0 marginleft2">in </p>
                    <p className="tooltipColor text1 margin0">{voiceGroupServer.name}</p>
                  </div> :
                  <div className="flex vcInfo3 aligny">
                    <p className="white text1 margin0 marginleft2">??</p>
                  </div>
                }
              </div>
              <div className="white chatColor channel alignmiddle" onClick={() => { this.props.API.API_leaveVoiceChannel(voiceGroupChannel); }}>
                <p className="white declineColor text1">&gt; Disconnect</p>
              </div>
            </div> : null
          }
          </div>
        :
        <div className="channels headerColor" style={{ height: this.props.state.pageHeight - 78 - this.props.state.pageHeightOffset }}>
          {friendList}
          {friendRequestsList}
          <div className="white headerColor channel" onClick={() => { this.props.switchDialogState(7) }}>
            Add Friend
          </div>
        </div>}
        <div className="accountSettings chatColor aligny">
            <div className="account">
              <img alt="" className="marginleft2 avatar pointer" src={this.props.state.fileEndpoint + "/" + loggedUser.avatar} onContextMenu={(e) => { this.props.switchDialogState(4); this.props.setBox(e.pageX, e.pageY); e.preventDefault(); }} onClick={(e) => { this.props.switchDialogState(22); this.props.setBox(e.currentTarget.getBoundingClientRect().left, e.currentTarget.getBoundingClientRect().top - 20); e.preventDefault(); }}/>
              <div className="statusWrapper2 statusBorder">
                <div className="status2" style={{ backgroundColor: this.props.const.getStatusColor(loggedUser.status) }}/>
              </div>
              <div className="flex marginleft2">
                <div>
                  <div className="white text2b">{loggedUser !== undefined ? loggedUser.username : "Loading"}</div>
                  <div className="tooltipColor text4">{loggedUser !== undefined ? loggedUser.customStatus : "Loading"}</div>
                </div>
              </div>
            </div>
            <div className="button settingsButton marginleft2" style={{ width: 28, height: 28, position: "relative", transform: "scale(0.85)" }} onClick={() => { this.props.API.API_logout(); }}>
              <svg width="24" height="24" viewBox="0 0 24 24"><path strokeWidth="5" fill="none" d="M0 0h24v24H0z"/><path strokeWidth="5" d="M4 18h2v2h12V4H6v2H4V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3zm2-7h7v2H6v3l-5-4 5-4v3z" fill="rgba(255,97,97,1)"/></svg>
            </div>
            <div className="button settingsButton marginleft2" style={{ width: 28, height: 28, position: "relative", transform: "scale(0.85)" }} onClick={() => { this.props.switchDialogState(13) }}>
              <svg width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path></svg>
            </div>
          </div>
      </div>
    );
  }
}