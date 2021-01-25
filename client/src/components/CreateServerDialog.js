import React from 'react';

export default class CreateServerDialog extends React.Component {
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
          <div className="white text3 marginleft2 margintop1a">Create new server-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <img alt="" className="avatar2 marginleft4 marginright2" ref="serverImage" src={this.props.state.fileEndpoint + "/defaultAvatar.png"} onMouseEnter={() => this.refs["serverEditOverlay"].style = "display: flex;" }/>
            <div className="cropButton alignmiddle" onClick={() => { this.props.setSelectedAvatar(this.state.serverAvatar); this.props.switchDialogState(19) }}>
                <div className="white text7">Crop</div>
            </div>
            <label for="avatar-input">
              <div className="avatar2 avatarOverlay marginleft4 alignmiddle" ref="serverEditOverlay" onMouseLeave={() => this.refs["serverEditOverlay"].style = "display: none;" }>
                <div className="white text4 nopointerevents">Change Icon</div>
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