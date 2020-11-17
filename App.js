import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, TextInput, Linking } from 'react-native';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { ScrollView } from 'react-native-gesture-handler';
import { Calendar } from 'react-native-calendars';
import { MyStyles} from './styles/myStyles';
import { WalletUtiils, WalletMethods, Contracts } from './utils/walletUtils';
import { MyContracts } from './utils/myContracts';
import { Backend } from './utils/backend';
import { getJSON, setJSON } from './utils/IPFS';
import { Dialog, DialogContent, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import { Entypo, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';


/**
 * GLOBAL VARS
 * @param projectID infura project id
 * @param airLineAddress the address of the airline (necessary for the payment)
 * @param provider the infura node required for communication with the blockchain
 * @param styles the css styles
 * @param _walletUtils all utils to create a wallet
 * @param flightToken contract instance of the token contract - necessary for payments
 * @param flightPlan contract instance for flight search contract
 * @param invContract instance to InventoryContract
 * @param pssInstance instance to PassengerSystem contract
 * @param signer represents the wallet
 * @param _walletMethods necessary for wallet creation
 * @param contracts access to the addr and abi of the contracts
 */
const projectID = "0211650106d841af86d75c8707e6e87b";
const airLineAddress = "0xf600CdC62b5259Ce70C9398406d4775c9306Fa37";
const mBackend = new Backend();
const provider = new ethers.providers.InfuraProvider("rinkeby", projectID);
const _styles = new MyStyles();
const _walletUtils = new WalletUtiils();
const funcContracts = new Contracts();
var flightTokenBuf;
var flightPlanBuf;
var invContractBuf;
var pssInstanceBuf;
var signer;
var _walletMethods;
const contracts = new MyContracts();

const StackBooking = createStackNavigator();
const StackTickets = createStackNavigator();
const Tab = createBottomTabNavigator();


// to change the hex value from token contract to decimal number
const hexToDec = (hex) => {
  var result = parseInt(hex, 16);
  console.log("Result token, ", result);
  setToken(result);
}

/**
// loginscreen
const LoginScreen = ({ navigation }) => {

  const bip39Url = "https://iancoleman.io/bip39/";
  const [ loginDialog, setLoginDialog ] = useState(false);
  const [ dialogText, setDialogText ] = useState("Logging in...");

  const openBip39Url = async () => {
    await Linking.openURL(bip39Url);
  }

  const createWallet = () => { 
    setLoginDialog(true);
    _walletUtils.setParams();
    setDialogText("Wallet created...")
    setTimeout(() => {
      _walletMethods = new WalletMethods(_walletUtils.getPrivateKey(), provider);
      signer = _walletMethods.getWallet(); 
      setupContracts();
    }, 1000);
  }

  const setupContracts = () => {

    setDialogText("Creating Contracts...");

    setTimeout(() => {
      flightToken = _walletMethods.createContractInstance(
        contracts.getFlightTokenAddr(), 
        contracts.getFlightTokenAbi(), 
        signer);

      flightPlan = _walletMethods.createContractInstance(
        contracts.getFlightPlanAddr(), 
        contracts.getFlightPlanAbi(), 
        signer);

      pssInstance = _walletMethods.createContractInstance(
        contracts.getPssAddr(),
        contracts.getPssAbi(),
        signer);

      invContract = _walletMethods.createContractInstance(
        contracts.getInventoryAddr(),
        contracts.getInventoryAbi(),
        signer);
    
      setLoginDialog(false);
      setDialogText("Logging in...");
  
      console.log("flightPlan: ", flightPlan);
      console.log("invContract: ", invContract);
      console.log("PssInstance: ", pssInstance);
      console.log("Flight2Token: ", flightToken);
    
      navigation.navigate("Portal")}, 1000);
  }

  return (

    <ScrollView style={{backgroundColor: "white", flex: 1}}>
      <View style={_styles.styles.containerFlightScreen}>
        
        <Text style={{ fontSize: 30, textAlign: "center", marginTop: 50, color: "blue"}}>Fly with Token</Text>

        <Text style={{ fontSize: 20, textAlign: "center", margin: 5, color: "blue"}}>Book your flight with FLY Coin</Text>

        <Text style={{ fontSize: 20, textAlign: "center", margin: 5, color: "blue"}}>Manage your booked flights</Text>

        <Text style={{ fontSize: 15, textAlign: "center", marginTop: 45, color: "blue"}}>Enter your mnemonic:</Text>

        <TextInput onChangeText={ (value) => {_walletUtils.setMnemonic(value);}} style={_styles.styles.textInputBox}/>

        <TouchableOpacity style={{width: 300, height:40, margin:10, backgroundColor: '#000F64'}}
                          onPress={ () => { setLoginDialog(true); setTimeout(() => {createWallet()}, 1000) }}>
          <Text style={{color:"#fff", fontSize: 15, textAlign: "center", margin: 10}}>Create new Address</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 12, textAlign: "center", margin: 5, width: 400}}>
          An mnemonic represents your digital wallet. This Wallet is necessary for any activities inside the app!
          There is no further personal data necessary! The Wallet signs the transactions and proves that you are YOU!
          Never lose your mnemonic and save it safely! Link to BIP39 creator: </Text>
        <TouchableOpacity style={{backgroundColor:"grey", fontSize: 14, fontStyle: "italic"}} onPress={() => {openBip39Url()}}> 
          <Text style={{color: "white", padding:2}}>BIP39</Text> 
        </TouchableOpacity>

        </View>
        <Dialog visible={loginDialog}>
          <DialogContent>
            <Text>{dialogText}</Text>
          </DialogContent>
        </Dialog>
      </ScrollView>
  );
}
 */

 // main menu
const MainMenuScreen = ({ navigation }) => {

  const [loggedin, setLoggedin] = useState(false);
  const [loginDialog, setLoginDialog] = useState(false);
  const [loggingInDialog, setLoggingInDialog] = useState(false);
  const bip39Url = "https://iancoleman.io/bip39/";
  const [ dialogText, setDialogText ] = useState("Logging in...");

  const openBip39Url = async () => {
    await Linking.openURL(bip39Url);
  }

  const createWallet = () => { 
    _walletUtils.setParams();
    setDialogText("Wallet created...")
    setTimeout(() => {
      _walletMethods = new WalletMethods(_walletUtils.getPrivateKey(), provider);
      signer = _walletMethods.getWallet();
      setLoggedin(true);
      setupContracts();
    }, 1000);
  }

  const setupContracts = () => {

    setDialogText("Creating Contracts...");

    setTimeout(() => {
      funcContracts.setFlightToken(_walletMethods.createContractInstance(
        contracts.getFlightTokenAddr(), 
        contracts.getFlightTokenAbi(), 
        signer));

      funcContracts.setFlightPlanContract(_walletMethods.createContractInstance(
        contracts.getFlightPlanAddr(), 
        contracts.getFlightPlanAbi(), 
        signer));

      funcContracts.setPssInstance(_walletMethods.createContractInstance(
        contracts.getPssAddr(),
        contracts.getPssAbi(),
        signer));

      funcContracts.setInvContract(_walletMethods.createContractInstance(
        contracts.getInventoryAddr(),
        contracts.getInventoryAbi(),
        signer));
    
      setLoggingInDialog(false);
      setDialogText("Logging out...");
  
      console.log("flightPlan: ", funcContracts.getFlightPlanContract());
      console.log("invContract: ", funcContracts.getInvContract());
      console.log("PssInstance: ", funcContracts.getPssInstance());
      console.log("Flight2Token: ", funcContracts.getFlightToken());
    }, 1000);
  }


  const goTicket = () => {
    // first search all tickets booked with this address inside the passenger system
    pssInstance.getTickets().then( (res) => {console.log(res); if(res != "") handleTicketData(res)})
  }

  const handleTicketData = async (result) => {

    mBackend.cleanMyValues();

    const splitResult = result.split("_");

    console.log("SplitResult: ", splitResult);

    var ipfsData = await getJSON(splitResult[0]);
    mBackend.setMyName(ipfsData["name"]);
    mBackend.setMySurname(ipfsData["surname"]);
    mBackend.setMyBDate(ipfsData["birthDate"]);
    mBackend.setMyFlight(ipfsData["flightNumber"]);
    mBackend.setMyFrom(ipfsData["from"]);
    mBackend.setMyTo(ipfsData["to"]);
    mBackend.setMyDepTime(ipfsData["departureTime"]);
    mBackend.setMyArrTime(ipfsData["arrivalTime"]);
    mBackend.setMyFlightDate(ipfsData["flightDate"]);

    console.log("IPFS: ", ipfsData);

    if(splitResult.length>0) {
      for(var i = 1; i<splitResult.length; i++) {
        ipfsData = await getJSON(splitResult[i]);
        
        mBackend.setMyName(ipfsData["name"]);
        mBackend.setMySurname(ipfsData["surname"]);
        mBackend.setMyBDate(ipfsData["birthDate"]);
        mBackend.setMyFlight(ipfsData["flightNumber"]);
        mBackend.setMyFrom(ipfsData["from"]);
        mBackend.setMyTo(ipfsData["to"]);
        mBackend.setMyDepTime(ipfsData["departureTime"]);
        mBackend.setMyArrTime(ipfsData["arrivalTime"]);
        mBackend.setMyFlightDate(ipfsData["flightDate"]);
      }
    }

    navigation.navigate("My Flights")
  }

  return (
    <ScrollView style={{ marginTop:60}}>

      {!loggedin?<TouchableOpacity style={{backgroundColor: "green", width: 50, margin: 10, padding: 5, alignItems: "center", alignItems: "flex-start"}}
          onPress= {() => {
            setLoginDialog(true);
          }}>
            <Entypo name="login" size={24} color="white"/>
            <Text style={{color:"white"}}>Login</Text>
          </TouchableOpacity>:null}

      {loggedin?<TouchableOpacity style={{backgroundColor: "red", width: 60, margin: 10, padding: 5, alignItems: "center", alignItems: "flex-end"}}
          onPress= {() => {
            setLoggingInDialog(true);
            setTimeout(() => {signer = null; // set signer to null
            _walletUtils.clearParams(); // delete all params
            console.log("WalletParams: ", _walletMethods)
            _walletMethods.clearParams(); // clear wallet o null
            }, 1000);
            setDialogText("Logging in ...");
            setLoggedin(false);
          }}>
            <Entypo name="log-out" size={24} color="white"/>
            <Text style={{color: "white"}}>Logout</Text>
          </TouchableOpacity>:null}

          <Dialog visible={loginDialog}
              footer={
                <DialogFooter>
                  <DialogButton text="Cancel" onPress={() => setLoginDialog(false)}/>
                  <DialogButton text="Login" onPress={() => { setLoginDialog(false); setLoggingInDialog(true); setTimeout(() => createWallet(), 1000);}}/>
                </DialogFooter>
              }>
            <DialogContent>
              <Text style={{ fontSize: 12, textAlign: "center", margin: 5, width: 300}}>
                An mnemonic represents your digital wallet. This Wallet is necessary for any activities inside the app!
                There is no further personal data necessary! The Wallet signs the transactions and proves that you are YOU!
                Never lose your mnemonic and save it safely! Link to BIP39 creator: </Text>
              <View style={{alignItems: "center"}}>
              <TouchableOpacity style={{alignItems: "center", backgroundColor:"grey", fontSize: 14, fontStyle: "italic", width:50}} onPress={() => {openBip39Url()}}> 
                <Text style={{color: "white", padding:2}}>BIP39</Text> 
              </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 15, textAlign: "center", marginTop: 45, color: "blue"}}>Enter your mnemonic:</Text>
              <TextInput onChangeText={ (value) => {_walletUtils.setMnemonic(value);}} style={_styles.styles.textInputBox}/>
            </DialogContent>
          </Dialog>

        <Dialog visible={loggingInDialog}>
          <DialogContent>
            <Text>{dialogText}</Text>
          </DialogContent>
        </Dialog>

        <View style={{alignItems: "center", marginTop: 100, marginBottom: 100}}>
        <TouchableOpacity 
          style={{width: 350, height:70, backgroundColor: "blue", marginBottom: 20, alignItems: "center"}}
          onPress={ () => {navigation.navigate("Book and fly")}}>
          <FontAwesome5 name="plane-departure" size={25} color="white" style={{marginTop: 5}}/>
          <Text style={{color:"#fff", fontSize: 16, textAlign: "center", margin: 10}}>Book a flight</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{width: 350, height:70, backgroundColor: "blue", marginBottom: 20, alignItems: "center"}}
          onPress={() => {goTicket()}}>
          <Ionicons name="md-person" size={30} color="white" style={{marginTop: 5}}/>
          <Text style={{color:"#fff", fontSize: 16, textAlign: "center", margin: 10}}>My Flys</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{width: 350, height:70, backgroundColor: "blue", marginBottom: 20, alignItems: "center"}}>
          <MaterialCommunityIcons name="coin" size={30} color="white" style={{marginTop: 5}}/>
          <Text style={{color:"#fff", fontSize: 16, textAlign: "center", margin: 10}}>Token Portal</Text>
        </TouchableOpacity>

        </View>
    </ScrollView>
  )
}

