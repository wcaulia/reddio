// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Disperse {
    function multicall(
        address[] calldata recipients, 
        uint256[] calldata values
    ) external payable {
        require(recipients.length == values.length, "Recipients and values length mismatch");

        uint256 sumValues = 0;
        for (uint256 i = 0; i < values.length; i++) {
            sumValues += values[i];
        }

        require(msg.value >= sumValues, "Insufficient Ether provided");

        // Transfer specified values to recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(values[i]);
        }

        // Refund any excess Ether to the sender
        uint256 refundAmount = msg.value - sumValues;
        if (refundAmount > 0) {
            payable(msg.sender).transfer(refundAmount);
        }
    }
}
