import React from 'react';
import { W, getCardStyle, T1, T2, T3, T4, btnSt } from '../utils/styles';

export default function IntroPanel({ fade, go, setPhase }) {
  return (
    <div style={W}>
      <div style={{ ...getCardStyle(fade), textAlign: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#00ff88", marginBottom: 14, textTransform: "uppercase" }}>DEEP CHARACTERISTIC DIAGNOSTIC v3</div>
        <div style={{ fontSize: 21, ...T1, marginBottom: 14, lineHeight: 1.5 }}>あなたが<span style={{ color: "#00ff88" }}>最も価値を出せる理由</span><br />を特定する</div>
        <div style={{ fontSize: 11, ...T3, lineHeight: 2.0, marginBottom: 18 }}>
          幼少期から現在まで——具体的な行動から推定する。<br />
          <span style={{ ...T2 }}>通常質問</span>：5票を好きに配分（連打OK・5票で自動進行）<br />
          <span style={{ color: "#ffaa44" }}>クイズ</span>：1択・自己申告を客観補正する
        </div>
        <div style={{ fontSize: 9, color: "#252540", marginBottom: 8, letterSpacing: 1 }}>
          Big Five / OCEAN · Holland RIASEC · 行動一貫性原則 · 縦断研究に基づく設計
        </div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          {["設計者", "診断者", "職人", "触媒", "統合者", "開拓者", "調整者", "実行者", "運用者", "適応者"].map(function(t) { return <div key={t} style={{ fontSize: 9, ...T4, letterSpacing: 1 }}>{t}</div>; })}
        </div>
        <div style={{ fontSize: 9, ...T4, marginBottom: 20, letterSpacing: 2 }}>16問前後 ／ クイズ3問含む ／ 約12分</div>
        <button style={{ ...btnSt(true), cursor: "pointer" }} onClick={function() { go(function() { setPhase("quiz"); }); }}>開始する →</button>
      </div>
    </div>
  );
}
