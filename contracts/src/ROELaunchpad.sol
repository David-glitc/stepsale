// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ROEToken} from "./roetoken.sol";
import {ROEPresale} from "./roepresale.sol";

/// @notice Deploys fully funded instances of the user's original three-round ROE sale.
/// No sale or token is created until a creator chooses its terms.
contract ROELaunchpad {
    address[] public sales;
    mapping(address=>address) public saleToken;
    event SaleCreated(address indexed sale,address indexed token,address indexed creator);
    function create(uint64 start,uint256 softCap,uint256 hardCap,uint256 minContribution,uint256 maxContribution,uint256 allocation) external returns(address sale) {
        ROEToken token=new ROEToken();
        require(allocation<=token.TOTAL_SUPPLY(),"allocation exceeds supply");
        ROEPresale presale=new ROEPresale(address(token),start,softCap,hardCap,minContribution,maxContribution,allocation);
        token.setPresale(address(presale)); token.transfer(address(presale),allocation);
        token.transfer(msg.sender,token.balanceOf(address(this)));
        token.transferOwnership(msg.sender); presale.transferOwnership(msg.sender);
        sale=address(presale); sales.push(sale); saleToken[sale]=address(token); emit SaleCreated(sale,address(token),msg.sender);
    }
    function saleCount() external view returns(uint256){return sales.length;}
}
