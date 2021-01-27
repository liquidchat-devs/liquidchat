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
    switch(this.props.state.dialogState) {
      case 1:
        return <c.CreateChannelDialog state={this.props.state} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 2:
        return <c.MessageOptionsDialog state={this.props.state} API={this.props.API} switchDialogState={this.props.switchDialogState} startEditingMessage={this.props.startEditingMessage} copyID={this.copyID} setEditedMessage={this.props.setEditedMessage}/>

      case 3:
        return <c.CopiedIDDialog state={this.props.state} switchDialogState={this.props.switchDialogState} copiedID={this.state.copiedID}/>

      case 4:
        return <c.AccountOptionsDialog state={this.props.state} API={this.props.API} getUser={this.props.getUser} switchDialogState={this.props.switchDialogState} copyID={this.copyID} setSelectedUser={this.props.setSelectedUser}/>
        
      case 5:
        return <c.ProfileDialog state={this.props.state} setSelectedServer={this.props.setSelectedServer} setSelectedUser={this.props.setSelectedUser} getServer={this.props.getServer} getUser={this.props.getUser} const={this.props.const} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 6:
        return <c.ProfileOptionsDialog state={this.props.state} getChannel={this.props.getChannel} getServer={this.props.getServer} switchChannelTypes={this.props.switchChannelTypes} switchChannel={this.props.switchChannel} API={this.props.API} getUser={this.props.getUser} copyID={this.copyID} switchDialogState={this.props.switchDialogState}/>

      case 7:
        return <c.AddFriendsDialog state={this.props.state} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 8:
        return <c.ImageDialog state={this.props.state} isMenuOpen={false} switchDialogState={this.props.switchDialogState} setSelectedMessage={this.props.setSelectedMessage}/>

      case 9:
        return <c.ImageDialog state={this.props.state} isMenuOpen={true} switchDialogState={this.props.switchDialogState} copyID={this.copyID} setSelectedMessage={this.props.setSelectedMessage}/>

      case 10:
        return <c.ChannelOptionsDialog state={this.props.state} getChannel={this.props.getChannel} API={this.props.API} copyID={this.copyID} switchDialogState={this.props.switchDialogState} />

      case 11:
        return <c.EditChannelDialog state={this.props.state} getChannel={this.props.getChannel} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 12:
        return <c.InviteFriendsDialog state={this.props.state} setBox={this.props.setBox} getChannel={this.props.getChannel} getServer={this.props.getServer} selectedServer={this.props.selectedServer} getUser={this.props.getUser} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 13:
        return <c.SettingsDialog state={this.props.state} API={this.props.API} switchDialogState={this.props.switchDialogState} getUser={this.props.getUser}/>

      case 14:
        return <c.EditAccountDialog state={this.props.state}  API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 15:
        return <c.ForgottenPasswordDialog state={this.props.state}  API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 16:
        return <c.CreateServerDialog state={this.props.state} setSelectedAvatar={this.props.setSelectedAvatar} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 17:
        return <c.ServerOptionsDialog state={this.props.state} getServer={this.props.getServer} API={this.props.API} copyID={this.copyID} switchDialogState={this.props.switchDialogState}/>

      case 18:
        return <c.EditServerDialog state={this.props.state} setSelectedBanner={this.props.setSelectedBanner} setSelectedAvatar={this.props.setSelectedAvatar} getServer={this.props.getServer} API={this.props.API} switchDialogState={this.props.switchDialogState} />

      case 19:
        return <c.CropImageDialog state={this.props.state} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 20:
        return <c.CreateEmoteDialog state={this.props.state} type={1} setSelectedAvatar={this.props.setSelectedAvatar} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 21:
        return <c.CreateEmoteDialog state={this.props.state} type={0} setSelectedAvatar={this.props.setSelectedAvatar} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 22:
        return <c.AccountStatusDialog state={this.props.state} const={this.props.const} API={this.props.API} getUser={this.props.getUser} switchDialogState={this.props.switchDialogState} copyID={this.copyID} setSelectedUser={this.props.setSelectedUser}/>

      case 23:
        return <c.SetCustomStatusDialog state={this.props.state} getUser={this.props.getUser} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      case 24:
        return <c.ServerDiscoveryDialog state={this.props.state} getUser={this.props.getUser} API={this.props.API} switchDialogState={this.props.switchDialogState}/>

      default:
        return null;
    }
  }
}