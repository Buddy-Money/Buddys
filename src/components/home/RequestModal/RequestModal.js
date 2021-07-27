import React, { Component } from 'react';
import Donation from '../../entities/donation/Donation.js'
import {
  InputGroup,
  FormControl,
  Button,
  Figure
} from 'react-bootstrap'

class RequestModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      show: false,
      request: null,
      web3: null,
      index: -1,
      donationsListsForRequests: [],
      updateDonationAmount: null,
      updateDonationDescription: null,
      handleDonate: null
    }
  }

  render() {
    return (
      <div>
        <div className="card-header">
          <small className="text-muted">
            Requestor: {this.props.request.requestor}
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
          <small className="text-muted">
            Outstanding Donations: {
              this.props.web3.utils.fromWei(this.props.request.outstandingDonations.toString(), 'Ether')
            }
            {' '}ETH</small><br></br>
          <small className="text-muted">
            Accepted Donations: {
              this.props.web3.utils.fromWei(this.props.request.acceptedDonations.toString(), 'Ether')
            }
            {' '}ETH</small>
        </li>

        <li className="list-group-item">
          <InputGroup className="mb-3 input-div">
            <FormControl
              onChange={evt => this.props.updateDonationAmount(evt)}
              placeholder="Amount of Ether"
              aria-label="Amount of Ether"
            />
            <FormControl
              onChange={evt => this.props.updateDonationDescription(evt)}
              placeholder="Comment..."
              aria-label="Donation Description"
            />
            <InputGroup.Append>
              <Button
                variant="outline-primary"
                name={this.props.request.id}
                onClick={(event) => { this.props.handleDonate(event) }}>
                Donate!
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </li>

        {this.props.donationsListsForRequests[this.props.request.id - 1].length > 0 ?
          Array.from(this.props.donationsListsForRequests[this.props.request.id - 1]).map((donation, key) => {
            return (<ul key={key} id="donationsList" className="list-group list-group-flush">
              <li key={key} className="list-group-item">
                <Donation
                  donation={donation}
                  web3={this.props.web3}
                /></li>
            </ul>
            )
          }) : null}
      </div>
    );
  }
}

export default RequestModal;
