import React from 'react';
import * as c from './components/index';

export default class DialogManager extends React.Component {
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
        return <c.CreateChannelDialog selectedServer={this.props.selectedServer} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 2:
        return <c.MessageOptionsDialog API={this.props.API} switchDialogState={this.props.switchDialogState} startEditingMessage={this.props.startEditingMessage}
        boxX={this.props.boxX} boxY={this.props.boxY} selectedMessage={this.props.selectedMessage} session={this.props.session} copyID={this.copyID} fileEndpoint={this.props.fileEndpoint} setEditedMessage={this.props.setEditedMessage}/>

      case 3:
        return <c.CopiedIDDialog switchDialogState={this.props.switchDialogState} boxX={this.props.boxX} boxY={this.props.boxY} copiedID={this.state.copiedID}/>

      case 4:
        return <c.AccountOptionsDialog API={this.props.API} getUser={this.props.getUser} switchDialogState={this.props.switchDialogState} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session} copyID={this.copyID} setSelectedUser={this.props.setSelectedUser}/>
        
      case 5:
        return <c.ProfileDialog API={this.props.API} fileEndpoint={this.props.fileEndpoint} switchDialogState={this.props.switchDialogState} session={this.props.session} selectedUser={this.props.selectedUser}/>

      case 6:
        return <c.ProfileOptionsDialog getChannel={this.props.getChannel} getServer={this.props.getServer} currentChannel={this.props.currentChannel} selectedServer={this.props.selectedServer} switchChannelTypes={this.props.switchChannelTypes} switchChannel={this.props.switchChannel} API={this.props.API} getUser={this.props.getUser} copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedUser={this.props.selectedUser} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session}/>

      case 7:
        return <c.AddFriendsDialog API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 8:
        return <c.ImageDialog isMenuOpen={false} fileEndpoint={this.props.fileEndpoint} selectedImage={this.props.selectedImage} switchDialogState={this.props.switchDialogState} setSelectedMessage={this.props.setSelectedMessage}/>

      case 9:
        return <c.ImageDialog isMenuOpen={true} fileEndpoint={this.props.fileEndpoint} selectedImage={this.props.selectedImage} switchDialogState={this.props.switchDialogState} copyID={this.copyID} boxX={this.props.boxX} boxY={this.props.boxY} setSelectedMessage={this.props.setSelectedMessage}/>

      case 10:
        return <c.ChannelOptionsDialog getChannel={this.props.getChannel} API={this.props.API} copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedChannel={this.props.selectedChannel} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session}/>

      case 11:
        return <c.EditChannelDialog selectedChannel={this.props.selectedChannel} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 12:
        return <c.InviteFriendsDialog fileEndpoint={this.props.fileEndpoint} getChannel={this.props.getChannel} getServer={this.props.getServer} selectedServer={this.props.selectedServer} getUser={this.props.getUser} session={this.props.session} selectedChannel={this.props.selectedChannel} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 13:
        return <c.SettingsDialog fileEndpoint={this.props.fileEndpoint} emotes={this.props.emotes} API={this.props.API} switchDialogState={this.props.switchDialogState} session={this.props.session} getUser={this.props.getUser}/>

      case 14:
        return <c.EditAccountDialog API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 15:
        return <c.ForgottenPasswordDialog API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 16:
        return <c.CreateServerDialog setSelectedAvatar={this.props.setSelectedAvatar} fileEndpoint={this.props.fileEndpoint} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 17:
        return <c.ServerOptionsDialog getServer={this.props.getServer} API={this.props.API} copyID={this.copyID} switchDialogState={this.props.switchDialogState} selectedServer={this.props.selectedServer} boxX={this.props.boxX} boxY={this.props.boxY} session={this.props.session}/>

      case 18:
        return <c.EditServerDialog emotes={this.props.emotes} setSelectedAvatar={this.props.setSelectedAvatar} fileEndpoint={this.props.fileEndpoint} getServer={this.props.getServer} selectedServer={this.props.selectedServer} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 19:
        return <c.CropImageDialog fileEndpoint={this.props.fileEndpoint} API={this.props.API} switchDialogState={this.props.switchDialogState} selectedAvatar={this.props.selectedAvatar}/>

      case 20:
        return <c.CreateEmoteDialog type={1} setSelectedAvatar={this.props.setSelectedAvatar} fileEndpoint={this.props.fileEndpoint} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 21:
        return <c.CreateEmoteDialog type={0} setSelectedAvatar={this.props.setSelectedAvatar} fileEndpoint={this.props.fileEndpoint} API={this.props.API} switchDialogState={this.props.switchDialogState} selectedServer={this.props.selectedServer}/>

      default:
        return null;
    }
  }
}