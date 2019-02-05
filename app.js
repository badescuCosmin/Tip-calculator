// TIP CONTROLLER
var tipController = (function(){
    var Reply = function(id,currency, amount, service, numPeople) {
        this.id       = id;
        this.currency = currency;
        this.amount   = amount;
        this.service  = service;
        this.numPeople= numPeople;      
    };
   var calculateTip = function() {
       data.tips    = [];
       data.bills   = [];
       data.billsNr = 0;
       data.allItems.forEach(function(el, index){
            bill = el;
            data.bills[index] = bill.amount;   
        var extraTip=0;
        if(bill.service === 'veryGood'){
           extraTip = bill.amount * 0.15;
        } else if (bill.service === 'good'){
            extraTip = bill.amount * 0.1;
        } else if (bill.service === 'bad'){
            extraTip = bill.amount *0.05;
        }
        if(bill.numPeople === 1){
            extraTip = extraTip + extraTip * 0.05;
        } else if (bill.numPeople === 2){
            extraTip = extraTip + extraTip *  0.1;
        } else if (bill.numPeople === 3){
            extraTip = extraTip + extraTip * 0.15;
        } else {
            extraTip = extraTip + extraTip * 0.2;
        } 
        data.tip = extraTip;
        data.billsNr = data.allItems.length;
        data.tips[index] = extraTip;
    });
    };
    var calculateTotalTips =function(){
        var sum = 0;
        data.tips.forEach(function(el){
            sum +=el;
        })
        data.totals.tips = sum;   
    };
    var calculateTotalAmount = function(){
        var sum = 0;
        data.bills.forEach(function(el){
            sum += el;
        })
        data.totals.bills = sum; 
    }
    var data = {
        allItems : [],
        tip : 0,
        billsNr: 0,
        tips :[],
        bills :[],
        totals : {
            tips: 0,
            bills: 0,
            amount:0
        } 
    };
    return {
        addItem : function(currency, amount, service, numPeople){
            var newItem, ID;
            if(data.allItems.length > 0){
                ID = data.allItems[data.allItems.length-1].id + 1;
            }else {
                ID = 0;
            }
            newItem = new Reply(ID, currency, amount, service, numPeople);
            data.allItems.push(newItem);
            return newItem;
        },
        deleteItem: function(id){
            var index, ids;
            ids = data.allItems.map(function(el){
                return el.id;
            })
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems.splice(index, 1);
            }
        }, 
        calculateAll : function(){
            calculateTip();
            calculateTotalTips();
            calculateTotalAmount();
            data.totals.amount = data.totals.tips + data.totals.bills;
        },
        getTip : function(){
            return {
                tip         : data.tip,
                totalTips   : data.totals.tips,
                totalBills  : data.totals.bills,
                billsNr     : data.billsNr,
                totalAmount : data.totals.amount
            }
        },
        testing : function(){
            console.log(data);
        }
    };
})()
//UI CONTROLLER
var UIController = (function(){
    var DOMstrings = {
        inputCurrency : "currency",
        inputAmount   : "amount",
        inputService  : "service",
        inputNrPeople : "number-people",
        inputBtn      : ".button",
        textContainer : ".texts-list",
        billsNR       : ".billNr",
        bill          : ".bill",
        tip           : ".tip",
        total         : ".total",
        tipText       : ".tip-value",
        container     : ".texts-list",
        mounth        : ".mounth",
        day           : ".day",
        year          : ".year"
    },
     formatNumber = function(num) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return int + '.' + dec;
    };
    return {
        getInput : function(){
            return {
                currency : document.getElementById(DOMstrings.inputCurrency).value,
                amount : parseFloat(document.getElementById(DOMstrings.inputAmount).value),
                service: document.getElementById(DOMstrings.inputService).value,
                nrPeople: parseInt(document.getElementById(DOMstrings.inputNrPeople).value)
            };
        },
        getDOM : function(){
            return DOMstrings;
        },
        getTime : function(){
            var now = new Date();
            var year = now.getFullYear();
            var mounth = now.getMonth();

            mounths=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMstrings.mounth).textContent = mounths[mounth];
            document.querySelector(DOMstrings.year).textContent = year;     
        },
        addListItem : function(obj, obj2){
            var html, newhtml;
            // create string html
             html = '<p class="text" id="%id%">The tip for current case is<span class="tip-value">%amount%</span><span class="tip-currency"> %currency%</span><span class="text-close"><i class="fas fa-times"></i></span></p></div>';
            //replace placeholder with data
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%amount%', formatNumber(obj2.tip));
            newhtml = newhtml.replace('%currency%', obj.currency);
            //insert in ui 
            document.querySelector(DOMstrings.textContainer).insertAdjacentHTML('beforeend', newhtml);
        },
        clearFields : function(){
            var field1, field2;
            field1 = document.getElementById(DOMstrings.inputAmount);
            field2 = document.getElementById(DOMstrings.inputNrPeople);
            field1.value = '';
            field2.value = '';
            field1.focus();
        },
        deleteListitem : function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        displayValues : function(obj){
            document.querySelector(DOMstrings.billsNR).textContent = obj.billsNr;
            document.querySelector(DOMstrings.bill).textContent    = formatNumber(obj.totalBills);
            document.querySelector(DOMstrings.tip).textContent     = formatNumber(obj.totalTips);
            document.querySelector(DOMstrings.total).textContent   = formatNumber(obj.totalAmount);
        }
    };
})();
//APP CONTROLLER
var controller = (function(tipCtrl, UICtrl){
    var setEvents = function() {
        var DOM = UIController.getDOM();
        document.querySelector(DOM.inputBtn).addEventListener("click", addItem);
        document.addEventListener("keypress", function(e){
            if(e.keyCode === 13){
                addItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click", deleteItems);
    }
    var values;

    var updateTips = function(){
        tipCtrl.calculateAll();
         values = tipCtrl.getTip();
        UICtrl.displayValues(values);   
    };
    var addItem = function(){
        // get input data
        var input = UIController.getInput();
        if(!isNaN(input.amount) && !isNaN(input.nrPeople) && input.amount > 0 && input.nrPeople > 0){
            // add input data to tip controller
            var newItem = tipController.addItem(input.currency, input.amount, input.service, input.nrPeople);
            // display to ui and update tips
            updateTips();
            UICtrl.addListItem(newItem, values);
            //clear inputs
            UICtrl.clearFields();       
        }
    };
    var deleteItems = function(e){
        var itemId;
        itemId = e.target.parentNode.parentNode.id;
        if(itemId){
          itemId = parseInt(itemId);
          tipCtrl.deleteItem(itemId);
          UICtrl.deleteListitem(itemId);
          updateTips();
        }
    };
    return {
        init: function(){
            UICtrl.getTime();
            console.log("app has started");
            setEvents();    
        }
    }
})(tipController, UIController)
controller.init();