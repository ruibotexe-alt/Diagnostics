import React from 'react';
import { W, getCardStyle, T1, T2, T3, T4, DIV } from '../utils/styles';
import Radar from './Radar';
import { Bar, ScoreBar } from './Bars';
import DIMS from '../data/dims.json';
import GROWTH_SIGNALS from '../data/growthSignals.json';
import { getTopGaps, getFigures } from '../utils/scoring';

export default function ResultPanel({ fade, scores, arc, era, sp, gapData }) {
  if (!scores || !arc) return null;

  var eraC = era >= 72 ? "#00ff88" : era >= 52 ? "#ffcc44" : "#ff7755";
  var NB = { fontSize: 9, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 };
  var topGaps = getTopGaps(gapData);
  var figs = getFigures(arc.id);

  return (
    <div style={W}>
      <div style={getCardStyle(fade)}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#00ff88", marginBottom: 14, textTransform: "uppercase" }}>DIAGNOSTIC RESULT</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, ...T4, marginBottom: 3 }}>{arc.en} · {arc.riasec}</div>
            <div style={{ fontSize: 28, color: "#00ff88", letterSpacing: 2, lineHeight: 1.1, textShadow: "0 0 24px #00ff8828", marginBottom: 4 }}>{arc.main}</div>
            <div style={{ fontSize: 10, color: "#00cc6677", letterSpacing: 2, marginBottom: 0 }}>{arc.sub}</div>
          </div>
          <div style={{ flexShrink: 0 }}><Radar scores={scores} /></div>
        </div>

        <div style={DIV} />
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...NB, color: "#a0a0ff" }}>WHO YOU ARE</div>
          <div style={{ fontSize: 12, ...T2, lineHeight: 1.95, marginBottom: 14 }}>{arc.identity}</div>
          <div style={{ background: "#0a0a16", border: "1px solid #141428", borderRadius: 3, padding: "14px 15px" }}>
            <div style={{ fontSize: 9, ...T4, letterSpacing: 2, marginBottom: 12 }}>あなたの特性プロフィール（キャリブレーション補正済み）</div>
            {Object.keys(scores).map(function (k, i) {
              var oceanLabel = DIMS[k].ocean ? " · OCEAN " + DIMS[k].ocean : "";
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10, ...T3, letterSpacing: 0.5 }}>
                    <span>{DIMS[k].label}<span style={{ color: "#2a2a48", fontSize: 9 }}>{oceanLabel}</span></span>
                    <span style={{ ...T1, fontWeight: "bold", fontSize: 11 }}>{scores[k]}</span>
                  </div>
                  <Bar val={scores[k]} delay={i * 70} />
                </div>
              );
            })}
          </div>
        </div>

        {topGaps.length > 0 && (
          <div>
            <div style={DIV} />
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...NB, color: "#cc88ff" }}>WHAT YOU BUILT</div>
              <div style={{ fontSize: 12, ...T3, lineHeight: 1.8, marginBottom: 14 }}>あなたの回答パターンに、自然な気質と現在のパフォーマンスの間に有意なギャップが検出された。これは——あなたがある特性を「持っていた」のではなく、「作り上げた」ことを示す。</div>
              {topGaps.map(function (k) {
                var sig = GROWTH_SIGNALS[k];
                return (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <div style={{ padding: "3px 10px", background: "#cc88ff10", border: "1px solid #cc88ff30", borderRadius: 12, fontSize: 9, color: "#cc88ffaa", letterSpacing: 1, display: "inline-block", marginBottom: 8 }}>{sig.badge}</div>
                    <div style={{ padding: "14px 16px", background: "#cc88ff05", border: "1px solid #cc88ff18", borderRadius: 3, marginBottom: 8 }}>
                      <div style={{ fontSize: 9, color: "#cc88ff44", letterSpacing: 2, marginBottom: 6 }}>何が起きていたか</div>
                      <div style={{ fontSize: 12, ...T2, lineHeight: 1.9 }}>{sig.narrative}</div>
                    </div>
                    <div style={{ padding: "14px 16px", background: "#cc88ff08", border: "1px solid #cc88ff25", borderRadius: 3 }}>
                      <div style={{ fontSize: 9, color: "#cc88ffaa", letterSpacing: 2, marginBottom: 6 }}>誰も言わなかったこと</div>
                      <div style={{ fontSize: 13, color: "#d8c0f8", lineHeight: 1.85, fontStyle: "italic" }}>{sig.compliment}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 12, padding: "12px 15px", background: "#1a1028", border: "1px solid #2a1840", borderRadius: 3 }}>
                <div style={{ fontSize: 11, color: "#8070a0", lineHeight: 1.9 }}>自然な出発点から距離を縮めた人間は、最初からその位置にいた人間とは異なる種類の強さを持っている。後者にはわからないコストを払い続けた事実が、その能力を別の質のものにしている。</div>
              </div>
            </div>
          </div>
        )}

        <div style={DIV} />
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...NB, color: "#a0a0ff" }}>HOW YOU GOT HERE</div>
          <div style={{ fontSize: 12, ...T2, lineHeight: 1.95 }}>{arc.origin}</div>
        </div>

        <div style={DIV} />
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...NB, color: "#a0a0ff" }}>THINGS NOBODY SAID OUT LOUD</div>
          <div style={{ marginBottom: 10, padding: "14px 16px", background: "#00ff8808", border: "1px solid #00ff881a", borderRadius: 3 }}>
            <div style={{ fontSize: 9, ...T4, letterSpacing: 2, marginBottom: 6 }}>あなたが価値を出す具体的な状況</div>
            <div style={{ fontSize: 12, ...T2, lineHeight: 1.9 }}>{arc.strength}</div>
          </div>
          <div style={{ marginBottom: 10, padding: "14px 16px", background: "#ffffff04", border: "1px solid #1a1a30", borderRadius: 3 }}>
            <div style={{ fontSize: 9, ...T4, letterSpacing: 2, marginBottom: 6 }}>おそらく誰も言葉にしてくれなかったこと</div>
            <div style={{ fontSize: 12, ...T2, lineHeight: 1.9 }}>{arc.hidden}</div>
          </div>
          <div style={{ padding: "14px 16px", background: "#ffcc4405", border: "1px solid #ffcc441a", borderRadius: 3 }}>
            <div style={{ fontSize: 9, color: "#ffcc4455", letterSpacing: 2, marginBottom: 6 }}>予想外かもしれない視点</div>
            <div style={{ fontSize: 12, ...T2, lineHeight: 1.9 }}>{arc.surprise}</div>
          </div>
        </div>

        <div style={DIV} />
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...NB, color: "#a0a0ff" }}>WHAT YOUR FUTURE LOOKS LIKE</div>
          <div style={{ fontSize: 12, ...T2, lineHeight: 1.95, marginBottom: 14 }}>{arc.trajectory}</div>
          {sp && (
            <div>
              <div style={{ padding: "13px 15px", background: "#a0a0ff08", border: "1px solid #a0a0ff1e", borderRadius: 3, marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#a0a0ff55", letterSpacing: 2, marginBottom: 8 }}>成功のトリガー——この条件が揃った時に動き出す</div>
                <div style={{ fontSize: 13, color: "#c0c4f8", lineHeight: 1.65, marginBottom: 10 }}>{sp.headline}</div>
                {sp.triggers.map(function (t, i) { return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ color: "#a0a0ff33", flexShrink: 0, marginTop: 3 }}>▸</span><span style={{ fontSize: 11, ...T3, lineHeight: 1.75 }}>{t}</span></div>; })}
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, ...T4, letterSpacing: 2, marginBottom: 10 }}>Hollandの person-environment congruence——組織構造</div>
                {sp.structureFit.map(function (sf, i) {
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 10, ...T3 }}><span>{sf.label}</span><span style={{ ...T1, fontWeight: "bold" }}>{sf.score}</span></div>
                      <ScoreBar val={sf.score} delay={i * 60} />
                      {sf.note && <div style={{ fontSize: 9, color: "#3a3a5a", marginTop: 2, letterSpacing: 0.3 }}>{sf.note}</div>}
                    </div>
                  );
                })}
              </div>
              <div>
                <div style={{ fontSize: 9, ...T4, letterSpacing: 2, marginBottom: 10 }}>文化圏・環境の適合——どの社会・組織文化でパフォーマンスが解放されるか</div>
                {sp.cultureFit.map(function (cf, i) {
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 10, ...T3 }}><span>{cf.label}</span><span style={{ ...T1, fontWeight: "bold" }}>{cf.score}</span></div>
                      <ScoreBar val={cf.score} delay={i * 60} />
                      {cf.note && <div style={{ fontSize: 9, color: "#3a3a5a", marginTop: 2, letterSpacing: 0.3 }}>{cf.note}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={DIV} />
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...NB, color: "#a0a0ff" }}>YOU AND THE AI ERA</div>
              <div style={{ fontSize: 12, ...T2, lineHeight: 1.95 }}>{arc.aiLens}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "center", minWidth: 64 }}>
              <div style={{ fontSize: 40, color: eraC, fontWeight: "bold", lineHeight: 1, textShadow: "0 0 16px " + eraC + "44" }}>{era}</div>
              <div style={{ fontSize: 8, ...T4, letterSpacing: 2, marginTop: 4 }}>ERA FIT</div>
              <div style={{ fontSize: 8, ...T4, letterSpacing: 1 }}>2025-30</div>
            </div>
          </div>
          {sp && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: "12px 14px", background: "#00ff8806", border: "1px solid #00ff881a", borderRadius: 3 }}>
                <div style={{ fontSize: 9, color: "#00cc6655", letterSpacing: 2, marginBottom: 6 }}>加速する条件</div>
                <div style={{ fontSize: 11, color: "#8090b0", lineHeight: 1.8 }}>{sp.accelerator}</div>
              </div>
              <div style={{ padding: "12px 14px", background: "#ff775505", border: "1px solid #ff77551a", borderRadius: 3 }}>
                <div style={{ fontSize: 9, color: "#ff775544", letterSpacing: 2, marginBottom: 6 }}>注意すべき罠</div>
                <div style={{ fontSize: 11, color: "#8090b0", lineHeight: 1.8 }}>{sp.trap}</div>
              </div>
            </div>
          )}
        </div>

        <div style={DIV} />
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...NB, color: "#a0a0ff" }}>YOUR ENERGY MAP</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: "13px 14px", background: "#ff775506", border: "1px solid #ff775520", borderRadius: 3 }}>
              <div style={{ fontSize: 9, color: "#ff775555", letterSpacing: 2, marginBottom: 7 }}>消耗するパターン</div>
              <div style={{ fontSize: 12, ...T2, lineHeight: 1.85 }}>{arc.drain}</div>
            </div>
            <div style={{ padding: "13px 14px", background: "#00ff8806", border: "1px solid #00ff8820", borderRadius: 3 }}>
              <div style={{ fontSize: 9, color: "#00cc6688", letterSpacing: 2, marginBottom: 7 }}>最も活きる状況</div>
              <div style={{ fontSize: 12, ...T2, lineHeight: 1.85 }}>{arc.thrive}</div>
            </div>
          </div>
        </div>

        {figs.length > 0 && (
          <div>
            <div style={DIV} />
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...NB, color: "#ffcc44" }}>HISTORICAL RESONANCE</div>
              <div style={{ fontSize: 12, ...T3, lineHeight: 1.8, marginBottom: 16 }}>あなたのプロフィールと同じ構造の認知・行動パターンを持った歴史上の人物がいる。彼らの生い立ちと偉業は、あなたの特性がどのように結晶化するかを示すケーススタディだ。</div>
              {figs.map(function (fig, i) {
                return (
                  <div key={i} style={{ marginBottom: i < figs.length - 1 ? 16 : 0 }}>
                    <div style={{ padding: "16px 16px 14px", background: "#0c0c1a", border: "1px solid #1e1e38", borderLeft: "3px solid #ffcc4440", borderRadius: 3 }}>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 15, color: "#ffdd88", fontWeight: "bold", letterSpacing: 1, marginBottom: 2 }}>{fig.name}</div>
                        <div style={{ fontSize: 9, ...T4, letterSpacing: 2 }}>{fig.era} · {fig.domain}</div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, color: "#ffcc4455", letterSpacing: 2, marginBottom: 5 }}>あなたとの構造的な共通点</div>
                        <div style={{ fontSize: 12, ...T2, lineHeight: 1.9 }}>{fig.connection}</div>
                      </div>
                      <div style={{ padding: "10px 12px", background: "#a0a0ff08", border: "1px solid #a0a0ff14", borderRadius: 2, marginBottom: 10 }}>
                        <div style={{ fontSize: 9, color: "#a0a0ff55", letterSpacing: 2, marginBottom: 4 }}>生い立ち・出発点</div>
                        <div style={{ fontSize: 11, color: "#9090c8", lineHeight: 1.85 }}>{fig.origin}</div>
                      </div>
                      <div style={{ padding: "10px 12px", background: "#00ff8806", border: "1px solid #00ff8815", borderRadius: 2 }}>
                        <div style={{ fontSize: 9, color: "#00cc6655", letterSpacing: 2, marginBottom: 4 }}>このプロフィールへの示唆</div>
                        <div style={{ fontSize: 11, color: "#80c8a0", lineHeight: 1.85, fontStyle: "italic" }}>{fig.lesson}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
