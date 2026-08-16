const selector = document.getElementById("selector");
const dropDownMenu = document.getElementById("dropDownMenu");

//點擊選單
selector.addEventListener("click",async function(event){
    try{
        const response =  await fetch("/api/categories");
        if(!response.ok){
            throw new Error(`回應狀態：${response.status}`)
        }
        const result = await response.json();
        const data = result.data;
        data.unshift("全部分類");//可以把東西加到陣列第一筆        

        dropDownMenu.innerHTML = "";//清空原本內容

        for(let i in data){
            const newDiv = document.createElement("div");
            newDiv.textContent = data[i];
            newDiv.classList.add("dropdown-item");
            dropDownMenu.appendChild(newDiv);
        }
        dropDownMenu.classList.toggle("show");
    } catch (error) {
        console.error(error.message);
        }
    }
)
//點擊完後關閉選單
dropDownMenu.addEventListener("click",function(event){
    if(event.target.classList.contains("dropdown-item")){
        const selectValue = event.target.textContent;
        selector.innerText = selectValue;
        console.log(selectValue);
        dropDownMenu.classList.remove("show")
    }
});

//點擊其他地方關閉選單
document.addEventListener("click",function(event){
    const isSelectorClick = selector.contains(event.target)
    const isDropDownMenu = dropDownMenu.contains(event.target)

    if(!isDropDownMenu && !isSelectorClick){
        dropDownMenu.classList.remove("show")
    }
})