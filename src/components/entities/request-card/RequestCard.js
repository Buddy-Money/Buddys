import React, { Component } from 'react';
import Card from 'react-bootstrap/Card'

class RequestCard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      request: null,
      web3: null,
      index: -1
    }
  }

  render() {
    return (
      <Card style={{ width: "18rem" }} key={this.props.index} className="box">
        <Card.Body>
          <Card.Title>{this.props.request.title}</Card.Title>
          <Card.Img variant="top" src={`https://ipfs.infura.io/ipfs/${this.props.request.hash}`} />
          <Card.Text className="text-left">{this.props.request.requestor}</Card.Text>
          <Card.Text className="text-left">{this.props.request.numDonations} Donations</Card.Text>
        </Card.Body>
      </Card>
    );
  }
}

export default RequestCard;