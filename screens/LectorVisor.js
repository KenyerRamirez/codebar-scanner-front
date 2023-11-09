import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  BackHandler,
  Image,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { getCode } from "../routes/barcode";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RuedaCarga from "./RuedaCarga";

const LectorVisor = ({ config }) => {
  const navigation = useNavigation();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [code, setcode] = useState({
    chijo: "",
  });
  const [inv, setinv] = useState({
    descrip: "",
    precio1: "",
    existencia: "",
  });
  const [ip, setIp] = useState("");
  // const [port, setPort] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setdone] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
      setScanned(true);
    };

    const getConfig = async () => {
      try {
        const savedIp = await AsyncStorage.getItem("ip");
        // const savedPort = await AsyncStorage.getItem("port");
        if (savedIp) {
          setIp(savedIp);
          // setPort(savedPort);
        } else {
          Alert.alert(
            "¡Hola!",
            "Por favor ingresa la dirección a la que se conectará.",
            [
              {
                text: "Ir a configuración",
                onPress: () => {
                  navigation.navigate("Api");
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error al recuperar la configuración:", error);
      }
    };

    const backAction = () => {
      Alert.alert("Espera", "Para salir de la app debes cerrar sesión.");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    getConfig();
    getBarCodeScannerPermissions();
    return () => backHandler.remove();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setcode({ chijo: data });
    handleSearch(data);
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const handleClean = async () => {
    setScanned(true);
    setcode({ chijo: "" });
    setinv({ descrip: "", precio1: "", existencia: "" });
  };

  const handleReSearch = () => {
    setTimeout(() => {
      setScanned(false);
      setTimeout(() => {
        setScanned(true);
      }, 5000);
      if (code.chijo != "") {
        setScanned(true);
        if (inv.descrip == "") {
          setIsLoading(true);
        }
      }
    }, 1000);
  };

  const handleScanning = async () => {
    setScanned(false);
    setTimeout(() => {
      setScanned(true);
    }, 5000);
    if (code.chijo != "") {
      setScanned(true);
      if (inv.descrip == "") {
        setIsLoading(true);
      }
    }
  };

  const handleSearch = async (data) => {
    await handleScanning();

    try {
      let apiUrl = ``;
      if (!(config.ip == "")) {
        apiUrl = `https://${config.ip}.loca.lt/lector`;
        // apiUrl = `http://${config.ip}:${config.port}/lector`;
        console.log("dirección con config: ", apiUrl);
      } else {
        apiUrl = `https://${ip}.loca.lt/lector`;
        // apiUrl = `http://${ip}:${port}/lector`;
        console.log("dirección con async: ", apiUrl);
      }
      if(code.chijo != ''){
        const result = await getCode(code.chijo, apiUrl);
        if (typeof result === "object") {
          setinv({
            descrip: result.descrip,
            precio1: result.precio1 + " $",
            existencia: result.existencia + " unidades",
          });
          // console.log(result);
          // console.log(inv);
        } else {
          Alert.alert(
            "Lo siento",
            `No se encontraron productos con el código ${code.chijo}, intenta nuevamente.`
          );
          setcode({ chijo: "" });
        }
    }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <ScrollView>
      <View style={styles.gradientOverlay} />
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.camera}
      />
      <View
        style={{
          padding: 10,
          marginTop: 10,
        }}
      ></View>
      <View style={styles.inputs}>
        <TextInput
          placeholder={scanned ? "Escanea o escribe el código" : "..."}
          style={styles.inputCode}
          value={code.chijo}
          keyboardType="numeric"
          editable={scanned ? true : false}
          onChangeText={(text) => {
            setcode({ chijo: text });
          }}
        />
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            style={styles.search}
            onPress={handleSearch}
            disabled={inv.descrip != "" ? true : false}
          >
            <Text style={{ color: "white" }}>
              {scanned ? "Buscar" : "Buscando"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clean} onPress={handleClean}>
            <Text style={{ color: "white" }}>
              {scanned ? "Limpiar" : "Cancelar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputs}>
        <ScrollView style={styles.inputText}>
          <TextInput
            placeholder="Descripción"
            value={inv.descrip}
            multiline
            editable={false}
            style={{ color: "black", textAlign: "center" }}
          />
        </ScrollView>
        <ScrollView style={styles.inputRest}>
          <TextInput
            placeholder="Precio"
            value={inv.precio1.toString()}
            multiline
            editable={false}
            style={{ color: "black", textAlign: "center" }}
          />
        </ScrollView>
        <ScrollView style={styles.inputAm}>
          <TextInput
            placeholder="Existencia"
            value={inv.existencia.toString()}
            multiline
            editable={false}
            style={{ color: "black", textAlign: "center" }}
          />
        </ScrollView>
      </View>
      {isLoading && <RuedaCarga />}
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
  container: {
    flex: 1,
    width: "100%",
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
  camera: {
    height: 300,
    marginTop: 40,
    borderColor: "red",
    borderRadius: 10,
  },
  inputs: {
    marginTop: 20,
    alignItems: "center",
  },
  inputsOne: {
    alignItems: "center",
  },
  inputCode: {
    backgroundColor: "#E5E5E5",
    padding: 9,
    width: "70%",
    textAlign: "center",
    borderRadius: 10,
  },
  inputText: {
    backgroundColor: "#E5E5E5",
    padding: 9,
    width: "70%",
    textAlign: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  inputRest: {
    backgroundColor: "#E5E5E5",
    padding: 9,
    width: "70%",
    textAlign: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  inputAm: {
    backgroundColor: "#E5E5E5",
    padding: 9,
    width: "70%",
    textAlign: "center",
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 120,
    zIndex: 3,
  },
  search: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    margin: 5,
    backgroundColor: "#02A0CA",
  },
  submit: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: "#02A0CA",
    marginBottom: 70,
  },
  submitDisabled: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: "gray",
    marginBottom: 70,
  },
  searching: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: "#38DBBD",
  },
  clean: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    margin: 5,
    backgroundColor: "#0D4D80",
  },
  footer: {
    flexDirection: "row",
    zIndex: 9,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    bottom: 65,
  },
  logoContainer: {
    position: "absolute",
    bottom: 0,
    left: -6,
    right: 0,
    alignItems: "center",
  },
});

export default LectorVisor;
