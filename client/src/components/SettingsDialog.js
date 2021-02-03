import React from 'react';

export default class SettingsDialog extends React.Component {
  state = {
    avatarChangeResult: 0,
    deletingEmotesEnabled: false
  };

  handleAvatar = async e => {
    if(e.target.files.length < 1) { return; }
    
    var file = e.target.files[0];
    e.target.value = ""
    const res = await this.props.API.endpoints["updateAvatar"](file, {}, {})
    this.setState({
      avatarChangeResult: res,
    });

    return true;
  }

  getConnection(icon, name, callback) {
    return <div className="connection chatColor">
    <div className="connectionSection1">
      <img className="connectionIcon" src={icon}/>
      <div className="connectionText">{name}</div>
    </div>
    <div className="connectionLink" onClick={() => { callback(); }}>
      <svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="rgba(255,85,85,1)"/></svg>
    </div>
  </div>
  }

  getConnectionButton(icon, name, link) {
    return <div className="connection chatColor">
    <div className="connectionSection1">
      <img className="connectionIcon" src={icon}/>
      <div className="connectionText">{name}</div>
    </div>
    <div className="connectionLink" onClick={() => { window.open(link, -1); }}>
      <svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 17h5v2h-3v3h-2v-5zM7 7H2V5h3V2h2v5zm11.364 8.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" fill="rgba(91,173,255,1)"/></svg>
    </div>
  </div>
  }

