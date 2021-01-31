import React from 'react';

export default class LoginForm extends React.Component {
    state = {
      username: "",
      password: "",
      clicked: false,
      loginResult: 0
    };
  
    componentDidMount = async() => {
      const res = await this.props.API.API_login("", "", "autologin");
      this.setState({
        loginResult: res,
      });
    }
  
    handleChange = e => {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  
    handleSubmit = async e => {
      e.preventDefault();
      const res = await this.props.API.API_login(this.state.username, this.state.password, "default");
      this.setState({
        loginResult: res,
      });
    }
  
    getErrorText(code) {
      switch(code) {
        case -3:
          return "Session expired-";
  
        case -2:
          return "User not found-";
        
        case -1:
          return "Invalid password-";
  
        case 0:
        default:
          return "";
      }
    }
  
    getSuccessText(code) {
      const user = this.props.functions.getUser(this.props.state.session.userID)
      switch(code) {
        case 0:
        case -3:
        case -2:
        case -1:
          return "";
  
        default:
          return "Logging in as " + (user !== undefined ? user.username : "Loading") + "...";
      }
    }
  
    render() {
      const form = (
        <form onSubmit={this.handleSubmit}  >
          <input className="inputfield1" name="username" type="text" autoComplete="username" placeholder="Username..." required={true} onChange={this.handleChange}  /><br />
          <input className="inputfield1 margin1" name="password" type="password" autoComplete="current-password" placeholder="Password..." required={true} onChange={this.handleChange}  />
        </form>
        );
      return (
        <div>
          <div className="absolutepos overlaybg"></div>
          <div className="absolutepos overlaybox0">
            <div style={{ width: "100%", padding: 24 }}>
              <div className="aligny marginbot2" style={{ height: 40 }}>
                <img alt="" className="avatar6 marginright2" src={this.props.state.fileEndpoint + "/defaultAvatar.png"}/>
                <div className="text0" style={{color: "white"}}>Login</div>
              </div>
              {form}
              <div className="margintop1" style={{ height: 40 }}>
                <div onClick={this.handleSubmit} className="button button1">Login!</div>
              </div>
              <div className="margintop1" style={{ height: 5 }}></div>
              <p className="text5 marginbot0 margintop0 link" onClick={() => { this.props.functions.switchFormState(); }}>Register?</p>
              {
                (this.getErrorText(this.state.loginResult).length > 0 ?
                <div className="margintop1 errorColor">
                  {this.getErrorText(this.state.loginResult)}
                </div>
                : (this.getSuccessText(this.state.loginResult).length > 0 ?
                <div className="margintop1 successColor">
                  {this.getSuccessText(this.state.loginResult)}
                </div>
                :
                ""))
              }
            </div>
          </div>
        </div>
      );
    }
}