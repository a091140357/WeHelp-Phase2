const loginBtn = document.querySelector(".loginBtn");
const loginSection = document.querySelector(".loginSection");
const loginCloseImg = document.querySelector(".loginCloseImg");
const signupBtn = document.querySelector(".signupBtn");
const loginFormInputBtn = document.querySelector(".loginFormInputBtn");
const loginForm = document.querySelector(".loginForm");
const loginFormInputEmail = document.getElementById("loginFormInputEmail");
const loginFormInputPwd = document.getElementById("loginFormInputPwd")
const login = document.querySelector(".login");
const signupText = document.querySelector(".signupText");
const loginTitle = document.querySelector(".loginTitle");


let isLogin = true;

function closeSignup(){
    if(isLogin === true){
        return;
    }
    const nameInput = document.getElementById("loginFormInputname");
    if(nameInput){
        loginForm.removeChild(nameInput);
        loginTitle.innerText = "登入會員帳號";
        loginFormInputBtn.innerText = "登入帳戶";
        signupText.innerText = "還沒有帳戶？";
        signupBtn.innerText = "點此註冊";
        login.style.height = "275px";
    }

    isLogin = true;
}

loginBtn.addEventListener("click", function(event){

    if (loginBtn.textContent === "登出系統") {
        localStorage.removeItem("jwt_token");
        loginBtn.textContent = "登入/註冊";
        window.location.href = "/"; 
        return;
    }
    
    loginSection.style.display = "flex";
    document.body.style.overflow = "hidden";
})

function clickOutSide(event){
    const clickOut = document.querySelector(".loginSection");
    if(event.target === clickOut){
        loginSection.style.display = "none";
        closeSignup();
        loginFormInputEmail.value = "";
        loginFormInputPwd.value = "";
        document.body.style.overflow = "";
        hideError();
    }
}

loginCloseImg.addEventListener("click", function(event){
    loginSection.style.display = "none";
    closeSignup();
    loginFormInputEmail.value = "";
    loginFormInputPwd.value = "";
    document.body.style.overflow = "";
    hideError();
})

signupBtn.addEventListener("click", function(event){
    if(isLogin === false){
        closeSignup();
        return;
    }
    loginFormInputBtn.innerText = "註冊新帳戶";
    loginTitle.innerText = "註冊會員帳號";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "loginFormInputname";
    nameInput.className = "loginFormInput";
    nameInput.placeholder = "輸入姓名";
    loginForm.insertBefore(nameInput, loginFormInputEmail);
    signupText.innerText = "已經有帳戶了？";
    signupBtn.innerText = "點此登入";

    login.style.height = "332px";

    isLogin = false;
})

const errorMessage = document.getElementById("errorMessage");

function showError(msg){
    errorMessage.textContent = msg;
    errorMessage.style.display = "flex";
}
function hideError(){
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
}

loginFormInputBtn.addEventListener("click", async function(event){
    hideError();

    errorMessage.style.color = "red";
    
    const userEmail = loginFormInputEmail.value.trim();
    const userPassword = loginFormInputPwd.value.trim();
    if(userEmail === "" && userPassword === ""){
        showError("Email、密碼不能是空的");
        return;
    }
    if(userEmail === ""){
        showError("Email不能是空的");
        return;
    }
    if(userPassword === ""){
       showError("密碼不能是空的"); 
       return;
    }

    if(isLogin === true){
        try{
            const response = await fetch("/api/user/auth",{
                method:"PUT",
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    email:userEmail,
                    password:userPassword
                })
            });
        const data = await response.json();
        if(data.token){
            localStorage.setItem("jwt_token", data.token);
            window.location.reload();
        }else{
            showError(data.message);
        }
        }catch(error){
            showError("伺服器異常");
        }
    }
    
    if(isLogin === false){
        const userName = document.getElementById("loginFormInputname").value.trim();
        if(userName === ""){
            showError("姓名不能是空的"); 
            return;
        }
        try{
            const response = await fetch("/api/user",{
                method:"POST",
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    name:userName,
                    email:userEmail,
                    password:userPassword
                })
            });
            const data = await response.json();

            if(data.ok){
                errorMessage.style.color = "green";
                showError("註冊成功");
            }else{
                showError(data.message);
            }
        }catch{
            showError("伺服器異常");
        }
    }
});

async function checkAuthStatus(){
    const token = localStorage.getItem("jwt_token");

    if (!token){
        loginBtn.textContent = "登入/註冊";
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

        if (result.data) {
            loginBtn.textContent = "登出系統";
        } else {
            loginBtn.textContent = "登入/註冊";
            localStorage.removeItem("jwt_token");
        }
        } catch (error) {
            loginBtn.textContent = "登入/註冊";
    }
}

checkAuthStatus();

const title = document.querySelector(".title");
title.addEventListener("click", function(){
    window.location.href = "/";
})

const bookingBtn = document.querySelector(".bookingBtn");
bookingBtn.addEventListener("click", function(){
    const token = localStorage.getItem("jwt_token");
    if (!token){
        loginBtn.click();
        return;
    } 
    
   window.location.href = "/booking"; 
})