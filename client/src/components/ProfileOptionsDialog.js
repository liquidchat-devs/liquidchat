import React from 'react';

export default class ProfileOptionsDialog extends React.Component {
  sendFriendRequest(id) {
    this.props.API.endpoints["sendFriendRequest"]({ id: id });
  }

  removeFriend(id) {
    this.props.API.endpoints["removeFriend"]({ id: id });
  }

  removeFromDMChannel(channelID, userID) {
    this.props.API.endpoints["removeFromDMChannel"]({ channel: { id: channelID }, user: { id: userID } });
  }

  removeFromServer(serverID, userID) {
    this.props.API.endpoints["kickFromServer"]({ server: { id: serverID }, user: { id: userID }});
  }

  async dmUser(id) {
    var channel = await this.props.API.endpoints["getSuitableDMChannel"](id);
    if(channel !== undefined) {
      this.props.functions.switchDialogState(0);
      this.props.functions.switchChannelTypes(1);
      this.props.functions.switchChannel(channel.id);
    }
  }

  render() {
    let loggedUser = this.props.functions.getUser(this.props.state.session.userID);
    let selectedUser = this.props.functions.getUser(this.props.state.selectedUser);
    let currentChannel = this.props.functions.getChannel(this.props.state.currentChannel)
    let currentServer = this.props.functions.getServer(this.props.state.selectedServer)

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY, height: selectedUser.id === this.props.state.session.userID ? 30 : 45  }}>
          {this.props.elements.getContextButton("Profile", (e) => { this.props.functions.switchDialogState(5); })}
          {loggedUser.friends.includes(selectedUser.id) === true ? this.props.elements.getContextButton("Message", (e) => { this.dmUser(selectedUser.id); }) : ""}
          {selectedUser.id !== loggedUser.id && loggedUser.friends.includes(selectedUser.id) === false ? this.props.elements.getContextButton("Add Friend", (e) => { this.sendFriendRequest(selectedUser.id); }) : ""}
          {loggedUser.friends.includes(selectedUser.id) === true ? this.props.elements.getContextButton("Remove Friend", (e) => { this.removeFriend(selectedUser.id); }, "var(--color8)") : ""}
          {currentChannel !== undefined && currentChannel.type === 2 && currentChannel.author.id === loggedUser.id && selectedUser.id !== loggedUser.id ? this.props.elements.getContextButton("Remove from group", (e) => { this.removeFromDMChannel(currentChannel.id , selectedUser.id); }, "var(--color8)") : ""}
          {currentServer !== undefined && currentServer.author.id === loggedUser.id && selectedUser.id !== loggedUser.id ? this.props.elements.getContextButton("Kick from server", (e) => { this.removeFromServer(currentServer.id, selectedUser.id); }, "var(--color8)") : ""}
          {this.props.elements.getContextButton("Copy ID", (e) => { this.props.functions.copyID(selectedUser.id); })}
        </div>
      </div>
    );
  }
}