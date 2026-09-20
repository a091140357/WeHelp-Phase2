const tokenBtn = document.getElementById("tokenBtn");
const token = localStorage.getItem("jwt_token");
const mcpToken = document.getElementById("mcpToken");

async function checkAuthStatus(){
    if (!token) {
        window.location.href = "/";
        return;
    }
    try {
        const response = await fetch("/api/user/auth", {
            method: "GET",
            headers: {
                    "Authorization": `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (result.error || !result.data) {
            localStorage.removeItem("jwt_token");
            window.location.href = "/";
            return;
        }

        return result.data;
    }catch (error){
        console.log(error);
    }
}

async function getMcpToken(){
    try {
        const response = await fetch("/api/mcptoken",{
            method:"Get",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const result = await response.json();
        console.log(result);
        return result
    }catch (error){
        console.log(error);
    }
}

async function init(){
    const data = await checkAuthStatus();

    const userName = document.getElementById("userName");
    userName.innerText = data["name"];

    const getMcpTokenData = await getMcpToken();
    const mcpTokenData = getMcpTokenData.mcp_token;

    if(!mcpTokenData){
        mcpToken.innerText = "還未有token，請先按 產出/更新金鑰 按鈕";
    }else{
        mcpToken.innerText = mcpTokenData;
    }

}
init();

tokenBtn.addEventListener("click",async function(event){
    try {
        const response = await fetch("/api/mcptoken",{
            method:"PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const result = await response.json();

        if(result["mcp_token"]){
            mcpToken.innerText = result["mcp_token"];
        }
    }catch (error){
        console.log(error);
    }
})

const loginoutBtn = document.getElementById("loginoutBtn");
loginoutBtn.addEventListener("click",function(event){
        localStorage.removeItem("jwt_token");
        loginBtn.textContent = "登入/註冊";
        window.location.href = "/"; 
})
