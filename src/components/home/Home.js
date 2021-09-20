import React, { Component } from 'react';
import Donator from '../../abis/Donator.json'
import Web3 from 'web3';
import Web3Modal from "web3modal";
import Donation from '../entities/donation/Donation.js'
import Request from '../entities/request/Request.js'
import {
  InputGroup,
  FormControl,
  Button,
  Container,
  Form,
} from 'react-bootstrap'
import './Home.css'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class Home extends Component {

  constructor(state) {
    super(state)
    this.state = {
      web3: null,
      account: '',
      donator: null,
      requests: [],
      requestsCount: 0,
      donations: [],
      donationsCount: 0,
      donationsListsForRequests: [],
      donationAmount: 0,
      donationDescription: '',
      expirationDate: new Date(),
      loading: true
    }
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    const providerOptions = {
      /* See Provider Options Section */
    };

    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions
    });

    const provider = await web3Modal.connect();

    const web3 = new Web3(provider);

    this.setState({ web3: web3 })
  }

  async loadBlockchainData() {
    this.setState({ loading: true })
    const web3 = this.state.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Donator.networks[networkId]

    if (networkData) {
      const donator = new web3.eth.Contract(Donator.abi, networkData.address)
      this.setState({ donator })

      const requestsCount = await donator.methods.requestsCount().call()
      this.setState({ requestsCount })

      const donationsCount = await donator.methods.donationsCount().call()
      this.setState({ donationsCount })

      await this.buildRequestsList()
      await this.buildDonationsList()
      await this.buildDonationsListForEachRequest()

      this.setState({ loading: false })
    }
    else {
      window.alert('Donator contract not deployed to detected network.')
    }
  }

  /*
  * Build the list of Requests from the smart contract.
  */
  async buildRequestsList() {
    for (var i = 1; i <= this.state.requestsCount; i++) {
      const request = await this.state.donator.methods.requests(i).call()
      this.setState({
        requests: [...this.state.requests, request]
      })
    }

    // Sort requests. Show requests with the most donations first.
    this.setState({
      requests: this.state.requests.sort((a, b) => b.outstandingDonations - a.outstandingDonations)
    })
  }

  /*
  * Build the list of Donations from the smart contract.
  */
  async buildDonationsList() {
    for (var i = 1; i <= this.state.donationsCount; i++) {
      const donation = await this.state.donator.methods.donations(i).call()
      this.setState({
        donations: [...this.state.donations, donation]
      })
    }
  }

  /*
  * Build a separate list of Donations for each Request.
  */
  async buildDonationsListForEachRequest() {
    for (var i = 0; i < this.state.requestsCount; i++) {
      const list = await this.buildDonationsByRequestId(i + 1)
      this.setState({
        donationsListsForRequests: [...this.state.donationsListsForRequests, list]
      })
    }
  }

  /*
  * Used to build a list of Donations for a single Request.
  */
  async buildDonationsByRequestId(requestId) {
    let donations = []
    for (var i = 0; i < this.state.donationsCount; i++) {
      if (this.state.donations[i].requestId == requestId) {
        donations.push(this.state.donations[i])
      }
    }
    return donations
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  uploadRequest = (title, description) => {
    ipfs.add(this.state.buffer, (error, result) => {
      if (error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.donator.methods.uploadRequest(result[0].hash, title, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  donate(id, donationDescription, donationAmount) {
    this.setState({ loading: true })
    this.state.donator.methods.donate(id, donationDescription).send({ from: this.state.account, value: donationAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  updateDonationAmount(evt) {
    this.setState({
      donationAmount: evt.target.value
    });
  }

  updateDonationDescription(evt) {
    this.setState({
      donationDescription: evt.target.value
    });
  }

  updateExpirationDate(evt) {
    this.setState({
      expirationDate: evt.target.value
    });
  }

  handleDonate(evt) {
    let amount = this.state.donationAmount
    let donationDescription = this.state.donationDescription
    let donationAmount = this.state.web3.utils.toWei(amount.toString(), 'Ether')
    this.donate(evt.target.name, donationDescription, donationAmount)
  }

  render() {
    if (this.state.loading) {
      return (<label className="text-center">Loading...</label>)
    }
    else {
      return (
        <Container className="container">
          <p>&nbsp;</p>
          <h2>Submit a new Request for Donations!</h2>
          <form onSubmit={(event) => {
            event.preventDefault()
            const description = this.requestDescription.value
            const title = this.requestTitle.value
            this.uploadRequest(title, description)
          }} >
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Control type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.captureFile} />
            </Form.Group>
            <div className="form-group mr-sm-2">
              <br></br>
              <textarea
                id="requestTitle"
                ref={(input) => { this.requestTitle = input }}
                className="form-control"
                rows={1}
                placeholder=
                "Request Title: Make it short and sweet!"
                required />
            </div><br></br>
            <div className="form-group mr-sm-2">
              <textarea
                id="requestDescription"
                ref={(input) => { this.requestDescription = input }}
                className="form-control"
                rows={3}
                placeholder=
                "Describe how you can help the world with your Donations..."
                required />
            </div><br></br>
            <Button type="submit" className="btn btn-primary btn-block btn-lg submit-button">Submit!</Button>
          </form>
          <p>&nbsp;</p>

          {this.state.requests.map((request, key) => {
            return (
              <div className="card mb-4" key={key} >

                <ul id="requestList" className="list-group list-group-flush">
                  <Request
                    request={request}
                    web3={this.state.web3}
                  />

                  <li className="list-group-item">
                    <InputGroup className="mb-3 input-div">
                      <FormControl
                        onChange={evt => this.updateDonationAmount(evt)}
                        placeholder="Amount of Ether"
                        aria-label="Amount of Ether"
                      />
                      <FormControl
                        onChange={evt => this.updateDonationDescription(evt)}
                        placeholder="Comment..."
                        aria-label="Donation Description"
                      />
                      <InputGroup.Append>
                        <Button
                          variant="outline-primary"
                          name={request.id}
                          onClick={(event) => { this.handleDonate(event) }}>
                          Donate!
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </li>

                  <div className="donations-label">
                  </div>
                  {this.state.donationsListsForRequests[request.id - 1].length > 0 ?
                    Array.from(this.state.donationsListsForRequests[request.id - 1]).map((donation, key) => {
                      return (<ul key={key} id="donationsList" className="list-group list-group-flush">
                        <li key={key} className="list-group-item">
                          <Donation
                            donation={donation}
                            web3={this.state.web3}
                          /></li>
                      </ul>
                      )
                    }) : null}
                </ul>
              </div>
            )
          })}
        </Container>
      );
    }
  }
}

export default Home;