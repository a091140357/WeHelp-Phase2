TPDirect.setupSDK(171064, 'app_LmWfZd4qMvpxcJ9zk5h7QC3StH6yQFpGsq34FAgZAXfX1t5zHrMhzdRas3tv', 'sandbox');

let fields = {
    number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'ccv'
    }
}

TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color' : '#000000',
            'font-weight' : '500'
        },
        // Styling ccv field
        'input.ccv': {
            'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            'font-size': '16px'
        },
        // style focus state
        //輸入時文字的樣式
        ':focus': {
            'color': 'black'
        },
        // style valid state
        //輸入格式正確時的樣式
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        //輸入格式錯誤時的樣式
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    }
})


// Check TapPay Fields Status is can get prime


function onClick() {
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
    
    if (tappayStatus.canGetPrime === false) {
        alert('can not get prime')
        return;
    }
    
    TPDirect.card.getPrime(function(result) {
        if (result.status !== 0) {
            console.error('getPrime error',result.msg);
            return;
        }
        const prime = result.card.prime
        console.log('getPrime success: ' + prime);
    })
}

const confirmBtn = document.querySelector(".confirmBtn");

confirmBtn.addEventListener("click",onClick);