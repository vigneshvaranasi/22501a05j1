export async function loggingMiddleware(stack,level,pkg,message){
    const accessToken = "to-do";
    try{
        const res = await fetch("http://20.244.56.144/evaluation-service/logs",{
            method: "POST",
            headers: {
                "Authorization":`${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({  
                stack: stack,
                level: level,
                package: pkg,
                message: message
            })
        });
        if (!res.ok) {
            throw new Error(`Logging failed`);
        }
        const data = await res.json();
        console.log(data);
        return data;
    }
    catch (err) {
        console.error("Error in loggingMiddleware:", err);
        throw err;
    }
}

// testing
loggingMiddleware("backend", "info", "config", "Testing the log Server");