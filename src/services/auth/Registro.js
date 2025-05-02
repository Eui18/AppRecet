import axios from "axios";
import { ENDPOINTS } from "../../config/endpoint";

const RegisterService = async ({ nombre, correo, contraseña }) => {
    try {
        
        const response = await axios.post(ENDPOINTS.REGISTER, {
            nombre,
            correo,
            contraseña
        });
       
        
            return {
                msg: "Usuario registrado correctamente",
                data: response.data.data,
            };

        
    } catch (error) {
        if (error.response && (error.response.status === 409)) {
            return {
                msg: "El correo ya está en uso, por favor intenta con otro",
                data: null
            };
        } else {
            return {
                msg: "Hubo un problema con el servidor, por favor intenta de nuevo",
                data: null
            };
        }
    }
}

export default RegisterService;