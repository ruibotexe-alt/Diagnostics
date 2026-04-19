import React, { useState, useEffect } from 'react';
import DIMS from '../data/dims.json';

export default function Radar(props){
  var sc=props.scores;
  var st=useState(false);var on=st[0];var setOn=st[1];
  useEffect(function(){var t=setTimeout(function(){setOn(true);},300);return function(){clearTimeout(t);};}, []);
  var keys=Object.keys(DIMS); var n=keys.length;
  var sz=172,cx=sz/2,cy=sz/2,r=54;
  function ang(i){return Math.PI*2*i/n-Math.PI/2;}
  function pt(i,p){return{x:cx+r*p*Math.cos(ang(i)),y:cy+r*p*Math.sin(ang(i))};}
  function mkPath(fn){var d=[];for(var i=0;i<n;i++){var p=pt(i,fn(i));d.push((i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1));}return d.join("")+"Z";}
  var grids=[0.25,0.5,0.75,1].map(function(p,i){return React.createElement("path",{key:i,d:mkPath(function(){return p;}),fill:"none",stroke:"#202040",strokeWidth:1});});
  var spokes=keys.map(function(k,i){var e=pt(i,1);return React.createElement("line",{key:k,x1:cx,y1:cy,x2:e.x,y2:e.y,stroke:"#202040",strokeWidth:1});});
  var poly=React.createElement("path",{d:mkPath(function(i){return(sc[keys[i]]||0)/100;}),fill:"#00ff8814",stroke:"#00ff88",strokeWidth:1.5,style:{opacity:on?1:0,transition:"opacity 1.1s ease"}});
  var dots=keys.map(function(k,i){var p=pt(i,(sc[k]||0)/100);return React.createElement("circle",{key:k,cx:p.x,cy:p.y,r:3,fill:"#00ff88",style:{opacity:on?1:0,transition:"opacity 1.1s ease "+(i*0.08)+"s"}});});
  var lbls=keys.map(function(k,i){var lp=pt(i,1.44);return React.createElement("text",{key:k,x:lp.x,y:lp.y,textAnchor:"middle",dominantBaseline:"middle",fill:"#5555a0",fontSize:7,fontFamily:"'Courier New',monospace",letterSpacing:0.5},DIMS[k].short);});
  return React.createElement("svg",{width:sz,height:sz,style:{overflow:"visible"}},grids,spokes,poly,dots,lbls);
}
