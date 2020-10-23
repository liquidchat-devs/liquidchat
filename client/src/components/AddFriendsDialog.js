import React from 'react';

export default class AddFriendsDialog extends React.Component {
  state = {
    friendUsername: "",
    friendRequestResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_sendFriendRequestByUsername(this.state.friendUsername);
    this.setState({
      friendRequestResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      case -1:
        return "You already sent a request to this user-";

      case -2:
        return "Nobody with this username found-";

      case -3:
        return "You can't send friend requests to yourself-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">Add a friend-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <input className="inputfield1 marginleft2" name="friendUsername" type="text" placeholder="Username..." required={true} onChange={this.handleChange} /><br />
          </form>
          <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Send request!</div>
          {
            (this.getErrorText(this.state.friendRequestResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.friendRequestResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}