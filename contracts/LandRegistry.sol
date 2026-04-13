// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LandRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");

    struct Land {
        uint256 landId;
        string title;
        string location;
        uint256 areaSqFt;
        address payable owner;
        address registeredBy;
        bool isVerified;
        bool isForSale;
        uint256 salePrice;
        uint256 registeredAt;
        string documentHash;
    }

    struct TransferRequest {
        uint256 requestId;
        uint256 landId;
        address from;
        address to;
        uint256 requestedAt;
        bool isApproved;
        bool isRejected;
        string reason;
    }

    mapping(uint256 => Land) public lands;
    mapping(address => uint256[]) public ownerLands;
    mapping(uint256 => TransferRequest[]) public transferHistory;
    mapping(uint256 => uint256) private _transferRequestLand;
    uint256 public landCount;
    uint256 public transferRequestCount;

    event LandRegistered(uint256 indexed landId, address indexed owner, string title);
    event LandVerified(uint256 indexed landId, address indexed inspector);
    event LandListedForSale(uint256 indexed landId, uint256 price);
    event LandDelisted(uint256 indexed landId);
    event TransferRequested(uint256 indexed requestId, uint256 indexed landId, address from, address to);
    event TransferApproved(uint256 indexed requestId, uint256 indexed landId, address from, address to);
    event TransferRejected(uint256 indexed requestId, uint256 indexed landId, string reason);
    event LandSold(uint256 indexed landId, address from, address to, uint256 price);
    event DocumentUpdated(uint256 indexed landId, string newHash);

    modifier onlyLandOwner(uint256 landId) {
        require(lands[landId].landId != 0, "Land does not exist");
        require(lands[landId].owner == msg.sender, "Only current owner can call this function");
        _;
    }

    modifier landExists(uint256 landId) {
        require(lands[landId].landId != 0, "Land does not exist");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    /// @notice Register a new land parcel under the caller's ownership.
    /// @param title Title of the land parcel.
    /// @param location GPS coordinates as a string.
    /// @param areaSqFt Area in square feet.
    /// @param documentHash IPFS hash of the ownership document.
    function registerLand(
        string calldata title,
        string calldata location,
        uint256 areaSqFt,
        string calldata documentHash
    ) external onlyRole(REGISTRAR_ROLE) {
        require(bytes(title).length > 0, "Title is required");
        require(bytes(location).length > 0, "Location is required");
        require(areaSqFt > 0, "Area must be greater than zero");
        require(bytes(documentHash).length > 0, "Document hash is required");

        landCount++;
        uint256 landId = landCount;

        lands[landId] = Land({
            landId: landId,
            title: title,
            location: location,
            areaSqFt: areaSqFt,
            owner: payable(msg.sender),
            registeredBy: msg.sender,
            isVerified: false,
            isForSale: false,
            salePrice: 0,
            registeredAt: block.timestamp,
            documentHash: documentHash
        });

        ownerLands[msg.sender].push(landId);

        emit LandRegistered(landId, msg.sender, title);
    }

    /// @notice Verify a land parcel record.
    /// @param landId The identifier of the land parcel.
    function verifyLand(uint256 landId) external onlyRole(INSPECTOR_ROLE) landExists(landId) {
        require(!lands[landId].isVerified, "Land is already verified");

        lands[landId].isVerified = true;

        emit LandVerified(landId, msg.sender);
    }

    /// @notice List a verified land parcel for sale.
    /// @param landId The identifier of the land parcel.
    /// @param priceInWei Sale price in wei.
    function listForSale(uint256 landId, uint256 priceInWei) external onlyLandOwner(landId) landExists(landId) {
        Land storage land = lands[landId];
        require(land.isVerified, "Land must be verified before listing");
        require(priceInWei > 0, "Sale price must be greater than zero");

        land.isForSale = true;
        land.salePrice = priceInWei;

        emit LandListedForSale(landId, priceInWei);
    }

    /// @notice Remove a land parcel from sale.
    /// @param landId The identifier of the land parcel.
    function delistFromSale(uint256 landId) external onlyLandOwner(landId) landExists(landId) {
        Land storage land = lands[landId];
        require(land.isForSale, "Land is not listed for sale");

        land.isForSale = false;
        land.salePrice = 0;

        emit LandDelisted(landId);
    }

    /// @notice Request ownership transfer for a land parcel.
    /// @param landId The identifier of the land parcel.
    /// @param to Recipient address for transfer.
    /// @param reason Explanation for the transfer request.
    function requestTransfer(uint256 landId, address to, string calldata reason)
        external
        onlyLandOwner(landId)
        landExists(landId)
    {
        require(to != address(0), "Recipient address cannot be zero");
        require(to != msg.sender, "Recipient must be different from current owner");
        require(bytes(reason).length > 0, "Reason is required");

        uint256 requestId = transferRequestCount;
        transferRequestCount++;

        transferHistory[landId].push(
            TransferRequest({
                requestId: requestId,
                landId: landId,
                from: msg.sender,
                to: to,
                requestedAt: block.timestamp,
                isApproved: false,
                isRejected: false,
                reason: reason
            })
        );

        _transferRequestLand[requestId] = landId;

        emit TransferRequested(requestId, landId, msg.sender, to);
    }

    /// @notice Approve a pending transfer request and transfer ownership.
    /// @param requestId The identifier of the transfer request.
    function approveTransfer(uint256 requestId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(requestId < transferRequestCount, "Transfer request does not exist");

        uint256 landId = _transferRequestLand[requestId];
        TransferRequest[] storage requests = transferHistory[landId];
        bool found;
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].requestId == requestId) {
                require(!requests[i].isApproved, "Transfer request already approved");
                require(!requests[i].isRejected, "Transfer request already rejected");
                require(requests[i].from == lands[landId].owner, "Transfer request is no longer valid");

                requests[i].isApproved = true;
                found = true;
                _executeOwnershipTransfer(landId, payable(requests[i].from), requests[i].to);
                emit TransferApproved(requestId, landId, requests[i].from, requests[i].to);
                break;
            }
        }
        require(found, "Transfer request not found");
    }

    /// @notice Reject a transfer request.
    /// @param requestId The identifier of the transfer request.
    /// @param reason Reason for rejecting the request.
    function rejectTransfer(uint256 requestId, string calldata reason) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(requestId < transferRequestCount, "Transfer request does not exist");

        uint256 landId = _transferRequestLand[requestId];
        TransferRequest[] storage requests = transferHistory[landId];
        bool found;
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].requestId == requestId) {
                require(!requests[i].isApproved, "Transfer request already approved");
                require(!requests[i].isRejected, "Transfer request already rejected");

                requests[i].isRejected = true;
                requests[i].reason = reason;
                found = true;
                emit TransferRejected(requestId, landId, reason);
                break;
            }
        }
        require(found, "Transfer request not found");
    }

    /// @notice Buy a land parcel that is listed for sale.
    /// @param landId The identifier of the land parcel.
    function buyLand(uint256 landId) external payable nonReentrant landExists(landId) {
        Land storage land = lands[landId];
        require(land.isForSale, "Land is not for sale");
        require(msg.sender != land.owner, "Owner cannot buy their own land");
        require(msg.value == land.salePrice, "Incorrect payment amount");

        address payable seller = land.owner;
        uint256 price = land.salePrice;

        land.owner = payable(msg.sender);
        land.isForSale = false;
        land.salePrice = 0;

        _removeOwnerLand(seller, landId);
        ownerLands[msg.sender].push(landId);

        (bool sent, ) = seller.call{value: price}("");
        require(sent, "Payment to seller failed");

        emit LandSold(landId, seller, msg.sender, price);
    }

    /// @notice Update the document hash for a land parcel.
    /// @param landId The identifier of the land parcel.
    /// @param newHash New IPFS document hash.
    function updateDocumentHash(uint256 landId, string calldata newHash) external landExists(landId) {
        require(
            hasRole(REGISTRAR_ROLE, msg.sender) || lands[landId].owner == msg.sender,
            "Caller must be registrar or owner"
        );
        require(bytes(newHash).length > 0, "Document hash is required");

        lands[landId].documentHash = newHash;

        emit DocumentUpdated(landId, newHash);
    }

    /// @notice Get all land IDs owned by an address.
    /// @param owner Address to query.
    /// @return Array of land IDs.
    function getLandsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerLands[owner];
    }

    /// @notice Get transfer history for a land parcel.
    /// @param landId The identifier of the land parcel.
    /// @return Array of transfer requests.
    function getTransferHistory(uint256 landId)
        external
        view
        landExists(landId)
        returns (TransferRequest[] memory)
    {
        TransferRequest[] storage requests = transferHistory[landId];
        TransferRequest[] memory result = new TransferRequest[](requests.length);
        for (uint256 i = 0; i < requests.length; i++) {
            result[i] = requests[i];
        }
        return result;
    }

    /// @notice Get detailed land information.
    /// @param landId The identifier of the land parcel.
    /// @return The land struct.
    function getLandDetails(uint256 landId) external view landExists(landId) returns (Land memory) {
        return lands[landId];
    }

    function _executeOwnershipTransfer(
        uint256 landId,
        address payable currentOwner,
        address newOwner
    ) internal {
        Land storage land = lands[landId];
        land.owner = payable(newOwner);
        land.isForSale = false;
        land.salePrice = 0;

        _removeOwnerLand(currentOwner, landId);
        ownerLands[newOwner].push(landId);
    }

    function _removeOwnerLand(address owner, uint256 landId) internal {
        uint256[] storage owned = ownerLands[owner];
        for (uint256 i = 0; i < owned.length; i++) {
            if (owned[i] == landId) {
                owned[i] = owned[owned.length - 1];
                owned.pop();
                return;
            }
        }
        revert("Owner does not own this land");
    }
}
