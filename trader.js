function Trader(){
  this.Asset = 10000000;
  this.HoldIndex = -1;
  this.HoldDirection = 0;
  this.HoldSymbolInfo = null;
  this.TradeHistory = [];
  this.addTradeHistory=function(o){this.TradeHistory.push(o);}
  this.getAsset=function(){return this.Asset;}
  this.getHoldIndex=function(){return this.HoldIndex;}
}

Trader.prototype.Buy = function(index, direction, SymboInfo){
  //Add holding
  this.HoldIndex = index;
  this.HoldDirection = direction;
  this.HoldSymbolInfo = SymboInfo;
}

Trader.prototype.Sell = function(SellSymboInfo){
  //Add TradeHistory
  if(this.HoldDirection == 1){
    this.Asset += (-parseFloat(this.HoldSymbolInfo.Close) + parseFloat(SellSymboInfo.Close))*1000;
  }
  else if(this.HoldDirection == -1){
    this.Asset += (parseFloat(this.HoldSymbolInfo.Close) - parseFloat(SellSymboInfo.Close))*1000;
  }
  this.TradeHistory.push({Buy:this.HoldSymbolInfo, Sell:SellSymboInfo, Direction: this.HoldDirection});

  this.HoldIndex = -1;
  this.HoldDirection = 0;
  this.HoldSymbolInfo = null;
}