pragma solidity ^0.5.16;

contract Donator {
    //address private tokenAddress;
    int constant public maxEntries = 100000;

    uint256 public requestsCount = 0;
    mapping(uint256 => Request) public requests;

    uint256 public achievementsCount = 0;
    mapping(uint256 => Achievement) achievements;

    uint256 public donationsCount = 0;
    mapping(uint256 => Donation) public donations;

    struct Request {
        uint256 id;
        string hash;
        string title;
        string description;
        uint256 numDonations;
        uint256 totalDonationsAmount;
        uint256 outstandingDonations;
        uint256 acceptedDonations;
        address payable requester;
        bool active;
    }

    struct Achievement {
        uint256 id;
        string hash;
        string title;
        string description;
        uint256 requestId;
        address payable requester;
        bool active;
    }

    struct Donation {
        uint256 id;
        string description;
        uint256 amount;
        uint256 requestId;
        address payable donator;
        bool active;
    }

    constructor() public {
        //tokenAddress = _tokenAddress;
        //owner = msg.sender
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
            0,
            msg.sender,
            true
        );
    }

    function uploadAchievement(
        uint256 _requestId,
        string memory _hash,
        string memory _title,
        string memory _description
    ) public payable {
        require(
            _requestId > 0, "Invalid _achievementId"
        );

        require(
            requests[_requestId].requester == msg.sender,
            "Only the requester may upload Achievements to their Request."
        );

        achievementsCount++;

        // Set a spot in the mapping to a new Achievement
        achievements[achievementsCount] = Achievement(
            donationsCount,
            _hash,
            _title,
            _description,
            _requestId,
            msg.sender,
            true
        );
    }

    function donate(uint256 _requestId, string memory _description)
        public
        payable
    {
        require(
            requests[_requestId].active, "Requests Inactive"
        );

        Request memory _request = requests[_requestId];

        // Pay the smart contract. Funds come from a donator.
        address(this).transfer(msg.value);

        // Update the field on the Request
        _request.outstandingDonations += msg.value;
        _request.numDonations += 1;
        _request.totalDonationsAmount += msg.value;
        requests[_requestId] = _request;

        donationsCount++;

        // Set a spot in the mapping to a new Donation
        donations[donationsCount] = Donation(
            donationsCount,
            _description,
            msg.value,
            _requestId,
            msg.sender,
            true
        );
    }

    function receiveDonation(uint256 _donationId) public payable {
        require(
            donations[_donationId].active, "Donation Inactive"
        );

        Donation memory _donation = donations[_donationId];
        Request memory _request = requests[_donation.requestId];
        address payable _requester = _request.requester;

        // Ensure that the actor is the correct requester
        require(
            msg.sender == _requester,
            "Only the requester may receive the Donations of their Request."
        );

        // Pay the requester. Funds come from the smart contract.
        _request.requester.transfer(_donation.amount);

        // Update the fields on the Request
        _request.acceptedDonations += _donation.amount;
        _request.outstandingDonations -= _donation.amount;
        requests[_request.id] = _request;

        // Make the Donation inactive
        _donation.active = false;
        donations[_donation.id] = _donation;
    }
    
    function refundDonation(uint256 _donationId) public payable {
        require(
            donations[_donationId].active, "Donation Inactive"
        );
        
        Donation memory _donation = donations[_donationId];
                Request memory _request = requests[
            _donation.requestId
        ];
        
        // Ensure that the actor is the correct donator
        require(
            msg.sender == _donation.donator,
            "Only the donator may refund their Donation."
        );
        
        // Pay back the donator. Funds come from the smart contract.
        _donation.donator.transfer(_donation.amount);
        
        // Update the fields on the Request
        _request.outstandingDonations -= _donation.amount;
        _request.numDonations -= 1;
        requests[_request.id] = _request;
        
        // Make the Donation inactive
        _donation.active = false;
        donations[_donation.id] = _donation;
    }

    function deleteRequest(uint256 _requestId) private {
        // Make the Request inactive
        requests[_requestId].active = false;
    }
}