// search for flights
const BookAFlightScreen = ({ navigation }) => {


  const onChange = (value) => {
    console.log(value);
    mBackend.setDate(value);
    var date = new Date(value.dateString);
    if(date.getDay()  == 0) { mBackend.setDay(7); console.log("Logged 7")} 
    else { mBackend.setDay(date.getDay()) }
    console.log("Day: ", date.getDay());
  }

  const getit = async () => {
    mBackend.cleanAllValues();

    console.log("flightplan: ", funcContracts.getFlightPlanContract());

    funcContracts.getFlightPlanContract()
      .searchFlight(mBackend.getSearchDep(), mBackend.getSearchArr())
      .then( (response) => {
        console.log(response);
        handleResult(response)
      })      
      .catch( err => {
        alert("No Flights found for your Route!");
      })
  }

  const handleResult = async (result) => {
    
    // split the cids divide by underline
    const splitResult = result.split("_");

    // get first json from ipfs
    var ipfsData = await getJSON(splitResult[0]);

    console.log(ipfsData);

    var daysOperated = ipfsData["opDays"];

    console.log("Days: ", daysOperated.length);

    const daySearched = mBackend.getDay();

    console.log("Day searched: ", daySearched)

    // check if route is operated on selected date
    // to do this, check if days match
    for(var i = 0; i<daysOperated.length; i++) {
      if(mBackend.getDay() == daysOperated[i]) {
        mBackend.setSearchDep(ipfsData["departure"]);
        mBackend.setSearchArr(ipfsData["arrival"]);
        mBackend.setSearchFlightNumber(ipfsData["flightNumber"]);
        mBackend.setSearchDepTime(ipfsData["depTime"]);
        mBackend.setSearchArrTime(ipfsData["arrTime"]);
        mBackend.setSearchFlightTime(ipfsData["flightDuration"]);
        mBackend.setSearchOpDay(ipfsData["opDays"]);
        mBackend.setSearchPrice(ipfsData["prices"]);
      }
    }


    // if there are more than one planned flight for the route
    if(splitResult.length>1){
      for(var ind = 1; ind < splitResult.length; ind++) {
      
        ipfsData = await getJSON(splitResult[ind]);
      
        daysOperated = ipfsData["opDays"];

        for(var i = 0; i<daysOperated.length; i++) {
          if(mBackend.getDay() === daysOperated[i]) {
            mBackend.setSearchFlightNumber(ipfsData["flightNumber"]);
            mBackend.setSearchDepTime(ipfsData["depTime"]);
            mBackend.setSearchArrTime(ipfsData["arrTime"]);
            mBackend.setSearchFlightTime(ipfsData["flightDuration"]);
            mBackend.setSearchOpDay(ipfsData["opDays"]);
            mBackend.setSearchPrice(ipfsData["prices"]);
          }
        }
      }
    }


    if(mBackend.getQueryArr().length == 0)
      alert("No flights found for your selected date")
    else {
      navigation.navigate('Flight Results');
    }
  }

  return (
    <ScrollView style={{backgroundColor: "white", marginTop: 30}}>
    <View style={_styles.styles.containerFlightScreen}>

      <Text style={{fontSize: 20, fontWeight: "bold", color: "blue", marginTop: 20}}>Book your flight</Text>

      <Text style={_styles.styles.searchLabelText}>From</Text>
      <TextInput style={_styles.styles.textInputBox} 
                  onChangeText={ (value) => { mBackend.setSearchDep(value) }}/>
      <Text style={_styles.styles.searchLabelText}>To</Text>
      <TextInput style={_styles.styles.textInputBox} 
                  onChangeText={ (value) => { mBackend.setSearchArr(value) }}/>
      <View style={{ marginTop: 20 }}>
        <Calendar theme={{selectedDayTextColor: "green", selectedDayBackgroundColor: "blue", todayTextColor: "red"}}
                  onDayPress={(dateObject) => {onChange(dateObject)}} enableSwipeMonths={true} />
      </View>
      <TouchableOpacity
            style={{width: 200, height:40, margin:10, backgroundColor: '#000F64'}}
            onPress={ () => getit() }>
            <Text style={{color:"#fff", fontSize: 15, 
                          textAlign: "center", margin: 10}}>Search Flights</Text> 
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

// ticket portal of customer
const TicketPortalScreen = ({ navigation }) => {
  
  const array = mBackend.getMyArrayLength();

  const gotoDetailsScreen = (ind) => {
    mBackend.setDetailsIndex(ind);
    navigation.navigate("Ticket Details")
  }
  
  return (
    <ScrollView>
      <View style={_styles.styles.containerFlightScreen}>
        <Text style={{ color: "blue", fontSize: 20 }}>Your Tickets</Text>
      {array.map(ind => (
        <TouchableOpacity style={{ width: 400, height: 200, flex:1, 
                                  flexDirection: "column", backgroundColor: "white", borderColor: "blue", 
                                  borderWidth: 2, margin: 10 }}
                          onPress={ () => {gotoDetailsScreen(ind)} }>
          <Text style={{ fontWeight: "bold", color: "blue", margin: 5, paddingLeft: 50}}>Flight {mBackend.getMyFlight(ind)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50 }}>Passenger:  {mBackend.getMyName(ind)} {mBackend.getMySurname(ind)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50 }}>FROM {mBackend.getMyFrom(ind)} TO {mBackend.getMyTo(ind)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50 }}>DEP {mBackend.getMyDepTime(ind)} ARR {mBackend.getMyArrTime(ind)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50 }}>FLIGHTDATE {mBackend.getMyFlightDate(ind)}</Text>
        </TouchableOpacity>
      ))}
      </View>
      </ScrollView>
  )
}

