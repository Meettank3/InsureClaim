// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract InsurancePolicy {
    struct Policy {
        uint256 policyId;
        string name;
        string description;
        uint256 premium; // in wei
        uint256 coverageAmount;
        uint256 duration; // in days
        bool active;
        uint256 createdAt;
    }

    uint256 public nextPolicyId = 1;
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256[]) public userPolicies;
    address public owner;

    event PolicyAdded(uint256 policyId, string name, uint256 premium);
    event PolicyPurchased(uint256 policyId, address user, uint256 premium);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function addPolicy(
        string memory _name,
        string memory _description,
        uint256 _premium,
        uint256 _coverageAmount,
        uint256 _duration
    ) public onlyOwner {
        policies[nextPolicyId] = Policy(
            nextPolicyId,
            _name,
            _description,
            _premium,
            _coverageAmount,
            _duration,
            true,
            block.timestamp
        );
        
        emit PolicyAdded(nextPolicyId, _name, _premium);
        nextPolicyId++;
    }

    function togglePolicyStatus(uint256 _policyId) public onlyOwner {
        require(_policyId > 0 && _policyId < nextPolicyId, "Invalid policy ID");
        policies[_policyId].active = !policies[_policyId].active;
    }

    function getAllActivePolicies() public view returns (Policy[] memory) {
        uint256 activeCount = 0;
        
        // Count active policies
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (policies[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active policies
        Policy[] memory activePolicies = new Policy[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (policies[i].active) {
                activePolicies[currentIndex] = policies[i];
                currentIndex++;
            }
        }
        
        return activePolicies;
    }
}

contract InsuranceClaim is InsurancePolicy {
    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address user;
        string reason;
        string description;
        uint256 requestedAmount;
        ClaimStatus status;
        uint256 submittedAt;
        uint256 processedAt;
        string adminNotes;
    }

    struct UserPolicy {
        uint256 policyId;
        address user;
        uint256 purchasedAt;
        uint256 expiresAt;
        bool active;
    }

    enum ClaimStatus { Pending, Approved, Rejected }

    uint256 public nextClaimId = 1;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public userClaims;
    mapping(uint256 => UserPolicy[]) public policyHolders;
    mapping(address => mapping(uint256 => bool)) public userOwnsPolicyId;

    event PolicyPurchased(uint256 policyId, address user, uint256 amount);
    event ClaimSubmitted(uint256 claimId, address user, uint256 policyId);
    event ClaimProcessed(uint256 claimId, ClaimStatus status, string adminNotes);

    function buyPolicy(uint256 _policyId) public payable {
        require(_policyId > 0 && _policyId < nextPolicyId, "Invalid policy ID");
        require(policies[_policyId].active, "Policy is not active");
        require(msg.value == policies[_policyId].premium, "Incorrect premium amount");
        require(!userOwnsPolicyId[msg.sender][_policyId], "User already owns this policy");

        uint256 expirationTime = block.timestamp + (policies[_policyId].duration * 1 days);
        
        policyHolders[_policyId].push(UserPolicy(
            _policyId,
            msg.sender,
            block.timestamp,
            expirationTime,
            true
        ));

        userPolicies[msg.sender].push(_policyId);
        userOwnsPolicyId[msg.sender][_policyId] = true;

        emit PolicyPurchased(_policyId, msg.sender, msg.value);
    }

    function submitClaim(
        uint256 _policyId,
        string memory _reason,
        string memory _description,
        uint256 _requestedAmount
    ) public {
        require(userOwnsPolicyId[msg.sender][_policyId], "User does not own this policy");
        require(policies[_policyId].active, "Policy is not active");
        require(_requestedAmount <= policies[_policyId].coverageAmount, "Requested amount exceeds coverage");

        claims[nextClaimId] = Claim(
            nextClaimId,
            _policyId,
            msg.sender,
            _reason,
            _description,
            _requestedAmount,
            ClaimStatus.Pending,
            block.timestamp,
            0,
            ""
        );

        userClaims[msg.sender].push(nextClaimId);
        emit ClaimSubmitted(nextClaimId, msg.sender, _policyId);
        nextClaimId++;
    }

    function processClaim(
        uint256 _claimId,
        ClaimStatus _status,
        string memory _adminNotes
    ) public onlyOwner {
        require(_claimId > 0 && _claimId < nextClaimId, "Invalid claim ID");
        require(claims[_claimId].status == ClaimStatus.Pending, "Claim already processed");

        claims[_claimId].status = _status;
        claims[_claimId].processedAt = block.timestamp;
        claims[_claimId].adminNotes = _adminNotes;

        if (_status == ClaimStatus.Approved) {
            // In a real implementation, transfer the approved amount to the user
            payable(claims[_claimId].user).transfer(claims[_claimId].requestedAmount);
        }

        emit ClaimProcessed(_claimId, _status, _adminNotes);
    }

    function getUserClaims(address _user) public view returns (Claim[] memory) {
        uint256[] memory claimIds = userClaims[_user];
        Claim[] memory userClaimsList = new Claim[](claimIds.length);
        
        for (uint256 i = 0; i < claimIds.length; i++) {
            userClaimsList[i] = claims[claimIds[i]];
        }
        
        return userClaimsList;
    }

    function getAllPendingClaims() public view onlyOwner returns (Claim[] memory) {
        uint256 pendingCount = 0;
        
        // Count pending claims
        for (uint256 i = 1; i < nextClaimId; i++) {
            if (claims[i].status == ClaimStatus.Pending) {
                pendingCount++;
            }
        }
        
        // Create array of pending claims
        Claim[] memory pendingClaims = new Claim[](pendingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < nextClaimId; i++) {
            if (claims[i].status == ClaimStatus.Pending) {
                pendingClaims[currentIndex] = claims[i];
                currentIndex++;
            }
        }
        
        return pendingClaims;
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {}
}