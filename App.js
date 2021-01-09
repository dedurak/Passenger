import 'react-native-gesture-handler';
import React, { useLayoutEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Linking, 
  SafeAreaView, 
  FlatList } from 'react-native';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { ScrollView } from 'react-native-gesture-handler';
import { Calendar } from 'react-native-calendars';
import { 
  MyStyles} from './styles/myStyles';
import { 
  WalletUtiils, 
  WalletMethods, 
  Contracts } from './utils/walletUtils';
import { MyContracts } from './utils/myContracts';
import { Backend } from './utils/backend';
import { getJSON, setJSON } from './utils/IPFS';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogButton} from 'react-native-popup-dialog';
import { 
  Entypo, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { passengerStatus } from './utils/Status/passengerStatus';
import { flightStatus } from './utils/Status/flightStatus';
import { vars } from './utils/global';
import { 
  DepPicker,
  ArrPicker,
  getAirports
} from './utils/Airports/airportpicker';
import { ActivityIndicator } from 'react-native';
import { materialcolors } from './styles/materialcolors';
import {
  useFonts,
  ComicNeue_300Light,
  ComicNeue_300Light_Italic,
  ComicNeue_400Regular,
  ComicNeue_400Regular_Italic,
  ComicNeue_700Bold,
  ComicNeue_700Bold_Italic,
} from '@expo-google-fonts/comic-neue';


/**
 * 
 * @notice this app is developed for passengers, who can book and manage their flights. 
 * the new business process automates all steps in relation to a flight booking
 */

const mBackend = new Backend();
const provider = new ethers.providers.InfuraProvider("rinkeby", vars.projectID);
const _styles = new MyStyles();
const _walletUtils = new WalletUtiils();
const funcContracts = new Contracts();
var signer;
var dataToDisplayAsList = [];
var _walletMethods;
const contracts = new MyContracts();
const Stack = createStackNavigator();
const StackBooking = createStackNavigator();
const StackTickets = createStackNavigator();


// to change the hex value from token contract to decimal number
const hexToDec = (hex) => {
  var result = parseInt(hex, 16);
  console.log("Result token, ", result);
  vars.tokens = result;
}


// main menu -- startup screen
const MainMenuScreen = ({ navigation }) => {

  var [fontsLoaded] = useFonts({
    ComicNeue_300Light,
    ComicNeue_300Light_Italic,
    ComicNeue_400Regular,
    ComicNeue_400Regular_Italic,
    ComicNeue_700Bold,
    ComicNeue_700Bold_Italic
  });

  const [loginDialog, setLoginDialog] = useState(false);
  const [loggingInDialog, setLoggingInDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [passphrase, setPassPhrase] = useState("");
  const bip39Url = "https://iancoleman.io/bip39/";
  const [ dialogText, setDialogText ] = useState("Logging in...");

  // open link if bip39 button is pressed
  const openBip39Url = async () => {
    await Linking.openURL(bip39Url);
  }


  // create wallet while login process
  const createWallet = () => { 
    _walletUtils.setParams();
    setDialogText("Wallet created...");
    setTimeout(() => {
      _walletMethods = new WalletMethods(
        _walletUtils.getPrivateKey(), 
        provider);
      signer = _walletMethods.getWallet();
      vars.loggedin = true;
      setupContracts();
    }, 1000);
  }


  // create contract instance while login process
  const setupContracts = () => {

    setDialogText("Creating Contracts...");

    setTimeout(() => {
      funcContracts.setFlightToken(
        _walletMethods.createContractInstance(
          contracts.getFlightTokenAddr(), 
          contracts.getFlightTokenAbi(), 
          signer
        ));

      funcContracts.setFlightPlanContract(
        _walletMethods.createContractInstance(
          contracts.getFlightPlanAddr(), 
          contracts.getFlightPlanAbi(), 
          signer
        ));

      funcContracts.setPssInstance(
        _walletMethods.createContractInstance(
          contracts.getPssAddr(),
          contracts.getPssAbi(),
          signer
        ));

      funcContracts.setInvContract(
        _walletMethods.createContractInstance(
          contracts.getInventoryAddr(),
          contracts.getInventoryAbi(),
          signer
        ));
    
      setLoggingInDialog(false);
      setDialogText("Logging out...");
  
      console.log("flightPlan: ", funcContracts.getFlightPlanContract());
      console.log("invContract: ", funcContracts.getInvContract());
      console.log("PssInstance: ", funcContracts.getPssInstance());
      console.log("Flight2Token: ", funcContracts.getFlightToken());
    }, 1000);
  }


  // start searching for bookings
  const goTicket = () => {
    // first search all tickets booked with this address inside the passenger system
    funcContracts.getPssInstance()
    .getTickets()
    .then( (res) => {
      console.log(res); 
      if(res != "") handleTicketData(res)
    })
  }


  // save data inside backend to display later
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
    mBackend.setMyPrice(ipfsData["price"]);
    mBackend.setMyPriceTaxes(ipfsData["taxes"]);

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
        mBackend.setMyPrice(ipfsData["price"]);
        mBackend.setMyPriceTaxes(ipfsData["taxes"]);
      }
    }

    getStatus();
  }


  // get flight and ticket status
  const getStatus = async () => {
    // get count of tickets 
    const countTickets = mBackend.getMyArrayLength();

    // iterate through all tickets and get flight and ticket status
    for (var i=0; i<countTickets.length; i++) {
      var date = new Date(mBackend.getMyFlightDate(i));

      // to look what happens
      console.log("Date: ", date.getMonth()+1, "/", date.getDate());

      // get Passenger Status and save inside backend array;
      await funcContracts.getPssInstance()
        .getPassengerStatus(
          _walletUtils.getAddress(), // wallet -> address
          mBackend.getMyFlight(i),   // flightnumber to look for ticket status
          date.getMonth()+1,         // month
          date.getDate()             // day
        )
        .then(res => {
          console.log("Result PassengerStatus: ", res, "typeof: ", typeof(res));
          console.log("what the fuck: ", parseInt(res, 10));
          mBackend.setMyPassengerStatus(res); // save passenger status
        });
      
      await funcContracts.getPssInstance()
        .getFlightStatus(
          mBackend.getMyFlight(i), // flight looking for flight status
          date.getMonth()+1,       // month
          date.getDate()           // day
        ) 
        .then(res => {
          console.log("FlightStatus: ", flightStatus[parseInt(res)]);
          mBackend.setMyFlightStatus(res);
        });
    }


    console.log("Passenger: ", mBackend.myPassengerStatus);
    console.log("Flight: ", mBackend.myFlightStatus);

    navigation.navigate("My Flights");
  }


  // search for last transactions
  const searchPayments = () => {
    dataToDisplayAsList = [];
    funcContracts.getFlightToken()
      .searchPayments(10)
      .then(res => handlePaymentSearchResult(res));
  }

  // 2nd step - handle payment search result
  const handlePaymentSearchResult = (res) => {

    console.log("Result: ", res);
    var amount = res[0].split("_");
    var sender = res[1];
    var recipient = res[2];
    var timestamp = res[3].split("_");

    var iterator = amount.length;

    for (var i = 0; i<iterator; i++) {
      var buf = {
        _amount: amount[i],
        _sender: sender[i],
        _recipient: recipient[i],
        _timestamp: timestamp[i]
      }

      dataToDisplayAsList.push(buf);
    }

    console.log("dataToShow: ", dataToDisplayAsList);

    getTotalSupply();
  }


  // get total amount of tokens
  const getTotalSupply = () => {
    funcContracts.getFlightToken()
      .balanceOf(_walletUtils.getAddress())
      .then(res => {
        console.log("res: ", res); 
        hexToDec(Object.values(res[0])); 
        navigation.navigate("Token Portal");
      })
  }


  return (
    <ScrollView 
      style={{
        backgroundColor: materialcolors[2],
        flex: 1
      }}>

      {!vars.loggedin?
      <TouchableOpacity 
        style={_styles.styles.loginButton}
        onPress= {() => {
          setLoginDialog(true);
        }}>
        <Entypo name="login" size={24} color="white"/>
        <Text style={{color:"white"}}>Login</Text>
      </TouchableOpacity>
      :null}

      {vars.loggedin?
      <TouchableOpacity 
        style={ _styles.styles.logoutButton }
        onPress= {() => {
          setLoggingInDialog(true);

          setTimeout(() => {
            console.log("inside logging out timeout")
            signer = null; // set signer to null
            _walletUtils.clearParams(); // delete all params
            _walletMethods.clearParams(); // clear wallet o null
            setDialogText("Logging in ...");
            setPassPhrase("");
            console.log("WalletParams: ", _walletMethods);
            vars.loggedin = false;
            setLoggingInDialog(false);
          }, 2000);
        }}>
        <Entypo name="log-out" size={24} color="red"/>
        <Text style={{color: "red"}}>Logout</Text>
      </TouchableOpacity>
      :null}

      <Dialog visible={loginDialog}
        footer={
          <DialogFooter style={{backgroundColor: materialcolors[3]}}>
            <DialogButton 
              textStyle={{color: materialcolors[2]}}
              text="Cancel" 
              onPress={() => setLoginDialog(false)}/>
            <DialogButton 
              textStyle={{color: materialcolors[2]}}
              text="Login" 
              onPress={() => { 
                setLoginDialog(false); 
                setLoggingInDialog(true); 
                setTimeout(() => createWallet(), 1000);}}/>
          </DialogFooter>
        }>
        <DialogContent style={{backgroundColor: materialcolors[3]}}>
          <Text style={ _styles.styles.bip39Text}> {vars.bip39Text} </Text>
          <View style={{alignItems: "center"}}>
            <TouchableOpacity 
              style={ _styles.styles.bip39Button } 
              onPress={() => {openBip39Url()}}> 
              <Text style={{color: materialcolors[7], padding:2}}>BIP39</Text> 
            </TouchableOpacity>
          </View>
          <Text 
            style={ _styles.styles.passphraseText }>Enter your passphrase:</Text>
          <TextInput
            value={passphrase}
            placeholder="passphrase" 
            onChangeText={ (value) => {
              setPassPhrase(value);
              _walletUtils.setMnemonic(value);
            }} 
            style={_styles.styles.textInputBox}/>
        </DialogContent>
      </Dialog>

      <Dialog visible={loggingInDialog}>
        <DialogContent 
          style={{
            backgroundColor: materialcolors[3]
          }}>
          <Text style={{color:materialcolors[2]}}>{dialogText}</Text>
          <ActivityIndicator size="large" color={materialcolors[2]} />
        </DialogContent>
      </Dialog> 

      <Dialog visible={alertDialog}>
        <DialogContent
          style={{
            backgroundColor: materialcolors[3]
          }}>
          <Text style={{color: materialcolors[2], marginTop: 5}}>You are not logged in!</Text>
        </DialogContent>
        <DialogFooter style={{backgroundColor: materialcolors[3]}}>
          <DialogButton 
            textStyle={{color: materialcolors[2]}} 
            text="OK" 
            onPress={() => {setAlertDialog(false)}}/>
        </DialogFooter>
      </Dialog>

      <View 
        style={{
          alignItems: "center", 
          marginTop: 100, 
          marginBottom: 100}}>
        <TouchableOpacity 
          style={ _styles.styles.menuButton }
          onPress={ () => {
            vars.loggedin ? navigation.navigate("Book and fly") : setAlertDialog(true)
          }}>
          <FontAwesome5 name="plane-departure" size={25} color={materialcolors[2]} style={{marginTop: 5}}/>
          <Text style={ _styles.styles.menuText }>Book a flight</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={ _styles.styles.menuButton }
          onPress={() => {
            vars.loggedin ? goTicket() : setAlertDialog(true)
          }}>
          <Ionicons name="md-person" size={30} color={materialcolors[2]} style={{marginTop: 5}}/>
          <Text style={ _styles.styles.menuText }>My Flys</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={ _styles.styles.menuButton }
          onPress={() => {
            vars.loggedin ? searchPayments() : setAlertDialog(true)
          }}>
          <MaterialCommunityIcons name="coin" size={30} color={materialcolors[2]} style={{marginTop: 5}}/>
          <Text style={ _styles.styles.menuText }>Token Portal</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  )
}

