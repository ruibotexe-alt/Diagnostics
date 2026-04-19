import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH BASIS
// Big Five / OCEAN: Barrick & Mount (1991), conscientiousness r=.22-.30 for job perf.
// Holland RIASEC: Hoff et al. (2022), two 12-yr longitudinal studies, interest→career outcomes
// Childhood predictors: Spengler et al. (2015, 2018), responsible student + rule-breaking
//   at age 12 predict occupational success 40 yrs later above IQ and SES
// SJT behavioral tendency format: McDaniel et al. (2007), r=.26-.34 criterion validity
// Personality × career success: Judge et al. (1999), conscientiousness + extraversion
//   in childhood → higher extrinsic career success; neuroticism → lower
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_VOTES = 5;

// Custom dimensions (mapped to OCEAN + RIASEC internally)
const DIMS = {
  openness:        { label: "開放性",     short: "開放", ocean: "O" },
  conscientiousness:{ label: "誠実性",    short: "誠実", ocean: "C" },
  extraversion:    { label: "外向性",     short: "外向", ocean: "E" },
  agreeableness:   { label: "協調性",     short: "協調", ocean: "A" },
  stability:       { label: "安定性",     short: "安定", ocean: "N_inv" },
  craftDrive:      { label: "職人衝動",   short: "職人", ocean: null },
  independence:    { label: "独立志向",   short: "独立", ocean: null },
  frameBreaking:   { label: "脱フレーム", short: "脱枠", ocean: null },
};

// Holland RIASEC — maps from dimension combos to archetype
// R=Realistic I=Investigative A=Artistic S=Social E=Enterprising C=Conventional

const ITEMS = [

  // ── CHILDHOOD: BEHAVIORAL PREDICTORS ─────────────────────────────────────
  // Based on Spengler et al. (2015, 2018):
  // "responsible student" behavior predicts occupational success 40 years later
  // "rule breaking/defiance" also directly predicts career success (above IQ, SES)
  // ──────────────────────────────────────────────────────────────────────────
  {
    type:"question", id:"qc1", tag:"幼少期", color:"#a0a0ff",
    text:"小学校〜中学校の頃——「あなたらしい」と言えば一番近いのはどれか？",
    sub:"「こうあるべきだった」ではなく、実際にそうだったこと。",
    // Research note: "responsible student" = conscientiousness proxy
    // "rule breaking/defiance" = openness + independence proxy (positive predictor)
    options:[
      { id:"a", text:"言われた事はきちんとやる、信頼できる生徒だった",
        scores:{ conscientiousness:80, stability:70 } },
      { id:"b", text:"なぜそのルールなのかに疑問を持ち、従わないことがあった",
        scores:{ frameBreaking:82, independence:72, openness:65 } },
      { id:"c", text:"特定のことに熱中すると、他が見えなくなるタイプだった",
        scores:{ craftDrive:80, openness:60, conscientiousness:55 } },
      { id:"d", text:"友達の悩みを聞いたり、グループをまとめる役割が多かった",
        scores:{ agreeableness:80, extraversion:65, stability:60 } },
      { id:"e", text:"何でもそこそここなすが、特に突出したものはなかった",
        scores:{ stability:72, agreeableness:60 } },
      { id:"f", text:"競争が好きで、勝負事には本気になるタイプだった",
        scores:{ extraversion:72, conscientiousness:62, independence:58 } },
    ],
  },
  {
    type:"question", id:"qc2", tag:"幼少期", color:"#a0a0ff",
    text:"子供の頃——誰にも言われなくても自然にやっていた「熱中」は何だったか？",
    sub:"研究では、10代の職業的興味は12年後の職業アウトカムを予測する（Hoff et al., 2022）。",
    // Holland vocational interests formed in childhood predict career outcomes
    options:[
      { id:"a", text:"ものを分解・組み立て・改造することが好きだった（ R: Realistic）",
        scores:{ craftDrive:78, conscientiousness:62, openness:55 } },
      { id:"b", text:"なぜそうなるのかを調べ、理解しようとしていた（ I: Investigative）",
        scores:{ openness:80, frameBreaking:65, conscientiousness:60 } },
      { id:"c", text:"絵・音楽・文章など、何かを表現することに熱中していた（ A: Artistic）",
        scores:{ openness:82, craftDrive:70, independence:65 } },
      { id:"d", text:"人を助けたり、誰かの役に立つことが自然と好きだった（ S: Social）",
        scores:{ agreeableness:82, extraversion:62, stability:60 } },
      { id:"e", text:"人を動かしたり、チームを引っ張ることに快感を覚えた（ E: Enterprising）",
        scores:{ extraversion:80, independence:70, conscientiousness:58 } },
      { id:"f", text:"物事を整理・管理・体系化することが自然と得意だった（ C: Conventional）",
        scores:{ conscientiousness:85, stability:72, agreeableness:55 } },
    ],
  },
  {
    type:"question", id:"qc3", tag:"学生時代", color:"#a0a0ff",
    text:"学生時代の失敗や挫折の後——実際に何をしたか？",
    sub:"過去の行動パターンは将来の行動の最も信頼できる予測因子である（SJT behavioral consistency principle）。",
    options:[
      { id:"a", text:"なぜ失敗したか徹底的に分析して、二度と繰り返さない構造を作った",
        scores:{ conscientiousness:82, openness:65, stability:68 } },
      { id:"b", text:"一人で静かに消化して、また黙々と取り組み直した",
        scores:{ independence:75, conscientiousness:65, stability:62 } },
      { id:"c", text:"そのルールやシステム自体がおかしいと感じ、抵抗した",
        scores:{ frameBreaking:82, independence:70, openness:65 } },
      { id:"d", text:"誰かに話して気持ちを整理してから、立て直した",
        scores:{ agreeableness:72, extraversion:65, stability:60 } },
      { id:"e", text:"あまり引きずらず、すぐ次に移った",
        scores:{ stability:72, extraversion:58, conscientiousness:55 } },
      { id:"f", text:"しばらく落ち込んだが、時間をかけて少しずつ回復した",
        scores:{ stability:55, agreeableness:60 } },
    ],
  },
  {
    type:"question", id:"qc4", tag:"学生時代", color:"#a0a0ff",
    text:"将来の仕事について——学生時代に実際に頭にあったことは？",
    sub:"10代の職業的アスピレーションは成人後の職業的地位と収入を予測する（Ashby & Schoon, 2010）。",
    options:[
      { id:"a", text:"安定した組織・職業に入ることが第一目標だった",
        scores:{ stability:85, conscientiousness:72, agreeableness:58 } },
      { id:"b", text:"やりたいことで食べていくことを漠然と思っていた",
        scores:{ independence:75, openness:68, craftDrive:60 } },
      { id:"c", text:"収入と安定を確保しながら、その中でやりがいを見つければいい",
        scores:{ conscientiousness:75, stability:70, agreeableness:60 } },
      { id:"d", text:"業界より何ができるかのスキルと専門性に関心があった",
        scores:{ craftDrive:78, conscientiousness:65, openness:60 } },
      { id:"e", text:"あまり具体的に考えていなかった",
        scores:{ stability:58, agreeableness:55 } },
      { id:"f", text:"社会を変えたい、何か大きなことをしたいと思っていた",
        scores:{ openness:78, frameBreaking:70, independence:68 } },
    ],
  },

  // ── CALIBRATION QUIZ 1: BROKEN SCALE ─────────────────────────────────────
  // SJT behavioral tendency format — harder to fake (McDaniel et al., 2007)
  // ──────────────────────────────────────────────────────────────────────────
  {
    type:"quiz", id:"quiz1", tag:"CALIBRATION QUIZ 1 / 3", color:"#ffaa44",
    title:"壊れたはかり問題",
    text:"バナナだけで計ると 300g、りんごだけで計ると 200g、一緒に計ると 600g と表示された。\n\nあなたが最初に感じたことは？",
    sub:"これは知識テストではない。あなたの認知スタイルのキャリブレーションに使用する。",
    options:[
      { id:"a", text:"「300+200=500なのに600はおかしい」——矛盾に即座に気づいた",
        calib:{ openness:+10, frameBreaking:+8 }, note:"問題構造への感度（Investigative type指標）" },
      { id:"b", text:"「はかりの前提自体がおかしいのでは」——与えられた条件を疑った",
        calib:{ frameBreaking:+14, openness:+8 }, note:"フレーム解体思考。低い規則適合性と相関" },
      { id:"c", text:"まず計算してみた（皿の重さ、係数など）",
        calib:{ conscientiousness:+10, openness:+6 }, note:"構造的アプローチ。高い誠実性と相関" },
      { id:"d", text:"「問題として出てるなら何か意図があるはず」と思った",
        calib:{ agreeableness:+8, stability:+6 }, note:"文脈依存的解釈。協調性・社会的感度と相関" },
      { id:"e", text:"特に考えなかった",
        calib:{ stability:+4 }, note:"" },
    ],
  },

  // ── WORK VALUES ───────────────────────────────────────────────────────────
  // Research: agreeableness negatively correlated with income (Judge et al., 2012)
  // Conscientiousness = strongest universal predictor
  // Low neuroticism (high stability) = higher career success
  // ──────────────────────────────────────────────────────────────────────────
  {
    type:"question", id:"qw1", tag:"仕事観", color:"#88bbff",
    text:"仕事に対する考え方として——最もしっくりくるのはどれか？",
    sub:"研究では、仕事への動機タイプは仕事の満足度と成果のパターンを大きく左右する。",
    options:[
      { id:"a", text:"仕事は生活のための手段。プライベートを充実させるための活動費を稼ぐ場",
        scores:{ stability:85, conscientiousness:68, agreeableness:55 } },
      { id:"b", text:"仕事を通じて価値を提供したい。意味を感じられることが重要",
        scores:{ openness:75, conscientiousness:65, craftDrive:60 } },
      { id:"c", text:"成果と報酬が明確に連動していれば、どんな仕事でもやれる",
        scores:{ conscientiousness:78, extraversion:58, independence:60 } },
      { id:"d", text:"自分が面白いと思えることに集中したい。そうでない仕事は長続きしない",
        scores:{ independence:78, openness:70, craftDrive:65 } },
      { id:"e", text:"信頼できる仲間とチームで動けることが最も大切",
        scores:{ agreeableness:82, extraversion:68, stability:62 } },
      { id:"f", text:"組織や社会の中で自分の役割を全うすることが仕事だと思っている",
        scores:{ conscientiousness:80, stability:75, agreeableness:65 } },
    ],
  },
  {
    type:"question", id:"qw2", tag:"仕事観", color:"#88bbff",
    text:"組織での立ち回りについて——実際に近いのはどれか？",
    sub:"「べき」ではなく実態として。行動の一貫性原則：過去のパターンは将来のパターンを予測する。",
    options:[
      { id:"a", text:"波風を立てないことが長期的に組織で生き残る正解だと思っている",
        scores:{ stability:88, agreeableness:75, conscientiousness:68 } },
      { id:"b", text:"正しいと思うことは言うが、言い方は空気を読みながら調整する",
        scores:{ agreeableness:72, extraversion:65, stability:62 } },
      { id:"c", text:"おかしいと思ったことははっきり言う。摩擦が起きても仕方ない",
        scores:{ frameBreaking:82, independence:78, openness:65 } },
      { id:"d", text:"組織の論理と自分の考えを使い分けることが現実的だと思っている",
        scores:{ conscientiousness:75, stability:68, agreeableness:60 } },
      { id:"e", text:"上司や組織の方向性に従いながら自分の専門性を高める方が効率的",
        scores:{ conscientiousness:78, stability:72, craftDrive:58 } },
      { id:"f", text:"組織より成果で評価されたい。プロセスや政治には関心がない",
        scores:{ independence:80, conscientiousness:65, openness:60 } },
    ],
  },

  // ── CONFLICT / ENERGY ─────────────────────────────────────────────────────
  {
    type:"question", id:"qs1", tag:"対人・衝突", color:"#ffaa44",
    text:"職場で誰かと意見が対立した時——実際にどうするか？",
    sub:"「べき」ではなく実際の行動パターン。",
    options:[
      { id:"a", text:"基本的に相手の意見に合わせる。争うコストの方が高い",
        scores:{ stability:82, agreeableness:78, conscientiousness:62 } },
      { id:"b", text:"その場は従うが、後で別の方法で自分の意見を反映させる",
        scores:{ agreeableness:65, stability:68, conscientiousness:60 } },
      { id:"c", text:"なぜ相手がそう考えるのかをまず理解しようと聞く",
        scores:{ agreeableness:80, extraversion:65, openness:62 } },
      { id:"d", text:"根拠とデータで論理的に反論する",
        scores:{ conscientiousness:72, independence:68, openness:62 } },
      { id:"e", text:"前提から問い直して、議論の枠組みを変えようとする",
        scores:{ frameBreaking:85, openness:72, independence:65 } },
      { id:"f", text:"自分の直感を信じて最後まで主張する",
        scores:{ independence:82, extraversion:65, openness:58 } },
    ],
  },
  {
    type:"question", id:"qs2", tag:"エネルギー管理", color:"#ffaa44",
    text:"仕事で最もエネルギーを奪われると感じる状況は？",
    sub:"消耗パターンは価値観・動機システムの逆説的な指標になる。",
    options:[
      { id:"a", text:"責任範囲が不明確で、何が自分の仕事かわからない時",
        scores:{ conscientiousness:82, stability:68, agreeableness:55 } },
      { id:"b", text:"間違っていると分かっているのに従わなければならない時",
        scores:{ frameBreaking:80, independence:78, openness:65 } },
      { id:"c", text:"意味を感じられないタスクを繰り返す時",
        scores:{ openness:75, craftDrive:68, independence:65 } },
      { id:"d", text:"自分のペースや集中を頻繁に中断される時",
        scores:{ craftDrive:78, independence:72, conscientiousness:65 } },
      { id:"e", text:"人間関係の調整や根回しに時間を取られる時",
        scores:{ independence:75, openness:62, stability:55 } },
      { id:"f", text:"頑張っても評価されず、報酬に反映されない時",
        scores:{ conscientiousness:72, stability:58, extraversion:55 } },
    ],
  },

  // ── CALIBRATION QUIZ 2: COGNITIVE STYLE ──────────────────────────────────
  // SJT: behavioral tendency format, less fakeable than knowledge-based
  // ──────────────────────────────────────────────────────────────────────────
  {
    type:"quiz", id:"quiz2", tag:"CALIBRATION QUIZ 2 / 3", color:"#ffaa44",
    title:"曖昧な指示問題",
    text:"上司から\n「いい感じのレポートを作っておいて」\nとだけ言われた。締め切りも形式も不明。\n\n最初にすることは？",
    sub:"行動傾向型質問（behavioral tendency）は知識型より社会的望ましさバイアスが低い。",
    options:[
      { id:"a", text:"上司に確認しに行く。曖昧なまま動くのは非効率",
        calib:{ conscientiousness:+10, agreeableness:+6 }, note:"効率と明確化を優先。高い誠実性の指標" },
      { id:"b", text:"他の人の過去のレポートを見て、形式を把握してから動く",
        calib:{ conscientiousness:+10, stability:+8 }, note:"規範参照型。高い誠実性・低い開放性の指標" },
      { id:"c", text:"自分なりに考えて作ってみる。形式より中身を優先",
        calib:{ independence:+10, craftDrive:+8 }, note:"自律的実行型。高い独立志向・開放性の指標" },
      { id:"d", text:"「いい感じ」の定義を引き出すために質問する",
        calib:{ openness:+10, agreeableness:+8 }, note:"問題の曖昧さを解消する。Investigative type指標" },
      { id:"e", text:"目的から考え直す——このレポートは誰のために何のためか",
        calib:{ frameBreaking:+12, openness:+10 }, note:"目的先行型。高い開放性・フレーム解体の指標" },
    ],
  },

  // ── RISK / DECISION ───────────────────────────────────────────────────────
  {
    type:"question", id:"qr1", tag:"リスクと決断", color:"#ffaa44",
    text:"重要な意思決定で十分な情報がない時——実際にどうするか？",
    sub:"意思決定スタイルは不確実性への耐性、誠実性、神経症的傾向と深く相関している。",
    options:[
      { id:"a", text:"動かない。不確実な状況での行動はリスクが高い",
        scores:{ stability:82, conscientiousness:72, agreeableness:58 } },
      { id:"b", text:"情報を最大限集めてから決める",
        scores:{ conscientiousness:80, stability:65, openness:55 } },
      { id:"c", text:"小さく試して感触を確認しながら進む",
        scores:{ openness:78, conscientiousness:65, extraversion:60 } },
      { id:"d", text:"信頼できる人に意見を聞いてから決める",
        scores:{ agreeableness:75, stability:65, extraversion:58 } },
      { id:"e", text:"直感と経験で動く。分析より感覚を信頼する",
        scores:{ extraversion:72, independence:68, openness:60 } },
      { id:"f", text:"最悪のケースを想定して、許容できるなら動く",
        scores:{ conscientiousness:75, openness:60, stability:62 } },
    ],
  },

  // ── CURRENT BEHAVIOR ─────────────────────────────────────────────────────
  {
    type:"question", id:"q1", tag:"現在の行動", color:"#00ff88",
    text:"今の仕事で——自分が自然にやってしまっていることは？",
    sub:"「やるべきこと」ではなく、気づいたらやっていること。行動の一貫性：現在の行動パターンは特性の最良の指標。",
    options:[
      { id:"a", text:"与えられた仕事を確実にこなすことに集中している",
        scores:{ conscientiousness:85, stability:75, agreeableness:60 } },
      { id:"b", text:"誰かが見落としているリスクや問題を記録・追跡している",
        scores:{ openness:72, conscientiousness:70, frameBreaking:60 } },
      { id:"c", text:"頼まれた範囲より精度・品質を上げることに時間を使っている",
        scores:{ craftDrive:85, conscientiousness:72, independence:55 } },
      { id:"d", text:"なぜそのやり方なのかを調べて疑い続けている",
        scores:{ frameBreaking:82, openness:75, conscientiousness:55 } },
      { id:"e", text:"周囲の人間関係を円滑に保つことに気を配っている",
        scores:{ agreeableness:85, extraversion:68, stability:72 } },
      { id:"f", text:"仕事が終わったら切り替えて、プライベートに集中している",
        scores:{ stability:80, agreeableness:65, conscientiousness:60 } },
    ],
  },
  {
    type:"question", id:"q2", tag:"最難の瞬間", color:"#00ff88",
    text:"これまでで最も「消耗した」と感じた仕事上の経験は？",
    sub:"消耗のパターンは person-environment fit（人と環境の適合）の逆指標として機能する。",
    options:[
      { id:"a", text:"自分の能力では対処できない複雑な問題を抱え続けた時",
        scores:{ stability:68, conscientiousness:62, agreeableness:55 } },
      { id:"b", text:"組織の方向性が間違っているのに、変えられなかった時",
        scores:{ frameBreaking:82, openness:72, independence:70 } },
      { id:"c", text:"品質や基準を下げることを求められ続けた時",
        scores:{ craftDrive:82, conscientiousness:70, independence:68 } },
      { id:"d", text:"人間関係の摩擦や対立が長く続いた時",
        scores:{ agreeableness:65, stability:60, extraversion:55 } },
      { id:"e", text:"仕事量と責任だけが増えて、報酬や評価が伴わなかった時",
        scores:{ conscientiousness:72, extraversion:58, stability:55 } },
      { id:"f", text:"役割や期待値が曖昧で、何をすればいいかわからなかった時",
        scores:{ conscientiousness:75, stability:65, agreeableness:58 } },
    ],
  },

  // ── CALIBRATION QUIZ 3: LOGICAL TRAP ─────────────────────────────────────
  // Research: "ability to correctly decipher situational demands" mediates SJT validity
  // This tests Investigative vs Conventional vs Artistic cognitive style
  // ──────────────────────────────────────────────────────────────────────────
  {
    type:"quiz", id:"quiz3", tag:"CALIBRATION QUIZ 3 / 3", color:"#ffaa44",
    title:"論理の罠問題",
    text:"あるマネージャーがこう言った：\n\n「このチームは過去3年間、プロジェクトの遅延が一度もない。だから優秀なチームだ。」\n\nこの話を聞いた時、最初に浮かんだ反応は？",
    sub:"思考スタイルのキャリブレーション。正解はない。",
    options:[
      { id:"a", text:"「そうか、良いチームなんだな」と素直に受け取った",
        calib:{ stability:+8, agreeableness:+6 }, note:"額面受け取り型。高い協調性・安定性の指標" },
      { id:"b", text:"「遅延なし＝優秀」という前提自体がおかしい気がした",
        calib:{ frameBreaking:+14, openness:+8 }, note:"因果飛躍検出。Investigative type + 低い服従性" },
      { id:"c", text:"「そもそも遅延の定義は何か」が気になった",
        calib:{ openness:+12, conscientiousness:+8 }, note:"定義先行型。高い開放性・誠実性の指標" },
      { id:"d", text:"「3年は短いのでは」と思った",
        calib:{ conscientiousness:+12, openness:+6 }, note:"サンプルサイズへの感度。高い誠実性の指標" },
      { id:"e", text:"「良い話だな、参考にしよう」と思った",
        calib:{ conscientiousness:+8, agreeableness:+4 }, note:"実用志向。Conventional type指標" },
    ],
  },

  // ── GAP DETECTION ─────────────────────────────────────────────────────────
  // qg1: recharge pattern → true introversion/extraversion (Cain 2012, "free trait theory")
  // Asking about evenings is less transparent than directly asking about social energy
  {
    type:"question", id:"qg1", tag:"素の自分", color:"#cc88ff",
    text:"仕事が終わった後の夜——最もエネルギーが回復する過ごし方は？",
    sub:"理想ではなく、実際に回復できると感じること。",
    options:[
      { id:"a", text:"一人で静かに過ごす。そこで初めて充電できる感覚がある",
        scores:{ extraversion:36, stability:68 }, gap:{ extraversion:30 } },
      { id:"b", text:"誰かと話したり飲んだりする方が逆に元気が出る",
        scores:{ extraversion:82, agreeableness:62 } },
      { id:"c", text:"やることをこなして早めに寝る。ルーティンの確実さが心地よい",
        scores:{ conscientiousness:78, stability:72 }, gap:{ conscientiousness:16 } },
      { id:"d", text:"仕事の延長のような作業——趣味・副業・読書など——を続けている",
        scores:{ craftDrive:72, independence:65 } },
      { id:"e", text:"特にパターンはない。その日の気分次第",
        scores:{ adaptability:65, stability:55 } },
    ],
  },
  // qg2: "letter to younger self" → reveals what was consciously built
  // (behavioral consistency principle: what you had to work on ≠ what comes naturally)
  // Self-monitoring research (Snyder 1974): high self-monitors close the gap between
  // natural tendencies and situational demands — correlated r≈.40 with career advancement
  {
    type:"question", id:"qg2", tag:"積み上げた力", color:"#cc88ff",
    text:"若い頃の自分に一つだけ伝えるとしたら——何を言いたいか？",
    sub:"今はできているのに、当時はできていなかったこと。",
    options:[
      { id:"a", text:"「もっと早く話す練習をしろ。人前やコミュニケーションで損するな」",
        scores:{ extraversion:55, agreeableness:52 }, gap:{ extraversion:32 } },
      { id:"b", text:"「もっと早く習慣と規律を作れ。計画と継続は才能ではなくシステムだ」",
        scores:{ conscientiousness:56 }, gap:{ conscientiousness:30 } },
      { id:"c", text:"「感情に振り回されるな。冷静さは筋肉で、鍛えられる」",
        scores:{ stability:54 }, gap:{ stability:32 } },
      { id:"d", text:"「批判を恐れるな。それは攻撃ではなく情報だ」",
        scores:{ openness:56, agreeableness:50 }, gap:{ openness:24, agreeableness:16 } },
      { id:"e", text:"「自分の意見を言っていい。空気を読みすぎるな」",
        scores:{ independence:54, frameBreaking:50 }, gap:{ independence:28, frameBreaking:20 } },
      { id:"f", text:"「特に何も伝えたいことはない。だいたい同じ道をたどると思う」",
        scores:{ stability:72, conscientiousness:65 } },
    ],
  },

  // qg3: disguised historical resonance question
  // "which situation resonates" → surfaces whether the person identifies with
  // structural thinkers (Tesla/Turing), craftsmen (Miyazaki/Jiro), catalysts (Galileo),
  // etc. Not "who is your hero" (too obvious) but "which situation" (behavioral)
  {
    type:"question", id:"qg3", tag:"共鳴する状況", color:"#cc88ff",
    text:"次のうち、最も「なぜかわかる気がする」と感じる状況はどれか？",
    sub:"「理想の自分」ではなく、本能的に共鳴するもの。",
    options:[
      { id:"a", text:"答えが見えているのに、世界がまだ理解していない——正しいと確信しながら孤立している",
        scores:{ frameBreaking:78, independence:72, openness:65 },
        figure:"catalyst" },
      { id:"b", text:"誰も解けない問題に一人で何年も向き合い、ついに突破した時の静かな確信",
        scores:{ openness:75, conscientiousness:68, independence:65 },
        figure:"diag" },
      { id:"c", text:"作り続けることをやめられない——完成したものより次の作品の方が常に気になる",
        scores:{ craftDrive:80, openness:65, independence:62 },
        figure:"craft" },
      { id:"d", text:"バラバラな知識がある日突然つながって、全体の構造が見えた瞬間",
        scores:{ systemThinking:78, openness:72, frameBreaking:60 },
        figure:"arch" },
      { id:"e", text:"人々が対立している場で、両者の言いたいことを同時に理解できている",
        scores:{ agreeableness:80, extraversion:65, adaptability:68 },
        figure:"synth" },
      { id:"f", text:"目標が明確になった瞬間、誰より速く動いて結果を出した",
        scores:{ conscientiousness:75, extraversion:68, independence:65 },
        figure:"pioneer" },
    ],
  },


  { type:"question", id:"q3", tag:"自分の役割", color:"#00ff88",
    text:"職場での自分の存在価値として——最もしっくりくるのはどれか？",
    sub:"Holland の person-environment congruence：自分の強みが最も発揮される環境の特定。",
    options:[
      { id:"a", text:"確実にやり切る信頼性——「あの人に任せれば大丈夫」という安心感",
        scores:{ conscientiousness:88, stability:78, agreeableness:68 } },
      { id:"b", text:"複雑な問題を整理して、チームが動きやすくする",
        scores:{ openness:75, conscientiousness:72, agreeableness:65 } },
      { id:"c", text:"誰も気づいていない問題をいち早く察知して防ぐ",
        scores:{ openness:80, frameBreaking:68, conscientiousness:62 } },
      { id:"d", text:"品質を妥協せずに高い水準で仕上げる",
        scores:{ craftDrive:85, conscientiousness:75, independence:60 } },
      { id:"e", text:"対立や摩擦が起きた時に橋渡しをして関係を保つ",
        scores:{ agreeableness:85, extraversion:70, stability:72 } },
      { id:"f", text:"誰も疑わなかった前提を変えて、方向を転換させる",
        scores:{ frameBreaking:85, openness:78, independence:72 } },
    ],
  },
  {
    type:"question", id:"q4", tag:"内部基準", color:"#00ff88",
    text:"仕事が「うまくいった」と感じる時——何があった時か？",
    sub:"内的基準は intrinsic career success の核心指標。外的報酬への依存度と逆相関する。",
    options:[
      { id:"a", text:"頼まれたことを期待通りに、期限通りに完了できた時",
        scores:{ conscientiousness:85, stability:78, agreeableness:68 } },
      { id:"b", text:"周囲が感謝してくれたり、喜んでくれた時",
        scores:{ agreeableness:82, extraversion:68, stability:65 } },
      { id:"c", text:"本来解決すべき問題が実際に解決されていた時",
        scores:{ openness:80, conscientiousness:68, frameBreaking:62 } },
      { id:"d", text:"自分が最初に描いたイメージに近いものが完成した時",
        scores:{ craftDrive:88, openness:65, independence:62 } },
      { id:"e", text:"同じ問題が再発しない構造を作れた時",
        scores:{ conscientiousness:82, openness:68, frameBreaking:60 } },
      { id:"f", text:"自分が納得できるクオリティで仕上がった時",
        scores:{ craftDrive:85, independence:75, openness:60 } },
    ],
  },
  {
    type:"question", id:"q5", tag:"駆動力の核心", color:"#00ff88",
    text:"正直なところ——仕事をする上で最も大切にしていることは？",
    sub:"核心動機は長期的な職業的充足感と最も相関する要因（Judge et al., 1999）。",
    options:[
      { id:"a", text:"生活の安定と将来の安心——それがあって初めて他のことができる",
        scores:{ stability:88, conscientiousness:75, agreeableness:68 } },
      { id:"b", text:"周囲との良い関係——信頼できる仲間と働けること",
        scores:{ agreeableness:85, extraversion:68, stability:65 } },
      { id:"c", text:"自分の成長と専門性——スキルが上がっていることを実感できること",
        scores:{ conscientiousness:82, openness:70, craftDrive:65 } },
      { id:"d", text:"問題を解決できること——困っていた状況が変わる瞬間",
        scores:{ openness:82, conscientiousness:65, craftDrive:58 } },
      { id:"e", text:"自分の判断で動けること——承認や許可を必要としない自律性",
        scores:{ independence:88, openness:70, extraversion:60 } },
      { id:"f", text:"フレームを変えること——当たり前とされていたものを疑い直す時",
        scores:{ frameBreaking:88, openness:80, independence:72 } },
    ],
  },
];

