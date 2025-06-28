export default async function getAccessToken(){
    try{
        const res = await fetch("http://20.244.56.144/evaluation-service/auth",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: process.env.EMAIL,
                name: process.env.NAME,
                rollNo: process.env.ROLL_NO,
                accessCode: process.env.ACCESS_CODE,
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET
            })
        })
        const data = await res.json();
        console.log('data: ', data);
        return data.access_token;
    }
    catch(err){
        console.error("Error fetching access token:", err);
        return null;
    }
}