import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, Switch, Route } from 'react-router-dom'
import DonationRequests from './DonationRequests';
import MyDonations from './MyDonations';
import MyRequests from './MyRequests';

class NavbarComponent extends Component {

  render() {
    return (
      <div>
        <Navbar bg="dark" variant={"dark"} expand="lg">
          <Navbar.Brand href="#home">Donator</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/donation-requests">Donation Requests</Nav.Link>
              <Nav.Link as={Link} to="/my-donations">My Donations</Nav.Link>
              <Nav.Link as={Link} to="/my-requests">My Requests</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          <Route path="/donation-requests" component={DonationRequests} />
          <Route path="/my-donations" component={MyDonations} />
          <Route path="/my-requests" component={MyRequests} />
        </Switch>
      </div>
    );
  }
}

export default NavbarComponent;