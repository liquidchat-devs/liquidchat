import React from 'react';

export default class SettingsDialog extends React.Component {
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

    return true;
  }

  render() {
    let loggedUser = this.props.getUser(this.props.session.userID);

    let emotes = []
    loggedUser.emotes.forEach(emoteID => {
      if(this.props.emotes.has(emoteID)) {
        emotes.push(this.props.emotes.get(emoteID));
      }
    })

    let emoteList = emotes.map((emote, i) => {
      return <div key={i} className="emoteImage2 tooltipWrapper">
          <img alt="" className="emoteImage2" src={this.props.fileEndpoint + "/" + emote.file} />
          <span className="tooltipText">:{emote.name}:</span>
        </div>
    }, "")

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox4">
          <div className="white text3 marginleft2b margintop1a">My Account</div>
          <div className="accountBox">
            <div className="flex">
              <form onSubmit={this.handleSubmit} className="flex margintop1">
                <img alt="" className="avatar2 margintop3 marginleft3" src={this.props.fileEndpoint + "/" + loggedUser.avatar} onMouseEnter={() => this.refs["userEditOverlay"].style = "display: flex;" }/>
                <label for="avatar-input">
                  <div className="avatar2 avatarOverlay avatarOverlay2 margintop3 marginleft3 alignmiddle" ref="userEditOverlay" onMouseLeave={() => this.refs["userEditOverlay"].style = "display: none;" }>
                    <div className="white text4 nopointer">Change Avatar</div>
                  </div>
                </label>
                <input id="avatar-input" className="hide" onChange={(e) => this.handleAvatar(e) } type='file' name="fileUploaded"/>
              </form>

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
          <div className="white text3 marginleft2b margintop1a">Emotes ({emotes.length})</div>
          <div className="flex marginleft2b">
            {emoteList}
            <div className="button2 addEmoteButton alignmiddle chatColor" onClick={() => { this.props.switchDialogState(20); }}>
              +
            </div>
          </div>
        </div>
      </div>
    );
  }
}