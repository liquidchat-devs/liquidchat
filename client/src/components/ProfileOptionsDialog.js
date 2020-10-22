import React from 'react';

export default class ProfileOptionsDialog extends React.Component {
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
    let selectedUser = this.props.getUser(this.props.selectedUser);
    let currentChannel = this.props.getChannel(this.props.currentChannel)
    let currentServer = this.props.getServer(this.props.selectedServer)

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: selectedUser.id === this.props.session.userID ? 30 : 45  }}>
          <div className="button2 hover alignmiddle chatColor" onClick={() => { this.props.switchDialogState(5); }}>
            <p className="white text1">> Profile</p>
          </div>
          {
            selectedUser.id !== loggedUser.id && loggedUser.friends.includes(selectedUser.id) === false ?
            <div className="button2 hover alignmiddle chatColor" onClick={() => { this.sendFriendRequest(selectedUser.id); }}>
              <p className="white text1">> Add Friend</p>
            </div> :
            ""
          }
          {
            loggedUser.friends.includes(selectedUser.id) === true ?
            <div>
              <div className="button2 hover alignmiddle chatColor" onClick={() => { this.removeFriend(selectedUser.id); }}>
                <p className="declineColor text1">> Remove Friend</p>
              </div>
              <div className="button2 hover alignmiddle chatColor" onClick={() => { this.dmUser(selectedUser.id); }}>
                <p className="white text1">> Message</p>
              </div>
            </div> :
            ""
          }
          {
            currentChannel !== undefined && currentChannel.type === 2 && currentChannel.author.id === loggedUser.id && selectedUser.id !== loggedUser.id ?
            <div>
              <div className="button2 hover alignmiddle chatColor" onClick={() => { this.removeFromDMChannel(currentChannel.id , selectedUser.id); }}>
                <p className="declineColor text1">> Remove from group</p>
              </div>
            </div> :
            ""
          }
          {
            currentServer !== undefined && currentServer.author.id === loggedUser.id && selectedUser.id !== loggedUser.id ?
            <div>
              <div className="button2 hover alignmiddle chatColor" onClick={() => { this.removeFromServer(currentServer.id, selectedUser.id); }}>
                <p className="white text1">> Kick from server</p>
              </div>
            </div> :
            ""
          }
          <div className="button2 hover alignmiddle chatColor" onClick={() => { this.props.copyID(selectedUser.id); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}