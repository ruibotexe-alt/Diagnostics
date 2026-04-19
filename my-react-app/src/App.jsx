import React, { useState, useRef } from "react";
import IntroPanel from './components/IntroPanel';
import QuizPanel from './components/QuizPanel';
import ResultPanel from './components/ResultPanel';

import ITEMS from './data/items.json';
import SUCCESS_PROFILES from './data/successProfiles.json';
import { computeScores, computeGapData, getArchetype, getEraFit } from './utils/scoring';

const TOTAL_VOTES = 5;

export default function App(){
  var phs=useState("intro");var phase=phs[0];var setPhase=phs[1];
  var idx=useState(0);var itemIdx=idx[0];var setItemIdx=idx[1];
  var vts=useState({});var votes=vts[0];var setVotes=vts[1];
  var qsel=useState(null);var quizSel=qsel[0];var setQuizSel=qsel[1];
  var his=useState([]);var history=his[0];var setHistory=his[1];
  var fds=useState(true);var fade=fds[0];var setFade=fds[1];
  var scs=useState(null);var scores=scs[0];var setScores=scs[1];
  var gds=useState({});var gapData=gds[0];var setGapData=gds[1];
  var vld=useState(null);var validated=vld[0];var setValidated=vld[1];
  var advancing=useRef(false);

  var currentItem=ITEMS[itemIdx];
  var isQuestion=currentItem&&currentItem.type==="question";
  var isQuiz=currentItem&&currentItem.type==="quiz";
  var usedVotes=Object.values(votes).reduce(function(a,b){return a+b;},0);
  var remaining=TOTAL_VOTES-usedVotes;

  function go(fn){setFade(false);setTimeout(function(){fn();setFade(true);},220);}
  
  function advanceItem(nh){
    go(function(){
      advancing.current=false;setVotes({});setQuizSel(null);
      var next=itemIdx+1;
      if(next>=ITEMS.length){
        setScores(computeScores(nh));
        setGapData(computeGapData(nh));
        setPhase("result");
      }
      else{setItemIdx(next);}
    });
  }
  
  function castVote(optId){
    if(!isQuestion) return;
    if(optId==="none"){
      if(advancing.current) return; advancing.current=true;
      var nh=history.concat([{id:currentItem.id,votes:{}}]); setHistory(nh); advanceItem(nh); return;
    }
    if(remaining<=0) return;
    var nv=Object.assign({},votes); nv[optId]=(nv[optId]||0)+1;
    var used=Object.values(nv).reduce(function(a,b){return a+b;},0); setVotes(nv);
    if(used>=TOTAL_VOTES){
      if(advancing.current) return; advancing.current=true;
      var nh=history.concat([{id:currentItem.id,votes:nv}]); setHistory(nh);
      setTimeout(function(){advanceItem(nh);},320);
    }
  }
  
  function submitQuiz(){
    if(!quizSel) return;
    var nh=history.concat([{id:currentItem.id,selected:quizSel}]); setHistory(nh); advanceItem(nh);
  }
  
  function reset(){
    go(function(){setPhase("intro");setItemIdx(0);setVotes({});setQuizSel(null);setHistory([]);setScores(null);setGapData({});setValidated(null);advancing.current=false;});
  }

  var arc=scores?getArchetype(scores):null;
  var era=scores?getEraFit(scores):null;
  var sp=arc?SUCCESS_PROFILES[arc.id]:null;

  return (
    <>
      {phase === "intro" && (
        <IntroPanel fade={fade} go={go} setPhase={setPhase} />
      )}
      
      {phase === "quiz" && (
        <QuizPanel
          fade={fade}
          currentItem={currentItem}
          isQuestion={isQuestion}
          isQuiz={isQuiz}
          itemIdx={itemIdx}
          tot={ITEMS.length}
          usedVotes={usedVotes}
          remaining={remaining}
          votes={votes}
          castVote={castVote}
          quizSel={quizSel}
          setQuizSel={setQuizSel}
          submitQuiz={submitQuiz}
        />
      )}
      
      {phase === "result" && (
        <ResultPanel 
          fade={fade} 
          scores={scores} 
          arc={arc} 
          era={era} 
          sp={sp} 
          gapData={gapData} 
        />
      )}
    </>
  );
}
