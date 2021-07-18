pragma solidity ^0.5.0;

contract Donator {
  string public name;
  uint public donationCount = 0;
  mapping(uint => DonationRequest) public donationRequests;

  struct DonationRequest {
    uint id;
    string hash;
    string description;
    uint donationAmount;
    address payable receiverAddress;
  }

  event DonationRequestCreated(
    uint id,
    string hash,
    string description,
    uint donationAmount,
    address payable receiverAddress
  );

  event DonationRequestTipped(
    uint id,
    string hash,
    string description,
    uint donationAmount,
    address payable receiverAddress
  );

  constructor() public {
    name = "Donator";
  }

  function uploadDonationRequest(string memory hash, string memory _description) public {
    require(bytes(hash).length > 0);
    require(bytes(_description).length > 0);
    require(msg.sender!=address(0));

    donationCount ++;
    donationRequests[donationCount] = DonationRequest(donationCount, hash, _description, 0, msg.sender);
    emit DonationRequestCreated(donationCount, hash, _description, 0, msg.sender);
  }

  function donate(uint _id) public payable {
    require(_id > 0 && _id <= donationCount);

    DonationRequest memory _donationRequest = donationRequests[_id];

    address payable _receiverAddress = _donationRequest.receiverAddress;

    address(_receiverAddress).transfer(msg.value);

    _donationRequest.donationAmount = _donationRequest.donationAmount + msg.value;

    donationRequests[_id] = _donationRequest;

    emit DonationRequestTipped(_id, _donationRequest.hash, _donationRequest.description, _donationRequest.donationAmount, _receiverAddress);
  }
}
