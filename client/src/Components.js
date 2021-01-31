import React from 'react';
import * as c from './components/index';

export default class DialogManager extends React.Component {
  render() {
    switch(this.props.state.dialogState) {
      case 1:
        return <c.CreateChannelDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 2:
        return <c.MessageOptionsDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 3:
        return <c.CopiedIDDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 4:
        return <c.AccountOptionsDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />
        
      case 5:
        return <c.ProfileDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 6:
        return <c.ProfileOptionsDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 7:
        return <c.AddFriendsDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 8:
        return <c.ImageDialog state={this.props.state} isMenuOpen={false} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 9:
        return <c.ImageDialog state={this.props.state} isMenuOpen={true} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 10:
        return <c.ChannelOptionsDialog state={this.props.state}  API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 11:
        return <c.EditChannelDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 12:
        return <c.InviteFriendsDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 13:
        return <c.SettingsDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 14:
        return <c.EditAccountDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 15:
        return <c.ForgottenPasswordDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 16:
        return <c.CreateServerDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions}/>

      case 17:
        return <c.ServerOptionsDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 18:
        return <c.EditServerDialog state={this.props.state}  API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 19:
        return <c.CropImageDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 20:
        return <c.CreateEmoteDialog state={this.props.state} type={1} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 21:
        return <c.CreateEmoteDialog state={this.props.state} type={0} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 22:
        return <c.AccountStatusDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 23:
        return <c.SetCustomStatusDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      case 24:
        return <c.ServerDiscoveryDialog state={this.props.state} API={this.props.API} const={this.props.const} elements={this.props.elements} functions={this.props.functions} />

      default:
        return null;
    }
  }
}