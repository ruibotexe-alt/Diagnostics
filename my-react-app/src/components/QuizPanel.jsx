import React from 'react';
import { W, getCardStyle, T1, T4, btnSt } from '../utils/styles';

export default function QuizPanel({
  fade, currentItem, isQuestion, isQuiz, itemIdx, tot,
  usedVotes, remaining, votes, castVote,
  quizSel, setQuizSel, submitQuiz
}) {
  if (!currentItem) return null;

  if (isQuestion) {
    var lc = currentItem.color || "#00ff88";
    var qn = itemIdx + 1;
    return (
      <div style={W}>
        <div style={getCardStyle(fade)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: lc, textTransform: "uppercase" }}>{currentItem.tag}</div>
            <div style={{ fontSize: 9, ...T4, letterSpacing: 2 }}>{qn} / {tot}</div>
          </div>
          <div style={{ height: 1, background: "#1c1c34", borderRadius: 1, marginBottom: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: ((qn - 1) / tot * 100) + "%", background: lc, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 5, marginBottom: 20 }}>
            {[0, 1, 2, 3, 4].map(function (i) { return <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < usedVotes ? "#00ff88" : "#1c1c34", border: "1px solid " + (i < usedVotes ? "#00ff8888" : "#2c2c48"), transition: "all 0.12s", boxShadow: i < usedVotes ? "0 0 6px #00ff8866" : "none" }} />; })}
            <div style={{ fontSize: 9, ...T4, marginLeft: 8, letterSpacing: 1 }}>{remaining}票残り</div>
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.65, marginBottom: currentItem.sub ? 8 : 22, ...T1, fontWeight: "normal" }}>{currentItem.text}</div>
          {currentItem.sub && <div style={{ fontSize: 10, ...T4, marginBottom: 20, lineHeight: 1.65, fontStyle: "italic" }}>{currentItem.sub}</div>}
          <div style={{ marginBottom: 8 }}>
            {currentItem.options.map(function (opt) {
              var vc = votes[opt.id] || 0; var act = vc > 0;
              return (
                <button key={opt.id} onClick={function () { castVote(opt.id); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "13px 15px", marginBottom: 8, background: act ? "#00ff880e" : "transparent", border: "1px solid " + (act ? "#00ff8855" : "#1c1c34"), borderRadius: 3, color: act ? "#d0f0e0" : "#9090c0", fontSize: 12, cursor: remaining > 0 ? "pointer" : "default", fontFamily: "'Courier New',monospace", transition: "border-color 0.1s,background 0.1s", letterSpacing: 0.3, lineHeight: 1.6 }}>
                  <span style={{ flex: 1, paddingRight: 10 }}>{opt.text}</span>
                  {act && <span style={{ display: "flex", gap: 3, flexShrink: 0 }}>{[0, 1, 2, 3, 4].map(function (i) { return <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < vc ? "#00ff88" : "transparent", border: "1px solid " + (i < vc ? "#00ff88" : "#2c2c48"), transition: "all 0.1s" }} />; })}</span>}
                </button>
              );
            })}
            <button onClick={function () { castVote("none"); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 15px", marginTop: 4, background: "transparent", border: "1px dashed #242444", borderRadius: 3, color: "#383858", fontSize: 11, cursor: "pointer", fontFamily: "'Courier New',monospace", letterSpacing: 1 }}>
              ⊘ &nbsp;どれも該当しない
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isQuiz) {
    var qn = itemIdx + 1;
    return (
      <div style={W}>
        <div style={getCardStyle(fade)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#ffaa44", textTransform: "uppercase" }}>{currentItem.tag}</div>
            <div style={{ fontSize: 9, ...T4, letterSpacing: 2 }}>{qn} / {tot}</div>
          </div>
          <div style={{ height: 1, background: "#1c1c34", borderRadius: 1, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: ((qn - 1) / tot * 100) + "%", background: "#ffaa44", transition: "width 0.4s ease" }} />
          </div>
          <div style={{ background: "#ffaa4408", border: "1px solid #ffaa4430", borderRadius: 3, padding: "4px 12px", display: "inline-block", marginBottom: 14 }}>
            <span style={{ fontSize: 9, letterSpacing: 3, color: "#ffaa44" }}>CALIBRATION QUIZ — 行動傾向型・補正に使用</span>
          </div>
          <div style={{ fontSize: 13, color: "#ffcc88", marginBottom: 10, letterSpacing: 1 }}>{currentItem.title}</div>
          <div style={{ fontSize: 16, ...T1, lineHeight: 1.75, marginBottom: currentItem.sub ? 8 : 22, whiteSpace: "pre-line" }}>{currentItem.text}</div>
          {currentItem.sub && <div style={{ fontSize: 10, ...T4, marginBottom: 20, lineHeight: 1.65, fontStyle: "italic" }}>{currentItem.sub}</div>}
          <div style={{ marginBottom: 16 }}>
            {currentItem.options.map(function (opt, oi) {
              var sel = quizSel === opt.id;
              return (
                <button key={opt.id} onClick={function () { setQuizSel(opt.id); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "13px 15px", marginBottom: 8, background: sel ? "#ffaa4410" : "transparent", border: "1px solid " + (sel ? "#ffaa44" : "#1c1c34"), borderRadius: 3, color: sel ? "#ffe0a0" : "#9090c0", fontSize: 12, cursor: "pointer", fontFamily: "'Courier New',monospace", transition: "all 0.1s", letterSpacing: 0.3, lineHeight: 1.6 }}>
                  <span style={{ color: sel ? "#ffaa4466" : "#2a2a44", marginRight: 10, fontWeight: "bold" }}>{String.fromCharCode(65 + oi)}.</span>
                  {opt.text}
                  {sel && opt.note && <div style={{ fontSize: 10, color: "#ffaa4466", marginTop: 5, letterSpacing: 1 }}>{opt.note}</div>}
                </button>
              );
            })}
          </div>
          <button style={{ ...btnSt(!!quizSel, "#ffaa44"), cursor: quizSel ? "pointer" : "default" }} onClick={submitQuiz} disabled={!quizSel}>次へ →</button>
        </div>
      </div>
    );
  }

  return null;
}
