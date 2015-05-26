var m_nPlotBorderWidth = 1;
var m_nXAxisTextWidth = 20;
var m_nYAxisTextWidth = 50;

function Plot(canvas, x1, y1, x2, y2){
  this.canvas_context = canvas.getContext("2d");
  this.createRectPlot(x1, y1, x2, y2);
  this.m_nBarWidth = 0.8;
  this.m_nHorizontalRange = -1;
}

Plot.prototype.Region = function(left, top, right, bottom){
  this.width = right - left;
  this.height = bottom - top;
  this.left = left;
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.hasGrid = false;
}
Plot.prototype.createRectPlot = function(x1, y1, x2, y2){
  this.m_rect = new this.Region(x1, y1, x2, y2);
  this.drawBorder();
}
Plot.prototype.drawBorder = function(){
  this.canvas_context.beginPath();
  this.canvas_context.rect(this.m_rect.left, this.m_rect.top-2, this.m_rect.width, this.m_rect.height+4);
  this.canvas_context.closePath();
  this.canvas_context.lineWidth = "2px";
  this.canvas_context.strokeStyle="white";
  this.canvas_context.stroke();
}
Plot.prototype.drawGrid = function(showXAxis, min, max, diff, baseCount){
  this.canvas_context.clearRect(this.m_rect.left, this.m_rect.top, this.m_rect.width+m_nYAxisTextWidth, this.m_rect.height);
  if(showXAxis){
    this.canvas_context.clearRect(this.m_rect.left, this.m_rect.bottom+m_nPlotBorderWidth*2, this.m_rect.width, m_nXAxisTextWidth);
  }
  this.drawBorder();
  this.canvas_context.beginPath();

  var horizontal_line_count = Math.round(( max - min ) / diff) - 1;
  var vertical_range = this.m_rect.height / (horizontal_line_count+1);
  var hop = Math.round( horizontal_line_count / baseCount );
  if(hop<1){
    hop=1;
  }
  var digitnumber = 0;
  if(diff < 1){
    digitnumber = -Math.floor(Math.log10(diff));
  }

  this.canvas_context.textAlign="left";
  this.canvas_context.textBaseline="middle";
  var fontsize = 12;
  this.canvas_context.font= fontsize+"px monospace";
  if(min<0){
    fontsize = fontsize*(m_nYAxisTextWidth-5)/this.canvas_context.measureText(min.toFixed(digitnumber)).width;
  }
  else{
    fontsize = fontsize*(m_nYAxisTextWidth-5)/this.canvas_context.measureText(max.toFixed(digitnumber)).width;
  }

  if( fontsize > vertical_range*hop ){
    fontsize = Math.floor(vertical_range*hop);
  }
  this.canvas_context.font= fontsize+"px monospace";
  this.canvas_context.fillStyle = "#ffffff";

  for( var i=1; i<=horizontal_line_count; i+=hop){
    this.canvas_context.moveTo(this.m_rect.left, this.m_rect.bottom - i*vertical_range);
    this.canvas_context.lineTo(this.m_rect.right, this.m_rect.bottom - i*vertical_range);
    this.canvas_context.fillText((min+diff*i).toFixed(digitnumber).toString(), this.m_rect.right + 3, this.m_rect.bottom - i*vertical_range);
  }

  //Draw vertical line
//  var nyear = -1;
//  var nmonth = -1;
//  var horizontal_range = this.m_rect.width / (arrstrViewDate.length+1);
//  this.canvas_context.textBaseline="top";
//  this.canvas_context.textAlign="center";
//  this.canvas_context.font = "14px monospace";
//  this.canvas_context.lineWidth = 1;
//  this.canvas_context.strokeStyle="white";
//  this.canvas_context.setLineDash([1]);
//  for( var i=arrstrViewDate.length-1; i>=0; --i){
//    if(arrstrViewDate[i].substring(0, 4) != nyear){
//      nyear = arrstrViewDate[i].substring(0, 4);
//      nmonth = arrstrViewDate[i].substring(4, 6);
//      if(showXAxis){
//        if(i==arrstrViewDate.length-1){
//          this.canvas_context.textAlign="left";
//        }
//        this.canvas_context.fillText(nyear+"/"+nmonth+"/"+arrstrViewDate[i].substring(6, 8), this.m_rect.right-(i+1)*horizontal_range, this.m_rect.bottom+3);
//        if(i==arrstrViewDate.length-1){
//          this.canvas_context.textAlign="center";
//        }
//      }
//      this.canvas_context.moveTo(this.m_rect.right-(i+1)*horizontal_range, this.m_rect.top);
//      this.canvas_context.lineTo(this.m_rect.right-(i+1)*horizontal_range, this.m_rect.bottom);
//    }
//    else{
//      if(arrstrViewDate[i].substring(4, 6) != nmonth){
//        nmonth = arrstrViewDate[i].substring(4, 6);
//        if(showXAxis){
//          this.canvas_context.fillText(nmonth, this.m_rect.right-(i+1)*horizontal_range, this.m_rect.bottom+3);
//        }
//        this.canvas_context.moveTo(this.m_rect.right-(i+1)*horizontal_range, this.m_rect.top);
//        this.canvas_context.lineTo(this.m_rect.right-(i+1)*horizontal_range, this.m_rect.bottom);
//      }
//    }
//  }

  this.canvas_context.stroke();
  this.canvas_context.closePath();
  this.canvas_context.setLineDash([]);
}

