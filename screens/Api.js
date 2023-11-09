import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getApi } from "../routes/test";
import ImagenHeader from "./ImagenHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RuedaCarga from "./RuedaCarga";

const Api = ({ onConfigChange }) => {
  const [ip, setIp] = useState("");
  // const [port, setPort] = useState("");
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getConfig = async () => {
      try {
        const savedIp = await AsyncStorage.getItem("ip");
        // const savedPort = await AsyncStorage.getItem("port");
        if (savedIp) {
          setIp(savedIp);
          // setPort(savedPort);
        }
      } catch (error) {
        console.error("Error al recuperar la configuración: ", error);
      }
    };
    getConfig();
  }, []);

  const saveConfig = async () => {
    const apiUrl = `https://${ip}.loca.lt`;
    console.log(apiUrl);
    setIsLoading(true);
    try {
      const apiUrl = `https://${ip}.loca.lt/test`;
      // const apiUrl = `http://${ip}:${port}/test`;
      const res = await getApi(apiUrl);

      if (res.Status === "Success") {
        Alert.alert("¡Muy bien!", "Dirección correcta.");
        navigation.navigate("Login");
        setError(null);
        await AsyncStorage.setItem("ip", ip);
        // await AsyncStorage.setItem("port", port);
      } else {
        Alert.alert("Espera", "La dirección es incorrecta. Intenta de nuevo.");
        setError("Espera, la dirección es incorrecta. Intenta de nuevo.");
      }
    } catch (error) {
      Alert.alert("Espera", "la dirección incorrecta. Intenta de nuevo.");
      setError("Espera, la dirección es incorrecta. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }

    // Guardar la configuración en el estado local del componente Api
    onConfigChange({ ip });
    // onConfigChange({ ip, port });
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.gradientOverlay} />
      <View style={styles.view}>
        <Text style={styles.title}>Ingresa los datos</Text>
        <TextInput
          placeholder="Ingresa el nombre del subdominio"
          value={ip}
          onChangeText={(text) => setIp(text)}
          style={styles.input}
        />
        {/* <TextInput
          placeholder="Puerto"
          value={port}
          onChangeText={(text) => setPort(text)}
          style={styles.input}
        /> */}
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity style={styles.button} onPress={saveConfig}>
            <Text style={{ color: "white", textAlign: "center" }}>
              Guardar y salir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {isLoading && <RuedaCarga />}

      {/* <View style={styles.footer}>
          <Text style={{ marginRight: 30, fontSize: 20, color: "gray" }}>
            Designed by
          </Text>
          <Image
      source={require('../assets/MultilogoPNGR.png')} // Ruta de la imagen
      style={{ width: 180, height: 70, marginLeft: -66, marginBottom: -27, resizeMode: 'contain' }} // Estilos de la imagen
    />
        </View> */}
      <View style={styles.footer}>
        <Text style={{ marginRight: 30, fontSize: 20, color: "gray" }}>
          Designed by
        </Text>
        <Image
          source={require("../assets/MultilogoPNGR.png")}
          style={{
            width: 180,
            height: 70,
            marginLeft: -66,
            marginBottom: -27,
            resizeMode: "contain",
          }}
        />
      </View>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logoMulti-removebg-HD.png")}
          style={{
            width: "100%",
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    elevation: 120,
    backgroundColor: "#E4E4E4",
    shadowColor: "black",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: "#02A0CA",
    marginBottom: 233,
    width: "40%",
  },
  view: {
    marginTop: 55,
    margin: 35,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
    color: "#5B5B5B",
  },
  input: {
    backgroundColor: "#E5E5E5",
    borderColor: "black",
    padding: 10,
    textAlign: "center",
    borderRadius: 5,
    marginBottom: 15,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "",
    padding: 10,
    bottom: -130,
    zIndex: 3
  },
});

export default Api;
