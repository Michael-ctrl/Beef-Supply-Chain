// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

interface OracleInterface {
    function requestData(uint256 requestId, bytes memory data) external;
}

abstract contract OracleClient {
    address _oracleAddr;

    uint256 _requestCounter = 0;

    constructor(address oracleAd) {
        _oracleAddr = oracleAd;
    }

    modifier oracleOnly() {
        require(msg.sender == _oracleAddr);
        _;
    }

    function requestDataFromOracle(bytes memory data)
        internal
        returns (uint256)
    {
        OracleInterface(_oracleAddr).requestData(++_requestCounter, data);
        return _requestCounter;
    }

    function receiveDataFromOracle(uint256 requestId, bytes memory data)
        public
        virtual;
}

abstract contract Oracle is OracleInterface {
    event request(uint256 requestId, address caller, bytes data);

    address public trustedServer;

    modifier trusted() {
        require(msg.sender == trustedServer);
        _;
    }

    constructor(address serverAddr) {
        trustedServer = serverAddr;
    }

    function requestData(uint256 requestId, bytes memory data) public override {
        emit request(requestId, msg.sender, data);
    }

    function replyData(
        uint256 requestId,
        address caller,
        bytes memory data
    ) public virtual trusted {
        OracleClient(caller).receiveDataFromOracle(requestId, data);
    }
}

contract TemperatureOracle is Oracle {
    constructor(address serverAddr) Oracle(serverAddr) {}
}

abstract contract TemperatureOracleClient is OracleClient {
    constructor(address oracleAd) OracleClient(oracleAd) {}

    function requestTemperatureFromOracle(
        string memory city1,
        string memory city2
    ) internal returns (uint256) {
        requestDataFromOracle(abi.encode(city1, city2));
        return _requestCounter;
    }

    function receiveDataFromOracle(uint256 requestId, bytes memory data)
        public
        override
        oracleOnly
    {
        (int256 temp1, int256 temp2) = abi.decode(data, (int256, int256));
        receiveTemperatureFromOracle(requestId, temp1, temp2);
    }

    function receiveTemperatureFromOracle(
        uint256 requestId,
        int256 temperature1,
        int256 temperature2
    ) internal virtual;
}
