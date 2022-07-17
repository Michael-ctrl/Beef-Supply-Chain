// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./oracle.sol";

contract UserApp is TemperatureOracleClient {
    int256 public temperature1;
    int256 public temperature2;

    constructor(address oracleAd) TemperatureOracleClient(oracleAd) {}

    function getTemperature(string calldata city1, string calldata city2)
        public
    {
        requestTemperatureFromOracle(city1, city2);
    }

    function receiveTemperatureFromOracle(
        uint256 requestId,
        int256 _temperature1,
        int256 _temperature2
    ) internal override {
        temperature1 = _temperature1;
        temperature2 = _temperature2;
    }
}
