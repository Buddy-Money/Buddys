import React, { Component } from 'react';
import Figure from 'react-bootstrap/Figure'

class Request extends Component {

  constructor(props) {
    super(props)
    this.state = {
      request: null,
      web3: null
    }
  }

  render() {
    return (
      <div>
        <div className="card-header">
          <label>
            {this.props.request.title}
          </label><br></br>
          <small className="text-muted">
          Requester: {this.props.request.requester}
          </small>
        </div>
        <li className="list-group-item">
          <div className="text-center">
            <Figure>
              <Figure.Image
                src={`https://ipfs.infura.io/ipfs/${this.props.request.hash}`}
                style={{ maxWidth: '650px' }} alt="" />
            </Figure>
          </div>
          <p>{this.props.request.description}</p>
          <label className="text-bold">
            {this.props.request.numDonations} Donations
          </label><br></br>
          <small className="text-muted">
            Outstanding: {
              this.props.web3.utils.fromWei(this.props.request.outstandingDonations.toString(), 'Ether')
            }
            {' '}ETH</small><br></br>
          <small className="text-muted">
            Accepted: {
              this.props.web3.utils.fromWei(this.props.request.acceptedDonations.toString(), 'Ether')
            }
            {' '}ETH</small>
        </li>
      </div>
    );
  }
}

export default Request;