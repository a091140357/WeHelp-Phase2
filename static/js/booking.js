let attractionName = "";
let attractionDate = "";
let attractionTime = "";
let attractionPrice = "";
let attractionAddress = "";
let attractionImage = "";
let attractionId = "";
let userName = "";
let userEmail = "";
let userPhone = "";

async function checkAuthStatus(){
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

        return result.data;
    }catch (error){
        console.log(error);
    }
}

async function initPage(){
    const userData = await checkAuthStatus();
    if (!userData) {
        window.location.href = "/";
        return;
    }

    const headlineUserName = document.getElementById("headlineUserName");
    headlineUserName.innerText = userData.name;

    const token = localStorage.getItem("jwt_token");

    const bookingResponse = await fetch("/api/booking",{
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const bookingResult = await bookingResponse.json();
            console.log(bookingResult.data);
            const emptyStatus = document.querySelector(".emptyStatus");

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

            attractionName = bookingData.attraction.name;
            attractionDate = bookingData.date;
            attractionTime = bookingData.time;
            attractionPrice = bookingData.price;
            attractionAddress = bookingData.attraction.address;
            attractionImage = images[0];
            attractionId = bookingData.attraction.id;
            
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
                            <div class = "tpfieId" id = "card-number"></div>
                        </div>
                        <div class = "paymentFormDiv">
                            <span class = "paymentFormSubtitle">過期時間：</span>
                            <div class = "tpfieId" id = "card-expiration-date"></div>
                        </div>
                        <div class = "paymentFormDiv">
                            <span class = "paymentFormSubtitle">驗證密碼：</span>
                            <div class = "tpfieId" id = "card-ccv"></div>
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

            initTapPay();

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
}

function initTapPay(){
    TPDirect.setupSDK(171064, 'app_LmWfZd4qMvpxcJ9zk5h7QC3StH6yQFpGsq34FAgZAXfX1t5zHrMhzdRas3tv', 'sandbox');

    let fields = {
        number: {
            // css selector
            element: document.getElementById('card-number') ,
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            // DOM object
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: document.getElementById('card-ccv'),
            placeholder: 'ccv'
        }
    }

    TPDirect.card.setup({
        fields: fields,
        styles: {
            'input': {
                'color' : '#000000',
                'font-weight' : '500'
            },
            'input.ccv': {
                'font-size': '16px'
            },
            'input.expiration-date': {
                'font-size': '16px'
            },
            'input.card-number': {
                'font-size': '16px'
            },
            //輸入時文字的樣式
            ':focus': {
                'color': 'black'
            },
            //輸入格式正確時的樣式
            '.valid': {
                'color': 'green'
            },
            //輸入格式錯誤時的樣式
            '.invalid': {
                'color': 'red'
            }
        }
    })

    const confirmBtn = document.querySelector(".confirmBtn");
    
    confirmBtn.addEventListener("click", function(){
        const tappayStatus = TPDirect.card.getTappayFieldsStatus();
        
        if (tappayStatus.canGetPrime === false){
            alert('can not get prime')
            return;
        }
        
        TPDirect.card.getPrime(async function(result){
            if (result.status !== 0) {
                console.error('getPrime error',result.msg);
                return;
            }
            const prime = result.card.prime;

            userName = document.getElementById("contactFormNameInput").value;
            userEmail = document.getElementById("contactFormEmail").value;
            userPhone = document.getElementById("contactFormPhone").value;
            const token = localStorage.getItem("jwt_token");

            const ordersData = {"prime":prime,
                                "order":{
                                    "price":attractionPrice,
                                    "trip":{
                                        "attraction":{
                                            "id":attractionId,
                                            "name":attractionName,
                                            "address":attractionAddress,
                                            "image":attractionImage
                                        },
                                        "date":attractionDate,
                                        "time":attractionTime
                                    },
                                    "contact":{
                                        "name":userName,
                                        "email":userEmail,
                                        "phone":userPhone
                                    }
                                }
                            };

            const response = await fetch("/api/orders", {
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body:JSON.stringify(ordersData)
            })
            const orderReslut = await response.json()
            const isPaySuccess = orderReslut["data"]["payment"]["status"];
            const ordser_msg = orderReslut["data"]["payment"]["message"];
            const orderNumber = orderReslut["data"]["number"];

            if(isPaySuccess === 0){
            const delBookingResponse = await fetch("/api/booking", {
                method:"DELETE",
                headers:{
                    "Authorization": `Bearer ${token}`
                },
            });
            delBookingResult = await delBookingResponse.json()
            console.log(delBookingResult);

            window.location.href = `/thankyou?number=${orderNumber}`;
            }else{
                alert(`${ordser_msg} 付款失敗，請重試`)
            }


        });
    });
}

initPage();

