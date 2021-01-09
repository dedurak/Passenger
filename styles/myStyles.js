import { StyleSheet } from 'react-native';
import { materialcolors } from './materialcolors'; 

export class MyStyles {
    styles = StyleSheet.create({
        bip39Button: {
          alignItems: "center", 
          backgroundColor:materialcolors[2], 
          fontSize: 14, 
          marginTop: 5,
          width:50
        },
        bip39Text: {
          color: materialcolors[2],
          fontSize: 12, 
          textAlign: "center", 
          marginTop: 25,
          width: 300
        },
        buttonSelected: {
          backgroundColor: 'blue'
        },
        buttonNotSelected: {
          backgroundColor: 'white'
        },
        container: {
          flex: 1,
          alignItems: "center",
          backgroundColor: '#fff',
          paddingTop: 20
        },
        checkBoxContainer: {
          borderWidth: 1,
          borderColor: 'blue'
        },
        checkBox: {
          flexDirection: "column",
          margin: 5,
          padding: 5
        },
        containerFlightScreen: {
          flex: 1,
          alignItems: "center",
          backgroundColor: materialcolors[0],
        },
        detailsScreenFirstBox: {
          backgroundColor: materialcolors[7],
          width: 400, 
          height: 120, 
          borderColor: materialcolors[3], 
          borderWidth: 2
        },
        detailsScreenHeader: {
          fontFamily: "ComicNeue_700Bold",
          fontSize: 20, 
          color: materialcolors[7], 
          margin: 5
        },
        detailsScreenText: {
          color: materialcolors[2], 
          fontFamily: "ComicNeue_400Regular",
          fontSize: 16,
          margin: 5, 
          paddingLeft: 50
        },
        flightBookingInfoText: {
          fontFamily: "ComicNeue_700Bold",
          fontSize: 16,
          color: materialcolors[2], 
          margin: 7, 
          paddingLeft: 50
        },
        flightResText: {
          fontFamily: "ComicNeue_700Bold",
          color: materialcolors[2],
          fontSize: 16,
          margin: 5, 
          textAlign: "center"
        },
        headerText: {
          color: '#00008B',
          fontSize: 50
        },
        loginButton: {
          borderRadius: 40,
          backgroundColor: "green", 
          width: 60, 
          marginTop: 50,
          marginLeft: 20,
          paddingTop: 8,
          paddingBottom: 8,
          alignItems: "center"
        },
        logoutButton: {
          backgroundColor: materialcolors[7], 
          width: 60, 
          marginTop: 50,
          marginLeft: 20, 
          paddingTop: 8,
          paddingBottom: 8,
          alignItems: "center"
        },
        menuButton: {
          borderRadius: 60,
          width: 350, 
          height:70, 
          backgroundColor: materialcolors[7], 
          marginBottom: 20, 
          alignItems: "center"
        },
        menuText: {
          color: materialcolors[2], 
          fontFamily: "ComicNeue_700Bold",
          fontSize: 20, 
          textAlign: "center",
          margin: 10
        },
        passphraseText: {
          color: materialcolors[2],
          fontSize: 15, 
          textAlign: "center", 
          marginTop: 15,
        },
        screenHeader: {
          fontSize: 22, 
          fontFamily: "ComicNeue_700Bold",
          color: materialcolors[7],
          marginTop: 15
        },
        searchLabelText: {
          color: materialcolors[7],
          fontFamily: "ComicNeue_400Regular",
          fontSize: 16,
          paddingTop: 10,
          paddingBottom: 5
        },
        textInputBox: {
          backgroundColor: "white",
          borderColor: materialcolors[2],
          borderWidth: 2,
          color: materialcolors[2],
          width: 300,
          height: 40,
          padding: 10
        },
        ticketBoxHeader: {
          fontFamily: "ComicNeue_700Bold",
          color: materialcolors[2], 
          margin: 5, 
          paddingLeft: 50
        },
        ticketBoxText: {
          fontFamily: "ComicNeue_400Regular",
          color: materialcolors[2], 
          margin: 5, 
          paddingLeft: 50
        }
      })
}