// this screen shows all details about the flight and the prices
const DetailsScreeen = () => {

  const index = mBackend.getDetailsIndex();

  return (
    <ScrollView>
      <View style={_styles.styles.containerFlightScreen}>
        <Text style={{ fontWeight: "bold", fontSize: 20, color: "blue", margin: 5}}>Flight Details</Text>
        <View style={{ width: 400, height: 120, borderColor: "blue", borderWidth: 2 }}>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50}}>Flightnumber: {mBackend.getMyFlight(index)}, Date: {mBackend.getMyFlightDate(index)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50}}>From: {mBackend.getMyFrom(index)} To: {mBackend.getMyTo(index)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50}}>Departure Time: {mBackend.getMyDepTime(index)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50}}>Flightnumber: {mBackend.getMyArrTime(index)}</Text>
        </View>

        <Text style={{ fontWeight: "bold", fontSize: 20, color: "blue", marginTop: 20, marginBottom:5}}>Passenger Details</Text>
        <View style={{ width: 400, height: 100, borderColor: "blue", borderWidth: 2 }}>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50}}>Name:: {mBackend.getMyName(index)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50}}>Surname: {mBackend.getMySurname(index)}</Text>
          <Text style={{ color: "blue", margin: 5, paddingLeft: 50}}>Birthdate: {mBackend.getMyBdate(index)}</Text>
        </View>

        <Text style={{ fontWeight: "bold", fontSize: 20, color: "blue", marginTop: 20, marginBottom:5}}>Flight Status</Text>
        <View style={{ width: 400, height: 100, borderColor: "blue", borderWidth: 2 }}>
        </View>

        <Text style={{ fontWeight: "bold", fontSize: 20, color: "blue", marginTop: 20, marginBottom:5}}>Price Details</Text>
        <View style={{ width: 400, height: 100, borderColor: "blue", borderWidth: 2 }}>
        </View>
      </View>
    </ScrollView>
  )
}

