import axios from "axios";
import { ENDPOINTS } from "../../config/endpoint";

const loginService = async ({correo, contraseña}) => {
    try {
        
        const response = await axios.post(ENDPOINTS.LOGIN, {
            correo,
            contraseña
        });
        
        console.log("Respuesta del servidor:", response.data.data); 
            return {
                msg: "Inicio de sesión exitoso",
                data: response.data.data || null
            }


    } catch (error) {
      

        if (error.response && (error.response.status === 401 || error.response.status === 404)) {
            return {
                msg: "Error al iniciar sesión, verifica tus credencialess",
                data: null
            };
        } else {
            return {
                msg: "Error inesperado, por favor intenta de nuevo",
                data: null
            };
        }

    }
}


export default loginService;