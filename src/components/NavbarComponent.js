import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, Switch, Route } from 'react-router-dom'
import Home from './Home';
import DonationRequests from './DonationRequests';
import ReceiverRequests from './ReceiverRequests';

class NavbarComponent extends Component {

  render() {
    return (
      <div>
        <Navbar bg="dark" variant={"dark"} expand="lg">
          <Navbar.Brand href="#home">Donator</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/home">Home</Nav.Link>
              <Nav.Link as={Link} to="/donation-requests">Donation Requests</Nav.Link>
              <Nav.Link as={Link} to="/receiver-requests">Receiver Requests</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          <Route path="/home" component={Home} />
          <Route path="/donation-requests" component={DonationRequests} />
          <Route path="/receiver-requests" component={ReceiverRequests} />
        </Switch>
      </div>
    );
  }
}

export default NavbarComponent;