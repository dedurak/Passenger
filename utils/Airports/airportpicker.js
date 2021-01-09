import React, { useState } from "react";
import { airports } from "./airports";
import { View } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { materialcolors } from "../../styles/materialcolors";


var pickedAirports = {
  pickedDep: 'ADB',
  pickedArr: 'ADB'
};


const DepPicker = () => {

  const [dep, setDep] = useState("ADB");

  return (
    <View style={{borderWidth: 2, borderColor: materialcolors[5]}}>
      <Picker
        selectedValue={dep}
        style={{
          height:40,
          backgroundColor: materialcolors[7],
          color: materialcolors[2],
          borderColor: materialcolors[3]
        }}
        onValueChange={(itemVal, itemInd) => {
          setDep(itemVal);
          pickedAirports.pickedDep = itemVal;
          console.log("Dep Airport: ", pickedAirports.pickedDep, 
            "'\n'Arr Airport: ", pickedAirports.pickedArr);
        }}
        mode="dropdown">
        {
          airports.map(arr => (
            <Picker.Item color={materialcolors[2]}  label={arr.origin} value={arr.iata} />    
          ))
        }
      </Picker>
    </View>
  )
}


const ArrPicker = () => {

  const [arr, setArr] = useState("ADB");

  return (
    <View style={{borderWidth: 2, borderColor: materialcolors[5]}}>
      <Picker
        selectedValue={arr}
        style={{
          height:40, 
          backgroundColor: materialcolors[7],
          color: materialcolors[2],
          borderColor: materialcolors[3]
        }}
        onValueChange={(itemVal, itemInd) => {
          setArr(itemVal);
          pickedAirports.pickedArr = itemVal;
          console.log("Dep Airport: ", pickedAirports.pickedDep, 
            "\nArr Airport: ", pickedAirports.pickedArr);
        }}
        mode="dropdown">
        {
          airports.map(arr => (
            <Picker.Item color={materialcolors[2]} label={arr.origin} value={arr.iata} />    
          ))
        }
      </Picker>
    </View>
  )
}

const getAirports = () => {
  return pickedAirports;
}

export {DepPicker, ArrPicker, getAirports};