  render() {
    let loggedUser = this.props.functions.getUser(this.props.state.session.userID);

    let emotes = []
    loggedUser.emotes.forEach(emoteID => {
      if(this.props.state.emotes.has(emoteID)) {
        emotes.push(this.props.state.emotes.get(emoteID));
      }
    })

    let emoteList = emotes.map((emote, i) => {
      return <div key={i} className="emoteImage2 tooltipWrapper" onClick={() => { if(this.state.deletingEmotesEnabled) { this.props.API.endpoints["deleteEmote"]({ id: emote.id }); } }}>
          <img alt="" className="emoteImage2" src={this.props.state.fileEndpoint + "/" + emote.file} />
          {this.state.deletingEmotesEnabled ?
          <div className="emoteDeletionOverlay">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="rgba(255,255,255,1)"/></svg>
          </div>
          : ""}
          <span className="tooltipText">:{emote.name}:</span>
        </div>
    }, "")

    let connections = [];
    let connectionButtons = [];
    if(loggedUser.connections.github !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/ujDmtl.png", loggedUser.connections.github.username, () => { this.props.API.endpoints["removeConnection"]({ type: "gh" }); }))
    } else {
      connectionButtons.push(this.getConnectionButton("https://qtlamkas.why-am-i-he.re/ujDmtl.png", "Github", "https://github.com/login/oauth/authorize?client_id=91bcd730211830731d9a"));
    }
    if(loggedUser.connections.reddit !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/4LiOlB.png", loggedUser.connections.reddit.username, () => { this.props.API.endpoints["removeConnection"]({ type: "reddit" }); }))
    } else {
      connectionButtons.push(this.getConnectionButton("https://qtlamkas.why-am-i-he.re/4LiOlB.png", "Reddit", "https://www.reddit.com/api/v1/authorize?client_id=g8QfIB742iwMKw&response_type=code&state=a&redirect_uri=https://nekonetwork.net:8080/auth_reddit&duration=permanent&scope=identity"));
    }
    if(loggedUser.connections.osu !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/AJj49O.png", loggedUser.connections.osu.username, () => { this.props.API.endpoints["removeConnection"]({ type: "osu" }); }))
    } else {
      connectionButtons.push(this.getConnectionButton("https://qtlamkas.why-am-i-he.re/AJj49O.png", "Osu!", "https://osu.ppy.sh/oauth/authorize?client_id=4883&redirect_uri=https://nekonetwork.net:8080/auth_osu&response_type=code&scope=public"));
    }
    if(loggedUser.connections.twitch !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/VZ5PN5.png", loggedUser.connections.twitch.username, () => { this.props.API.endpoints["removeConnection"]({ type: "twitch" }); }))
    } else {
      connectionButtons.push(this.getConnectionButton("https://qtlamkas.why-am-i-he.re/VZ5PN5.png", "Twitch", "https://id.twitch.tv/oauth2/authorize?client_id=3oxkg8rjxqox7kkx4qu9b7d441mzse&redirect_uri=https://nekonetwork.net:8080/auth_twitch&response_type=code&scope=user:read:email"));
    }
    if(loggedUser.connections.spotify !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/XgHLDJ.png", loggedUser.connections.spotify.username, () => { this.props.API.endpoints["removeConnection"]({ type: "spotify" }); }))
    } else {
      connectionButtons.push(this.getConnectionButton("https://qtlamkas.why-am-i-he.re/XgHLDJ.png", "Spotify", "https://accounts.spotify.com/authorize?client_id=d10fc3159d9c4c3ea3c307df4b04ca43&redirect_uri=https://nekonetwork.net:8080/auth_spotify&response_type=code"));
    }
    if(loggedUser.connections.blizzard !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/3QuD8o.png", loggedUser.connections.blizzard.username, () => { this.props.API.endpoints["removeConnection"]({ type: "blizzard" }); }))
    } else {
      connectionButtons.push(this.getConnectionButton("https://qtlamkas.why-am-i-he.re/3QuD8o.png", "Blizzard", "https://us.battle.net/oauth/authorize?client_id=24428d45ed4b42448c9a33f1161585c5&redirect_uri=https://nekonetwork.net:8080&response_type=code&scope=openid"));
    }
    if(loggedUser.connections.discord !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/XfNe77.png", loggedUser.connections.discord.username, () => { this.props.API.endpoints["removeConnection"]({ type: "discord" }); }))
    } else {
      connectionButtons.push(this.getConnectionButton("https://qtlamkas.why-am-i-he.re/XfNe77.png", "Discord", "https://discord.com/api/oauth2/authorize?client_id=803587850762453072&redirect_uri=https://nekonetwork.net:8080/auth_discord&response_type=code&scope=identify"));
    }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox4">
          <div className="white text3 marginleft2b margintop1a">My Account</div>
          <div className="accountBox">
            <div className="flex">
              <form onSubmit={this.handleSubmit} className="flex margintop1">
                <img alt="" className="avatar2 margintop3 marginleft3" src={this.props.state.fileEndpoint + "/" + loggedUser.avatar} onMouseEnter={() => this.refs["userEditOverlay"].style = "display: flex;" }/>
                <label for="avatar-input">
                  <div className="avatar2 avatarOverlay avatarOverlay2 margintop3 marginleft3 alignmiddle" ref="userEditOverlay" onMouseLeave={() => this.refs["userEditOverlay"].style = "display: none;" }>
                    <div className="white text4 nopointerevents">Change Avatar</div>
                  </div>
                </label>
                <input id="avatar-input" className="hide" onChange={(e) => this.handleAvatar(e) } type='file' name="fileUploaded"/>
              </form>

              <div>
                <div className="margintop4 marginleft2b" style={{ height: 40 }}>
                  <p className="tooltipColor text6 margintop0 marginbot0">Username</p>
                  <p className="white text5 margintop0 margintop0b">{loggedUser.username}</p>
                </div>
                <div className="margintop1c marginleft2b" style={{ height: 40 }}>
                  <p className="tooltipColor text6 margintop0 marginbot0">Email</p>
                  {loggedUser.email == null ? 
                  <p className="text5 margintop0 margintop0b link" onClick={() => { this.props.functions.switchDialogState(14); }}>Set an email-</p>
                  : <p className="white text5 margintop0 margintop0b">{loggedUser.email}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="white text3 marginleft2b margintop1a">Emotes ({emotes.length})</div>
          <div className="flex marginleft2b">
            {emoteList}
            <div className="button2 marginright1 hover addEmoteButton alignmiddle chatColor" onClick={() => { this.props.functions.switchDialogState(20); }}>
              +
            </div>
            <div className="button2 hover addEmoteButton alignmiddle chatColor" onClick={() => { this.setState({ deletingEmotesEnabled: !this.state.deletingEmotesEnabled }) }}>
              -
            </div>
          </div>
          <div className="white text3 marginleft2b margintop1a">Connections</div>
          <div className="connections">
            {connections}
            {connectionButtons}
          </div>
        </div>
      </div>
    );
  }
}