import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, Switch, Route, Redirect } from 'react-router-dom'
import Home from './Home';
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
              <Nav.Link as={Link} to="/home">Home</Nav.Link>
              <Nav.Link as={Link} to="/my-donations">My Donations</Nav.Link>
              <Nav.Link as={Link} to="/my-requests">My Requests</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route path="/home" component={Home} />
          <Route path="/my-donations" component={MyDonations} />
          <Route path="/my-requests" component={MyRequests} />
        </Switch>
      </div>
    );
  }
}

export default NavbarComponent;