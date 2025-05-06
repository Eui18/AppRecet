import axios from "axios";
import { ENDPOINTS} from "../../config/endpoint";

export const adquirePayment = async ({id_user}) => {

    try {
        
        const response = await axios.post(ENDPOINTS.Payment, {id_user});
        return response.data;


    } catch (error) {

        if (error.response && (error.response.status === 400)) {
            return {
                msg: "Asegurate de mandar el id de usuario",
                data: null
            };
        } else  if (error.response && (error.response.status === 500)){
            return {
                msg: "Hubo un problema con el servidor, por favor intenta de nuevo",
                data: null
            };
        }
    }
    

}


export const cancelSuscription = async ({id_user, id_suscription}) => {

    try {
        
        const response = await axios.post(ENDPOINTS.SuscriptionCancel, {
            id_user,
            id_suscripcion: id_suscription}
        
        );
        
        return {
            data: response.data,
            msg: "La suscripcion ha sido cancelada con exito"
        };


    } catch (error) {

        if (error.response && (error.response.status === 400)) {
            return {
                msg: "Asegurate de mandar el id de usuario y el id de la suscripcion",
                data: null
            };
        } else  if (error.response && (error.response.status === 500)){
            return {
                msg: "Hubo un problema con el servidor, por favor intenta de nuevo",
                data: null
            };
        }
    }
}