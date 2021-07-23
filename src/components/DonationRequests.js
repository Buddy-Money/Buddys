import React, { Component } from 'react';
import Donator from '../abis/Donator.json'
import Web3 from 'web3';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import './DonationRequests.css'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class DonationRequests extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Donator.networks[networkId]
    if (networkData) {
      const donator = new web3.eth.Contract(Donator.abi, networkData.address)
      this.setState({ donator })
      const donationRequestsCount = await donator.methods.donationRequestsCount().call()
      this.setState({ donationRequestsCount })

      for (var i = 1; i <= donationRequestsCount; i++) {
        const donationRequest = await donator.methods.donationRequests(i).call()
        this.setState({
          donationRequests: [...this.state.donationRequests, donationRequest]
        })
      }
      // Sort donationRequests. Show requests with the most donations first
      this.setState({
        donationRequests: this.state.donationRequests.sort((a, b) => b.donationAmount - a.donationAmount)
      })
      this.setState({ loading: false })
    } else {
      window.alert('Donator contract not deployed to detected network.')
    }
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

  uploadDonationRequest = description => {
    ipfs.add(this.state.buffer, (error, result) => {
      if (error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.donator.methods.uploadDonationRequest(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  donate(id, donationAmount) {
    this.setState({ loading: true })
    this.state.donator.methods.donate(id).send({ from: this.state.account, value: donationAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(state) {
    super(state)
    this.state = {
      account: '',
      donator: null,
      donationRequests: [],
      loading: true
    }

    this.uploadDonationRequest = this.uploadDonationRequest.bind(this)
    this.donate = this.donate.bind(this)
    this.captureFile = this.captureFile.bind(this)
  }

  render() {
    return (
      <Container className="container">
        <p>&nbsp;</p>
        <h2>Request a Donation</h2>
        <form onSubmit={(event) => {
          event.preventDefault()
          const description = this.donationRequestDescription.value
          this.uploadDonationRequest(description)
        }} >
          <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.captureFile} />
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
        {this.state.donationRequests.map((donationRequest, key) => {
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
                          this.donate(event.target.name, donationAmount)
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

export default DonationRequests;