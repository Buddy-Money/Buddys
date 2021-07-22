import React, { Component } from 'react';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import './Main.css'

class Main extends Component {

  render() {
    return (
      <Container className="container">
        <p>&nbsp;</p>
        <h2>Request a Donation</h2>
        <form onSubmit={(event) => {
          event.preventDefault()
          const description = this.donationRequestDescription.value
          this.props.uploadDonationRequest(description)
        }} >
          <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.props.captureFile} />
          <div className="form-group mr-sm-2">
            <br></br>
            <textarea
              id="donationRequestDescription"
              ref={(input) => { this.donationRequestDescription = input }}
              className="form-control"
              placeholder="Description..."
              required />
          </div><br></br>
          <Button type="submit" className="btn btn-primary btn-block btn-lg submit-button">Submit!</Button>
        </form>
        <p>&nbsp;</p>
        {this.props.donationRequests.map((donationRequest, key) => {
          return (
            <div className="card mb-4" key={key} >
              <div className="card-header">
                <small className="text-muted">{donationRequest.receiverAddress}</small>
              </div>
              <ul id="donationRequestList" className="list-group list-group-flush">
                <li className="list-group-item">
                  <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${donationRequest.hash}`} style={{ maxWidth: '420px' }} /></p>
                  <p>{donationRequest.description}</p>
                </li>
                <li key={key} className="list-group-item py-2">
                  <small className="float-left mt-1 text-muted">
                    Donations: {window.web3.utils.fromWei(donationRequest.donationAmount.toString(), 'Ether')} ETH
                  </small></li>
                <li className="list-group-item">
                  <InputGroup className="mb-3 input-div">
                    <FormControl
                      ref={(input) => { this.donationAmount = input }}
                      placeholder="Amount of Ether"
                      aria-label="Amount of Ether"
                    />
                    <InputGroup.Append>
                      <Button
                        name={donationRequest.id}
                        onClick={(event) => {
                          let amount = this.donationAmount.value
                          let donationAmount = window.web3.utils.toWei(amount.toString(), 'Ether')
                          console.log(event.target.name, donationAmount)
                          this.props.donate(event.target.name, donationAmount)
                        }}>
                        Donate
                      </Button>
                    </InputGroup.Append>
                  </InputGroup>
                </li>
              </ul>
            </div>
          )
        })}
      </Container>
    );
  }
}

export default Main;