// show the results for bookable flights
const FlightResultsScreen = ({ navigation }) => {

  const array = mBackend.getQueryArr();

  console.log("Array: ", array.length);

  const searchInventory = (ind) => {

    mBackend.setIndexforFlightBooking(ind);

    // console output for demonstration
    console.log("Contract INV: ", funcContracts.getInvContract());
    console.log("flightnumber: ", mBackend.getSearchFlightNumber(ind));
    console.log("month: ", mBackend.getDate().month);
    console.log("day: ", mBackend.getDate().day);

    // 1) searchforInventory and check if there are seats available, if yes go to next page, otherwise show user an alert
    funcContracts.getInvContract().searchInventory(mBackend.getSearchFlightNumber(ind),
                                mBackend.getDate().month,
                                mBackend.getDate().day)
                .then(res => {console.log("RES INVsearch: ", res); handleResData(res[0], res[1], res[2])})
                .catch(err => console.log("Error @inv: ", err));
  }

  const handleResData = (seats, index, cid) => {
    if(seats > 0) {
      mBackend.setBookingCID(cid);
      mBackend.setBookingIndex(index);

      console.log("i'm here");

      navigation.navigate('Booking Page');
    }
    else {alert("No more seats available! Look for alternative flights.")}
  }

  return (
    <View style={_styles.styles.containerFlightScreen}>

      <Text style={{ color: "blue", fontSize: 16, marginTop:10, marginBottom: 10 }}>
        Flights for {mBackend.getSearchDep()} -{'>'} {mBackend.getSearchArr()} 
      </Text>

      <View style={{ maxHeight:30, width: 400 , flex: 1, flexDirection: "row", 
                                 borderColor: "blue", borderWidth: 1, borderRadius: 2, alignItems: "center"}}>
                                
        <Text style={{ marginLeft: 10, fontStyle: "italic"}}> FLIGHT </Text>
        <Text style={{ marginLeft: 15, marginRight: 2, fontStyle: "italic"}}> DEP TIME </Text>
        <Text style={{ marginLeft: 20, marginRight: 2, fontStyle: "italic"}}> ARR TIME </Text>
        <Text style={{ marginLeft: 10, fontStyle: "italic"}}> DURATION </Text>
        <Text style={{ marginLeft: 20, fontStyle: "italic"}}> PRICE </Text>
      </View>
      {array.map((arr, key) => (
      <TouchableOpacity key={arr}
                        style={{ maxHeight:60, width: 400 , flex: 1, flexDirection: "row", 
                                 borderColor: "blue", borderWidth: 1, borderRadius: 2, alignItems: "center"}}
                        onPress={() => {searchInventory(arr)}}>

          <Text style={{ margin: 10, width:60, textAlign: "center"}}>{ mBackend.getSearchFlightNumber(arr)}   </Text>
          <Text style={{ width:60, margin: 10, textAlign: "center"}}>{ mBackend.getSearchDepTime(arr) }h  </Text>
          <Text style={{ width: 60, margin: 10, textAlign: "center"}}>{ mBackend.getSearchArrTime(arr) }h  </Text>
          <Text style={{ width: 60, margin: 10, textAlign: "center"}}>{ mBackend.getSearchFlightTime(arr) }</Text>
          <Text style={{ width: 60, margin: 10, textAlign: "center"}}>{ mBackend.getSearchPrice(arr) } FLY</Text>
        
      </TouchableOpacity>
      ))}
    </View>
  );
}

