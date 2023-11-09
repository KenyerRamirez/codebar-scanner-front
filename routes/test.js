export const getApi = async (apiUrl) => {
    try{
        const response = await fetch(`${apiUrl}`);
        const data = await response.json();
        console.log(data)
        return data;
    }catch(error){
        console.log('Dirección y puertos incorrectos.', error)
        return data.status(404)
    }
};