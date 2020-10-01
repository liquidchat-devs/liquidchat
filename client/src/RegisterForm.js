import React from 'react';
import Button from '@material-ui/core/Button';

export default class RegisterForm extends React.Component {
    state = {
      username: "",
      password: "",
      password2: "",
      clicked: false,
      registerResult: 0
    };
  
    handleChange = e => {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  
    handleSubmit = async e => {
      e.preventDefault();
      const res = await this.props.API.API_register(this.state.username, this.state.password, this.state.password2);
      this.setState({
        registerResult: res,
      });
    }
  
    getErrorText(code) {
      switch(code) {
        case -2:
          return "Passwords don't match-";
  
        case -1:
          return "Username already taken-";
  
        default:
          return "";
      }
    }
  
    render(){
      const form = (
        <form onSubmit={this.handleSubmit}  >
          <input className="inputfield1" name="username" type="text" placeholder="Username..." required={true} onChange={this.handleChange}  /><br />
          <input className="inputfield1 margintop1" name="password" type="password" placeholder="Password..." required={true} onChange={this.handleChange}  /><br />
          <input className="inputfield1 margintop1" name="password2" type="password" placeholder="Repeat password..." required={true} onChange={this.handleChange}  />
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
              className="button1" style={{ marginTop: 10 }}>Register</Button>
              <br />
              <Button
              variant="contained" 
              color="primary" 
              onClick={this.props.switchFormState}
              className="button1" style={{ marginTop: 5 }}>Login</Button>
              <br />
              <div className="panel1 margintop1 errorColor textcenter">
              {
                (this.getErrorText(this.state.registerResult).length > 0 ?
                <div className="margintop1 errorColor textcenter">
                  {this.getErrorText(this.state.registerResult)}
                </div>
                : "")
              }
              </div>
          </div>
        </div>
      );
    }
}