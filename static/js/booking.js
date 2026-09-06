const headlineUserName = document.getElementById("headlineUserName");
const emptyStatus = document.querySelector(".emptyStatus");

async function checkAuthStatus() {
    const token = localStorage.getItem("jwt_token");
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

            const userName = result.data.name;
            headlineUserName.innerText = userName;

            const bookingResponse = await fetch("/api/booking",{
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const bookingResult = await bookingResponse.json();
            console.log(bookingResult.data)

            if (bookingResult.error){
                console.log(bookingResult.message)
                return 
            }

            if (bookingResult.data === null){
                emptyStatus.style.display = "block";
                return 
            }

            const sectionContainer = document.getElementById("sectionContainer");
            emptyStatus.style.display = "none";

            const bookingData = bookingResult.data;
            const images = JSON.parse(bookingData.attraction.image);
            
            sectionContainer.innerHTML = `
                <div class = "section">
                    <img class = "arrPic" src = "${images[0]}">
                    <div class = "infor">
                        <div class = "inforTitle">台北一日遊：${bookingData.attraction.name}</div>
                        <div class = "inforText">
                            <span class = "subtitle">日期：</span>
                            <span class = "inforContent">${bookingData.date}</span>
                        </div>
                        <div class = "inforText">
                            <span class = "subtitle">時間：</span>
                            <span class = "inforContent">${bookingData.time}</span>
                        </div>
                        <div class = "inforText">
                            <span class = "subtitle">費用：</span>
                            <span class = "inforContent">${bookingData.price}</span>
                        </div>
                        <div class = "inforText">
                            <span class = "subtitle">地點：</span>
                            <span class = "inforContent">${bookingData.attraction.address}</span>
                        </div>
                        <img class = "trashIcon" src = "/static/imgs/trash.png">
                    </div>
                </div>

                <div class = "userData">
                    <div class = "separatorLine"></div>
                    <div class = "contactForm">
                        <div class = "contactFormTitle">您的聯絡資訊</div>
                        <div class = "contactFormDiv">
                            <span class = "contactFormSubtitle">聯絡姓名：</span>
                            <input class = "contactFormInput" id = "contactFormNameInput" type = "text">
                        </div>
                        <div class = "contactFormDiv">
                            <span class = "contactFormSubtitle">連絡信箱：</span>
                            <input class = "contactFormInput" id = "contactFormEmail" type = "email">
                        </div>
                        <div class = "contactFormDiv">
                            <span class = "contactFormSubtitle">手機號碼：</span>
                            <input class = "contactFormInput" id = "contactFormPhone" type = "tel" maxlength="10">
                        </div>
                        <div class = "remark">請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。</div>
                    </div>

                    <div class = "separatorLine"></div>

                    <div class = "payment">
                        <div class = "paymentTitle">信用卡付款資訊</div>
                        <div class = "paymentFormDiv">
                            <span class = "paymentFormSubtitle">卡片號碼：</span>
                            <input class = "paymentFormInput" id = "paymentFormCardNumInput" type = "text" inputmode="numeric" placeholder="xxxx xxxx xxxx xxxx" maxlength="19">
                        </div>
                        <div class = "paymentFormDiv">
                            <span class = "paymentFormSubtitle">過期時間：</span>
                            <input class = "paymentFormInput" id = "paymentFormTimeOutInput" type="text"  placeholder="MM / YY" inputmode="numeric" maxlength="7" >
                        </div>
                        <div class = "paymentFormDiv">
                            <span class = "paymentFormSubtitle">驗證密碼：</span>
                            <input class = "paymentFormInput" id = "paymentFormPwdInput" type = "text" placeholder="CCV" inputmode="numeric" maxlength="3">
                        </div>
                    </div>

                    <div class = "separatorLine"></div>

                    <div class = "confirm">
                        <div class = "confirmDiv">
                            <div class = "totalPrice">總價：新台幣 ${bookingData.price} 元</div>
                            <button class = "confirmBtn">確認訂購並付款</button>
                        </div>
                    </div>
                </div>
            `

            const trashIcon = document.querySelector(".trashIcon");

            trashIcon.addEventListener("click",async function(){
                const token = localStorage.getItem("jwt_token");
                const response = await fetch("/api/booking",{
                        method: "DELETE",
                        headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });
                const result = await response.json();
                console.log(result);
                window.location.reload();
            })

            const paymentFormCardNumInput = document.getElementById("paymentFormCardNumInput");
            paymentFormCardNumInput.addEventListener("input", function(event){
                if(event.inputType === "deleteContentBackward"){
                    return
                }
                const value = event.target.value;
                console.log('目前輸入內容：', value);
                if(value.length === 4 || value.length === 9 || value.length === 14){
                    paymentFormCardNumInput.value = value + " ";
                }
            });

    } catch (error) {
        console.log(error);
    }
}
checkAuthStatus();

