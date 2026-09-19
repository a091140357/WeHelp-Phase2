async function init(){
    const orderNumber = new URLSearchParams(window.location.search).get("number");
    const token = localStorage.getItem("jwt_token");
    console.log(orderNumber);

    if(!orderNumber){
        window.location.href = "/";
        return;
    }

    try{
        const response = await fetch(`/api/order/${orderNumber}`, {
            method:"GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const result = await response.json();
        console.log(result);

        const userOrderData = document.getElementById("userOrderData");

        if(result.error){
            userOrderData.innerHTML = "找不到訂單"
            return;
        }

        const image = result.data.trip.attraction.image;
        const name = result.data.trip.attraction.name;
        const date = result.data.trip.date;
        const time = result.data.trip.time;
        const price = result.data.price;
        const address = result.data.trip.attraction.address;
        const contactName = result.data.contact.name;
        const contactEmail = result.data.contact.email;
        const contactPhone = result.data.contact.phone;

        const innerHtml =`
            <div class = "payStatus">
                <span class = "paySuccessText">付款完成</span>
                <span>，以下是您預訂的行程:</span>
            </div>

            
            <div class = "orderNumber">
                <span>訂單編號:</span>
                <span>${orderNumber}</span>
            </div>
            
            <div class = "section">
                <img class = "arrPic" src = "${image}">
                <div class = "infor">
                    <div class = "inforTitle">台北一日遊：${name}</div>
                    <div class = "inforText">
                        <span class = "subtitle">日期：</span>
                        <span class = "inforContent">${date}</span>
                    </div>
                    <div class = "inforText">
                        <span class = "subtitle">時間：</span>
                        <span class = "inforContent">${time}</span>
                    </div>
                    <div class = "inforText">
                        <span class = "subtitle">費用：</span>
                        <span class = "inforContent">${price}</span>
                    </div>
                    <div class = "inforText">
                        <span class = "subtitle">地點：</span>
                        <span class = "inforContent">${address}</span>
                    </div>
                </div>
            </div>

            <div class = "userData">
                <div class = "separatorLine"></div>
                <div class = "contactForm">
                    <div class = "contactFormTitle">預約的聯絡資訊</div>
                    <div class = "contactFormDiv">
                        <span class = "contactFormSubtitle">聯絡姓名：</span>
                        <span class = "contactText">${contactName}</span>
                    </div>
                    <div class = "contactFormDiv">
                        <span class = "contactFormSubtitle">連絡信箱：</span>
                        <span class = "contactText">${contactEmail}</span>
                    </div>
                    <div class = "contactFormDiv">
                        <span class = "contactFormSubtitle">手機號碼：</span>
                        <span class = "contactText">${contactPhone}</span>
                    </div>
                </div>
            </div>
        ` 

        userOrderData.innerHTML = innerHtml;

    }catch (error) {
        console.error("讀取訂單發生錯誤:", error);
    }
}
init()