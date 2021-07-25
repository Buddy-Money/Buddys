pragma solidity ^0.5.0;

contract Donator {
    string public name;

    uint256 public donationRequestsCount = 0;
    mapping(uint256 => DonationRequest) public donationRequests;

    uint256 public donationsCount = 0;
    mapping(uint256 => Donation) public donations;

    struct DonationRequest {
        uint256 id;
        string hash;
        string description;
        uint256 unclaimedDonations;
        uint256 claimedDonations;
        address payable receiverAddress;
    }

    struct Donation {
        uint256 id;
        string description;
        uint256 expirationDate;
        uint256 amount;
        uint256 donationRequestId;
        address payable donator;
    }

    constructor() public {
        name = "Donator";
    }

    function() external payable {}

    function uploadDonationRequest(
        string memory _hash,
        string memory _description
    ) public {
        require(bytes(_hash).length > 0);
        require(bytes(_description).length > 0);
        require(msg.sender != address(0));

        donationRequestsCount++;

        // Set a spot in the mapping to a new DonationRequest
        donationRequests[donationRequestsCount] = DonationRequest(
            donationRequestsCount,
            _hash,
            _description,
            0,
            0,
            msg.sender
        );
    }

    function donate(
        uint256 _donationRequestId,
        string memory _description,
        uint256 _expDateInUnixTime
    ) public payable {
        require(
            _donationRequestId > 0 &&
            _donationRequestId <= donationRequestsCount
        );

        DonationRequest memory _donationRequest = donationRequests[
            _donationRequestId
        ];

        // Pay the smart contract. Funds come from a donator.
        address(this).transfer(msg.value);

        // Update the field on the DonationRequest
        _donationRequest.unclaimedDonations += msg.value;
        donationRequests[_donationRequestId] = _donationRequest;

        donationsCount++;

        // Set a spot in the mapping to a new Donation
        donations[donationsCount] = Donation(
            donationsCount,
            _description,
            _expDateInUnixTime,
            msg.value,
            _donationRequestId,
            msg.sender
        );
    }

    function receiveDonation(uint256 _donationId) public payable {
        require(_donationId > 0 && _donationId <= donationsCount);

        Donation memory _donation = donations[_donationId];
        DonationRequest memory _donationRequest = donationRequests[
            _donation.donationRequestId
        ];
        address payable _receiverAddress = _donationRequest.receiverAddress;

        // Ensure that the actor is the correct receiver
        require(
            msg.sender == _receiverAddress,
            "The user must be the receiver of the Donation Request."
        );

        // Pay the receiver. Funds come from the smart contract.
        address(_donationRequest.receiverAddress).transfer(_donation.amount);

        // Update the fields on the DonationRequest
        _donationRequest.claimedDonations += _donation.amount;
        _donationRequest.unclaimedDonations -= _donation.amount;
        donationRequests[_donationRequest.id] = _donationRequest;

        delete (donations[_donationId]);
    }

    function refundDonation(uint256 _donationId) public payable {
        Donation memory _donation = donations[_donationId];
                DonationRequest memory _donationRequest = donationRequests[
            _donation.donationRequestId
        ];

        // Pay back the donator. Funds come from the smart contract.
        address(_donation.donator).transfer(_donation.amount);
        
        // Update the fields on the DonationRequest
        _donationRequest.unclaimedDonations -= _donation.amount;
        donationRequests[_donationRequest.id] = _donationRequest;

        delete (donations[_donationId]);
    }
}
