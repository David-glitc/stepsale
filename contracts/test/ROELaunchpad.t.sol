// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Test} from "forge-std/Test.sol";
import {ROELaunchpad} from "../src/ROELaunchpad.sol";
import {ROEPresale} from "../src/roepresale.sol";
import {ROEToken} from "../src/roetoken.sol";

contract ROELaunchpadTest is Test {
    address alice=address(0xA11CE);address bob=address(0xB0B);address treasury=address(0x777);
    function setUp() public {vm.deal(alice,100 ether);vm.deal(bob,100 ether);vm.deal(address(this),100 ether);}
    function test_presaleFundedClaimAndPausedRefund() public {
        ROELaunchpad l=new ROELaunchpad();uint64 start=uint64(block.timestamp+60);
        vm.prank(alice);address addr=l.create(start,1 ether,10 ether,0.1 ether,5 ether,100 ether);ROEPresale p=ROEPresale(addr);
        assertEq(p.owner(),alice);assertEq(ROEToken(l.saleToken(addr)).balanceOf(addr),100 ether);
        vm.warp(start);vm.prank(bob);p.buyTokens{value:1 ether}();vm.warp(p.claimStart());vm.prank(bob);p.claim();assertEq(ROEToken(l.saleToken(addr)).balanceOf(bob),2 ether);
        start=uint64(vm.getBlockTimestamp()+60);vm.prank(alice);p=ROEPresale(l.create(start,2 ether,10 ether,0.1 ether,5 ether,100 ether));
        vm.warp(start);vm.prank(bob);p.buyTokens{value:1 ether}();vm.prank(alice);p.pause();vm.warp(p.claimStart());uint256 before=bob.balance;vm.prank(bob);p.refund();assertEq(bob.balance,before+1 ether);
    }
    function test_presaleRejectsOversoldAllocationAndRoundBoundary() public {
        ROELaunchpad l=new ROELaunchpad();uint64 start=uint64(block.timestamp+60);ROEPresale p=ROEPresale(l.create(start,1 ether,10 ether,0.1 ether,5 ether,1 ether));
        vm.warp(start);vm.prank(bob);vm.expectRevert("Allocation exceeded");p.buyTokens{value:1 ether}();
        vm.warp(start+1 days);assertEq(p.getCurrentRoundIndex(),1);vm.warp(start+3 days);vm.expectRevert();p.getCurrentRoundIndex();
    }
}
