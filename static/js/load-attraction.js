const attractionName = document.getElementById("attractionName");
const categoryMrt = document.getElementById("categoryMrt");
const infors = document.getElementById("infors");
const attractionPic = document.getElementById("attractionPic");
const indicatorBar = document.getElementById("indicatorBar");
const leftArrow = document.getElementById("leftArrow");
const rightArrow = document.getElementById("rightArrow");
const firstHalfCircle = document.getElementById("firstHalfCircle");
const secondHalfCircle = document.getElementById("secondHalfCircle");
const priceContent = document.getElementById("priceContent");

async function getAttraction(id){
    try{
    const response = await fetch(`/api/attraction/${id}`)
    const data = await response.json();
    return data.data;
    }catch(error){
        console.error(error.message);
        return null;
    }
}
//拿id
const path = window.location.pathname;
const pathSplit = path.split("/");
const attractionId = pathSplit.pop();

async function init(){
    const result = await getAttraction(attractionId);
    if (result){
        const name = result.name;
        const address = result.address;
        const category = result.category;
        const description = result.description;
        images = result.images;

        images.forEach(imagesUrl=>{
            const img = new Image();
            img.src = imagesUrl;
        });

        const mrt = result.mrt;
        const transport = result.transport;
        
        attractionPic.src = images[picNum];
        imgLength = Number(images.length);

        let imgBarHtml = "";
        for(let i = 0; i < imgLength; i++){
            imgBarHtml += "<div class = 'imgBarItem'></div>"
        } 
        indicatorBar.innerHTML = imgBarHtml; 
        
        const imgBarItem = document.querySelector(".imgBarItem");
        imgBarItem.classList.add("activate");

        leftArrow.src = "/static/imgs/暗箭頭.png";
        rightArrow.src = "/static/imgs/亮箭頭.png";

        firstHalfCircle.classList.add("click");

        attractionName.innerText = name;
        categoryMrt.innerText = `${category} at ${mrt}`
        infors.innerHTML = `
        <div class = "description">${description}</div>
        <div class = "addressTitle">景點地址：</div>
        <div class = "addressContent">${address}</div>
        <div class = "transportTitle">交通方式：</div>
        <div class = "transportContent">${transport}</div>
        `
    }
    else{
        console.log("網路連線錯誤")
    }
}

function changePicBar(){
    const imgBarItem = document.querySelectorAll(".imgBarItem");

    imgBarItem.forEach((Item)=>{
        Item.classList.remove("activate");
    });
    
    if(imgBarItem[picNum]){
        imgBarItem[picNum].classList.add("activate");
    }

    if(picNum === 0){
        leftArrow.src = "/static/imgs/暗箭頭.png";
    }else{
        leftArrow.src = "/static/imgs/亮箭頭.png";
    }
    if(picNum === imgLength - 1){
        rightArrow.src = "/static/imgs/暗箭頭.png"
    }else{
        rightArrow.src = "/static/imgs/亮箭頭.png"
    }
}

let imgLength = 0;
let images = [];

let picNum = 0;
init();

const leftArrowContainer = document.getElementById("leftArrowContainer");
const rightArrowContainer = document.getElementById("rightArrowContainer");

const firstHalf = document.getElementById("firstHalf");
const secondHalf = document.getElementById("secondHalf");

leftArrowContainer.addEventListener("click",function(event){
    if (picNum > 0){
        picNum -= 1;
        attractionPic.src = images[picNum];
        changePicBar();
        return;
    }else{
        return;
    }
})
rightArrowContainer.addEventListener("click",function(event){
    if (picNum < imgLength - 1){
        picNum += 1;
        attractionPic.src = images[picNum];
        changePicBar();
        return;
    }else{
        return;
    }
})

let isFirstHalfOk = true;
let isSecondHalfOk = false;



firstHalf.addEventListener("click", function(event){
    if(!isFirstHalfOk){
        isFirstHalfOk = true;
        firstHalfCircle.classList.add("click");
        priceContent.innerText = "新台幣 2000 元";
    }
    if(isSecondHalfOk){
        secondHalfCircle.classList.remove("click");
        isSecondHalfOk = false;
    }
})
secondHalf.addEventListener("click", function(event){
    if(!isSecondHalfOk){
        isSecondHalfOk = true;
        secondHalfCircle.classList.add("click");
        priceContent.innerText = "新台幣 2500 元";
    }
    if(isFirstHalfOk){
        firstHalfCircle.classList.remove("click");
        isFirstHalfOk = false;
    }
})

const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", function(event){
    event.preventDefault();
    
    const date = document.getElementById("bookingDateInput").value;
    let time = "";
    if(!date){
        window.alert("請填寫日期再送出");
        return;
    }
    if(isFirstHalfOk){
        time = "morning";
    }
    if(isSecondHalfOk){
        time = "afternoon";
    }
    console.log(`time:${time}, date:${date}`)
})

const title = document.querySelector(".title");
title.addEventListener("click", function(){
    window.location.href = "/";
})