// ── ARCHETYPE SYSTEM ──────────────────────────────────────────────────────────
const ARCHETYPES = [
  {
    id:"arch_demolish", main:"設計者", en:"ARCHITECT", sub:"解体再設計型", pri:14,
    riasec:"IC", ocean:"High O, High C, Low A",
    cond:function(s){ return s.openness>=68&&s.frameBreaking>=72&&s.conscientiousness>=58&&s.stability<70; },
    desc:"既存の構造を疑うところから設計を始める。「なぜこうなっているのか」を理解しないまま手を動かすことができない。時間はかかるが、生み出した構造は本質的な欠陥を持ちにくい。",
    identity:"あなたは心理学的に「高い開放性（Openness）」と「権威への低い同調性（Low Agreeableness）」を組み合わせて持っている。これは、内容に入る前にフレームを問い直すことが認知的なデフォルトになっているということだ。多くの人は与えられた構造の中で最適化する。あなたはその構造の前提を疑うことから始める——これは選択ではなく、脳の配線の問題に近い。同時に、Investigativeな性格傾向（Holland理論）が強く、「なぜそうなっているのか」を理解しないままでいることに、他の人よりも強い居心地の悪さを感じる。この二つが組み合わさったのがあなただ。",
    origin:"Spengler et al.（2015, 2018）の40年間の縦断研究では、12歳時点での「規則への反抗・権威への疑問」が、IQや家庭環境を上回って成人後の職業的成功を予測することが示されている。つまり、子供の頃に「なぜこのルールなのか」と疑い続けたあなたの行動は、単なる反抗ではなかった。その衝動は消えておらず、より精緻になっただけだ。幼少期の職業的興味の安定性についての研究（Hoff et al., 2022）も、10代に形成された「調べることへの熱中」が、12年後のキャリアアウトカムを有意に予測することを示している。",
    trajectory:"Holland理論では、自分の性格タイプと仕事環境のタイプが一致するほど、職業満足度と成果が高くなることが繰り返し示されている。あなたのIC（Investigative-Catalytic）プロフィールは、「問題を定義する役割」にいる時に最も高い一致度を示す。これが意味するのは——あなたは改善担当として入った瞬間から摩擦が始まり、ゼロからの設計権限を与えられた瞬間から加速するということだ。成功のトリガーは能力ではなく環境の選択にある。",
    aiLens:"AIは定義された問題を解くことが得意だ。あなたが得意なのは、問題の定義自体が間違っていると判断することだ。2025〜2030年は、AIが実行を引き受けるほど、その前段階の「何を構築すべきか」の定義者に希少性が集中していく。この特性の市場価値は、今後10年で上がることはあっても下がることはない。",
    strength:"表面的な改善では満足できず、根本から再設計する。数年後に最も価値を持つ判断であることが多い。",
    hidden:"あなたが時間をかけて「なぜ」を調べていた時間は周囲には「遅い」に見えていたはずだ。しかしその問いがなければ同じ問題は別の形で必ず再発していた。",
    surprise:"最大の強みは設計そのものではなく、「これは解体が必要だ」と判断できることだ。多くの設計者は改善しか考えない。",
    drain:"表面的な修正で済ませることを求められる環境。",
    thrive:"ゼロから構造を問い直す権限がある組織。不確実性が高く正解がない問題。",
    era:"AIが実行を引き受けるほど、「何を構築すべきか」を定義する人間の価値が指数的に上がる。",
  },
  {
    id:"arch_precision", main:"設計者", en:"ARCHITECT", sub:"精密設計型", pri:13,
    riasec:"IC", ocean:"High O, Very High C",
    cond:function(s){ return s.openness>=60&&s.craftDrive>=72&&s.conscientiousness>=72&&s.stability<72; },
    desc:"構造の美しさと機能性への異常なこだわりを持って設計する。「動けばいい」では終わらない——余分がない、後から変更しやすい、という基準を自分に課し続ける。",
    identity:"あなたのプロフィールの最大の特徴は「誠実性（Conscientiousness）の高さ」だ。Big Fiveの研究において、誠実性は職業的成功のあらゆる指標——収入、昇進、満足度——と最も強く相関する単一の特性として繰り返し示されている（Barrick & Mount, 1991）。しかしあなたの誠実性は規則への服従ではなく、自分の中の基準への服従として機能している。外から「十分だ」と言われても止められない——それがあなたの誠実性の現れ方だ。開放性（Openness）との組み合わせが、純粋なルール遵守者ではなく「美しい構造への衝動」として出力している。",
    origin:"12歳時点での「責任感のある生徒（responsible student）」という行動特性が40年後の職業的成功を予測するという縦断研究（Spengler et al.）の結果は、あなたのプロフィールに直接当てはまる。ただし注目すべきは、その「責任感」が外部から課されたものか、内部から来るものかの違いだ。あなたの場合、それは自分の中の基準から来ており、それが職業的な強みとして機能する一方で、外部の基準が低い環境では慢性的な摩擦の源になる。",
    trajectory:"Hollandの職業的適合研究が示すのは、IC（Investigative-Conventional）プロフィールの人間は、品質への投資が直接的な差別化要因になる市場で最も高い成果を上げるということだ。これが意味するのは——あなたの価値は「速い環境」では見えにくく、「深い環境」では際立つということだ。成功の軌跡は品質の評判が先行し、仕事が後からついてくる形になる。",
    aiLens:"AIが「十分なもの」を大量に生成する時代に、「本当に良いもの」を作れる人間の希少性は上がる。あなたが自分の基準を妥協しないことへの衝動は、コモディティ化が進むほどに希少な資産になっていく。ただし、その衝動が「市場に出さない」という形で発動しないよう注意が必要だ。",
    strength:"設計した構造は他の人が設計したものより長持ちする。過剰な品質基準が時間の試練に耐えるからだ。",
    hidden:"「念のため」追加した設計上の工夫は誰にも気づかれない。しかしそれが6ヶ月後の改修コストを半分にしている。",
    surprise:"設計者として認識されているかもしれないが、実は職人でもある。品質への衝動が設計に向いているだけだ。",
    drain:"スピード優先で構造の質を妥協させられる環境。",
    thrive:"品質への投資が長期的に評価される組織。",
    era:"AIが大量に「動くもの」を生成する時代に、「正しく動くもの」を設計できる人間の希少価値が上がる。",
  },
  {
    id:"diag_root", main:"診断者", en:"DIAGNOSTICIAN", sub:"根本原因型", pri:12,
    riasec:"I", ocean:"High O, High C, Low A",
    cond:function(s){ return s.openness>=72&&s.frameBreaking>=68&&s.stability<68&&s.agreeableness<72; },
    desc:"症状ではなく原因を見る。他の人が「解決した」と思っている問題の下に、まだ何かがあると感じる。その感覚はほとんどの場合、正しい。",
    identity:"あなたの中核は高い開放性（Openness）——特にその「知的好奇心」の側面だ。Holland理論のInvestigativeタイプが最も強く、「なぜそうなっているのか」が解明されるまで認知的な完結感が得られない。これはモチベーションの問題ではなく、あなたの情報処理の構造的な特徴だ。協調性（Agreeableness）が低めなのは冷たさではなく、対人的な摩擦より「正しい答えへの到達」を優先する傾向の反映だ——これが診断能力を支える。",
    origin:"縦断研究（Spengler et al., 2015）では、12歳時点での「学業への熱心さ（studiousness）」と「疑問を持ち続ける姿勢」が、IQと家庭環境を超えて成人後の職業的地位を予測することが示されている。子供の頃に「どうしてそうなるんだろう」を止められなかったあなたは、その特性が職業的な価値として結晶化する軌道に乗っている。10代の職業的興味の安定性に関する研究（Hoff et al., 2022）もまた、Investigativeな関心が12年後の職業満足度と収入を予測することを示している。",
    trajectory:"Hollandのperson-environment congruence（人と環境の適合）の観点では、Investigativeタイプが最も高い満足度を示す環境は、問題の深掘りと理解に価値を置く場だ。コンサルティング・専門的診断・研究など、「なぜ」への投資が直接的なアウトカムとして評価される環境が最も高い一致度を示す。逆に「分析より行動」が文化的に優先される環境では、能力が活かされないまま消耗する。環境の選択がキャリアを決定する。",
    aiLens:"AIが最も得意とするのは既知パターンの高速処理だ。しかしあなたが得意とするのは、まだ名前のない問題を感知すること——AIが学習データを持たない領域での診断だ。この能力は、AIが既知問題を処理する速度が上がるほど、対比的に希少になっていく。2025〜2030年は、この種の診断能力への需要がピークを迎える時代と重なっている。",
    strength:"組織では同じ問題が繰り返されにくい。再発しない場所まで掘り下げるからだ。",
    hidden:"「なぜ」を繰り返し聞いた時、周囲には「しつこい」に見えていたかもしれない。しかし5回目の「なぜ」が本当の問題を明らかにした。",
    surprise:"問題発見が得意だと思っているかもしれないが、「問題の終わり方を知っている」ことが希少だ。",
    drain:"「分析より行動」を求められ、深く掘ることを許されない環境。",
    thrive:"問題の本質を理解することに価値を置く組織。",
    era:"AIは既知パターンに対しては優秀。名前のない問題を感知するのは依然として人間の強み。",
  },
  {
    id:"craft_uncompromising", main:"職人", en:"CRAFTSMAN", sub:"不妥協型", pri:12,
    riasec:"RA", ocean:"High C, High O-aesthetics, Low A",
    cond:function(s){ return s.craftDrive>=80&&s.conscientiousness>=70&&s.independence>=65&&s.stability<72; },
    desc:"自分の中に明確な「これで良い」の基準があり、それを下回ることへの抵抗感が強い。外部からの圧力で基準を下げることは一時的にはできるが、長く続けると消耗する。",
    identity:"あなたのプロフィールは誠実性（Conscientiousness）の高さに加え、開放性（Openness）の「美的感受性」の側面が強く出ている。これは、完成物の質への感受性が鋭いことを意味する——自分が作ったものが「これでいい」かどうか、他者の評価より先に自分の中で確定する。外部から「十分だ」と言われても止められないのは、その内部基準が外部基準より精度が高いからだ。協調性（Agreeableness）が低めなのは、品質への基準を社会的な圧力で下げることへの本能的な抵抗として機能している。",
    origin:"子供の頃に何かを「必要以上に良くしようとしていた」経験——誰も頼んでいないのに、という熱中——は、後のキャリアで職人的な価値を生む行動パターンの初期の現れだ。Big Five研究が示すのは、誠実性と開放性の特定の組み合わせが、芸術的・技術的な専門性を通じたキャリアアウトカムと強く相関するということだ。あなたの「止められない衝動」は、訓練ではなく特性から来ている。",
    trajectory:"Holland理論のRA（Realistic-Artistic）プロフィールが最も高い一致度を示す環境は、成果物の品質が直接的な評判に変換される市場だ。指名で仕事が来るようになった時、「これを作れるのはあなただけだ」という評判が確立した時——そこがあなたの職業的なブレークポイントだ。その前段階では、品質への基準が「やりすぎ」や「遅い」として見られる期間が必ずある。それが摩擦ではなく、価値の積み上がる時間であることを理解しておく必要がある。",
    aiLens:"AIが「それなりのもの」を無限に生成できる時代に、品質の認識は二極化する。「どうせAIで作れる」か「これは本物だ」かの二択に収束していく市場で、後者を体現できる人間の希少性は時間とともに上がる。あなたの強みは、このコモディティ化の波に対して構造的に免疫を持っている。",
    strength:"関わったものは他の人が関わったものより品質が高い。それはルールではなく、衝動から来ている。",
    hidden:"誰も気にしていない細部に費やした時間は「無駄」に見える。しかしその細部がユーザーの信頼を作り、競合との差を生む。",
    surprise:"最大の危機は「完璧でないものを出すこと」への恐れが行動を止めることだ。",
    drain:"量と速度が評価され、質が見えない環境。",
    thrive:"品質への投資が長期的に評価される。完成度を追求することが「プロ意識」として尊重される文化。",
    era:"AIが大量生産を担う時代に、妥協しない人間の作るものの希少価値は上がる。",
  },
  {
    id:"catalyst_prophetic", main:"触媒", en:"CATALYST", sub:"先行認識型", pri:13,
    riasec:"AE", ocean:"Very High O, Low A, Low C-conv.",
    cond:function(s){ return s.frameBreaking>=80&&s.openness>=72&&s.independence>=70&&s.stability<65; },
    desc:"問題が顕在化する前にフレームを変える。「なぜ今それを？」と言われる時期に最も重要なことを指摘している。タイミングが早すぎて評価されないが、後から正しかったと判明する。",
    identity:"あなたの開放性（Openness）は非常に高い——Big Fiveの研究において、開放性が高い人間は、新しいアイデア・抽象的思考・既存の枠組みへの疑問において突出することが繰り返し示されている。同時に、慣習的なルール遵守への指向性（Conscientiousness-convention）が低く、「みんながそう言っているから」という理由での合意への抵抗感が強い。AE（Artistic-Enterprising）の組み合わせは、新しいフレームを作り、それを他者に伝えようとする指向として現れる。あなたにとって、現状への批判は目的ではなく、より良い可能性への感受性の副産物だ。",
    origin:"縦断研究が示す「ルール破りが成功を予測する」という知見は、このプロフィールに最も鮮明に当てはまる。Spengler et al.（2018）は、12歳時点での「権威への反抗」が40年後の職業的成功を——IQ・家庭環境を上回って——予測することを示した。これはあなたの過去の「反抗」が、現在の「フレームを変える能力」と同じ根から来ていることを意味する。その能力が正当に評価される環境に入った時、蓄積された年月が一気に価値として現れる。",
    trajectory:"Hollandのperson-environment congruenceが最も重要になるのがこのプロフィールだ。AEタイプが最も高い一致度と満足度を示す環境は、変化のフレームを定義する立場——スタートアップ創業、戦略コンサルティング、投資判断、独立したアドバイザーポジション——だ。逆に、組織の中間層として「改善の実行係」に入った瞬間から、最も消耗が速いタイプになる。環境の選択が、あなたにとってキャリアの全てを決定する。",
    aiLens:"AI移行期は、フレームを変えることへの市場需要が最大化する時代だ。「どのAIを使うか」より「AIで何を変えるか」の定義者が最も価値を持つ。あなたの特性は、この転換の最前線に構造的に位置している。2025〜2035年は、このプロフィールの人間にとって歴史的に希少な機会の窓になる可能性が高い。",
    strength:"警告や提案が無視されてから数ヶ月後に、同じ問題が顕在化したことがある。それがある種の証明だ。",
    hidden:"「おかしい」と感じた時、その感覚を表明することには勇気が必要だった。特に全員が逆の方向を向いていた時に。",
    surprise:"自分を「批判的な人間」と思っているかもしれない。しかし批判が目的ではない。より良いフレームを探しているだけだ。",
    drain:"変化への抵抗が強く、フレームを変えることのコストが高い硬直した組織。",
    thrive:"不確実性の高い移行期。変化が速い環境でフレームを変える人間に権限がある状況。",
    era:"AI移行は本質的に不安定な時代。フレームを変える触媒は構造的に有利な立場にいる。",
  },
  {
    id:"ind_pioneer", main:"開拓者", en:"PIONEER", sub:"独立開拓型", pri:11,
    riasec:"EI", ocean:"High O, High E, Low A",
    cond:function(s){ return s.independence>=78&&s.extraversion>=60&&s.agreeableness<65&&s.stability<65; },
    desc:"組織のルールより自分の判断軸を信頼する。誰かに許可を取ることへの本能的な抵抗がある。組織内では「扱いにくい」に見えるが、独立した文脈では最大の強みになる。",
    identity:"外向性（Extraversion）と開放性（Openness）が高く、協調性（Agreeableness）が低い——この組み合わせは、Big Five研究において「起業家的なパーソナリティプロフィール」として繰り返し識別されている（Kang et al., 2023）。エネルギーは他者との相互作用から来るが、他者への同調からは来ない。これが「動力は外向き・判断は内向き」という行動パターンになる。EI（Enterprising-Investigative）の組み合わせは、新しい領域を切り開きながら、なぜそれが機能するかを理解したいという指向として現れる。",
    origin:"縦断研究が示す「反抗・独自性への指向が成人後の成功を予測する」という知見は、このプロフィールに直接当てはまる。しかし重要な点は、その成功の条件だ——独立した文脈での成功と、組織内での成功は、このプロフィールにとって全く異なる軌跡をたどる。学生時代に「誰かのルールに従うことへの違和感」を感じ続けた経験は、後の独立した文脈での爆発的な成果の前段階として機能している。",
    trajectory:"Hollandのcongruence仮説が最も強く機能するのがこのプロフィールだ。Enterprisingタイプは、自律性が高く成果で評価される環境で最も高い一致度を示す——そして最も強い不一致を示すのが、承認プロセスが多層化した大組織だ。あなたの成功の軌跡は、組織内でのキャリアアップではなく、権限の範囲を自分でコントロールできる立場に移行することによって開かれる。",
    aiLens:"個人がAIを使って組織相当の成果を出せる時代の到来は、このプロフィールにとって構造的な追い風だ。許可を必要としない人間が最も速く動ける時代に、あなたの「承認を待たずに動く」という特性は阻害要因から最大の強みへと変換される。2025〜2035年はこのプロフィールの構造的な優位性が最大化する窓だ。",
    strength:"誰かの承認を待たずに動ける。これは当たり前に見えるが、多くの人間は「許可されること」を前提に行動している。",
    hidden:"独断で動いた時、後から「なぜ相談しなかった」と言われたことがある。しかしその行動がなければ物事は動いていなかった。",
    surprise:"独立志向の強い人間が最も失敗するパターンは「一人でやりすぎること」ではなく、「信頼できる数人を持つことへの抵抗」だ。",
    drain:"自分の判断より承認プロセスが優先される環境。",
    thrive:"自律性が高い役割。結果で評価され、プロセスへの干渉が少ない状況。",
    era:"個人がAIを使って単独で動ける時代に、独立志向の人間の構造的な優位性は拡大する。",
  },
  {
    id:"synth_bridge", main:"統合者", en:"SYNTHESIZER", sub:"越境統合型", pri:9,
    riasec:"SI", ocean:"High O, High A, Mid E",
    cond:function(s){ return s.agreeableness>=65&&s.extraversion>=60&&s.openness>=65&&s.stability<70&&s.conscientiousness<80; },
    desc:"一つの世界に完全に属さず、複数の世界を行き来する。「どこにも深く属していない」という孤独感を生むことがあるが、その立場だからこそ見えるものがある。",
    identity:"あなたは開放性（Openness）と協調性（Agreeableness）の両方が高いという、やや珍しい組み合わせを持っている。これは、新しいアイデアへの感受性（Openness）と、異なる文脈の人間への共感・関心（Agreeableness）が共存しているということだ。SI（Social-Investigative）のプロフィールは、人とアイデアの両方への関心が高く、それが「複数の世界の橋渡し役」として自然に現れる。一つの専門に完全にコミットすることへの抵抗感は、欠陥ではなく、このプロフィールの構造的な特徴だ。",
    origin:"Holland理論が示す職業的興味の安定性の研究（Hoff et al., 2022）では、Socialな興味とInvestigativeな興味が組み合わさった子供時代の活動パターンが、後の統合的な役割への適合を予測することが示されている。子供の頃に「友達の悩みを聞きながら、なぜそうなるかも気になっていた」という記憶があるなら、それはこのプロフィールの初期の現れだ。",
    trajectory:"Hollandのcongruence研究では、Social-Investigativeの複合プロフィールは、学際的な環境・異なる専門が交差するプロジェクト・組織間の調整役で最も高い満足度を示す。あなたの市場価値は「深さ」ではなく「接続の希少性」にある——特定の二つの世界を自然につなげる人間は、それぞれの専門家より少ない。その少なさが価値だ。",
    aiLens:"専門化が進む時代に、AIは各専門領域の処理を担う。しかし異なる専門領域をまたいだ統合——AのソリューションがBの問題に使えると判断すること——はAIが最も苦手とする領域だ。あなたの「複数の世界を見ている」という立場は、AI時代の最後の人間的な希少価値の一つに直接対応している。",
    strength:"領域Aの解決策が領域Bの問題に使えることを自然に気づく。横断的な発想は一つの専門に深く入った人間には難しい。",
    hidden:"「こっちの世界ではこうやってる」と言った時、それが全く新しいアプローチだったことがある。しかしあなたにとっては当たり前だったので、その価値を実感しにくい。",
    surprise:"「深さが足りない」という自己評価があるかもしれない。しかし複数の世界を橋渡しできる希少性は別の軸で評価される。",
    drain:"一つの専門に特化することを求められ、横断的な動きが評価されない環境。",
    thrive:"学際的なプロジェクト、組織間の調整が必要な場面。",
    era:"専門化が進むほど、境界を越えて統合できる人間の市場価値は上がる。",
  },
  {
    id:"harmony_keeper", main:"調整者", en:"HARMONIZER", sub:"関係維持型", pri:8,
    riasec:"SE", ocean:"High A, High E, High C",
    cond:function(s){ return s.agreeableness>=78&&s.extraversion>=65&&s.stability>=62; },
    desc:"組織の中で人間関係を円滑に保つことに自然と力を使っている。表立って見えにくいが、チームが機能し続けるためのグリースとして不可欠な存在だ。",
    identity:"あなたのプロフィールは、協調性（Agreeableness）・外向性（Extraversion）・誠実性（Conscientiousness）の三つが高い——これはBig Five研究において「対人的な有能さ」と最も強く相関する組み合わせだ。SE（Social-Enterprising）のHollandプロフィールは、人を通じて物事を動かすことに自然な喜びを感じる。あなたにとって、関係の摩擦を感知することは意識的な注意ではなく、情報処理の一部として機能している——これが、他の人が気づく前に場の空気が読めることの神経学的な背景だ。",
    origin:"協調性の高さは、Big Five研究において学業成績への影響は複雑（直接的には弱い）だが、職場での文脈的なパフォーマンス（Contextual Performance）——組織市民行動、チームサポート、対人関係の円滑化——を最も強く予測する特性として示されている（Barrick & Mount, 1991）。子供の頃に「友達の相談に乗ることが自然だった」という記憶は、この特性の初期の現れだ。その能力は年月とともに精緻化されている。",
    trajectory:"Hollandの適合研究では、SEタイプは人間関係が成果に直接影響する環境——チームマネジメント・組織開発・教育・医療——で最も高い満足度と成果を示す。あなたの価値は、あなたがいる時に「普通に機能していた」という事実の中に隠れている。その貢献は測定されにくいが、消えた時には組織が初めてその大きさに気づく。",
    aiLens:"AIが業務処理を担うほど、「人間同士の感情的な調整」は人間に残る最後の価値領域の一つとして浮かび上がる。ただしこのプロフィールの課題は、その価値の「可視化」だ——AIが担えない仕事をしているという事実を、測定可能なアウトカムとして言語化することが、AI時代における市場価値の維持に不可欠になる。",
    strength:"あなたがいるチームは摩擦が少ない。それは誰かが努力して維持しているのではなく、あなたが自然にやっているからだ。",
    hidden:"あなたがいた会議で対立が起きなかった理由の一部は、あなたの言葉の選び方や場の読み方だ。炎上しなかった議論は記録されない。",
    surprise:"関係維持の能力は「当たり前」と思われやすいが、これが壊れた時のコストは計り知れない。あなたの最大の強みは可視化されにくい種類のものだ。",
    drain:"関係性の崩れた環境や、感謝されない調整を延々続けることを求められる状況。",
    thrive:"チームの連携と信頼関係が直接的な成果に影響する環境。",
    era:"AIが処理できない「人間同士の感情的な調整」は依然として高い価値を持つ。",
  },
  {
    id:"stable_operator", main:"運用者", en:"OPERATOR", sub:"安定運用型", pri:6,
    riasec:"CR", ocean:"Very High C, High A, Low O",
    cond:function(s){ return s.conscientiousness>=78&&s.stability>=72&&s.agreeableness>=65; },
    desc:"複雑なものを確実に動かし続ける。派手さはないが、これがなければ組織は動かない。「当たり前に動いている状態」を維持することの難しさを、実際には誰よりも知っている。",
    identity:"あなたのプロフィールは非常に高い誠実性（Conscientiousness）と安定性が特徴だ。Big Five研究において、誠実性は職業的成功の最強の予測因子として繰り返し示されているが、あなたの場合その誠実性は「確実にやりきること」への強い傾向として現れる。CR（Conventional-Realistic）のHollandプロフィールは、システムと手順の中で機能することへの自然な親和性を持ち、曖昧さや混乱より明確な構造を好む。開放性（Openness）が低めなのは「変化への無関心」ではなく、「証明された方法への信頼」として機能している。",
    origin:"縦断研究（Spengler et al.）において、12歳時点での「責任感のある生徒」という行動が40年後の職業的成功を予測することは、このプロフィールに最も直接的に当てはまる。幼少期に「言われたことをきちんとやる」ということが自然だった経験は、その後の信頼性という評判として積み上がっていく。Judge et al.（1999）も、誠実性が高い子供は成人後の職業的成功（外的な指標での）がより高いことを縦断的に示している。",
    trajectory:"HollandのCR（Conventional-Realistic）プロフィールが最も高い適合を示す環境は、明確な基準と安定性が直接的な価値を持つ領域——金融・公共・インフラ・医療——だ。あなたの価値は「信頼の積み上がり」の構造をしており、同じ環境に長くいるほど指数的に高まる。ただし重要な警告がある：高い誠実性を持つ人間は「安全な道を選ぶ」傾向も高く、それがAI時代において最初に自動化される種類の仕事への依存につながるリスクがある。",
    aiLens:"AIによる自動化は、反復的で予測可能な業務——つまり「安定した運用」の中核——から始まる。これはあなたのプロフィールにとって最も重要な警告だ。あなたの強みである「確実に動かし続ける」能力が、AI時代においても価値を持ち続けるためには、「何をAIに任せてよいか」の判断者・監視者としての役割へのシフトが必要だ。変化への対応を後回しにする傾向を意識的に修正することが、10年後の分岐点になる。",
    strength:"信頼性。担当したことは期待通りに動く。これは当たり前に見えるが、実際には稀なことだ。「任せれば大丈夫」という評判は積み上がるのに時間がかかるが、壊れにくい。",
    hidden:"あなたが普通にやっていることが他の人には難しいことがある。「なぜそれができないのか」が理解しにくいのは、あなたの基準が高いからだ。",
    surprise:"最も「安全」に見えるポジションが、AIによる自動化では最初に影響を受ける。安定志向の強さが、変化への対応を後回しにさせるリスクがある。",
    drain:"混乱と曖昧さが常態化している環境。",
    thrive:"明確な基準があり、それを維持することが評価される役割。公共・金融・インフラなど安定性が直接価値になる分野。",
    era:"AIが実行の多くを担う時代に、「何をAIに任せてよいか」の判断と監視は人間に残る。ただし純粋な安定運用への需要は縮小傾向にある。",
  },
  {
    id:"pragmatic_executor", main:"実行者", en:"EXECUTOR", sub:"実利実行型", pri:7,
    riasec:"EC", ocean:"High C, Low O, Low A",
    cond:function(s){ return s.conscientiousness>=72&&s.stability>=65&&s.agreeableness<68&&s.openness<65; },
    desc:"感情や理念より結果と効率を重視する。「なぜやるか」より「どうやるか」に関心がある。明確なゴールと報酬があれば確実に動ける。",
    identity:"あなたのプロフィールは高い誠実性（Conscientiousness）と低い開放性（Openness）の組み合わせ——これはBig Five研究において「実行への高い能力と、抽象的な探索への低い関心」として現れる。EC（Enterprising-Conventional）のHollandプロフィールは、明確なゴールへ向けて他者を動かしながら、システマティックに成果を出すことへの強い傾向を持つ。あなたにとって、「意義」よりも「成果」が行動のエンジンだ——これは欠如ではなく、特定の環境では圧倒的な強みとなる別の動機構造だ。",
    origin:"Big Five研究（Barrick & Mount, 1991）において誠実性は、あらゆる職業分野で最も一貫して職業的成功を予測する特性だ。あなたの「やると言ったらやる」という信頼性は、学生時代の行動パターンからの延長線上にある。Judge et al.（1999）の縦断研究も、誠実性が高い個人は成人後の外的な職業的成功（収入・昇進）がより高いことを示している。",
    trajectory:"HollandのEC（Enterprising-Conventional）プロフィールが最も高い一致度を示すのは、成果と報酬が明確に連動する環境だ。成果報酬型の営業・フリーランス・独立事業——あなたが自分の数字を直接コントロールできる立場に入った瞬間から、能力が最大化する。逆に、努力と評価が切り離された環境は、このプロフィールの最大の消耗源だ。",
    aiLens:"AIで個人の生産性が上がるほど、成果を出せる人間への報酬の集中は加速する。あなたが自分の強みを最大化するためのシフトは一つ——成果と報酬の連動が明確な環境への移行だ。そこに入れば、AIはあなたの生産性を乗算する道具になる。",
    strength:"感情的なバイアスを排して、効率的に成果を出せる。「意義」がなくても動けることは、特定の環境では圧倒的な強みだ。",
    hidden:"「仕事だから」と割り切って動けることは多くの人が持っていない実用的な強さだ。感情に左右されずに実行し続けられる人間は組織に不可欠だ。",
    surprise:"実利志向が強い人間が最も消耗するのは、「報酬に対して仕事量が見合わない」という状況だ。この問題を構造的に解決することが長期的なキャリアの鍵になる。",
    drain:"曖昧な目標や、成果と報酬が連動していない環境。",
    thrive:"成果報酬型の環境。目標が明確で達成すれば報われる構造。",
    era:"AIが単純実行を代替する中で、「人間の判断が必要な実行」の価値は残る。ただし純粋な実行力だけでは差別化が難しくなる。",
  },
  {
    id:"default_adapter", main:"適応者", en:"ADAPTER", sub:"環境適応型", pri:3,
    riasec:"SE", ocean:"Mid All",
    cond:function(s){ return s.agreeableness>=60&&s.stability>=58&&s.extraversion>=55; },
    desc:"環境の変化に柔軟に対応できる。特定の強烈な「軸」は持っていないかもしれないが、どんな環境でもそれなりに機能できる。その適応力は過小評価されやすい実用的な能力だ。",
    identity:"あなたのBig Fiveプロフィールは複数の次元でバランスが取れている——どれかが極端に高い人間は特定の環境で爆発する一方、ある種の環境では機能しない。あなたは逆の構造を持っている。これは「軸がない」ことではなく、特定の環境条件に依存しない安定した機能性を意味する。Holland理論の観点では、複数のタイプにまたがる「undifferentiated profile」は、職業の幅の広さと環境への適応速度と相関する。",
    origin:"縦断研究が示す「vocational identity（職業的アイデンティティ）の明確さ」への指向は個人差が大きい。Hollandは、職業的アイデンティティが明確でない段階では、多様な経験を通じてそれを形成することが最も合理的だと論じた。あなたが現時点で「特定の軸」を見出せていないとしたら、それは探索段階の終わりではなく、方向性を絞り込むための材料を集めている時間かもしれない。",
    trajectory:"このプロフィールで最も成功するパターンは、適応力を「どこでも生きられる」ではなく「最も良い場所を選べる」という強みとして再定義した時だ。AI時代に急速に変化する役割の中で、新しいことにいち早く適応する速度自体が差別化要因になる。「何でもそこそこできる」から「新しいことに誰より速く入れる」への言語の転換が、このプロフィールの次のステージを開く。",
    aiLens:"AIで仕事の内容が急速に変化する時代に、新しい役割への適応速度は重要な競争優位になる。特定の専門スキルが陳腐化するスピードが上がるほど、「どの専門にも縛られず動ける」という特性の価値が相対的に上がる。あなたの強みはAI時代の変化速度と相性が良い——ただし、その適応力を意図的な方向性と組み合わせることが必要だ。",
    strength:"変化の多い環境でも安定して機能できる。「特に得意なことがない」と感じることがあるかもしれないが、適応力自体が一つの希少な能力だ。",
    hidden:"あなたが「普通にできる」と思っていることの中に、多くの人が苦手とすることが含まれている可能性がある。",
    surprise:"このタイプで最も成功するパターンは、「適応力」を自分の強みと認識した上で、それを最大限に活かせる環境を戦略的に選ぶことだ。",
    drain:"一つのことに完全にコミットすることを求められる環境。",
    thrive:"変化が多く、複数の役割を求められる環境。",
    era:"AIが専門スキルを補完する時代に、AI活用を含む新しい役割への適応速度で差別化できる。",
  },
  {
    id:"fallback", main:"探索中", en:"EXPLORER", sub:"軸形成期", pri:1,
    riasec:"—", ocean:"Mixed signals",
    cond:function(){ return true; },
    desc:"現時点では、特定の強いパターンが回答から読み取りにくかった。これは「軸がない」のではなく、まだ自分のパターンが言語化されていないか、意図的に多様な可能性を残している状態かもしれない。",
    identity:"あなたの回答パターンからは、特定の支配的な特性プロフィールが明確に浮かび上がってこなかった。これにはいくつかの可能性がある——自己認識と実際の行動にギャップがある、複数の文脈で異なる自分が出ている、または本当に探索段階にある。Holland理論では、「職業的アイデンティティ（vocational identity）」が明確でない段階では、多様な経験を通じてそれを発見していくことが最も合理的な戦略だとされている。",
    origin:"職業的アイデンティティの形成には個人差がある。Hoff et al.（2022）の縦断研究では、10代に形成された職業的興味が12年後のキャリアアウトカムを予測するが、その「形成のタイミング」は人によって大きく異なる。「まだわからない」という状態は遅れではなく、単に探索期間が続いているということだ。",
    trajectory:"このプロフィールで最も重要なのは、次のステップの設計だ——多様な経験を意図的に積みながら、「これは自分しかできない」「これをやっている時は時間を忘れる」という手がかりを収集することだ。Holland理論が示すのは、職業的アイデンティティが明確になった時点から、キャリアの収束が急速に進むということだ。",
    aiLens:"自分の軸を見つけることへの投資は、AI時代ではより重要になっている。AIが多くの業務を代替できる時代に、「自分にしかできないこと」を特定していない人間は構造的に脆弱になる。今がその探索に最も投資すべきタイミングだ。",
    strength:"固定した枠を持たないことは、特定の条件では強みになる。まだ形成途上であれば、どの方向にも伸びられる。",
    hidden:"自分の強みが見えにくいのは、それが「当たり前」すぎて言語化されていないことが多い。",
    surprise:"「特にない」という感覚自体が、高い適応力や複数の軸を持っていることの反映であることがある。",
    drain:"自分の強みを発揮できない環境全般。",
    thrive:"試行錯誤が許される環境。様々な役割を経験しながら自分のパターンを見つけていける場所。",
    era:"自分の軸を見つけることへの投資が、AI時代では最も重要なプリオリティの一つになっている。",
  },
];

