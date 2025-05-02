import axios from "axios";
import { ENDPOINTS } from "../../config/endpoint";

const getListRecetsService = async ({id_user}) => {
    try {
       
         const response = await axios.get(`${ENDPOINTS.RECIPES}/${id_user}`);
         
         if (response.status === 200) {
            return {
                data: response.data.data,
                msg: "Recetas obtenidas correctamente",
            };
         } else if (response.status === 404) {
            return {
                data: null,
                msg: " no se pudo obtener las recetas para este usuario", 
            };
         } else {
            return {
                data: null,
                msg: "Error inesperado al obtener las recetas",
            };
         }  

    } catch (error) {
        console.error("Hubo un problema al intentar obtener los datos", error);
        throw new Error("Hubo un problema al intentar obtener los datos"); 
    }
}


export default getListRecetsService;