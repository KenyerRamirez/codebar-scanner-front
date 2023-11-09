import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import { postUser } from "../routes/register";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { getApi } from "../routes/test";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RuedaCarga from "./RuedaCarga";

const Login = ({ config, handleUser }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState({
    nombre: "",
    contrasena: "",
  });
  const [ip, setIp] = useState("");
  // const [port, setPort] = useState("");
  const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const getConfig = async () => {
        try {
          const savedIp = await AsyncStorage.getItem("ip");
          // const savedPort = await AsyncStorage.getItem("port");

          if (savedIp) {
            setIp(savedIp);
            // setPort(savedPort);

            if (savedIp) {
              const apiUrl = `https://${savedIp}.loca.lt/test`;
              // const apiUrl = `http://${savedIp}:${savedPort}/test`;
              const res = await getApi(apiUrl);
              console.log(apiUrl)

              if (typeof res !== "object") {
                Alert.alert(
                  "¡Espera!",
                  "La dirección no se puede conectar a la API, ve a configuración e ingresa el correcto.",
                  [
                    {
                      text: "Ir a configuración",
                      onPress: () => {
                        navigation.navigate("Api");
                      },
                    },
                  ]
                );
              } else {
                //
              }
            } else {
              // continúa
            }
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

      getConfig();
    }, []);

  axios.defaults.withCredentials = true;
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      let apiUrl = ``;
      if (!(config.ip == "")) {
        apiUrl = `https://${config.ip}.loca.lt/login`;
        // apiUrl = `http://${config.ip}:${config.port}/login`;
        console.log("dirección con config: ", apiUrl);
      } else {
        apiUrl = `https://${ip}.loca.lt/login`;
        // apiUrl = `http://${ip}:${port}/login`;
        console.log("dirección con async: ", apiUrl);
      }
      console.log("Esta es la dirección: ", apiUrl);
      const res = await postUser(user, apiUrl);
      console.log(res);
      if (res.usuario) {
        // Alert.alert("¡Inicio de sesión exitoso!", `¡Bienvenido ${res.usuario.nombre}!`);
        handleUser(user.nombre);
        console.log(user.nombre);
        if (res.usuario.rol == "admin") {
          navigation.navigate("LectorAdmin");
        } else if (res.usuario.rol == "colector") {
          navigation.navigate("LectorColector");
        } else if (res.usuario.rol == "visor") {
          navigation.navigate("LectorVisor");
        }
      } else {
        Alert.alert("Error", "Nombre de usuario o contraseña incorrectos.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Error en la consulta, ejecuta el servidor para continuar."
      );
      console.log(error);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleChange = (name, value) => {
    setUser({ ...user, [name]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gradientOverlay} />
      <View style={styles.imagen}>
        <Image
          source={require("../assets/user2.png")}
          style={styles.userImage}
        />
      </View>
      <View style={styles.inputs}>
        <TextInput
          placeholder="Nombre de usuario"
          style={styles.inputName}
          onChangeText={(text) => handleChange("nombre", text)}
          value={user.nombre}
        />
        <TextInput
          placeholder="Contraseña"
          value={user.contrasena}
          onChangeText={(text) => handleChange("contrasena", text)}
          style={styles.inputAm}
          secureTextEntry={true} // Para ocultar la contraseña
        />
        <TouchableOpacity style={styles.submit} onPress={handleLogin}>
          <Text style={{ color: "white", textAlign: "center" }}>
            Iniciar Sesión
          </Text>
        </TouchableOpacity>
        {isLoading && <RuedaCarga />}
        {/* <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={{ color: "blue", textAlign: "center" }}>¿No tienes una cuenta? Regístrate aquí</Text>
        </TouchableOpacity> */}
      </View>
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
  imagen: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 12,
  },
  userImage: {
    width: 160,
    height: 160,
    borderRadius: 50,
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
  inputName: {
    padding: 9,
    width: "70%",
    textAlign: "center",
    borderRadius: 10,
    backgroundColor: "#E5E5E5",
  },
  picker: {
    width: "40%",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    marginVertical: 20,
    textAlign: "center",
  },
  inputText: {
    borderWidth: 1,
    borderColor: "black",
    padding: 9,
    width: "70%",
    textAlign: "center",
    borderRadius: 10,
    marginTop: 30,
  },
  inputAm: {
    padding: 9,
    width: "70%",
    textAlign: "center",
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "#E5E5E5",
  },
  search: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: "black",
  },
  submit: {
    marginBottom: "70%",
    borderRadius: 10,
    padding: 10,
    marginTop: 30,
    backgroundColor: "#02A0CA",
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
    left: 0,
    right: 0,
    alignItems: "center",
  },
});

export default Login;