// ── SUCCESS PROFILES ──────────────────────────────────────────────────────────
const SUCCESS_PROFILES = {
  arch_demolish:{
    headline:"組織が危機に陥り「根本から変えろ」と言われた瞬間に爆発する",
    triggers:["既存の組織やシステムが限界を迎えてゼロから再設計する権限が与えられた時","誰も解けない問題が長期化して「何でもやっていい」になった時","独立・起業して自分が軸の全権限を持った時"],
    structureFit:[{label:"大企業（中間管理職）",score:18,note:"構造が見えているのに触れられず最も消耗"},{label:"大企業（戦略・CxO）",score:72,note:"権限があれば機能する"},{label:"コンサルティング",score:82,note:"問題定義から入れる環境"},{label:"スタートアップ",score:88,note:"ゼロから設計できる"},{label:"独立・個人事業",score:82,note:"全権限が自分にある"}],
    cultureFit:[{label:"日本の大企業文化",score:22,note:"稟議と前例主義で根本設計が通らない"},{label:"日本のスタートアップ",score:68,note:"スピード重視だが設計への投資は理解される"},{label:"シリコンバレー型",score:92,note:"「なぜ」を問い直すことが最も評価される"},{label:"欧州型（独・北欧）",score:74,note:"品質と構造への投資が許容される"},{label:"グローバルリモート",score:86,note:"成果物の質で評価される環境"}],
    accelerator:"AIが実行を担うほど、「何を構築すべきか」の定義者の価値が指数的に上がる。2025-2030年はこのタイプが最も需要が高まる時代と重なっている。",
    trap:"最大の罠は大企業の「改善担当」ポジション。構造が見えているのに改善しか許されない役割に入ると、能力が摩耗し続ける。",
  },
  arch_precision:{
    headline:"品質が直接的な差別化要因になる市場で、気づいたら競合不在になっている",
    triggers:["品質の差が価格差に直結する市場に入った時","「このクオリティで作れる人間が他にいない」という評判が確立した時","独立して自分の基準を妥協なく実装できる環境を作った時"],
    structureFit:[{label:"大企業（中間管理職）",score:32,note:"品質より速度の文化との摩擦が大きい"},{label:"大企業（技術・設計）",score:70,note:"専門職として機能する"},{label:"コンサルティング",score:76,note:"高品質アウトプットが直接評価される"},{label:"スタートアップ",score:62,note:"スピード要求との葛藤がある"},{label:"独立・個人事業",score:90,note:"自分の基準を市場に直接提示できる"}],
    cultureFit:[{label:"日本の大企業文化",score:48,note:"職人性は評価されるが出世とは切り離される"},{label:"日本の職人・専門職市場",score:92,note:"品質への投資が文化的に正当化される"},{label:"シリコンバレー型",score:56,note:"品質よりスピードが優先されることが多い"},{label:"欧州型（独・北欧）",score:86,note:"ドイツのMittelstandは最適な文化圏"},{label:"グローバル高付加価値市場",score:84,note:"品質差が価格差に変換できる市場"}],
    accelerator:"AIが「それなりのもの」を大量生成する時代に、真に品質にこだわった人間の作るものの希少価値は上がる。",
    trap:"完璧主義が「出さないこと」につながった時。品質を追求する行為が市場への参加を遅らせる障害になる逆説。",
  },
  diag_root:{
    headline:"誰も解決できない問題が長期化した組織で、突然呼ばれる人間になる",
    triggers:["「なぜか毎回同じ問題が起きる」組織に入り根本原因を特定した時","専門的な診断能力が確立されそれ自体がサービスになった時","「○○の問題ならあの人に聞け」という評判が口コミで広がった時"],
    structureFit:[{label:"大企業（中間管理職）",score:28,note:"「分析より行動」の圧力で能力が殺される"},{label:"大企業（内部コンサル）",score:74,note:"問題の深掘りを仕事にできる"},{label:"コンサルティング",score:92,note:"根本原因の特定が最も評価される場"},{label:"スタートアップ",score:68,note:"問題が複雑でない段階では過剰になることも"},{label:"独立・専門コンサル",score:88,note:"診断能力を直接マネタイズできる"}],
    cultureFit:[{label:"日本の大企業文化",score:30,note:"「原因を探る」より「動く」が評価される"},{label:"日本のコンサル市場",score:72,note:"専門知識は評価されるが深掘りへの許容は限定的"},{label:"シリコンバレー型",score:82,note:"「なぜ」を問い続けることへの投資がある"},{label:"欧州型",score:78,note:"分析への文化的尊重がある"},{label:"グローバル専門家市場",score:90,note:"診断能力に直接対価が払われる構造"}],
    accelerator:"AIが既知パターンの問題を自動解決するほど、「まだ名前のない問題」を感知して定義できる人間の希少価値が上がる。",
    trap:"「分析するだけで動かない人」というレッテルが貼られた時。診断と実行のバランスの取り方が社会的評価を分ける。",
  },
  craft_uncompromising:{
    headline:"「なぜこのクオリティが出せるのか」が謎になった時に市場価値が確定する",
    triggers:["品質の差が口コミで広がって指名で仕事が来るようになった時","「これを作れるのはあなただけだ」という評判が確立した時","独立して価格より品質を選ぶクライアントだけと仕事できるようになった時"],
    structureFit:[{label:"大企業",score:35,note:"「十分なもの」文化との慢性的な摩擦"},{label:"専門職・職人市場",score:94,note:"最適。品質が直接評価される"},{label:"スタートアップ",score:50,note:"MVP文化との根本的な価値観の衝突"},{label:"独立・個人事業",score:92,note:"自分の基準を妥協なく実装できる"},{label:"高付加価値B2B",score:86,note:"品質差がプレミアム価格に変換できる"}],
    cultureFit:[{label:"日本の職人・伝統文化",score:96,note:"最も相性の良い文化圏"},{label:"日本の大企業文化",score:40,note:"職人性は認められるが出世とは切り離される"},{label:"ドイツのMittelstand",score:92,note:"品質へのこだわりが事業の中核にある文化"},{label:"シリコンバレー型",score:44,note:"スピードと反復が優先される文化との齟齬"},{label:"欧州高級品市場",score:88,note:"品質への投資が正当化される"}],
    accelerator:"AIが「それなりのもの」を無限に量産する時代に、人間が作るものへの価値の基準は二極化する。本物を体現できるのはこのタイプだけだ。",
    trap:"高品質へのこだわりが「完成しないもの」を量産する時。市場に出さないプロジェクトは価値を生まない。",
  },
  catalyst_prophetic:{
    headline:"「あの時の指摘が正しかった」という実績が積み上がった時に先見性の評判が確立する",
    triggers:["移行期・転換期に居合わせて変化の方向を早期に特定した時","自分の指摘が後から証明されることが繰り返され信用が蓄積された時","「この人の言うことは聞いておいた方がいい」という評判が生まれた時"],
    structureFit:[{label:"大企業（中間管理職）",score:20,note:"最悪の環境。正しくても早すぎる指摘が評価されない"},{label:"大企業（経営企画・戦略）",score:68,note:"権限があれば機能する"},{label:"コンサルティング",score:82,note:"変化の方向を示すことが仕事になる"},{label:"スタートアップ（創業）",score:90,note:"自分がフレームを作る立場になれる"},{label:"投資・VC・アドバイザー",score:86,note:"先行認識が直接的な価値になる"}],
    cultureFit:[{label:"日本の大企業文化",score:18,note:"「出る杭」として扱われる最悪の文化圏"},{label:"日本のスタートアップ",score:72,note:"変化への感度が評価される"},{label:"シリコンバレー型",score:94,note:"先行認識が「ビジョン」として最大限評価される"},{label:"欧州型",score:66,note:"変化への感度は評価されるが組織的抵抗は大きい"},{label:"グローバル独立市場",score:90,note:"先見性に直接対価が払われる構造"}],
    accelerator:"AIによる社会変容が加速する2025-2035年は、このタイプが最も構造的に有利な10年間と重なっている。",
    trap:"正しすぎるタイミングで言い続けることへの孤独と消耗。「また言ってる」という疲労感が蓄積した時に自己検閲が始まる。",
  },
  ind_pioneer:{
    headline:"独立した瞬間から、組織内では発揮できなかった能力が一気に解放される",
    triggers:["独立・起業して自分が軸の全権限を持った時","「許可なしに動ける」構造を手に入れた時","結果だけで評価される環境（成果報酬・投資家・市場）に入った時"],
    structureFit:[{label:"大企業",score:22,note:"最悪の環境。承認プロセスがこのタイプの最大の障害"},{label:"スタートアップ（創業）",score:96,note:"最適。全権限が自分にある"},{label:"フリーランス・独立",score:94,note:"自分の判断軸だけで動ける"},{label:"投資・VC",score:80,note:"独立した判断が直接結果になる"},{label:"小規模チームのリーダー",score:76,note:"権限の範囲が明確であれば機能する"}],
    cultureFit:[{label:"日本の大企業文化",score:15,note:"最悪の文化圏。根本的な価値観の不一致"},{label:"日本のスタートアップ",score:74,note:"独立志向が評価される文化が育ちつつある"},{label:"シリコンバレー型",score:96,note:"独立志向・自律性が最も評価される文化"},{label:"欧州型",score:66,note:"独立性は尊重されるが承認文化も残る"},{label:"アジア新興国",score:82,note:"起業家精神が社会的に評価される"}],
    accelerator:"個人がAIを使って単独で組織相当の成果を出せる2025-2035年は、このタイプの構造的な優位性が最大化する時代と完全に重なっている。",
    trap:"信頼できる2-3人の核を持たずに完全に単独で動くこと。協力の構造を自分が設計しないことが最大の失敗パターンだ。",
  },
  synth_bridge:{
    headline:"「なぜあなたにはこっちの世界とあっちの世界の両方が分かるのか」という評判が価値になる",
    triggers:["複数の専門領域の人間が集まる場で自然に橋渡し役になった時","「この二つをつなぐことができる人間が他にいない」という立場になった時","異なる業界の知識を組み合わせた独自のアプローチが評価された時"],
    structureFit:[{label:"大企業（部門横断）",score:78,note:"組織内の翻訳者として機能する"},{label:"コンサルティング",score:86,note:"複数クライアントから横断的な視点が蓄積される"},{label:"スタートアップ（初期）",score:72,note:"多役割が求められる環境で機能する"},{label:"独立・アドバイザー",score:84,note:"複数の専門領域への関与が価値になる"},{label:"学術・研究機関",score:76,note:"学際的研究への需要がある"}],
    cultureFit:[{label:"日本の大企業文化",score:55,note:"ジェネラリストとして使われるが評価軸が曖昧"},{label:"シリコンバレー型",score:86,note:"T字型人材が最も評価される"},{label:"欧州型",score:78,note:"学際的アプローチへの文化的尊重がある"},{label:"グローバル独立市場",score:90,note:"ニッチな専門組み合わせが希少価値になる"},{label:"アジア成長市場",score:74,note:"複数市場をつなぐ役割への需要がある"}],
    accelerator:"専門化が極度に進んだ時代に、境界を越えて翻訳・統合できる人間の価値は上がる。",
    trap:"「どちらにも深く属していない」という自己認識が、価値を発信することへの自信を削ること。",
  },
  harmony_keeper:{
    headline:"「あの人がいるとチームがうまく回る」という評判が口コミで広がった時に価値が確定する",
    triggers:["チームの連携と信頼関係が直接的な成果に影響する環境に入った時","「あの人がいないと摩擦が増える」ということが証明された時","人間関係の調整能力自体がサービス・価値として認識された時"],
    structureFit:[{label:"大企業（HR・組織開発）",score:86,note:"関係維持の価値が最も可視化される"},{label:"チームマネジメント",score:90,note:"最適。人間関係が成果に直結する"},{label:"コンサルティング",score:74,note:"クライアント関係の維持で機能する"},{label:"スタートアップ",score:66,note:"初期は重要だが後期はスケールしにくい"},{label:"独立・コーチング",score:80,note:"関係構築能力を直接マネタイズできる"}],
    cultureFit:[{label:"日本の職場文化",score:90,note:"和を重んじる文化と深く共鳴する"},{label:"東アジア企業文化",score:86,note:"関係維持が評価される文化圏"},{label:"欧州型",score:72,note:"チームワークへの価値がある"},{label:"シリコンバレー型",score:50,note:"成果主義が強く関係維持の価値が相対的に低い"},{label:"医療・教育・NPO",score:92,note:"人間関係が核心にある分野"}],
    accelerator:"AIが業務処理を担うほど、「人間同士の感情的な調整」は人間に残る最後の価値領域の一つになる。",
    trap:"関係維持のために自分を犠牲にし続けること。境界線を引けないことが長期的な消耗につながる。",
  },
  stable_operator:{
    headline:"「あの人がいれば大丈夫」という信頼が積み上がって、特定の分野での不可欠性が生まれる",
    triggers:["自分の信頼性が組織の中核的なインフラになった時","複雑なシステムや組織の運用に不可欠な知識が自分に集中した時","安定を必要とする高価値な領域（金融・医療・インフラ）で専門性を確立した時"],
    structureFit:[{label:"大企業（運用・管理）",score:84,note:"安定への投資が評価される"},{label:"公共・インフラ",score:90,note:"安定性が最も価値を持つ場"},{label:"金融・医療",score:86,note:"高信頼性が直接的な価値になる"},{label:"スタートアップ",score:30,note:"変化のスピードとの摩擦が大きい"},{label:"独立",score:46,note:"安定を売ることはできるが変化に弱い"}],
    cultureFit:[{label:"日本の大企業文化",score:86,note:"安定と継続性が評価される文化"},{label:"公共・行政",score:92,note:"安定性が最も評価される場"},{label:"シリコンバレー型",score:28,note:"「変化しない」ことが弱点として見られる"},{label:"欧州型（独・北欧）",score:76,note:"信頼性への文化的価値がある"},{label:"東アジア企業文化",score:84,note:"長期的な信頼関係が評価される"}],
    accelerator:"AIが実行の多くを担う時代に、「何をAIに任せてよいか」の判断と監視は人間に残る。安定運用の知識と経験はAI自動化後の監視・例外処理において価値を持つ。",
    trap:"変化を回避し続けることで、ある日突然ポジションごと不要になること。最も安全に見えるポジションが最初に消える逆説に注意が必要。",
  },
  pragmatic_executor:{
    headline:"成果と報酬が明確に連動した環境に入った瞬間、周囲が驚くほどのアウトプットを出す",
    triggers:["成果報酬型の環境（営業・フリーランス・独立）に入った時","目標が明確で達成すれば報われることが保証された時","自分の労働市場価値を正確に把握して適切な対価を要求できるようになった時"],
    structureFit:[{label:"大企業（固定給のみ）",score:35,note:"成果と報酬の連動が弱く動機を維持しにくい"},{label:"成果報酬型営業",score:92,note:"最適。明確な報酬連動がある"},{label:"フリーランス・独立",score:86,note:"自分で価格を設定できる"},{label:"スタートアップ（ストックオプション）",score:76,note:"長期的な成果連動がある"},{label:"コンサルティング",score:80,note:"成果が見えやすく報酬連動しやすい"}],
    cultureFit:[{label:"日本の年功序列文化",score:28,note:"成果と報酬の連動が弱い最悪の環境"},{label:"外資系企業文化",score:84,note:"成果主義が徹底されている"},{label:"シリコンバレー型",score:86,note:"成果への対価が明確"},{label:"新興国市場",score:80,note:"成長市場での成果が直接報酬に結びつく"},{label:"グローバル独立市場",score:90,note:"自分の価値を市場に直接問える"}],
    accelerator:"AIで個人の生産性が上がるほど、成果を出せる人間への報酬は増加する。実利志向の人間はこの変化を最も速く読んで行動できる。",
    trap:"短期的な報酬最大化を追いすぎて、長期的な信頼と評判の構築を後回しにすること。",
  },
  default_adapter:{
    headline:"どんな環境でも機能できる適応力を、戦略的に「最も良い場所を選ぶ」ために使い始めた時に加速する",
    triggers:["適応力自体を強みと認識してそれを最大化できる環境を意識的に選んだ時","変化の激しい分野で先行者として入り適応速度で差をつけた時","AIなどの新技術をいち早く取り入れて新しい役割の標準を作った時"],
    structureFit:[{label:"変化の激しいスタートアップ",score:76,note:"適応速度が最も評価される"},{label:"新興分野・新技術領域",score:82,note:"先行者として適応速度で差をつけられる"},{label:"コンサルティング",score:74,note:"多様な環境への適応が求められる"},{label:"大企業（変革期）",score:66,note:"変化への対応が評価される時期"},{label:"独立・フリーランス",score:72,note:"様々なクライアントへの適応が価値になる"}],
    cultureFit:[{label:"変化を歓迎する文化",score:82,note:"適応力が最も評価される"},{label:"シリコンバレー型",score:76,note:"変化への速度が評価される"},{label:"日本の大企業文化",score:54,note:"適応力は評価されるが軸のなさとも解釈される"},{label:"グローバル環境",score:80,note:"多様な文化への適応が直接的な価値になる"},{label:"新興国市場",score:74,note:"変化の速い環境で機能する"}],
    accelerator:"AIで仕事の内容が急速に変化する時代に、新しい役割への適応速度は重要な競争優位になる。",
    trap:"「特に強みがない」という自己認識のまま、戦略なく環境に流され続けること。",
  },
  fallback:{
    headline:"自分のパターンを言語化した時に、強みが一気に見えてくる",
    triggers:["自分が「当たり前」にやっていることの希少性に気づいた時","他者の反応から自分の強みを逆算できた時","試行錯誤の中で「これは自分しかできない」という感覚が生まれた時"],
    structureFit:[{label:"試行錯誤できる環境",score:74,note:""},{label:"スタートアップ初期",score:70,note:""},{label:"教育・研修環境",score:66,note:""},{label:"大企業（ローテーション）",score:52,note:""},{label:"独立",score:56,note:"自分のパターンが見えてから有効"}],
    cultureFit:[{label:"自己探索を支援する文化",score:76,note:""},{label:"メンタリング文化が強い環境",score:72,note:""},{label:"シリコンバレー型",score:66,note:""},{label:"日本の大企業文化",score:48,note:""},{label:"試行錯誤が許される組織",score:74,note:""}],
    accelerator:"自分の軸を見つけることへの投資が、AI時代では最も重要なプリオリティの一つになっている。",
    trap:"自己理解を後回しにして、環境に流されながら時間だけが過ぎること。",
  },
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function getArchetype(s){
  var sorted=ARCHETYPES.slice().sort(function(a,b){return b.pri-a.pri;});
  for(var i=0;i<sorted.length;i++){if(sorted[i].cond(s))return sorted[i];}
  return ARCHETYPES[ARCHETYPES.length-1];
}

function computeScores(history){
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

function computeGapData(history){
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

// Gap growth signals — what the person built vs. what came naturally
// Research: Snyder (1974) self-monitoring r≈.40 career advancement
// Cain (2012) free trait theory — introverts who act extroverted for core goals
// Roberts et al. (2006) — conscientiousness most amenable to deliberate change
// Hochschild (1983) — emotional labor has real cognitive cost
const GROWTH_SIGNALS={
  extraversion:{
    badge:"内向 → 対外スキルを構築",
    narrative:"仕事では外向的に見えているが、それが自然なエネルギーの方向ではないことが回答パターンに示されている。Susan Cainの「Free Trait Theory」が示すように、人は核となる目標のために自然な気質に反した行動を維持できる——ただしエネルギーコストを伴って。会議でプレゼンし、初対面の人と話し、場を引っ張る能力は、おそらく生まれつきのものではなく、選択と練習によって作り上げたものだ。",
    compliment:"あなたが今「当たり前に」やっている対人スキルの多くは、自然に得意な人間にはわからないコストがかかっている。それを払い続けて洗練させてきたことは、努力の形として最も見えにくいものの一つだ。",
  },
  conscientiousness:{
    badge:"衝動 → 構築した規律と習慣",
    narrative:"「計画と継続は才能ではなくシステムだ」という認識は、誠実性が生まれつきではなく構築したものであることを示している。Roberts et al.（2006）の研究は、誠実性がBig Fiveの中で最も意図的な訓練によって変化する特性であることを示している——それは「なる」ものではなく「作る」ものだ。現在の習慣と継続力は、そのシステム構築の結果だ。",
    compliment:"今のあなたの「やり切る力」は気質ではなく設計だ。同じ目標を持ちながらそのシステムを作れなかった人間がいる中で、あなたはそれを作り上げた。その違いは才能ではなく意志の形だ。",
  },
  stability:{
    badge:"感情的な反応性 → 制御された安定",
    narrative:"冷静さを意識的に構築してきたことが示されている。Hochschildの感情労働（emotional labor）研究が示すように、感情を制御してパフォーマンスを維持することは外には見えない認知コストを伴う。「冷静に見える」のは、そう感じているからではなく、そう機能するよう自分を訓練した結果かもしれない。",
    compliment:"プレッシャー下での冷静さの内側に、調整のためのエネルギーが動いていることを周囲は気づいていない。だからこそ希少だ。",
  },
  independence:{
    badge:"社会的同調 → 確立した自己軸",
    narrative:"「自分の意見を言っていい、空気を読みすぎるな」というメッセージを若い自分に伝えたいという回答は、自己主張が生まれつきではなく意識的に構築したものであることを示している。特に日本の職場文化において、これは文化的な圧力に逆らった選択の積み重ねだ。",
    compliment:"今あなたが持っている「自分の意見を言える」能力は、周囲の期待に逆らい続けた積み重ねの結果だ。それは生まれつきの強さより、ある意味で稀な種類の力だ。",
  },
  openness:{
    badge:"防衛反応 → 受容の知性",
    narrative:"批判を「攻撃ではなく情報」として扱うことを意識的に練習してきたことが示されている。批判は自己概念への脅威として処理される傾向があり、それを「情報処理」に変換することには継続的な意識的努力が必要だ。現在の開放性スコアは、この練習の蓄積を反映している。",
    compliment:"批判に対してオープンでいられること——これは自然に得られる能力ではなく、防衛反応に勝ち続けた姿勢の結果だ。その選択を繰り返してきたことが、今の知的な柔軟性を作っている。",
  },
};

function getTopGaps(gapData){
  return Object.keys(gapData)
    .filter(function(k){return gapData[k]>=16&&GROWTH_SIGNALS[k];})
    .sort(function(a,b){return gapData[b]-gapData[a];})
    .slice(0,2);
}

// ── HISTORICAL FIGURES ────────────────────────────────────────────────────────
const HISTORICAL_FIGURES = {
  arch_demolish:[
    {
      name:"アラン・チューリング",
      era:"1912–1954",
      domain:"数学・コンピュータ科学",
      connection:"チューリングは「計算とは何か」という問いから始めた。当時の数学者が証明の中身を考えていた時、彼はその証明を行う「機械」の構造を問い直した——フレームそのものを解体した。エニグマ解読も然りで、他の暗号解読者がコードを破ろうとしていた時、チューリングはコード解読機械のアーキテクチャを設計した。",
      origin:"少年期は学校の規則を無視して独自の数学を探求し続けた。教師からは「役に立たないことに集中している」と言われた。その「役に立たない」探求が、現代コンピューターの基礎になった。",
      lesson:"「なぜこうなっているのか」を理解しないまま進めない——という特性は、チューリングにとって欠陥ではなく、他の誰も辿り着けなかった場所への道だった。",
    },
    {
      name:"レオナルド・ダ・ヴィンチ",
      era:"1452–1519",
      domain:"芸術・工学・解剖学・水力学",
      connection:"ダ・ヴィンチは鳥の翼の構造を解体して飛行機械を設計し、人体を解体して芸術の精度を上げ、川の流れを解体して水力工学に応用した。あらゆる分野で「まずそれを解体する」ことから始めた。",
      origin:"私生児として生まれ、正規の教育を受けられなかった。それが逆に「既存の権威から学ぶ」ではなく「自分で観察して理解する」という方法論を生んだ。",
      lesson:"制度の外にいたことが、制度の中で形成された「当たり前の前提」を持たないことにつながった。",
    },
  ],
  arch_precision:[
    {
      name:"ヨハン・セバスティアン・バッハ",
      era:"1685–1750",
      domain:"音楽作曲",
      connection:"バッハの対位法は美しさと数学的精密さが同時に最高点を達している。彼は「十分な音楽」を書くことができなかった——あらゆる声部が独立して完璧でありながら、全体として統合されていなければならなかった。その基準は外部から来ていなかった。",
      origin:"幼少期に両親を亡くし、10代で独立した。生涯を通じて経済的に苦しい時期があっても、作品の質への妥協は一度もなかった。",
      lesson:"バッハが生前に真の評価を受けたのは一部の地域だけだった。死後100年で再発見された。精密さへの執着は、しばしば時代より先に到達することを意味する。",
    },
    {
      name:"宮崎 駿",
      era:"1941–",
      domain:"アニメーション",
      connection:"宮崎は自分の描いたキャラクターの動きが「十分」だと感じることができなかった。他のアニメーターが8コマで描く動作を、彼は24コマで描いた。その差は観客には意識されないが、感じられる。",
      origin:"戦後の混乱期に育ち、航空機工場を経営する父を持った。機械の精密さへの感受性と、動く絵への執着が合流した。",
      lesson:"「誰も気づかない細部」に費やした時間が、作品全体の「何かが違う」という感覚を生む。その感覚がブランドになる。",
    },
  ],
  diag_root:[
    {
      name:"マリー・キュリー",
      era:"1867–1934",
      domain:"物理学・化学",
      connection:"ウランが放射線を出すことは知られていた。キュリーは「なぜ」を止めなかった。その「なぜ」が放射性元素の存在という根本原因の発見に至った。当時の科学界が現象を記述しようとしていた時、彼女は原因を探し続けた。",
      origin:"女性が大学に入れないポーランドで育ち、姉と資金を分け合いながら秘密の勉強会に参加した。制度的な障壁が「既存のフレームへの服従」を持たないことを生んだ。",
      lesson:"「なぜ」を止めなかったことは彼女の人生を縮めたかもしれない（放射線被曝）。しかしその「止めない」という特性なしには、2つのノーベル賞もなかった。",
    },
    {
      name:"リチャード・ファインマン",
      era:"1918–1988",
      domain:"理論物理学",
      connection:"チャレンジャー号爆発事故の調査委員会で、ファインマンは他の委員が報告書の文言を議論している時に、ガスケットをコップの氷水に沈めた。症状ではなく根本原因を探す——それが彼の思考の自動的な動き方だった。",
      origin:"父親に「大事なのは名前ではなく、それが何をするかを知ることだ」と教えられて育った。観察から始まる習慣が幼少期に形成された。",
      lesson:"「なぜ機能するのか」を理解しないままでいることへの不快感は、物理学だけでなく、錠前解錠・絵画・ボンゴドラムにまで及んだ。それが広い連想と問題解決の幅を生んだ。",
    },
  ],
  craft_uncompromising:[
    {
      name:"ミケランジェロ",
      era:"1475–1564",
      domain:"彫刻・絵画",
      connection:"システィーナ礼拝堂の天井画を依頼された時、ミケランジェロは最初断った——彫刻家であり画家ではないと。しかし引き受けた後は、当初の計画を独自の解釈で全面的に拡張した。「依頼通りにやる」という選択肢が内部に存在しなかった。",
      origin:"石切り場の職人の家に里子に出され、職人の仕事を幼少期から見た。素材と対話する姿勢は、職人文化から吸収された。",
      lesson:"ミケランジェロは「彫刻とは大理石の中に既に存在する形を解放することだ」と言った。彼の基準は外部から与えられたものではなく、素材の中にある完成形への応答だった。",
    },
    {
      name:"小野 二郎（すきやばし次郎）",
      era:"1925–",
      domain:"寿司職人",
      connection:"85歳を超えても毎朝市場に行き、同じ職人から同じ食材を仕入れ、同じ動作を繰り返した。「完成した」という感覚を一度も持たないことが、その仕事の特徴だ。",
      origin:"7歳で奉公に出され、家に帰れなかった。「この仕事しかない」という状況が、その仕事に全てを注ぎ込むことへの自然な流れを作った。",
      lesson:"同じことを何十年も繰り返すことへの執着は、外部からは「変わらない」に見える。しかし内部では毎回「今日はどこを改善できるか」が動いている。",
    },
  ],
  catalyst_prophetic:[
    {
      name:"ガリレオ・ガリレイ",
      era:"1564–1642",
      domain:"天文学・物理学",
      connection:"地動説を主張した時、ガリレオは全員が間違った方向を向いていることを知っていた。証拠があった。しかし宗教裁判に直面し、公式には撤回した——ただし研究は続けた。「早すぎた指摘」が正しかったと証明されるまでに数十年かかった。",
      origin:"医学を学ぶつもりが、振り子の等時性に気づいたことで物理学へ転向した。既存の説明への違和感が出発点だった。",
      lesson:"ガリレオの経験が示すのは、「正しいタイミングより早い」ことのコストだ。そのコストを払いながら研究を続けたことが、後の科学革命の基礎になった。",
    },
    {
      name:"ニコラ・テスラ",
      era:"1856–1943",
      domain:"電気工学",
      connection:"交流電流（AC）の優位性を確信していたが、直流電流（DC）のエジソンとの「電流戦争」で一時的に負けた。しかしテスラが正しかった。20世紀の電力網は交流で動いている。",
      origin:"幼少期から異常な視覚化能力を持ち、設計を頭の中で完成させてから作り始めた。「試作してから改良する」ではなく「理解してから作る」という思考スタイルは生来のものだった。",
      lesson:"テスラは「発明の価値は、どれだけ多くの人がまだ理解していないか」によって測られることがある、と言った。先行認識は、評価の時間軸を長く取ることを要求する。",
    },
  ],
  ind_pioneer:[
    {
      name:"アメリア・イアハート",
      era:"1897–1937",
      domain:"航空",
      connection:"「女性が飛行機を操縦するべきではない」という文化的コンセンサスがあった時代に、大西洋単独横断飛行を成し遂げた。許可を待たず、先例を作ることで承認に変えた。",
      origin:"父親のアルコール依存と家庭の不安定さの中で、自力で道を切り開くことを早くに学んだ。誰かの許可を待つことへの不信感は、生い立ちの中で形成された。",
      lesson:"「前例がない」は禁止ではなく、「最初になれる」を意味する——その読み替えが開拓者の本質だ。",
    },
    {
      name:"坂本 龍馬",
      era:"1836–1867",
      domain:"政治・外交",
      connection:"幕末の日本で、薩摩藩と長州藩という宿敵を結びつけた。どちらの側でもなく、両者の可能性を見ていた。許可を得ずに行動し、結果で信頼を作った。",
      origin:"土佐藩の下士という低い身分だったが、その枠組みを自分への制約として受け入れなかった。「身分があなたの可能性を決める」というフレームを最初から疑っていた。",
      lesson:"龍馬は自分の行動の全てを許可された行動の範囲内で行ったわけではない。しかし結果として日本の歴史を変えた。「組織のルールより自分の判断軸」という特性が、最も発揮された人物の一人だ。",
    },
  ],
  synth_bridge:[
    {
      name:"ベンジャミン・フランクリン",
      era:"1706–1790",
      domain:"政治・科学・外交・著述",
      connection:"電気の研究者であり、アメリカ建国の父であり、外交官であり、印刷業者だった。一つの専門に閉じることができなかった——あるいは閉じる必要を感じなかった。その横断性が、異なる世界を橋渡しする外交能力として機能した。",
      origin:"16人兄弟の10番目として生まれ、正規教育は2年のみ。独学で複数の分野を渡り歩いたことが、どの専門家にも「半分こちらの世界の人間」として接することを可能にした。",
      lesson:"「専門家でない」ことは、専門家同士が話せない時の通訳者になれることを意味する。フランクリンの価値は深さではなく接続にあった。",
    },
    {
      name:"イブン・バットゥータ",
      era:"1304–1368 or 1369",
      domain:"探検・地理・外交",
      connection:"29年間で約12万kmを旅し、イスラム世界・インド・中国・アフリカなど全く異なる文化圏を移動した。どこへ行っても「外の世界」の情報を「今いる世界」の言語で伝える能力を持っていた。",
      origin:"モロッコの裕福なイスラム法学者家系に生まれ、21歳でメッカ巡礼に出発したが、そのまま世界を旅し続けた。「帰るべき場所」への執着より「次の世界を見る」衝動が強かった。",
      lesson:"どこにも完全には属さないことは孤独だが、どこでも「外の視点を持つ人間」として価値を持てることでもある。",
    },
  ],
  harmony_keeper:[
    {
      name:"エレノア・ルーズベルト",
      era:"1884–1962",
      domain:"人権・外交・政治",
      connection:"国連人権宣言の起草委員長として、文化・イデオロギー・利害が全く異なる代表団を一つのテキストへと収束させた。彼女の能力は対立を消すことではなく、対立の中に共通の言語を見つけることだった。",
      origin:"幼少期に両親を亡くし、内向的で自己評価が低かったと本人が述べている。人の痛みへの感受性は、自分の孤独な経験から来ていた。",
      lesson:"人を結びつける能力は、しばしば自分自身が「どちらの側でもない」という経験から来る。ルーズベルトは自分の「どこにも属さない感覚」を、全員の言いたいことを聞ける能力に変換した。",
    },
  ],
  stable_operator:[
    {
      name:"ウォーレン・バフェット",
      era:"1930–",
      domain:"投資",
      connection:"バフェットの投資哲学の核心は「理解できないものに投資しない」だ。派手な技術革新より、何十年も同じビジネスモデルで機能し続ける企業を選ぶ。確実に機能するシステムへの信頼が基本原則だ。",
      origin:"11歳で株を始め、13歳で新聞配達のルートを最適化してティップを最大化した。早期から「繰り返し機能するシステム」の発見に喜びを感じていた。",
      lesson:"バフェットの言葉「退屈なほど良い投資だ」は、このプロフィールの本質を指している——確実に機能し続けるものの価値は、劇的に見えるものよりも長く続く。",
    },
  ],
  pragmatic_executor:[
    {
      name:"ナポレオン・ボナパルト",
      era:"1769–1821",
      domain:"軍事・政治",
      connection:"ナポレオンは戦略会議より実行を優先した。「最高の計画は十分早く実行された次善の計画だ」という考え方を体現した。目標が明確になった瞬間の動き出しの速さが、彼の軍事的天才の核心だった。",
      origin:"コルシカ島の中産階級の家庭に生まれ、フランス人からは「外国人」と見られた。どのコミュニティにも完全には属さない立場が、感情的な忠誠より結果への集中を生んだ。",
      lesson:"ナポレオンの最終的な失敗（ロシア遠征・過信）は、実行力の強さが判断の質を上回った時に何が起きるかを示している——実行者プロフィールの最大の罠の歴史的な実例だ。",
    },
    {
      name:"アンドリュー・カーネギー",
      era:"1835–1919",
      domain:"鉄鋼・慈善",
      connection:"スコットランドから移民した10代で電報配達員として働き始め、鉄鋼王になった。彼の成功は才能より「どうやれば目標に達するか」への集中と実行の速さにあった。感情より数字と結果が意思決定の軸だった。",
      origin:"貧困の中で育ち、「金持ちになること」が最初の明確な目標だった。目標の明確さが実行力を駆動した。",
      lesson:"カーネギーが晩年に全財産を慈善に使ったことは、実利志向の人間が目標を変えた時に何が起きるかを示している——実行力はその向き先を変えられる。",
    },
  ],
  default_adapter:[
    {
      name:"レオナルド・ダ・ヴィンチ（別側面）",
      era:"1452–1519",
      domain:"芸術・科学・工学",
      connection:"ダ・ヴィンチは「未完成の天才」とも呼ばれる。多くのプロジェクトが途中で終わった。それは集中力の欠如ではなく、次の興味が常に引力を持っていたからだ。どの専門にも固定しない性質が、全ての専門に入れることを意味した。",
      origin:"私生児として生まれ、どのコミュニティにも完全には属せなかった。その「どこにも属さない」感覚が、どこにでも入れる柔軟性の基盤になった。",
      lesson:"「特定の軸がない」ことへの焦りは、それを強みとして使う文脈を見つけていないだけかもしれない。ダ・ヴィンチは「複数の世界への好奇心」を抑制しようとしなかった。",
    },
  ],
  fallback:[
    {
      name:"ヴィクトール・フランクル",
      era:"1905–1997",
      domain:"精神医学・哲学",
      connection:"強制収容所での経験から「意味への意志（ロゴセラピー）」を構築した。方向性が見えない時期に、その経験そのものが後の生涯の仕事の基盤になった。「今まだわからない」という状態が、後の軸形成に必要なものを積み上げていることがある。",
      origin:"若い頃はフロイトとアドラーの弟子として出発したが、その枠組みでは説明できない人間の側面に気づき、独自の理論を形成した。",
      lesson:"フランクルの言葉：「重要なのは、人生が私たちに何を期待しているかだ」——軸がまだ見えない状態は、その問いを立てるための時間かもしれない。",
    },
  ],
};

function getFigures(arcId){
  var key=arcId;
  // fallback to parent archetype key if needed
  var fig=HISTORICAL_FIGURES[key];
  if(!fig||fig.length===0){
    if(key.indexOf("arch")===0) fig=HISTORICAL_FIGURES["arch_demolish"];
    else fig=HISTORICAL_FIGURES["fallback"];
  }
  return fig||[];
}

function getEraFit(s){
  // Weighted by research: openness+conscientiousness strong predictors,
  // independence adds AI-era premium, stability adds broad career success
  return Math.round(
    s.openness*0.20+s.frameBreaking*0.18+s.conscientiousness*0.15+
    s.independence*0.14+s.craftDrive*0.13+s.extraversion*0.08+
    s.agreeableness*0.07+s.stability*0.05
  );
}
function topKey(s){return Object.keys(s).reduce(function(a,b){return s[b]>s[a]?b:a;});}
function botKey(s){return Object.keys(s).reduce(function(a,b){return s[b]<s[a]?b:a;});}

// ── COMPONENTS ───────────────────────────────────────────────────────────────
function Radar(props){
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

function Bar(props){
  var ws=useState(0);var w=ws[0];var setW=ws[1];
  useEffect(function(){var t=setTimeout(function(){setW(props.val);},400+(props.delay||0));return function(){clearTimeout(t);};}, [props.val,props.delay]);
  var c=props.val>=75?"#00ff88":props.val>=55?"#ffcc44":"#ff7755";
  return React.createElement("div",{style:{height:3,background:"#181830",borderRadius:2,overflow:"hidden"}},
    React.createElement("div",{style:{height:"100%",width:w+"%",background:c,borderRadius:2,boxShadow:"0 0 5px "+c+"44",transition:"width 0.9s cubic-bezier(.4,0,.2,1)"}}));
}
function ScoreBar(props){
  var ws=useState(0);var w=ws[0];var setW=ws[1];
  useEffect(function(){var t=setTimeout(function(){setW(props.val);},props.delay||0);return function(){clearTimeout(t);};}, [props.val,props.delay]);
  var c=props.val>=75?"#00ff88":props.val>=50?"#ffcc44":props.val>=30?"#ff9955":"#ff5544";
  return React.createElement("div",{style:{height:4,background:"#181830",borderRadius:2,overflow:"hidden",marginTop:3}},
    React.createElement("div",{style:{height:"100%",width:w+"%",background:c,borderRadius:2,transition:"width 0.8s cubic-bezier(.4,0,.2,1)"}}));
}

// ── APP ───────────────────────────────────────────────────────────────────────
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
      if(next>=ITEMS.length){setScores(computeScores(nh));setGapData(computeGapData(nh));setPhase("result");}
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

  var W={minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace",padding:"20px 16px"};
  var CARD={width:"100%",maxWidth:600,background:"#0e0e1c",border:"1px solid #1c1c34",borderRadius:4,padding:"30px 26px",opacity:fade?1:0,transform:fade?"translateY(0)":"translateY(6px)",transition:"opacity 0.22s ease,transform 0.22s ease"};
  var DIV={height:1,background:"#1c1c34",margin:"22px 0"};
  var T1={color:"#e8eaf6"};var T2={color:"#b0b4d8"};var T3={color:"#7880b0"};var T4={color:"#44486a"};
  function btnSt(a,col){col=col||"#00ff88";return{padding:"11px 24px",background:a?col:"#131326",border:"1px solid "+(a?col:"#1c1c34"),borderRadius:3,color:a?"#080810":"#44486a",fontSize:10,letterSpacing:3,cursor:a?"pointer":"default",fontFamily:"'Courier New',monospace",textTransform:"uppercase",fontWeight:"bold",transition:"all 0.15s"};}

  if(phase==="intro") return(
    <div style={W}><div style={{...CARD,textAlign:"center"}}>
      <div style={{fontSize:9,letterSpacing:4,color:"#00ff88",marginBottom:14,textTransform:"uppercase"}}>DEEP CHARACTERISTIC DIAGNOSTIC v3</div>
      <div style={{fontSize:21,...T1,marginBottom:14,lineHeight:1.5}}>あなたが<span style={{color:"#00ff88"}}>最も価値を出せる理由</span><br/>を特定する</div>
      <div style={{fontSize:11,...T3,lineHeight:2.0,marginBottom:18}}>
        幼少期から現在まで——具体的な行動から推定する。<br/>
        <span style={{...T2}}>通常質問</span>：5票を好きに配分（連打OK・5票で自動進行）<br/>
        <span style={{color:"#ffaa44"}}>クイズ</span>：1択・自己申告を客観補正する
      </div>
      <div style={{fontSize:9,color:"#252540",marginBottom:8,letterSpacing:1}}>
        Big Five / OCEAN · Holland RIASEC · 行動一貫性原則 · 縦断研究に基づく設計
      </div>
      <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:12,marginBottom:18}}>
        {["設計者","診断者","職人","触媒","統合者","開拓者","調整者","実行者","運用者","適応者"].map(function(t){return <div key={t} style={{fontSize:9,...T4,letterSpacing:1}}>{t}</div>;})}
      </div>
      <div style={{fontSize:9,...T4,marginBottom:20,letterSpacing:2}}>16問前後 ／ クイズ3問含む ／ 約12分</div>
      <button style={{...btnSt(true),cursor:"pointer"}} onClick={function(){go(function(){setPhase("quiz");});}}>開始する →</button>
    </div></div>
  );

  if(phase==="quiz"&&isQuestion){
    var lc=currentItem.color||"#00ff88";
    var qn=itemIdx+1;var tot=ITEMS.length;
    return(
      <div style={W}><div style={CARD}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:9,letterSpacing:3,color:lc,textTransform:"uppercase"}}>{currentItem.tag}</div>
          <div style={{fontSize:9,...T4,letterSpacing:2}}>{qn} / {tot}</div>
        </div>
        <div style={{height:1,background:"#1c1c34",borderRadius:1,marginBottom:10,overflow:"hidden"}}>
          <div style={{height:"100%",width:((qn-1)/tot*100)+"%",background:lc,transition:"width 0.4s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:5,marginBottom:20}}>
          {[0,1,2,3,4].map(function(i){return <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<usedVotes?"#00ff88":"#1c1c34",border:"1px solid "+(i<usedVotes?"#00ff8888":"#2c2c48"),transition:"all 0.12s",boxShadow:i<usedVotes?"0 0 6px #00ff8866":"none"}}/>;} )}
          <div style={{fontSize:9,...T4,marginLeft:8,letterSpacing:1}}>{remaining}票残り</div>
        </div>
        <div style={{fontSize:17,lineHeight:1.65,marginBottom:currentItem.sub?8:22,...T1,fontWeight:"normal"}}>{currentItem.text}</div>
        {currentItem.sub&&<div style={{fontSize:10,...T4,marginBottom:20,lineHeight:1.65,fontStyle:"italic"}}>{currentItem.sub}</div>}
        <div style={{marginBottom:8}}>
          {currentItem.options.map(function(opt){
            var vc=votes[opt.id]||0;var act=vc>0;
            return(
              <button key={opt.id} onClick={function(){castVote(opt.id);}}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",textAlign:"left",padding:"13px 15px",marginBottom:8,background:act?"#00ff880e":"transparent",border:"1px solid "+(act?"#00ff8855":"#1c1c34"),borderRadius:3,color:act?"#d0f0e0":"#9090c0",fontSize:12,cursor:remaining>0?"pointer":"default",fontFamily:"'Courier New',monospace",transition:"border-color 0.1s,background 0.1s",letterSpacing:0.3,lineHeight:1.6}}>
                <span style={{flex:1,paddingRight:10}}>{opt.text}</span>
                {act&&<span style={{display:"flex",gap:3,flexShrink:0}}>{[0,1,2,3,4].map(function(i){return <span key={i} style={{width:6,height:6,borderRadius:"50%",background:i<vc?"#00ff88":"transparent",border:"1px solid "+(i<vc?"#00ff88":"#2c2c48"),transition:"all 0.1s"}}/>;})}</span>}
              </button>
            );
          })}
          <button onClick={function(){castVote("none");}} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 15px",marginTop:4,background:"transparent",border:"1px dashed #242444",borderRadius:3,color:"#383858",fontSize:11,cursor:"pointer",fontFamily:"'Courier New',monospace",letterSpacing:1}}>
            ⊘ &nbsp;どれも該当しない
          </button>
        </div>
      </div></div>
    );
  }

  if(phase==="quiz"&&isQuiz){
    var qn=itemIdx+1;var tot=ITEMS.length;
    return(
      <div style={W}><div style={CARD}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#ffaa44",textTransform:"uppercase"}}>{currentItem.tag}</div>
          <div style={{fontSize:9,...T4,letterSpacing:2}}>{qn} / {tot}</div>
        </div>
        <div style={{height:1,background:"#1c1c34",borderRadius:1,marginBottom:16,overflow:"hidden"}}>
          <div style={{height:"100%",width:((qn-1)/tot*100)+"%",background:"#ffaa44",transition:"width 0.4s ease"}}/>
        </div>
        <div style={{background:"#ffaa4408",border:"1px solid #ffaa4430",borderRadius:3,padding:"4px 12px",display:"inline-block",marginBottom:14}}>
          <span style={{fontSize:9,letterSpacing:3,color:"#ffaa44"}}>CALIBRATION QUIZ — 行動傾向型・補正に使用</span>
        </div>
        <div style={{fontSize:13,color:"#ffcc88",marginBottom:10,letterSpacing:1}}>{currentItem.title}</div>
        <div style={{fontSize:16,...T1,lineHeight:1.75,marginBottom:currentItem.sub?8:22,whiteSpace:"pre-line"}}>{currentItem.text}</div>
        {currentItem.sub&&<div style={{fontSize:10,...T4,marginBottom:20,lineHeight:1.65,fontStyle:"italic"}}>{currentItem.sub}</div>}
        <div style={{marginBottom:16}}>
          {currentItem.options.map(function(opt,oi){
            var sel=quizSel===opt.id;
            return(
              <button key={opt.id} onClick={function(){setQuizSel(opt.id);}}
                style={{display:"block",width:"100%",textAlign:"left",padding:"13px 15px",marginBottom:8,background:sel?"#ffaa4410":"transparent",border:"1px solid "+(sel?"#ffaa44":"#1c1c34"),borderRadius:3,color:sel?"#ffe0a0":"#9090c0",fontSize:12,cursor:"pointer",fontFamily:"'Courier New',monospace",transition:"all 0.1s",letterSpacing:0.3,lineHeight:1.6}}>
                <span style={{color:sel?"#ffaa4466":"#2a2a44",marginRight:10,fontWeight:"bold"}}>{String.fromCharCode(65+oi)}.</span>
                {opt.text}
                {sel&&opt.note&&<div style={{fontSize:10,color:"#ffaa4466",marginTop:5,letterSpacing:1}}>{opt.note}</div>}
              </button>
            );
          })}
        </div>
        <button style={{...btnSt(!!quizSel,"#ffaa44"),cursor:quizSel?"pointer":"default"}} onClick={submitQuiz} disabled={!quizSel}>次へ →</button>
      </div></div>
    );
  }

  if(phase==="result"&&scores&&arc){
    var eraC=era>=72?"#00ff88":era>=52?"#ffcc44":"#ff7755";
    var NB={fontSize:9,letterSpacing:3,textTransform:"uppercase",marginBottom:8};
    var topGaps=getTopGaps(gapData);
    var figs=getFigures(arc.id);

    return(
      <div style={W}><div style={CARD}>
        <div style={{fontSize:9,letterSpacing:4,color:"#00ff88",marginBottom:14,textTransform:"uppercase"}}>DIAGNOSTIC RESULT</div>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:6}}>
          <div style={{flex:1}}>
            <div style={{fontSize:9,letterSpacing:4,...T4,marginBottom:3}}>{arc.en} · {arc.riasec}</div>
            <div style={{fontSize:28,color:"#00ff88",letterSpacing:2,lineHeight:1.1,textShadow:"0 0 24px #00ff8828",marginBottom:4}}>{arc.main}</div>
            <div style={{fontSize:10,color:"#00cc6677",letterSpacing:2,marginBottom:0}}>{arc.sub}</div>
          </div>
          <div style={{flexShrink:0}}><Radar scores={scores}/></div>
        </div>

        <div style={DIV}/>
        <div style={{marginBottom:20}}>
          <div style={{...NB,color:"#a0a0ff"}}>WHO YOU ARE</div>
          <div style={{fontSize:12,...T2,lineHeight:1.95,marginBottom:14}}>{arc.identity}</div>
          <div style={{background:"#0a0a16",border:"1px solid #141428",borderRadius:3,padding:"14px 15px"}}>
            <div style={{fontSize:9,...T4,letterSpacing:2,marginBottom:12}}>あなたの特性プロフィール（キャリブレーション補正済み）</div>
            {Object.keys(scores).map(function(k,i){
              var oceanLabel=DIMS[k].ocean?" · OCEAN "+DIMS[k].ocean:"";
              return(
                <div key={k} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:10,...T3,letterSpacing:0.5}}>
                    <span>{DIMS[k].label}<span style={{color:"#2a2a48",fontSize:9}}>{oceanLabel}</span></span>
                    <span style={{...T1,fontWeight:"bold",fontSize:11}}>{scores[k]}</span>
                  </div>
                  <Bar val={scores[k]} delay={i*70}/>
                </div>
              );
            })}
          </div>
        </div>

        {topGaps.length>0&&(
          <div>
            <div style={DIV}/>
            <div style={{marginBottom:20}}>
              <div style={{...NB,color:"#cc88ff"}}>WHAT YOU BUILT</div>
              <div style={{fontSize:12,...T3,lineHeight:1.8,marginBottom:14}}>あなたの回答パターンに、自然な気質と現在のパフォーマンスの間に有意なギャップが検出された。これは——あなたがある特性を「持っていた」のではなく、「作り上げた」ことを示す。</div>
              {topGaps.map(function(k){
                var sig=GROWTH_SIGNALS[k];
                return(
                  <div key={k} style={{marginBottom:12}}>
                    <div style={{padding:"3px 10px",background:"#cc88ff10",border:"1px solid #cc88ff30",borderRadius:12,fontSize:9,color:"#cc88ffaa",letterSpacing:1,display:"inline-block",marginBottom:8}}>{sig.badge}</div>
                    <div style={{padding:"14px 16px",background:"#cc88ff05",border:"1px solid #cc88ff18",borderRadius:3,marginBottom:8}}>
                      <div style={{fontSize:9,color:"#cc88ff44",letterSpacing:2,marginBottom:6}}>何が起きていたか</div>
                      <div style={{fontSize:12,...T2,lineHeight:1.9}}>{sig.narrative}</div>
                    </div>
                    <div style={{padding:"14px 16px",background:"#cc88ff08",border:"1px solid #cc88ff25",borderRadius:3}}>
                      <div style={{fontSize:9,color:"#cc88ffaa",letterSpacing:2,marginBottom:6}}>誰も言わなかったこと</div>
                      <div style={{fontSize:13,color:"#d8c0f8",lineHeight:1.85,fontStyle:"italic"}}>{sig.compliment}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{marginTop:12,padding:"12px 15px",background:"#1a1028",border:"1px solid #2a1840",borderRadius:3}}>
                <div style={{fontSize:11,color:"#8070a0",lineHeight:1.9}}>自然な出発点から距離を縮めた人間は、最初からその位置にいた人間とは異なる種類の強さを持っている。後者にはわからないコストを払い続けた事実が、その能力を別の質のものにしている。</div>
              </div>
            </div>
          </div>
        )}

        <div style={DIV}/>
        <div style={{marginBottom:20}}>
          <div style={{...NB,color:"#a0a0ff"}}>HOW YOU GOT HERE</div>
          <div style={{fontSize:12,...T2,lineHeight:1.95}}>{arc.origin}</div>
        </div>

        <div style={DIV}/>
        <div style={{marginBottom:20}}>
          <div style={{...NB,color:"#a0a0ff"}}>THINGS NOBODY SAID OUT LOUD</div>
          <div style={{marginBottom:10,padding:"14px 16px",background:"#00ff8808",border:"1px solid #00ff881a",borderRadius:3}}>
            <div style={{fontSize:9,...T4,letterSpacing:2,marginBottom:6}}>あなたが価値を出す具体的な状況</div>
            <div style={{fontSize:12,...T2,lineHeight:1.9}}>{arc.strength}</div>
          </div>
          <div style={{marginBottom:10,padding:"14px 16px",background:"#ffffff04",border:"1px solid #1a1a30",borderRadius:3}}>
            <div style={{fontSize:9,...T4,letterSpacing:2,marginBottom:6}}>おそらく誰も言葉にしてくれなかったこと</div>
            <div style={{fontSize:12,...T2,lineHeight:1.9}}>{arc.hidden}</div>
          </div>
          <div style={{padding:"14px 16px",background:"#ffcc4405",border:"1px solid #ffcc441a",borderRadius:3}}>
            <div style={{fontSize:9,color:"#ffcc4455",letterSpacing:2,marginBottom:6}}>予想外かもしれない視点</div>
            <div style={{fontSize:12,...T2,lineHeight:1.9}}>{arc.surprise}</div>
          </div>
        </div>

        <div style={DIV}/>
        <div style={{marginBottom:20}}>
          <div style={{...NB,color:"#a0a0ff"}}>WHAT YOUR FUTURE LOOKS LIKE</div>
          <div style={{fontSize:12,...T2,lineHeight:1.95,marginBottom:14}}>{arc.trajectory}</div>
          {sp&&(
            <div>
              <div style={{padding:"13px 15px",background:"#a0a0ff08",border:"1px solid #a0a0ff1e",borderRadius:3,marginBottom:12}}>
                <div style={{fontSize:9,color:"#a0a0ff55",letterSpacing:2,marginBottom:8}}>成功のトリガー——この条件が揃った時に動き出す</div>
                <div style={{fontSize:13,color:"#c0c4f8",lineHeight:1.65,marginBottom:10}}>{sp.headline}</div>
                {sp.triggers.map(function(t,i){ return <div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:"#a0a0ff33",flexShrink:0,marginTop:3}}>▸</span><span style={{fontSize:11,...T3,lineHeight:1.75}}>{t}</span></div>; })}
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:9,...T4,letterSpacing:2,marginBottom:10}}>Hollandの person-environment congruence——組織構造</div>
                {sp.structureFit.map(function(sf,i){
                  return(
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2,fontSize:10,...T3}}><span>{sf.label}</span><span style={{...T1,fontWeight:"bold"}}>{sf.score}</span></div>
                      <ScoreBar val={sf.score} delay={i*60}/>
                      {sf.note&&<div style={{fontSize:9,color:"#3a3a5a",marginTop:2,letterSpacing:0.3}}>{sf.note}</div>}
                    </div>
                  );
                })}
              </div>
              <div>
                <div style={{fontSize:9,...T4,letterSpacing:2,marginBottom:10}}>文化圏・環境の適合——どの社会・組織文化でパフォーマンスが解放されるか</div>
                {sp.cultureFit.map(function(cf,i){
                  return(
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2,fontSize:10,...T3}}><span>{cf.label}</span><span style={{...T1,fontWeight:"bold"}}>{cf.score}</span></div>
                      <ScoreBar val={cf.score} delay={i*60}/>
                      {cf.note&&<div style={{fontSize:9,color:"#3a3a5a",marginTop:2,letterSpacing:0.3}}>{cf.note}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={DIV}/>
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:14}}>
            <div style={{flex:1}}>
              <div style={{...NB,color:"#a0a0ff"}}>YOU AND THE AI ERA</div>
              <div style={{fontSize:12,...T2,lineHeight:1.95}}>{arc.aiLens}</div>
            </div>
            <div style={{flexShrink:0,textAlign:"center",minWidth:64}}>
              <div style={{fontSize:40,color:eraC,fontWeight:"bold",lineHeight:1,textShadow:"0 0 16px "+eraC+"44"}}>{era}</div>
              <div style={{fontSize:8,...T4,letterSpacing:2,marginTop:4}}>ERA FIT</div>
              <div style={{fontSize:8,...T4,letterSpacing:1}}>2025-30</div>
            </div>
          </div>
          {sp&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{padding:"12px 14px",background:"#00ff8806",border:"1px solid #00ff881a",borderRadius:3}}>
                <div style={{fontSize:9,color:"#00cc6655",letterSpacing:2,marginBottom:6}}>加速する条件</div>
                <div style={{fontSize:11,color:"#8090b0",lineHeight:1.8}}>{sp.accelerator}</div>
              </div>
              <div style={{padding:"12px 14px",background:"#ff775505",border:"1px solid #ff77551a",borderRadius:3}}>
                <div style={{fontSize:9,color:"#ff775544",letterSpacing:2,marginBottom:6}}>注意すべき罠</div>
                <div style={{fontSize:11,color:"#8090b0",lineHeight:1.8}}>{sp.trap}</div>
              </div>
            </div>
          )}
        </div>

        <div style={DIV}/>
        <div style={{marginBottom:20}}>
          <div style={{...NB,color:"#a0a0ff"}}>YOUR ENERGY MAP</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{padding:"13px 14px",background:"#ff775506",border:"1px solid #ff775520",borderRadius:3}}>
              <div style={{fontSize:9,color:"#ff775555",letterSpacing:2,marginBottom:7}}>消耗するパターン</div>
              <div style={{fontSize:12,...T2,lineHeight:1.85}}>{arc.drain}</div>
            </div>
            <div style={{padding:"13px 14px",background:"#00ff8806",border:"1px solid #00ff8820",borderRadius:3}}>
              <div style={{fontSize:9,color:"#00cc6688",letterSpacing:2,marginBottom:7}}>最も活きる状況</div>
              <div style={{fontSize:12,...T2,lineHeight:1.85}}>{arc.thrive}</div>
            </div>
          </div>
        </div>

        {figs.length>0&&(
          <div>
            <div style={DIV}/>
            <div style={{marginBottom:20}}>
              <div style={{...NB,color:"#ffcc44"}}>HISTORICAL RESONANCE</div>
              <div style={{fontSize:12,...T3,lineHeight:1.8,marginBottom:16}}>あなたのプロフィールと同じ構造の認知・行動パターンを持った歴史上の人物がいる。彼らの生い立ちと偉業は、あなたの特性がどのように結晶化するかを示すケーススタディだ。</div>
              {figs.map(function(fig,i){
                return(
                  <div key={i} style={{marginBottom:i<figs.length-1?16:0}}>
                    <div style={{padding:"16px 16px 14px",background:"#0c0c1a",border:"1px solid #1e1e38",borderLeft:"3px solid #ffcc4440",borderRadius:3}}>
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:15,color:"#ffdd88",fontWeight:"bold",letterSpacing:1,marginBottom:2}}>{fig.name}</div>
                        <div style={{fontSize:9,...T4,letterSpacing:2}}>{fig.era} · {fig.domain}</div>
                      </div>
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:9,color:"#ffcc4455",letterSpacing:2,marginBottom:5}}>あなたとの構造的な共通点</div>
                        <div style={{fontSize:12,...T2,lineHeight:1.9}}>{fig.connection}</div>
                      </div>
                      <div style={{padding:"10px 12px",background:"#a0a0ff08",border:"1px solid #a0a0ff14",borderRadius:2,marginBottom:10}}>
                        <div style={{fontSize:9,color:"#a0a0ff55",letterSpacing:2,marginBottom:4}}>生い立ち・出発点</div>
                        <div style={{fontSize:11,color:"#9090c8",lineHeight:1.85}}>{fig.origin}</div>
                      </div>
                      <div style={{padding:"10px 12px",background:"#00ff8806",border:"1px solid #00ff8815",borderRadius:2}}>
                        <div style={{fontSize:9,color:"#00cc6655",letterSpacing:2,marginBottom:4}}>このプロフィールへの示唆</div>
                        <div style={{fontSize:11,color:"#80c8a0",lineHeight:1.85,fontStyle:"italic"}}>{fig.lesson}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={DIV}/>
        {!validated?(
          <div>
            <div style={{fontSize:9,letterSpacing:4,...T4,marginBottom:11}}>VALIDATION</div>
            <div style={{fontSize:12,...T3,marginBottom:13}}>「{arc.main} / {arc.sub}」——実感と合っているか？</div>
            {["完全に合っている","だいたい合っている","部分的に合っている","合っていない"].map(function(o,i){
              return(
                <button key={i} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 15px",marginBottom:7,background:"transparent",border:"1px solid #1c1c34",borderRadius:3,color:"#8890b8",fontSize:12,cursor:"pointer",fontFamily:"'Courier New',monospace",letterSpacing:0.3,lineHeight:1.5,transition:"all 0.12s"}}
                  onClick={function(){setValidated(i);}}>
                  <span style={{color:"#00ff8840",marginRight:10}}>{String.fromCharCode(65+i)}.</span>{o}
                </button>
              );
            })}
          </div>
        ):(
          <div style={{fontSize:12,...T3,lineHeight:2,padding:"10px 0"}}>
            {validated<=1?"フィードバックを記録しました。":validated===2?"部分的な不一致を記録しました。":"不一致を記録しました。回答と実態のギャップが最も有益なデータです。"}
          </div>
        )}

        <button style={{...btnSt(true),cursor:"pointer",marginTop:16}} onClick={reset}>もう一度 ↺</button>
      </div></div>
    );
  }
  return <div style={W}><div style={CARD}><div style={{color:"#333"}}>...</div></div></div>;
}
