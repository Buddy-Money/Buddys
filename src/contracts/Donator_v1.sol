pragma solidity ^0.5.0;

contract Donator {
    string public name;

    uint256 public requestsCount = 0;
    mapping(uint256 => Request) public requests;

    uint256 public donationsCount = 0;
    mapping(uint256 => Donation) public donations;

    struct Request {
        uint256 id;
        string hash;
        string title;
        string description;
        uint256 numDonations;
        uint256 outstandingDonations;
        uint256 acceptedDonations;
        address payable requestor;
    }

    struct Donation {
        uint256 id;
        string description;
        uint256 expirationDate;
        uint256 amount;
        uint256 requestId;
        address payable donator;
    }

    constructor() public {
        name = "Donator";
    }

    function() external payable {}

    function uploadRequest(
        string memory _hash,
        string memory _title,
        string memory _description
    ) public {
        require(bytes(_hash).length > 0);
        require(bytes(_description).length > 0);
        require(msg.sender != address(0));

        requestsCount++;

        // Set a spot in the mapping to a new Request
        requests[requestsCount] = Request(
            requestsCount,
            _hash,
            _title,
            _description,
            0,
            0,
            0,
            msg.sender
        );
    }

    function donate(
        uint256 _requestId,
        string memory _description,
        uint256 _expDateInUnixTime
    ) public payable {
        require(
            _requestId > 0 &&
            _requestId <= requestsCount
        );

        Request memory _request = requests[
            _requestId
        ];

        // Pay the smart contract. Funds come from a donator.
        address(this).transfer(msg.value);

        // Update the field on the Request
        _request.outstandingDonations += msg.value;
        _request.numDonations += 1;
        requests[_requestId] = _request;

        donationsCount++;

        // Set a spot in the mapping to a new Donation
        donations[donationsCount] = Donation(
            donationsCount,
            _description,
            _expDateInUnixTime,
            msg.value,
            _requestId,
            msg.sender
        );
    }

    function receiveDonation(uint256 _donationId) public payable {
        require(_donationId > 0 && _donationId <= donationsCount);

        Donation memory _donation = donations[_donationId];
        Request memory _request = requests[
            _donation.requestId
        ];
        address payable _requestor = _request.requestor;

        // Ensure that the actor is the correct receiver
        require(
            msg.sender == _requestor,
            "The user must be the receiver of the Request."
        );

        // Pay the receiver. Funds come from the smart contract.
        address(_request.requestor).transfer(_donation.amount);

        // Update the fields on the Request
        _request.acceptedDonations += _donation.amount;
        _request.outstandingDonations -= _donation.amount;
        requests[_request.id] = _request;

        delete (donations[_donationId]);
    }

    function refundDonation(uint256 _donationId) public payable {
        Donation memory _donation = donations[_donationId];
                Request memory _request = requests[
            _donation.requestId
        ];

        // Pay back the donator. Funds come from the smart contract.
        address(_donation.donator).transfer(_donation.amount);
        
        // Update the fields on the Request
        _request.outstandingDonations -= _donation.amount;
        _request.numDonations -= 1;
        requests[_request.id] = _request;

        delete (donations[_donationId]);
    }
}
