import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  BackHandler,
  Alert,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { getCode, postCode } from "../routes/barcode";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LectorAdmin = ({ config, UserName }) => {
  const navigation = useNavigation();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setscanning] = useState(false);
  const [code, setcode] = useState({
    chijo: "",
  });
  const [movement, setmovement] = useState({
    user: UserName,
    cod_prod: "",
    conteo: "",
  });
  const [inv, setinv] = useState({
    descrip: "",
    precio1: "",
    existencia: "",
  });
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");

  useEffect(() => {
    console.log("Iniciado ", movement.user);
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
      setScanned(true);
    };

    const getConfig = async () => {
      try {
        const savedIp = await AsyncStorage.getItem("ip");
        const savedPort = await AsyncStorage.getItem("port");
        if (savedIp && savedPort) {
          setIp(savedIp);
          setPort(savedPort);
        } else {
          Alert.alert(
            "¡Hola!",
            "Por favor ingresa la dirección IP y puerto al que se conectará.",
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

  const handleSubmit = async () => {
    try {
      if (movement.conteo === parseInt("")) {
        Alert.alert("Espera", "No dejes campos vacíos.");
        console.log("No dejes campos vacíos.");
      } else {
        const apiUrl = `http://${ip}:${port}/lector`;
        const res = await postCode(movement, apiUrl);
        if (res) {
          Alert.alert("¡Muy bien!", "Registro exitoso");
          setcode({ chijo: "" });
          setinv({ descrip: "", precio1: "", existencia: "" });
          setmovement({ conteo: "", user: UserName });
          setScanned(true);
        }
      }
    } catch (error) {
      navigation.navigate("Login");
      Alert.alert(
        "Error",
        "Error en la consulta, dirección y puerto incorrectos o inexistentes.",
        [
          {
            text: "Ir a inicio",
            onPress: () => {
              navigation.navigate("Login");
            },
          },
        ]
      );
    }
  };

  const handleChange = (name, value) => {
    try {
      setmovement({ ...movement, conteo: parseInt(value) });
    } catch (err) {}
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setcode({ chijo: data });
    handleSearch(data);
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const handleClean = () => {
    setScanned(true);
    setcode({ chijo: "" });
    setinv({ descrip: "", precio1: "", existencia: "" });
    setmovement({ conteo: "", user: UserName });
  };
  const handleSearch = async (data) => {
    // console.log(data)
    if (code.chijo == "") {
      setScanned(false);
      setTimeout(() => {
        setScanned(true);
      }, 5000);
    } else {
      setScanned(true);
    }
    try {
      // console.log(codeToSearch)
      const apiUrl = `http://${ip}:${port}/lector`;
      const [result] = await getCode(code.chijo, apiUrl);
      // const apiUrlUser = `http://${config.ip}:${config.port}/lector`
      // const [user] = await getUsers(apiUrlUser)
      // setmovement({ id_user: user[0].id_user, cod_prod: code.chijo });

      if (result) {
        setinv({
          descrip: result.descrip,
          precio1: result.precio1 + " $",
          existencia: result.existencia + " unidades",
        });
        setmovement({ cod_prod: code.chijo, user: UserName, conteo: "" });
        console.log(movement);
      } else {
        Alert.alert(
          "Lo siento",
          "No se encontraron productos con ese código, intenta nuevamente."
        );
      }
    } catch (error) {}
  };

  if (hasPermission === null) {
    return (
      <View>
        <View style={styles.gradientOverlay} />
        <Text style={{ fontSize: 20, textAlign: "center", marginTop: 25 }}>
          Esperando permisos para utilizar la cámara.
        </Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View>
        <View style={styles.gradientOverlay} />
        <Text style={{ fontSize: 20, textAlign: "center", marginTop: 25 }}>
          Acceso denegado para utilizar la cámara.
        </Text>
      </View>
    );
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
          <TouchableOpacity style={styles.search} onPress={handleSearch}>
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
      <View style={styles.inputsOne}>
        <ScrollView style={styles.inputText}>
          <TextInput
            placeholder="Descripción"
            value={inv.descrip}
            multiline
            editable={false}
            style={{ color: "black", textAlign: "center" }}
          />
        </ScrollView>
        <ScrollView style={styles.inputAm}>
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
        <TextInput
          placeholder="Ingresar conteo"
          keyboardType="numeric"
          editable={movement.conteo == "" && inv.descrip == "" ? false : true}
          onChangeText={(text) => handleChange("conteo", text)}
          style={styles.inputAm}
          value={movement.conteo}
        />
        {movement.conteo == "" || movement.conteo == parseInt("") ? (
          <View style={styles.submitDisabled}>
            <Text style={{ color: "white" }}>Registrar</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
            <Text style={{ color: "white" }}>Registrar</Text>
          </TouchableOpacity>
        )}
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
    marginTop: 30,
  },
  inputAm: {
    backgroundColor: "#E5E5E5",
    padding: 9,
    width: "70%",
    textAlign: "center",
    borderRadius: 10,
    marginTop: 10,
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
});

export default LectorAdmin;