Plot.prototype.countDiff = function(min, max){
  var diff = max - min;
  if( diff == 0){
    return {min: min-1, max: max+1, diff: 1};
  }
  var digitnumber = Math.floor(Math.log10(diff)) + 1;
  var digit_max = Math.pow(10, digitnumber);
  if( diff > digit_max/2){// >5
    if( (diff - digit_max/2) > (digit_max - diff)){
      diff = digit_max/10;
    }
    else{//Close 5
      diff = digit_max/20;
    }
  }
  else{// <5
    if( (diff - digit_max/10) > (digit_max/2-diff)){//Close 5
      diff = digit_max/20;
    }
    else{//Close 1
      diff = digit_max/100;
      digit_max = digit_max/10;
    }
  }
  var newmax = max - Math.abs(max%diff) + diff;
  var newmin = min - Math.abs(min%diff);
  return {min: newmin, max: newmax, diff: diff};
}

Plot.prototype.drawCandlePlot = function(data){
  var kmin = Math.min.apply(Math, data.map(function(o){return parseFloat(o.Low);}));
  var kmax = Math.max.apply(Math, data.map(function(o){return parseFloat(o.High);}));
  var diff = this.countDiff(kmin, kmax);

  this.drawGrid(false, diff.min, diff.max, diff.diff, 8);

  var horizontal_range = this.m_rect.width / data.length;
  this.m_nHorizontalRange = this.m_rect.width / data.length;
  var vertical_range = this.m_rect.height / (diff.max-diff.min);

  for(var i=0; i<data.length-1; ++i){
    this.canvas_context.beginPath();
    this.canvas_context.moveTo(this.m_rect.right - (i+1)*horizontal_range, this.m_rect.bottom - (data[i].High-kmin)*vertical_range);
    this.canvas_context.lineTo(this.m_rect.right - (i+1)*horizontal_range, this.m_rect.bottom - (data[i].Low-kmin)*vertical_range);
    this.canvas_context.lineWidth = 2;
    if(data[i].Open < data[i].Close){
      this.canvas_context.fillStyle = "#7f0000";
      this.canvas_context.strokeStyle = "#ff0000";
    }
    else{
      this.canvas_context.fillStyle = "#007f00";
      this.canvas_context.strokeStyle = "#00ff00";
    }
    this.canvas_context.stroke();
    this.canvas_context.closePath();

    this.canvas_context.beginPath();
    if(data[i].Open === data[i].Close){
      this.canvas_context.moveTo(this.m_rect.right - (i+1+this.m_nBarWidth/2)*horizontal_range, this.m_rect.bottom - (data[i].Open-kmin)*vertical_range);
      this.canvas_context.lineTo(this.m_rect.right - (i+1-this.m_nBarWidth/2)*horizontal_range, this.m_rect.bottom - (data[i].Close-kmin)*vertical_range);
      this.canvas_context.stroke();
    }
    else{
      if(data[i].Open > data[i].Close){
        this.canvas_context.rect(this.m_rect.right - (i+1+this.m_nBarWidth/2)*horizontal_range, this.m_rect.bottom - (data[i].Open-kmin)*vertical_range, this.m_nBarWidth*horizontal_range, Math.abs(data[i].Open-data[i].Close)*vertical_range);
      }
      else{
        this.canvas_context.rect(this.m_rect.right - (i+1+this.m_nBarWidth/2)*horizontal_range, this.m_rect.bottom - (data[i].Close-kmin)*vertical_range, this.m_nBarWidth*horizontal_range, Math.abs(data[i].Open-data[i].Close)*vertical_range);
      }
      this.canvas_context.lineWidth = 2;
      this.canvas_context.stroke();
      this.canvas_context.fill();
    }
    this.canvas_context.closePath();
  }
}

Plot.prototype.drawSelectLine = function(idx){
  var x = this.m_rect.right - (idx+1)*this.m_nHorizontalRange;

  this.canvas_context.beginPath();

  this.canvas_context.moveTo(x, this.m_rect.top);
  this.canvas_context.lineTo(x, this.m_rect.bottom);

  this.canvas_context.lineWidth = 2;
  this.canvas_context.strokeStyle = "#00ddff";
  this.canvas_context.stroke();
  this.canvas_context.closePath();
}