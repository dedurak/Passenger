export class MyContracts {
    flightPlan_ADDR = "0xeA425418DFEdB87c0faf35D8Eab1Ad7F48D8c30c";
    flightPlan_ABI = [
        // functions
        "function issueFlight(string memory _from, string memory _to,  uint _status, string memory cid)",
        "function searchFlight( string memory _from, string memory _to) public view returns (string memory)",

        //events
        " event newFlightIssued(string _from, string _to, uint _status)"
    ];

    flightToken_ADDR = "0x997fA064833E7522f7CBE133c3a35cAe9ba0e8AE";
    flightToken_ABI = [
        // functions
        "function totalSupply() public view returns(uint256)",
        "function balanceOf(address owner) public view returns(uint256)",
        "function allowance(address owner,address spender) public view returns(uint256)",
        "function transfer(address to, uint256 value) public returns(bool)",
        "function approve(address spender, uint256 value) public returns(bool)",
        "function transferFrom(address from, address to, uint256 value ) public returns(bool)",
        "function increaseAllowance(address spender, uint256 addedValue) public returns(bool)",
        "function decreaseAllowance(address spender, uint256 subtractedValue) public returns(bool)",
        "function _mint(address account, uint256 amount)",
        "function _burn(address account, uint256 amount)",
        "function _burnFrom(address account, uint256 amount)",
        "function paymentHandlerCancelled(address cust, uint price)",
        "function paymentHandlerDelayed(address cust, uint dist)"
    ];

    inventory_ADDR = "0x6382d590557eC0Dce0C268cbda20e1C0C9dcEaBD";
    inventory_ABI = [
        // functions
        "function createInventory(string memory cid, string memory flightNumber, uint month, uint day, uint seats )",
        "function searchInventory(string memory flightNumber, uint month, uint day) public view returns(uint, uint, string)",
        "function flightBooked(uint index) public returns (bool)",
        "function compareStrings (string memory cmp1, string memory cmp2) private pure returns(bool)"
    ];

    pss_ADDR = "0x546E58eC1CeC1C0Ace2d461aDBeD7EF821A05785";
    pss_ABI = [
        "function createTicket(string memory cid, string memory flightNumber, uint month, uint day, uint256 price) public returns(bool)",
        "function changeFlightStatus(string memory flightNumber, uint month, uint day, uint _status) public returns(bool, uint)",
        "function getPassengerList(string memory flightNumber, uint month, uint day) public view returns(address[] memory)",
        "function getTickets() public view returns(string)",
        "function changePassengerStatus(uint _status, string memory flightNumber) public view returns(bool) ",
        "function compareStrings (string memory cmp1, string memory cmp2) private pure returns(bool)",
        "function concatStrings(string[] memory cids)",

        // events
         "event TicketIssued(address customer, string flightNumber, uint month, uint day)",
         "event FlightCreated(string flightNumber, uint month, uint day)",
         "event FlightStatusChanged(string flightNumber, uint month, uint day, uint status)",
         "event PassengerStatusChanged(address customer, string flightNumber, uint month, uint day, uint status)"
    ];

    getFlightPlanAddr() { return this.flightPlan_ADDR }
    getFlightPlanAbi() { return this.flightPlan_ABI }

    getFlightTokenAddr() { return this.flightToken_ADDR; }
    getFlightTokenAbi() { return this.flightToken_ABI}

    getInventoryAddr() { return this.inventory_ADDR; }
    getInventoryAbi() { return this.inventory_ABI; }

    getPssAddr() { return this.pss_ADDR; }
    getPssAbi() { return this.pss_ABI; }
}