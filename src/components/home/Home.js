import React, { Component } from 'react';
import Donator from '../../abis/Donator.json'
import Web3 from 'web3';
import Web3Modal from "web3modal";
import RequestCard from '../entities/request-card/RequestCard.js'
import './Home.css'
import {
  Container,
  Button,
  Modal
} from 'react-bootstrap'
import RequestModal from './RequestModal/RequestModal';

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
      loading: true,
      modal: false
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

  donate(id, donationDescription, expDateInUnixTime, donationAmount) {
    this.setState({ loading: true })
    this.state.donator.methods.donate(id, donationDescription, expDateInUnixTime).send({ from: this.state.account, value: donationAmount }).on('transactionHash', (hash) => {
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
    let expirationDate = new Date(this.state.expirationDate)
    let expirationDateInUnixTime = expirationDate / 1000;
    this.donate(evt.target.name, donationDescription, expirationDateInUnixTime, donationAmount)
  }

  toggleModal(event, key) {
    console.log(this.state.modal)
    let currentFlag = this.state.modal
    this.setState({
      modal: !currentFlag
    })

    let request = this.state.requests[event.target.name]

    return this.state.modal && (
      <RequestModal
        show={this.state.modal}
        request={request}
        web3={this.state.web3}
        index={key}
        donationsListsForRequests={this.state.donationsListsForRequests}
        updateDonationAmount={this.updateDonationAmount}
        updateDonationDescription={this.updateDonationDescription}
        updateDonationDescription={this.updateDonationDescription} />
    );
  }

  render() {
    if (this.state.loading) {
      return (<label className="text-center">Loading...</label>)
    }
    else {
      return (
        // Submit a new Request
        <Container className="container">
          <p>&nbsp;</p>
          <h2>Submit a new Request for Donations!</h2>
          <form onSubmit={(event) => {
            event.preventDefault()
            const description = this.requestDescription.value
            const title = this.requestTitle.value
            this.uploadRequest(title, description)
          }} >
            <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.captureFile} />
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

          {/* Cards */}
          {
            this.state.requests.map((request, key) => {
              return (
                <Button
                key={key}
                  name={request.id}
                  className="text-left"
                  variant="outline-primary"
                  onClick={(event) => { this.toggleModal(event, key) }}>
                  <RequestCard
                    request={request}
                    web3={this.state.web3}
                    index={key} />
                </Button>
              );
            })
          }
        </Container>
      );
    }
  }
}

export default Home;