
const API_URL = 'http://localhost:5000/api';

export const loginadmin = async(username:string,password:string) => {
    try {
       const response = await fetch(`${API_URL}/4dm13n`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok){

        throw new Error(data.message || "No miras no miras")
    }
    return data;
    }
    catch (error: any) {
        throw new Error (error.message);
    }
}