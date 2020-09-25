import React from 'react';
import Button from '@material-ui/core/Button';

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
  
        default:
          return "";
      }
    }
  
    getSuccessText(code) {
      const user = this.props.getUser(this.props.session.userID)
      switch(code) {
        case -3:
        case -2:
        case -1:
          return "";
  
        default:
          return "Logging in as " + (user !== -1 ? user.username : "Loading") + "...";
      }
    }
  
    render() {
      const form = (
        <form onSubmit={this.handleSubmit}  >
          <input className="inputfield1" name="username" type="text" placeholder="Username..." required={true} onChange={this.handleChange}  /><br />
          <input className="inputfield1 margin1" name="password" type="password" placeholder="Password..." required={true} onChange={this.handleChange}  />
        </form>
        );
      return (
        <div className="margin1 alignmiddle">
          <div style={{width: 170 }}>
            {form}
              <Button
              variant="contained" 
              color="primary" 
              onClick={this.handleSubmit}
              className="button1" style={{ marginTop: 10 }}>Login</Button>
              <br />
              <Button
              variant="contained" 
              color="primary" 
              onClick={this.props.switchFormState}
              className="button1" style={{ marginTop: 5 }}>Register</Button>
              <br />
              {
                (this.getErrorText(this.state.loginResult).length > 0 ?
                <div className="margintop1 errorColor textcenter">
                  {this.getErrorText(this.state.loginResult)}
                </div>
                : (this.getSuccessText(this.state.loginResult).length > 0 ?
                <div className="margintop1 successColor textcenter">
                  {this.getSuccessText(this.state.loginResult)}
                </div>
                :
                ""))
              }
            </div>
        </div>
      );
    }
}