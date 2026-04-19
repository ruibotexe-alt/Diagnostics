import DIMS from '../data/dims.json';
import ITEMS from '../data/items.json';
import ARCHETYPES from '../data/archetypes.js';
import GROWTH_SIGNALS from '../data/growthSignals.json';
import HISTORICAL_FIGURES from '../data/historicalFigures.json';

export function getArchetype(s){
  var sorted=ARCHETYPES.slice().sort(function(a,b){return b.pri-a.pri;});
  for(var i=0;i<sorted.length;i++){if(sorted[i].cond(s))return sorted[i];}
  return ARCHETYPES[ARCHETYPES.length-1];
}

export function computeScores(history){
  var keys=Object.keys(DIMS);
  var selfSums={}; var selfW={}; var calibAdj={};
  keys.forEach(function(k){selfSums[k]=0;selfW[k]=0;calibAdj[k]=0;});
  history.forEach(function(entry){
    var item=ITEMS.find(function(it){return it.id===entry.id;});
    if(!item) return;
    if(item.type==="question"){
      var total=Object.values(entry.votes).reduce(function(a,b){return a+b;},0);
      if(total===0) return;
      item.options.forEach(function(opt){
        var v=entry.votes[opt.id]||0; if(v===0) return;
        var w=v/total;
        Object.keys(opt.scores).forEach(function(k){
          if(selfSums[k]!==undefined){selfSums[k]+=opt.scores[k]*w;selfW[k]+=w;}
        });
      });
    } else if(item.type==="quiz"&&entry.selected){
      var opt=item.options.find(function(o){return o.id===entry.selected;});
      if(opt&&opt.calib){
        Object.keys(opt.calib).forEach(function(k){
          if(calibAdj[k]!==undefined) calibAdj[k]+=opt.calib[k];
        });
      }
    }
  });
  var out={};
  keys.forEach(function(k){
    var base=selfW[k]>0?Math.round(selfSums[k]/selfW[k]):42;
    out[k]=Math.max(0,Math.min(100,base+Math.round((calibAdj[k]||0)*0.5)));
  });
  return out;
}

export function computeGapData(history){
  var keys=Object.keys(DIMS);
  var gapSums={}; var gapW={};
  keys.forEach(function(k){gapSums[k]=0;gapW[k]=0;});
  history.forEach(function(entry){
    var item=ITEMS.find(function(it){return it.id===entry.id;});
    if(!item||item.type!=="question") return;
    var total=Object.values(entry.votes).reduce(function(a,b){return a+b;},0);
    if(total===0) return;
    item.options.forEach(function(opt){
      if(!opt.gap) return;
      var v=entry.votes[opt.id]||0; if(v===0) return;
      var w=v/total;
      Object.keys(opt.gap).forEach(function(k){
        if(gapSums[k]!==undefined){gapSums[k]+=opt.gap[k]*w;gapW[k]+=w;}
      });
    });
  });
  var out={};
  keys.forEach(function(k){out[k]=gapW[k]>0?Math.round(gapSums[k]/gapW[k]):0;});
  return out;
}

export function getTopGaps(gapData){
  return Object.keys(gapData)
    .filter(function(k){return gapData[k]>=16&&GROWTH_SIGNALS[k];})
    .sort(function(a,b){return gapData[b]-gapData[a];})
    .slice(0,2);
}

export function getFigures(arcId){
  var key=arcId;
  // fallback to parent archetype key if needed
  var fig=HISTORICAL_FIGURES[key];
  if(!fig||fig.length===0){
    if(key.indexOf("arch")===0) fig=HISTORICAL_FIGURES["arch_demolish"];
    else fig=HISTORICAL_FIGURES["fallback"];
  }
  return fig||[];
}

export function getEraFit(s){
  // Weighted by research: openness+conscientiousness strong predictors,
  // independence adds AI-era premium, stability adds broad career success
  return Math.round(
    s.openness*0.20+s.frameBreaking*0.18+s.conscientiousness*0.15+
    s.independence*0.14+s.craftDrive*0.13+s.extraversion*0.08+
    s.agreeableness*0.07+s.stability*0.05
  );
}

export function topKey(s){return Object.keys(s).reduce(function(a,b){return s[b]>s[a]?b:a;});}
export function botKey(s){return Object.keys(s).reduce(function(a,b){return s[b]<s[a]?b:a;});}
