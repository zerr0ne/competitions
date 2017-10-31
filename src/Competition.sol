pragma solidity ^0.4.13;

import "erc20/erc20.sol";
import './DBC.sol';
import './SimpleCertifier.sol';

/// @title Competition Contract
/// @author Melonport AG <team@melonport.com>
/// @notice Register Melon funds in competition
contract Competition is DBC {

    // TYPES

    struct Hopeful { // Someone who wants to succeed or who seems likely to win
        address fund; // Address of the Melon fund
        address registrant; // Manager (== owner) of above Melon fund
        bool hasSigned; // Whether initial requirements passed and Hopeful signed Terms and Conditions; Does not mean Hopeful is competing yet
        address buyinAsset; // Asset (ERC20 Token) spent to take part in competition
        address payoutAsset; // Asset (usually Melon Token) to be received as prize
        uint buyinQuantity; // Quantity of buyinAsset spent
        uint payoutQuantity; // Quantity of payoutAsset received as prize
        bool isCompeting; // Whether outside oracle verified remaining requirements; If yes Hopeful is taking part in a competition
        uint finalSharePrice; // Performance of Melon fund at competition endTime; Can be changed for any other comparison metric
        uint finalCompetitionRank; // Rank of Hopeful at end of competition; Calculate by logic as set in terms and conditions
    }

    struct HopefulId {
      uint id; // Actual Hopeful Id
      bool exists; // Used to check if the mapping exists
    }

    // FIELDS

    // Constant fields
    uint public constant MAX_CONTRIBUTION_DURATION = 4 weeks; // Max amount in seconds of competition
    bytes32 public constant TERMS_AND_CONDITIONS = 0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad; // Hashed terms and conditions as displayed on IPFS.
    uint public MELON_BASE_UNIT = 10 ** 18;
    // Constructor fields
    address public oracle; // Information e.g. from Kovan can be passed to contract from this address
    address public melonport; // All deposited tokens will be instantly forwarded to this address.
    uint public startTime; // Competition start time in seconds (Temporarily Set)
    uint public endTime; // Competition end time in seconds
    uint public maxbuyinQuantity; // Limit amount of deposit to participate in competition
    uint public maxHopefulsNumber; // Limit number of participate in competition
    uint public prizeMoneyAsset; // Equivalent to payoutAsset
    uint public prizeMoneyQuantity; // Total prize money pool
    address public MELON_ASSET; // Adresss of Melon asset contract
    ERC20 public MELON_CONTRACT; // Melon as ERC20 contract
    SimpleCertifier public PICOPS; // Parity KYC verification contract
    // Methods fields
    Hopeful[] public hopefuls; // List of all hopefuls, can be externally accessed
    mapping (address => address) public registeredFundToRegistrants; // For fund address indexed accessing of registrant addresses
    mapping(address => HopefulId) public registrantToHopefulIds; // For registrant address indexed accessing of hopeful ids
    //EVENTS

    event Register(uint withId, address fund, address manager);

    // PRE, POST, INVARIANT CONDITIONS

    /// @dev Proofs that terms and conditions have been read and understood
    /// @param v ellipitc curve parameter v
    /// @param r ellipitc curve parameter r
    /// @param s ellipitc curve parameter s
    /// @return Whether or not terms and conditions have been read and understood
    function termsAndConditionsAreSigned(uint8 v, bytes32 r, bytes32 s) internal returns (bool) {
        return ecrecover(
            // Parity does prepend \x19Ethereum Signed Message:\n{len(message)} before signing.
            //  Signature order has also been changed in 1.6.7 and upcoming 1.7.x,
            //  it will return rsv (same as geth; where v is [27, 28]).
            // Note that if you are using ecrecover, v will be either "00" or "01".
            //  As a result, in order to use this value, you will have to parse it to an
            //  integer and then add 27. This will result in either a 27 or a 28.
            //  https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsign
            sha3("\x19Ethereum Signed Message:\n32", TERMS_AND_CONDITIONS),
            v,
            r,
            s
        ) == msg.sender; // Has sender signed TERMS_AND_CONDITIONS
    }

    /// @return Whether message sender is oracle or not
    function isOracle() internal returns (bool) { return msg.sender == oracle; }

    /// @dev Whether message sender is KYC verified through PICOPS
    /// @param x Address to be checked for KYC verification
    function isKYCVerified(address x) internal returns (bool) { return PICOPS.certified(x); }

    // CONSTANT METHODS

    function getMelonAsset() constant returns (address) { return MELON_ASSET; }

    /// @return Get HopefulId from registrant address
    function getHopefulId(address x) constant returns (uint) { return registrantToHopefulIds[x].id; }

    // NON-CONSTANT METHODS

    function Competition(
        address ofMelonAsset,
        address ofOracle,
        address ofSimpleCertifier,
        uint ofStartTime,
        uint ofEndTime,
        uint ofMaxbuyinQuantity,
        uint ofMaxHopefulsNumber
    ) {
        MELON_ASSET = ofMelonAsset;
        MELON_CONTRACT = ERC20(MELON_ASSET);
        oracle = ofOracle;
        PICOPS = SimpleCertifier(ofSimpleCertifier);
        startTime = ofStartTime;
        endTime = ofEndTime;
        maxbuyinQuantity = ofMaxbuyinQuantity;
        maxHopefulsNumber = ofMaxHopefulsNumber;
    }

    /// @notice Register to take part in the competition
    /// @param fund Address of the Melon fund
    /// @param buyinAsset Asset (ERC20 Token) spent to take part in competition
    /// @param payoutAsset Asset (usually Melon Token) to be received as prize
    /// @param buyinQuantity Quantity of buyinAsset spent
    /// @param v ellipitc curve parameter v
    /// @param r ellipitc curve parameter r
    /// @param s ellipitc curve parameter s
    function registerForCompetition(
        address fund,
        address buyinAsset,
        address payoutAsset,
        uint buyinQuantity,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        pre_cond(termsAndConditionsAreSigned(v, r, s) && isKYCVerified(msg.sender))
        pre_cond(registeredFundToRegistrants[fund] == address(0) && registrantToHopefulIds[msg.sender].exists == false)
        pre_cond(buyinAsset == MELON_ASSET && payoutAsset == MELON_ASSET)
        pre_cond(buyinQuantity <= maxbuyinQuantity && hopefuls.length <= maxHopefulsNumber)
    {
        registeredFundToRegistrants[fund] = msg.sender;
        registrantToHopefulIds[msg.sender] = HopefulId({id: hopefuls.length, exists: true});
        Register(hopefuls.length, fund, msg.sender);
        hopefuls.push(Hopeful({
          fund: fund,
          registrant: msg.sender,
          hasSigned: true,
          buyinAsset: buyinAsset,
          payoutAsset: payoutAsset,
          buyinQuantity: buyinQuantity,
          payoutQuantity: 0,
          isCompeting: false,
          finalSharePrice: 0,
          finalCompetitionRank: 0
        }));
    }

    /// @notice Initial oracle service, attests for fund sharePrice being one
    /// @dev Only the oracle can call this function
    /// @param withId Index of Hopeful to be attest for
    /// @param sharePrice sharePrice of the hopeful Fund
    function attestForHopeful(
        uint withId,
        uint sharePrice
    )
        pre_cond(isOracle())
        pre_cond(block.timestamp <= startTime)
        pre_cond(sharePrice == MELON_BASE_UNIT)
    {
        hopefuls[withId].isCompeting = true;
    }

    /// @notice Closing oracle service, inputs final stats and triggers payouts
    /// @dev Only the oracle can call this function
    /// @param withId Index of Hopeful to be attest for
    /// @param payoutQuantity Quantity of payoutAsset received as prize
    /// @param finalSharePrice Performance of Melon fund at competition endTime; Can be changed for any other comparison metric
    /// @param finalCompetitionRank Rank of Hopeful at end of competition; Calculate by logic as set in terms and conditions
    function finalizeAndPayoutForHopeful(
        uint withId,
        uint payoutQuantity, // Quantity of payoutAsset received as prize
        uint finalSharePrice, // Performance of Melon fund at competition endTime; Can be changed for any other comparison metric
        uint finalCompetitionRank // Rank of Hopeful at end of competition; Calculate by logic as set in terms and conditions
    )
        pre_cond(isOracle())
        pre_cond(block.timestamp >= endTime)
    {
        hopefuls[withId].finalSharePrice = finalSharePrice;
        hopefuls[withId].finalCompetitionRank = finalCompetitionRank;
        hopefuls[withId].payoutQuantity = payoutQuantity;
        require(MELON_CONTRACT.transfer(hopefuls[withId].registrant, payoutQuantity));
    }

}
