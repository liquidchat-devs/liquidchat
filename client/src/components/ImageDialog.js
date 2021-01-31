import React from 'react';

export default class ImageDialog extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0) }}></div>
          <img alt="" className="absolutepos overlaybox3" src={this.props.state.selectedImage.link === undefined ? this.props.state.fileEndpoint + "/" + this.props.state.selectedImage.name : this.props.state.selectedImage.link}
          style={{ width: "auto", height: "auto", maxWidth: "90%", maxHeight: "90%", borderRadius: 0 }}
          onContextMenu={(e) => { this.props.functions.switchDialogState(9); this.props.functions.setBox(e.pageX, e.pageY); e.preventDefault(); }}
          onClick={(e) => { this.props.functions.switchDialogState(8); e.preventDefault(); }}
          />
          {this.props.isMenuOpen === true ?
            <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY, height: 40 }}>
              {this.props.elements.getContextButton("Copy Link", (e) => { this.props.functions.copyID(this.props.state.fileEndpoint + "/" + this.props.state.selectedImage.name); })}
              {this.props.elements.getContextButton("Open Link", (e) => { window.open(this.props.state.fileEndpoint + "/" + this.props.state.selectedImage.name); })}
            </div>
            : ""
          }
      </div>
    );
  }
}