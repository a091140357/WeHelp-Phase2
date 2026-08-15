const attractionsGroup = document.getElementById("attractionsGroup");
const scrollSensor = document.getElementById("scrollSensor");
const searchBtn = document.getElementById("searchBtn");
const category = document.getElementById("selector");
const keyword = document.getElementById("inputSelect");
const listItemContainer = document.getElementById("listItemContainer");
const mrtListContainer = document.getElementById("listItemContainer");
const leftArrowBtn = document.getElementById("leftContainer");
const rightArrowBtn = document.getElementById("rightContainer");

let currentPage = 0;
let currentCategory = "";
let currentKeyword = "";
let isLoding = false;

const leftArrowImg = document.querySelector(".leftArrow");
const rightArrowImg = document.querySelector(".rightArrow");
const imgDark = "/static/imgs/暗箭頭.png";
const imgBright = "/static/imgs/亮箭頭.png";

function checkArrowStatus(){
    const scrollLeft = listItemContainer.scrollLeft;       
    const clientWidth = listItemContainer.clientWidth;     
    const scrollWidth = listItemContainer.scrollWidth;

    if (scrollLeft <= 0) {
        leftArrowImg.src = imgDark; 
    } else {
        leftArrowImg.src = imgBright;   
    }
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
        rightArrowImg.src = imgDark; 
    } else {
        rightArrowImg.src = imgBright;   
    } 
}
listItemContainer.addEventListener("scroll", checkArrowStatus);
window.addEventListener("resize", checkArrowStatus);

async function getPageData(page, category = "", keyword = ""){
    try{
        let url = `/api/attractions?page=${page}`;
        if(category){
            url += `&category=${category}`
        }
        if(keyword){
            url += `&keyword=${keyword}`
        }
        const response =  await fetch(url);
        console.log(url);
        if(!response.ok){
            throw new Error(`回應狀態：${response.status}`)
        }
        const result = await response.json();
        const nextPage = result.nextPage
        return {
            "data":result.data,
            "nextPage":nextPage
            }
    } catch (error) {
        console.error(error.message);
        return null;
        }
    }

    async function rendercard(dataArray){
    if(!dataArray|| dataArray.length === 0){
        return
    }
    let innerhtml = ""
    for(let i of dataArray){
        innerhtml += `
        <div class = "attraction">
            <div class = "container">
                <img class = "attImg" src = "${i["images"][0]}">
                <div class = "attName">${i["name"]}</div>
            </div>
            <div class = "attText">
                <span class = "attMrt">${i["mrt"]}</span>
                <span class = "attCategory">${i["category"]}</span>
            </div>
        </div>
        `;
    }
    attractionsGroup.innerHTML += innerhtml;
}

async function init() {
    const result = await getPageData(currentPage, currentCategory, currentKeyword);
    if (result) {
            rendercard(result.data);
            currentPage = result.nextPage;
        }
        isLoding = false;

    try{
        const mrtResponse = await fetch("/api/mrts");
        const mrtData = await mrtResponse.json();
        const mrts = mrtData.data;
        console.log(mrts);

        let mrtslisthtml = "";
        for(let i of mrts){
            if(!i){
                continue;
            };
            mrtslisthtml += `
            <div class = "listItem">
                <span class = "listItemText">${i}</span>
            </div>
            `
        }

        listItemContainer.innerHTML += mrtslisthtml;

        checkArrowStatus();

    }catch(error) {
        console.error(error.message);
        return null;
        }
    }

init();

searchBtn.addEventListener("click", async function(event){
    if (isLoding) return;

    const allMrtItems = document.querySelectorAll(".listItemText");
    allMrtItems.forEach(item => item.classList.remove("active"));
    
    let searchCategory = category.textContent.trim();
    let searchKeyword = keyword.value.trim();

    if(searchCategory.includes("全部分類")){
        searchCategory = "";
    }

    //更新資料讓滾動時可以抓
    currentCategory = searchCategory;
    currentKeyword = searchKeyword;
    currentPage = 0;

    //先關閉 避免與isLoding卡到
    if (scrollSensor) {
        observer.unobserve(scrollSensor);
    }
    attractionsGroup.innerHTML = ""; //清除原本畫面上的卡片

    isLoding = true;
    const result = await getPageData(currentPage, currentCategory, currentKeyword);
    if (result) {
        rendercard(result.data);
        currentPage = result.nextPage; //更新為下一頁
        console.log(currentPage, currentCategory, currentKeyword);
    }
    isLoding = false;
    
    if (scrollSensor) {
        observer.observe(scrollSensor);
    }
});

const observer = new IntersectionObserver(async(entrise)=>{
    if(entrise[0].isIntersecting){
        if(isLoding || currentPage === null){
            return;
        }
        isLoding = true;
        const result = await getPageData(currentPage, currentCategory, currentKeyword);
        if(result){
            rendercard(result.data);
            currentPage = result.nextPage;
        }
        isLoding = false;
    }
});
if (scrollSensor) {
    observer.observe(scrollSensor);
}


leftArrowBtn.addEventListener("click",()=>{
    mrtListContainer.scrollBy({left:-300, behavior:"smooth"});
});
rightArrowBtn.addEventListener("click",()=>{
    mrtListContainer.scrollBy({left:300, behavior:"smooth"});
});

mrtListContainer.addEventListener("click", async(event)=>{
    if(event.target.classList.contains("listItemText")){
        const allMrtItems = document.querySelectorAll(".listItemText");
        allMrtItems.forEach(item => {
            item.classList.remove("active");
        });
        event.target.classList.add("active");

        const clickMrtName = event.target.textContent;

        keyword.value = clickMrtName;
        
        let searchCategory = category.textContent.trim();
        if(searchCategory.includes("全部分類")){
            searchCategory = "";
        }
        currentCategory = searchCategory;
        currentKeyword = clickMrtName;
        currentPage = 0;

        if (scrollSensor) observer.unobserve(scrollSensor);
        attractionsGroup.innerHTML = "";

        isLoding = true;
        const result = await getPageData(currentPage, currentCategory, currentKeyword);
        if (result) {
            rendercard(result.data);
            currentPage = result.nextPage; 
        }
        isLoding = false;

        if (scrollSensor) observer.observe(scrollSensor);
    }
})

