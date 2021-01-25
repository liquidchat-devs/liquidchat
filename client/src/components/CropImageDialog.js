import React from 'react';

export default class CropImageDialog extends React.Component {
  componentDidMount = () => {
    if(typeof this.props.state.selectedAvatar !== "string") {
      var reader = new FileReader();
      reader.onload = function(e) {
        this.refs["serverImage"].src = e.target.result;
      }.bind(this);

      reader.readAsDataURL(this.props.state.selectedAvatar);
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox5 alignmiddle">
          <div style={{ width: "90%", height: "90%", position: "relative" }}>
            <img alt="" className="avatar5" ref="serverImage" src={this.props.state.fileEndpoint + "/" + this.props.state.selectedAvatar}/>
            <div className="cropOverlay"></div>
          </div>
        </div>
      </div>
    );
  }
}