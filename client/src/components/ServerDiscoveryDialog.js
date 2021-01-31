import React from 'react';

export default class ServerDiscoveryDialog extends React.Component {
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
      this.props.functions.switchDialogState(-1);
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
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox8">
          <div className="white text0 marginleft2 margintop1a">Server Discovery</div>
          <form onSubmit={this.handleSubmit} className="margintop1">
            <div className="margintop1" style={{ height: 40 }}>
              <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Popular</div>
            </div>
            <div className="margintop1" style={{ height: 40 }}>
              <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Anime</div>
            </div>
            <div className="margintop1" style={{ height: 40 }}>
              <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Games</div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}