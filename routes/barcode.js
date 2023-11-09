// const API = 'http://192.168.1.5:3000/lector';

export const getCode = async (cod, apiUrl) => {
  const response = await fetch(`${apiUrl}/${cod}`);
  const [data] = await response.json();
  console.log("status:", response.status, ", Data:", data);
  return data;
};

export const postCode = async (newCode, apiUrl) => {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify(newCode),
    });
    // console.log(res);
    return await res.json();
  } catch (err) {
    console.log("Error:", err);
  }
};
