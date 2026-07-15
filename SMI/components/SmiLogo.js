// components/SmiLogo.js

 

import React from "react";

import { Image, StyleSheet, View } from "react-native";

 

export default function SmiLogo({ size = 130 }) {

  return (

    <View

      style={[

        styles.logoWrap,

        {

          width: size,

          height: size,

          borderRadius: size / 2,

        },

      ]}

    >

      <Image

        source={require("../assets/images/smi-coop-logo.png")}

        style={styles.logoImage}

        resizeMode="cover"

      />

    </View>

  );

}

 

const styles = StyleSheet.create({

  logoWrap: {

    backgroundColor: "#ffffff",

    justifyContent: "center",

    alignItems: "center",

    overflow: "hidden",

  },

 

  logoImage: {

    width: "100%",

    height: "100%",

  },

});