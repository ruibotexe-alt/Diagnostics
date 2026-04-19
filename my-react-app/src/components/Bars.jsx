import React, { useState, useEffect } from 'react';

export function Bar(props){
  var ws=useState(0);var w=ws[0];var setW=ws[1];
  useEffect(function(){var t=setTimeout(function(){setW(props.val);},400+(props.delay||0));return function(){clearTimeout(t);};}, [props.val,props.delay]);
  var c=props.val>=75?"#00ff88":props.val>=55?"#ffcc44":"#ff7755";
  return React.createElement("div",{style:{height:3,background:"#181830",borderRadius:2,overflow:"hidden"}},
    React.createElement("div",{style:{height:"100%",width:w+"%",background:c,borderRadius:2,boxShadow:"0 0 5px "+c+"44",transition:"width 0.9s cubic-bezier(.4,0,.2,1)"}}));
}

export function ScoreBar(props){
  var ws=useState(0);var w=ws[0];var setW=ws[1];
  useEffect(function(){var t=setTimeout(function(){setW(props.val);},props.delay||0);return function(){clearTimeout(t);};}, [props.val,props.delay]);
  var c=props.val>=75?"#00ff88":props.val>=50?"#ffcc44":props.val>=30?"#ff9955":"#ff5544";
  return React.createElement("div",{style:{height:4,background:"#181830",borderRadius:2,overflow:"hidden",marginTop:3}},
    React.createElement("div",{style:{height:"100%",width:w+"%",background:c,borderRadius:2,transition:"width 0.8s cubic-bezier(.4,0,.2,1)"}}));
}