// search for flights
const BookAFlightScreen = ({ navigation }) => {

  const [mDate, setMDate] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{marginRight: 20}}
          onPress={() => navigation.navigate('FLY Portal')}>
          <Entypo name="home" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onChange = (value) => {
    console.log(value);
    mBackend.setDate(value);
    setMDate(value.dateString);
    var date = new Date(value.dateString);
    if(date.getDay()  == 0) { mBackend.setDay(7); console.log("Logged 7")} 
    else { mBackend.setDay(date.getDay()) }
    console.log("Day: ", date.getDay());
  }

  const getit = async () => {
    mBackend.cleanAllValues();

    console.log("flightplan: ", funcContracts.getFlightPlanContract());

    funcContracts.getFlightPlanContract()
      .searchFlight(getAirports().pickedDep, getAirports().pickedArr)
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
    <ScrollView style={{backgroundColor: materialcolors[0]}}>
      <View style={_styles.styles.containerFlightScreen}>

        <Text style={_styles.styles.screenHeader}>Book your flight</Text>

        <View style={{flex:1, flexDirection: "row"}}>
          <View style={{flex:1, flexDirection: "column", margin: 10}}>
            <Text style={_styles.styles.searchLabelText}>From</Text>
            <DepPicker />
          </View>
          <View style={{flex:1, flexDirection: "column", margin: 10}}>
            <Text style={_styles.styles.searchLabelText}>To</Text>
            <ArrPicker/>
          </View>
        </View>
      
        <Calendar 
          firstDay={1}
          markedDates={{
            [mDate]: {selected: true, selectedColor: materialcolors[2], selectedDayTextColor: materialcolors[7], marked: true}
          }}
          style={{backgroundColor: materialcolors[0]}}
          theme={{ 
            monthTextColor: "white",
            selectedDayTextColor: "white", 
            selectedDayBackgroundColor: materialcolors[7], 
            todayTextColor: "red"}}
          onDayPress={(dateObject) => {onChange(dateObject)}} 
          enableSwipeMonths={true} />
      
        <TouchableOpacity
          style={{
            borderRadius: 40,
            width: 200, 
            height:40, 
            margin:10, 
            backgroundColor: materialcolors[2]}}
          onPress={ () => getit() }>
          <Text 
          style={{
            color:"#fff", 
            fontSize: 15, 
            textAlign: "center", 
            margin: 10}}>Search Flights</Text> 
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


// ticket portal of customer
const TicketPortalScreen = ({ navigation }) => {
  
  const array = mBackend.getMyArrayLength();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{marginRight: 20}}
          onPress={() => navigation.navigate('FLY Portal')}>
          <Entypo name="home" size={24} color="white" />
        </TouchableOpacity>
      ),
    })
  });  

  const gotoDetailsScreen = (ind) => {
    mBackend.setDetailsIndex(ind);
    navigation.navigate("Ticket Details")
  }

  const getTickets = () => {
    funcContracts.getPssInstance().getTickets()
      .then(res => {
        console.log("Tickets: ", res);
        handleTickets(res);
      })
  }

  const handleTickets = (res) => {
    const splitTickets = res.split("_");

    console.log("handleTickets: ", splitTickets);
  }
  
  return (
    <ScrollView>
      <View style={_styles.styles.containerFlightScreen}>
        <Text style={_styles.styles.screenHeader}>Your Tickets</Text>
        {array.map((ind, key) => (
        <TouchableOpacity 
          style={{ 
            width: 400, 
            height: 200, 
            flex:1, 
            flexDirection: "column", 
            backgroundColor: "white",
            borderRadius: 40, 
            borderColor: materialcolors[3], 
            borderWidth: 2, 
            margin: 10 }}
          onPress={ () => {gotoDetailsScreen(ind)} }>
          <Text style={_styles.styles.ticketBoxHeader}>Flight {mBackend.getMyFlight(ind)} - STATUS {flightStatus[parseInt(mBackend.getMyFlightStatus(ind))]}</Text>
          <Text style={_styles.styles.ticketBoxText}>Passenger:  {mBackend.getMyName(ind)} {mBackend.getMySurname(ind)}</Text>
          <Text style={_styles.styles.ticketBoxText}>FROM {mBackend.getMyFrom(ind)} TO {mBackend.getMyTo(ind)}</Text>
          <Text style={_styles.styles.ticketBoxText}>DEP {mBackend.getMyDepTime(ind)} ARR {mBackend.getMyArrTime(ind)}</Text>
          <Text style={_styles.styles.ticketBoxText}>FLIGHTDATE {mBackend.getMyFlightDate(ind)}</Text>
          <Text style={_styles.styles.ticketBoxText}>STATUS OF TICKET {passengerStatus[parseInt(mBackend.getMyPassengerStatus(ind))]}</Text>
        </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}


// this screen shows all details about the flight and the prices
const DetailsScreeen = ({ navigation }) => {

  const index = mBackend.getDetailsIndex();
  const [ cancelTicketDialog, setCancelTicketDialog ] = useState(false);
  const [ cancelDialog, setCancelDialog] = useState("Cancellation in progress...");
  const [ cancelledConfirmation, setCancelledConfirmation ] = useState(false);
  //const [ ticketCancelledDialog, setTicketCancelledDialog ] = useState(false);
  //const [ cancelButton, setCancelButton ] = useState(false);
  //const [ checkinButton, setCheckinButton ] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{marginRight: 20}}
          onPress={() => navigation.navigate('FLY Portal')}>
          <Entypo name="home" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  var price = mBackend.getMyPrice(index);
  var taxes = mBackend.getMyPriceTaxes(index)*price;
  var ticketPrice = price - taxes;

  var flightstate = mBackend.getMyFlightStatus(index);
  var passengerState = mBackend.getMyPassengerStatus(index);

  const flightStatusText = [
    "Flight is PLANNED",
    "Flight has been CANCELLED",
    "Checkin is open",
    "Boarding in process",
    "Flight departed",
    "Flight landed",
    "Flight departed delayed",
    "Flight arrived delayed"
  ]

  const colors = [
    "green",
    "red",
    "orange",
    "blue",
    "black",
    "black",
    "red",
    "red"
  ]

  // if cancel button is pressed this function cancels the flight
  const cancelTicket = () => {
    var cDate = new Date(mBackend.getMyFlightDate(index));

    console.log(typeof(cDate.getMonth()+1)), typeof(cDate.getDate());
    console.log("Month: ", cDate.getMonth()+1, " Day: ", cDate.getDate());

    funcContracts.getPssInstance()
      .changePassengerStatus(
        5, 
        mBackend.getMyFlight(index), 
        cDate.getMonth()+1, 
        cDate.getDate())
      .then(res => {
        console.log("Ticket cancelled: ", res);
        changeInv(cDate.getMonth()+1, cDate.getDate());
        })
      .catch(err => console.log("Error: ", err));
  }

  // update inventory
  const changeInv = (month, day) => {
    funcContracts.getInvContract()
      .flightTicketCancelled(
        mBackend.getMyFlight(index), 
        month, 
        day)
      .then(res => {
        console.log("Inventory updated: ", res);
        setCancelTicketDialog(false);
        setTimeout(() => setCancelledConfirmation(true), 500);
      })
      .catch(err => console.log("Error at Inventory: ", err))
  }

  // checking in
  const checkin = () => {
    var cDate = new Date(mBackend.getMyFlightDate(index));

    funcContracts.getPssInstance()
      .changePassengerStatus(
        1, 
        mBackend.getMyFlight(index), 
        cDate.getMonth()+1, 
        cDate.getDate())
      .then(res => {
        console.log("You are checked in! ", res);
      })
      .catch(err => console.log("Error: ", err));
  }


  return (
    <ScrollView style={{backgroundColor: materialcolors[0]}}>
      <View style={_styles.styles.containerFlightScreen}>
        <Text style={_styles.styles.detailsScreenHeader}>Flight Details</Text>
        <View style={_styles.styles.detailsScreenFirstBox}>
          <Text style={_styles.styles.detailsScreenText}>Flightnumber: {mBackend.getMyFlight(index)}, Date: {mBackend.getMyFlightDate(index)}</Text>
          <Text style={_styles.styles.detailsScreenText}>From: {mBackend.getMyFrom(index)} To: {mBackend.getMyTo(index)}</Text>
          <Text style={_styles.styles.detailsScreenText}>Departure: {mBackend.getMyDepTime(index)}</Text>
          <Text style={_styles.styles.detailsScreenText}>Arrival:   {mBackend.getMyArrTime(index)}</Text>
        </View>

        <Text style={_styles.styles.detailsScreenHeader}>Passenger Details</Text>
        <View style={_styles.styles.detailsScreenFirstBox}>
          <Text style={_styles.styles.detailsScreenText}>Name:: {mBackend.getMyName(index)}</Text>
          <Text style={_styles.styles.detailsScreenText}>Surname: {mBackend.getMySurname(index)}</Text>
          <Text style={_styles.styles.detailsScreenText}>Birthdate: {mBackend.getMyBdate(index)}</Text>
        </View>

        <Text style={_styles.styles.detailsScreenHeader}>Flight Status</Text>
        <View 
          style={{ 
            width: 400, 
            height: 100, 
            backgroundColor: materialcolors[7],
            borderColor: materialcolors[3], 
            borderWidth: 2, 
            alignItems: "center"}}>
          <Text style={{ fontFamily: "ComicNeue_700Bold", margin: 5, color: colors[flightstate]}}>{flightStatusText[flightstate]}</Text>
          
          {(flightstate==0 && passengerState!=5)?
          <TouchableOpacity 
            style={{
              marginTop:5, 
              width:150, 
              height:40, 
              borderWidth: 1, 
              borderColor: "red", 
              backgroundColor: "blue", 
              alignItems: "center"}}
            onPress={() => {
              setCancelTicketDialog(true);
              cancelTicket();}}>
            <Text style={{color: "white"}}>CANCEL FLIGHT</Text>
          </TouchableOpacity>:null}
          
          {(flightstate==2 && passengerState!=1)?
          <TouchableOpacity 
            style={{
              marginTop:5, 
              width:150, 
              height:40, 
              borderWidth: 1, 
              borderColor: "red", 
              backgroundColor: "green", 
              alignItems: "center"}}
            onPress= {() => checkin()}>
            <Text style={{color: "white"}}>CHECKIN</Text>
          </TouchableOpacity>:null}
        </View>

        <Dialog visible={cancelTicketDialog}>
          <DialogContent style={{backgroundColor: materialcolors[3]}}>
            <Text style={{color: materialcolors[2]}}>{cancelDialog}</Text>
            <ActivityIndicator size="large" color="white" />
          </DialogContent>
        </Dialog>

        <Dialog visible={cancelledConfirmation}
          footer={
            <DialogFooter style={{backgroundColor: materialcolors[3]}}>
              <DialogButton 
                text="Confirm" 
                textStyle={{color: materialcolors[2]}}
                onPress={() => {
                  setCancelledConfirmation(false);
                  navigation.navigate("FLY Portal");
                }}/>
            </DialogFooter>
          }>
          <DialogContent style={{backgroundColor: materialcolors[3]}}>
            <Text style={{color: materialcolors[2]}}>Ticket cancelled</Text>
          </DialogContent>
        </Dialog>

        <Text style={_styles.styles.detailsScreenHeader}>Price Details</Text>
        <View style={_styles.styles.detailsScreenFirstBox}>
          <Text style={{color: materialcolors[2], margin: 5, paddingLeft: 50}}>Ticket Price: {ticketPrice} FLY</Text>
          <Text style={{color: materialcolors[2], margin: 5, paddingLeft: 50}}>Taxes: {taxes} FLY</Text>
          <Text style={{color: materialcolors[2], margin: 5, paddingLeft: 50}}>TOTAL: {price} FLY</Text>
        </View>
      </View>
    </ScrollView>
  )
}


// show the results for bookable flights
const FlightResultsScreen = ({ navigation }) => {

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{marginRight: 20}}
          onPress={() => navigation.navigate('FLY Portal')}>
          <Entypo name="home" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
    funcContracts.getInvContract()
      .searchInventory(
        mBackend.getSearchFlightNumber(ind),
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

      <Text style={{ 
        color: "white", 
        fontFamily: "ComicNeue_700Bold",
        fontSize: 22, 
        marginTop:15, 
        marginBottom: 10 }}>
        Flight Search: {getAirports().pickedDep} -{'>'} {getAirports().pickedArr} 
      </Text>

      {array.map((arr, key) => (
      <TouchableOpacity 
        key={arr}
        style={{ 
          backgroundColor: "white",
          maxHeight:80, 
          width: 400, 
          flex: 1, 
          flexDirection: "row", 
          margin: 10,
          borderRadius: 40, 
          alignItems: "center"}}
        onPress={() => {searchInventory(arr)}}>

        <Text style={{ 
          color: materialcolors[2],
          fontFamily: "ComicNeue_700Bold",
          margin: 10, 
          textAlign: "center"}}>{ mBackend.getSearchFlightNumber(arr)}</Text>
        <View style={{
          flex: 1,
          flexDirection: "column"
        }}>
          <Text style={_styles.styles.flightResText}>Dep { mBackend.getSearchDepTime(arr) }h  </Text>
          <Text style={_styles.styles.flightResText}>Arr { mBackend.getSearchArrTime(arr) }h  </Text>
        </View>
        <View style={{flex: 1, flexDirection: "column"}}>
          <Text style={{ 
            margin: 10, 
            textAlign: "center", 
            fontFamily: "ComicNeue_700Bold",
            fontSize: 20}}>{ mBackend.getSearchPrice(arr) } FLY</Text>
          <Text style={_styles.styles.flightResText}>{ mBackend.getSearchFlightTime(arr) }</Text>
        </View>
      </TouchableOpacity>
      ))}
    </View>
  );
}


// last screen in booking process
const BookingScreen = ({ navigation }) => {

  // variables for textinput and setPrice
  const [ price, setPrice ] = useState("");
  const [ name, setName ] = useState("");
  const [ surname, setSurname ] = useState("");
  const [ birthDate, setBirthDate ] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{marginRight: 20}}
          onPress={() => navigation.navigate('FLY Portal')}>
          <Entypo name="home" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
      "from": getAirports().pickedDep,
      "to": getAirports().pickedArr,
      "name": name,
      "surname": surname,
      "birthDate": birthDate,
      "flightDate": mBackend.getDate().dateString,
      "departureTime": mBackend.getSearchDepTime(ind),
      "arrivalTime": mBackend.getSearchArrTime(ind),
      "price": mBackend.getSearchPrice(ind),
      "taxes": 0.3 // experimental value to refund taxes if passenger couldn't meet the booking
    });

    // create the ticket with all informations
    funcContracts.getPssInstance()
      .createTicket(
        cid,
        mBackend.getSearchFlightNumber(ind),
        mBackend.getDate().month,
        mBackend.getDate().day,
        price)
      .then(res => {
        if(res) {
          payTicket();
          console.log("Ticket created: ", res);
          alert("Flight is booked. Check your ticket portal for details");
        }
      })
      .catch(err => {
        console.log("Err create ticket: ", err); 
        alert("Flight couldn't be booked")
      });

    // pay the ticket
    const payTicket = async () => {
      await funcContracts.getFlightToken()
        .transfer(vars.airLineAddress, price)
        .then(res => {
          console.log("Ticket is paid: ", res);
          const timeNow = Date.now();
          insertPayment(price, timeNow);
      })
    }

    // insert Payment into Payments
    const insertPayment = async (amount, timestamp) => {
      await funcContracts.getFlightToken()
        .insertPayment(
          amount.toString(), 
          vars.airLineAddress, 
          timestamp.toString())
        .then(res => {
          console.log("Payment inserted ", res);
          navigation.navigate("Book a flight"); // if payment is done - book the flight
        })
    }
  }

  return (
    <ScrollView style={{backgroundColor: materialcolors[0]}}>
    <View style={_styles.styles.containerFlightScreen}>
      <View style={{ 
        width: 400, 
        height: 200, 
        backgroundColor: "white", 
        borderRadius: 40,
        borderColor: materialcolors[3], 
        borderWidth: 2, 
        marginTop: 20 }}>
        <Text style={_styles.styles.flightBookingInfoText}>FLIGHT {mBackend.getSearchFlightNumber(ind)}</Text>
        <Text style={_styles.styles.flightBookingInfoText}>From {getAirports().pickedDep} to {getAirports().pickedArr}</Text>
        <Text style={_styles.styles.flightBookingInfoText}>Date: {mBackend.getDate().dateString}</Text>
        <Text style={_styles.styles.flightBookingInfoText}>Departure: {mBackend.getSearchDepTime(ind)}</Text>
        <Text style={_styles.styles.flightBookingInfoText}>Arrival: {mBackend.getSearchArrTime(ind)}</Text>
        <Text style={_styles.styles.flightBookingInfoText}>Price is {price} FLY</Text>
      </View>

      <Text style={_styles.styles.searchLabelText}>Name</Text>
      <TextInput style={_styles.styles.textInputBox} onChangeText={ (value) => { setName(value) }}/>      

      <Text style={_styles.styles.searchLabelText}>Surname</Text>
      <TextInput style={_styles.styles.textInputBox} onChangeText={ (value) => { setSurname(value) }}/>     

      <Text style={_styles.styles.searchLabelText}>Birthdate</Text>
      <TextInput style={_styles.styles.textInputBox} placeholder="dd.mm.yyyy" onChangeText={ (value) => { setBirthDate(value) }}/>     
  
      <TouchableOpacity
            style={{
              borderRadius: 45,
              width: 300, 
              height:40, 
              marginTop:20, 
              backgroundColor: materialcolors[2]}}
            onPress={() => {console.log("Pressed"); payAndBook();}}>
            <Text style={{color:"#fff", fontSize: 18, textAlign: "center", margin: 10}}>Pay and Book flight</Text> 
        </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

// screen to look for all balances and the current token amount
const TokenPortal = ({ navigation }) => {

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{marginRight: 20}}
          onPress={() => navigation.navigate('FLY Portal')}>
          <Entypo name="home" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const [ claimDialog, setClaimDialog ] = useState(false);

  // mint new tokens
  const claimTokens = () => {
    funcContracts.getFlightToken()._mint(_walletUtils.getAddress(), 3000)
      .then(() => {console.log("3000 tokens added to your account"); setClaimDialog(true); getTotalSupply();})
      .catch(err => {console.log("Error: ", err);  alert(err)});
  }

  const itemView = ({item}) => {

    var date = new Date(parseInt(item._timestamp));
    var minutes = 0;
    if(date.getMinutes()<10) {
      minutes = "0" + date.getMinutes();
    }
    else {
      minutes = date.getMinutes();
    }
    var textDate = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + " " + date.getHours() + ":" + minutes;

    return (
      <View style={{borderColor: "blue", borderWidth: 1, flex: 1, flexDirection: "column", margin: 5}}>
        <Text>{item._amount}</Text>
        <Text>From: {item._sender}</Text>
        <Text>To: {item._recipient}</Text>
        <Text>Time: {textDate}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={{marginTop: 40}}>
          <View style={_styles.styles.containerFlightScreen}>
              <Text style={{ fontSize: 16, color: "blue"}}>Balance: {vars.tokens} FLY</Text>
              <SafeAreaView style={{width: 400, height: 400}}>
                <FlatList
                  data={dataToDisplayAsList}
                  renderItem={itemView}
                  keyExtractor={dataToDisplayAsList => dataToDisplayAsList.timestamp}
                />
              </SafeAreaView>
              { dataToDisplayAsList.length == 0?<Text>No balances available</Text> : null}
              <TouchableOpacity style={{width: 200, alignItems: "center", backgroundColor: "blue", height: 60, margin: 15}} 
                onPress={() => {
                    claimTokens();
                  }}>
                <Text style={{fontSize: 14, color: "white", marginTop: 20}}>Buy Tokens</Text>
              </TouchableOpacity>

              <Dialog visible={claimDialog}
                footer={
                  <DialogFooter>
                    <DialogButton text="OK" onPress={() => {setClaimDialog(false)}} />
                  </DialogFooter>
                }>
                <DialogContent>
                  <Text>Claimed Tokens</Text>
                </DialogContent>
              </Dialog>

          </View> 
      </ScrollView>
  )
}


// main starting point
const App = ({ navigation }) => {

  // back button handler
  useEffect(() => {
    const myBackAction = () => {
      console.log("do nothin, backbutton is presses");
      return true;
    };

    const myBackHandler = BackHandler.addEventListener(
      "hardwareBackPress", myBackAction);

    return () => myBackHandler.remove();
  }, );
  

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FLY Portal">
        <Stack.Screen name="FLY Portal" component={MainMenuScreen}
          options={{
            headerShown: false
          }}/>
        <Stack.Screen 
          name="Book and fly" component={BookAFlightScreen} 
          options= {{
            headerStyle: {
              backgroundColor: materialcolors[2]
            }, 
            headerTitleStyle: {
              color: materialcolors[7]
            }
          }}/>
        <Stack.Screen name="Flight Results" component={FlightResultsScreen} 
          options={{
            headerStyle: {
              backgroundColor: materialcolors[2]
            }, 
            headerTitleStyle: {
              color: materialcolors[7]
            }
          }}/>
        <Stack.Screen name="Booking Page" component={BookingScreen} 
          options={{
            headerStyle: {
              backgroundColor: materialcolors[2]
            }, 
            headerTitleStyle: {
              color: materialcolors[7]
            }
          }}/>
        <Stack.Screen name="My Flights" component={TicketPortalScreen} 
          options={{
            headerStyle: {
              backgroundColor: materialcolors[2]
            }, 
            headerTitleStyle: {
              color: materialcolors[7]
            }
          }}/>
        <Stack.Screen name="Ticket Details" component={DetailsScreeen} 
          options={{
            headerStyle: {
              backgroundColor: materialcolors[2]
            }, 
            headerTitleStyle: {
              color: materialcolors[7]
            }
          }}/>
        <Stack.Screen name="Token Portal" component={TokenPortal} 
          options={{
            headerStyle: {
              backgroundColor: materialcolors[2]
            }, 
            headerTitleStyle: {
              color: materialcolors[7]
            }
          }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// export main point to start app
export default App;