const BookingScreen = ({ navigation }) => {

  // variables for textinput and setPrice
  const [ price, setPrice ] = useState("");
  const [ name, setName ] = useState("");
  const [ surname, setSurname ] = useState("");
  const [ birthDate, setBirthDate ] = useState("");

  const getData = async () => {
    var data = await getJSON(mBackend.getBookingCID());
    console.log("Flight booking data: ", data);
    setPrice(data["price"]);
  }

  getData();

  const ind = mBackend.getIndexforFlightBooking();

  const payAndBook = () => {
    
    var month = mBackend.getDate().month;
    console.log("Month: ", month);

    // create json and send to ipfs to later get the ticket details at ticket portal
    const cid = setJSON({
      "flightNumber": mBackend.getSearchFlightNumber(ind),
      "from": mBackend.getSearchDep(),
      "to": mBackend.getSearchArr(),
      "name": name,
      "surname": surname,
      "birthDate": birthDate,
      "flightDate": mBackend.getDate().dateString,
      "departureTime": mBackend.getSearchDepTime(ind),
      "arrivalTime": mBackend.getSearchArrTime(ind),
      "price": mBackend.getSearchPrice(ind)
    });

    // create the ticket with all informations
    funcContracts.getPssInstance().createTicket(
                cid,
                mBackend.getSearchFlightNumber(ind),
                mBackend.getDate().month,
                mBackend.getDate().day,
                price).then(res => {if(res) {
                                      payTicket();
                                      console.log("Ticket created: ", res);
                                      alert("Flight is booked. Check your ticket portal for details");}})
                      .catch(err => {console.log("Err create ticket: ", err); alert("Flight couldn't be booked")});

    // pay the ticket
    const payTicket = async () => {
      await funcContracts.getFlightToken().transfer(airLineAddress, price)
        .then(res => {console.log("Ticket is paid: ", res);
      
        navigation.navigate("FLY Portal")}) // if payment is done - book the flight
    }
  }

  return (
    <ScrollView>
    <View style={_styles.styles.containerFlightScreen}>
      <View style={{ width: 400, height: 200, backgroundColor: "white", borderColor: "blue", borderWidth: 2, margin: 10 }}>
        <Text style={{ fontWeight: "bold", color: "blue", margin: 5, paddingLeft: 50}}>FLIGHT {mBackend.getSearchFlightNumber(ind)}</Text>
        <Text style={{ fontWeight: "bold", color: "blue", margin: 5, paddingLeft: 50}}>From {mBackend.getSearchDep()} to {mBackend.getSearchArr()}</Text>
        <Text style={{ fontWeight: "bold", color: "blue", margin: 5, paddingLeft: 50}}>Date: {mBackend.getDate().dateString}</Text>
        <Text style={{ fontWeight: "bold", color: "blue", margin: 5, paddingLeft: 50}}>Departure: {mBackend.getSearchDepTime(ind)}</Text>
        <Text style={{ fontWeight: "bold", color: "blue", margin: 5, paddingLeft: 50}}>Arrival: {mBackend.getSearchArrTime(ind)}</Text>
        <Text style={{ fontWeight: "bold", color: "blue", margin: 5, paddingLeft: 50}}>Price is {price} FLY</Text>
      </View>

      <Text style={_styles.styles.searchLabelText}>Name</Text>
      <TextInput style={_styles.styles.textInputBox} onChangeText={ (value) => { setName(value) }}/>      

      <Text style={_styles.styles.searchLabelText}>Surname</Text>
      <TextInput style={_styles.styles.textInputBox} onChangeText={ (value) => { setSurname(value) }}/>     

      <Text style={_styles.styles.searchLabelText}>Birthdate</Text>
      <TextInput style={_styles.styles.textInputBox} placeholder="dd.mm.yyyy" onChangeText={ (value) => { setBirthDate(value) }}/>     
  
      <TouchableOpacity
            style={{width: 300, height:40, margin:10, backgroundColor: '#000F64'}}
            onPress={() => {console.log("Pressed"); payAndBook();}}>
            <Text style={{color:"#fff", fontSize: 18, textAlign: "center", margin: 10}}>Pay and Book flight</Text> 
        </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

// navigator
const FlyPortalScreen = ({ navigation }) => {
  return (
    <Tab.Navigator initialRouteName="FLY Portal"
      screenOptions={({route}) => ({
        tapBarIcon: () => {
          if(route.name == "Book and fly") {
            return <FontAwesome5 name="plane-departure" size={25} color="white" style={{marginTop: 5}}/>;
          } else if (route.name == "My Flights") {
            return <Ionicons name="md-person" size={30} color="white" style={{marginTop: 5}}/>;
          } else if (route.name == "Token Portal") {
            return <MaterialCommunityIcons name="coin" size={30} color="white" style={{marginTop: 5}}/>;
          }
        }
      })}>
      <Tab.Screen name="FLY Portal" component={MainMenuScreen}/>
      <Tab.Screen name="Book and fly" component={BookingScreens} />
      <Tab.Screen name="My Flights" component={TicketDetails} />
      <Tab.Screen name="Token Portal" component={TokenPortal} />
    </Tab.Navigator>
  )
}
/*
<TouchableOpacity style={{backgroundColor: "red", width: 50, margin: 10, padding: 5, alignItems: "center"}}
          onPress= {() => {
            signer = null; // set signer to null
            _walletUtils.clearParams(); // delete all params
            console.log("WalletParams: ", _walletMethods)
            _walletMethods.clearParams(); // clear wallet o null
            navigation.goBack();
          }}></TouchableOpacity>
 */

// navigation this component includes all screens inside a stack necess. for booking a flight
const BookingScreens = () => {
  return (
      <StackBooking.Navigator initialRouteName="Book a flight">
        <StackBooking.Screen name="Book a flight" component={BookAFlightScreen} options={{ headerShown: false}}/>
        <StackBooking.Screen name="Flight Results" component={FlightResultsScreen} options={{ headerShown: true}}/>
        <StackBooking.Screen name="Booking Page" component={BookingScreen} options={{ headerShown: true}}/>
      </StackBooking.Navigator>
  )
}


// navigation this comp. includes all screens for administrating all booked tickets
const TicketDetails = () => {
  return (
    <StackTickets.Navigator initialRouteName="My Flies">
      <StackTickets.Screen name="My Flies" component={TicketPortalScreen} options={{ headerShown: false}}/>
      <StackTickets.Screen name="Ticket Details" component={DetailsScreeen} options={{ headerShown: false}}/>
    </StackTickets.Navigator>
  )
}


// screen to look for all balances and the current token amount
const TokenPortal = () => {

}

// main starting point
const App = () => {

  useEffect(() => {
    const myBackAction = () => {
      console.log("do nothin, backbutton is presses");
      return true;
    };

    const myBackHandler = BackHandler.addEventListener(
      "hardwareBackPress", myBackAction);

    return () => myBackHandler.remove();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="FLY Portal"
      
      screenOptions={({route}) => ({
        tapBarIcon: ({ color, size}) => {
          if(route.name === "Book and fly") {
            return (<FontAwesome5 name="plane-departure" size={25} color="blue"/>);
          } else if (route.name === "My Flights") {
            return <Ionicons name="md-person" size={30} color="blue"/>;
          } else if (route.name === "Token Portal") {
            return <MaterialCommunityIcons name="coin" size={30} color="blue" style={{marginTop: 5}}/>;
          }
        }
      })}>
      <Tab.Screen name="FLY Portal" component={MainMenuScreen}/>
      <Tab.Screen name="Book and fly" component={BookingScreens} />
      <Tab.Screen name="My Flights" component={TicketDetails} />
      <Tab.Screen name="Token Portal" component={TokenPortal} />
    </Tab.Navigator>
    </NavigationContainer>
  );
};

// export main point to start app
export default App;

/**
 * <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{
          title: "fly - the new way",
          headerStyle:{backgroundColor: "blue"}, 
          headerTintColor: "white",
          headerTitleStyle: {fontWeight: "bold"},
          headerShown: true
        }}
        />
        <Stack.Screen name="Portal" component={FlyPortalScreen} options={{ headerShown: false}}/>
      </Stack.Navigator>
 */