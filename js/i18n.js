/* ==========================================================================
   APPRENTICE PATHWAYS EXPLORER – js/i18n.js  (17 Nigerian languages)
   --------------------------------------------------------------------------
   WRITTEN INTO THIS FILE: English, Hausa, Yoruba, Igbo, Nigerian Pidgin.
     (Written with AI help. Native speakers: please check and correct them.)
   AI-TRANSLATED (beta): Fulfulde, Kanuri, Tiv, Ibibio, Efik, Izon (Ijaw),
     Edo, Nupe, Urhobo, Igala, Idoma, Ebira. The first time someone picks one,
     /api/translate translates the English words once and the phone
     remembers them. The page shows "AI translation (beta)".

   HOW A PAGE USES IT
     <span data-i18n="nav.home">Home</span>            -> text
     <input data-i18n-placeholder="hero.search">       -> placeholder
     <h1 data-i18n-html="hero.title">                  -> <o>gold words</o>
     <button data-i18n-label="ask.close">              -> aria-label
     In JavaScript:  I18N.t("ask.thinking")
   Any word a language does not have falls back to English automatically.
   ========================================================================== */
(function (root) {
  "use strict";

  const LANGS = [
    { code: "en", name: "English", native: "English", how: "hand" },
    { code: "ha", name: "Hausa", native: "Hausa", how: "hand" },
    { code: "yo", name: "Yoruba", native: "Yorùbá", how: "hand" },
    { code: "ig", name: "Igbo", native: "Igbo", how: "hand" },
    { code: "pcm", name: "Nigerian Pidgin", native: "Naijá (Pidgin)", how: "hand" },
    { code: "ff", name: "Fulfulde", native: "Fulfulde", how: "ai" },
    { code: "kr", name: "Kanuri", native: "Kanuri", how: "ai" },
    { code: "tiv", name: "Tiv", native: "Tiv", how: "ai" },
    { code: "ibb", name: "Ibibio", native: "Ibibio", how: "ai" },
    { code: "efi", name: "Efik", native: "Efik", how: "ai" },
    { code: "ijc", name: "Izon (Ijaw)", native: "Izon", how: "ai" },
    { code: "bin", name: "Edo (Bini)", native: "Ẹ̀dó", how: "ai" },
    { code: "nup", name: "Nupe", native: "Nupe", how: "ai" },
    { code: "urh", name: "Urhobo", native: "Urhobo", how: "ai" },
    { code: "igl", name: "Igala", native: "Igala", how: "ai" },
    { code: "idu", name: "Idoma", native: "Idoma", how: "ai" },
    { code: "igb", name: "Ebira", native: "Ebira", how: "ai" }
  ];
  const STRINGS = {
    en: {
      "nav.tools": "Apprentice Tools", "tools.open": "Open",
      "tools.agTitle": "Apprenticeship Agreement", "tools.agLead": "Write a fair agreement with your master before you start: length, fee, hours and freedom terms. Our fairness check warns you about unfair terms.",
      "tools.ppTitle": "Skill Passport", "tools.ppLead": "Tick off every skill as you learn it. Your master confirms with a PIN. Share a signed link as proof for customers, SUPA screening or a trade test.",
      "tools.cdTitle": "Artisan Profile Card", "tools.cdLead": "Make a WhatsApp-ready business card and a mini web page with your skills, area and a QR code.",
      "tools.agTranslate": "Translate to my language",
      "nav.home": "Home", "nav.trades": "Trades", "nav.careers": "Careers", "nav.skills": "Talents / Skills",
      "nav.planner": "Pathway Planner", "nav.opps": "Opportunities", "nav.dash": "My Dashboard",
      "ui.language": "Language", "ui.translating": "Translating…",
      "ui.aiBeta": "AI translation (beta). If a word is wrong, tell your ByteBusters trainer so we can fix it.",
      "hero.eyebrow": "Learn it · Master it · Earn your freedom",
      "hero.title": "Find your trade. <o>Plan</o> your path.",
      "hero.lead": "Explore 99 trades, careers and creative skills across Nigeria. See how long training takes, the skills you will learn, and the very first step to take, then get a learning plan made for you.",
      "hero.search": "Search: tailoring, solar, welding, baking…",
      "hero.finder": "Take the Pathway Finder", "hero.plan": "Build a learning plan",
      "trade.quick": "Quick answer", "trade.first": "Your first step", "trade.summary": "Summary of the work",
      "trade.skills": "Skills training", "trade.path": "Training path, step by step", "trade.cert": "Certification",
      "trade.years": "Years required", "trade.cost": "Start-up cost", "trade.faq": "Questions people ask",
      "trade.buildPlan": "Build my learning plan", "trade.save": "Save this trade", "trade.ask": "Ask the AI Trainer about this trade",
      "ask.fab": "Ask a trainer", "ask.title": "AI Trainer", "ask.sub": "Questions about trades, training and starting out",
      "ask.hello": "Hello! Ask anything about learning a trade in Nigeria: how to choose a master, what tools to buy, or how long training takes.",
      "ask.s1": "How do I find a good master?", "ask.s2": "Which trade can I learn in 3 months?", "ask.s3": "How do I register for a trade test?",
      "ask.placeholder": "Type your question", "ask.send": "Send", "ask.close": "Close", "ask.thinking": "The trainer is thinking…",
      "ask.offline": "You are offline. Connect to the internet to ask the trainer.",
      "ask.error": "The trainer could not be reached just now. Please try again later.",
      "ask.see": "Open these pathways:", "ask.note": "AI can make mistakes. Check programme details on official .gov.ng websites.",
      "foot.explore": "Explore", "foot.plan": "Plan", "foot.start": "Get started"
    },
    ha: {
      "nav.tools": "Kayan Aikin Koyo", "tools.open": "Buɗe",
      "tools.agTitle": "Yarjejeniyar Koyon Sana'a", "tools.agLead": "Rubuta yarjejeniya mai adalci da maigidanka kafin ka fara: tsawon lokaci, kuɗi, sa'o'i da sharuɗɗan 'yanci. Binciken adalci zai gargaɗe ka game da sharuɗɗa marasa adalci.",
      "tools.ppTitle": "Fasfo na Basira", "tools.ppLead": "Yi alama a kowace basira idan ka koya ta. Maigidanka zai tabbatar da lambar sirri. Raba hanyar haɗi da aka sa hannu a matsayin shaida ga abokan ciniki, tantancewar SUPA ko gwajin sana'a.",
      "tools.cdTitle": "Katin Bayanan Mai Sana'a", "tools.cdLead": "Yi katin kasuwanci na WhatsApp da ƙaramin shafin yanar gizo mai basirarka, yankinka da lambar QR.",
      "tools.agTranslate": "Fassara zuwa harshena",
      "nav.home": "Gida", "nav.trades": "Sana'o'i", "nav.careers": "Ayyuka", "nav.skills": "Basira / Fasaha",
      "nav.planner": "Mai Tsara Hanya", "nav.opps": "Damammaki", "nav.dash": "Shafina",
      "ui.language": "Harshe", "ui.translating": "Ana fassarawa…",
      "hero.eyebrow": "Koya · Ƙware · Sami 'yancinka",
      "hero.title": "Nemo sana'arka. <o>Tsara</o> hanyarka.",
      "hero.lead": "Bincika sana'o'i, ayyuka da fasahohi 99 a faɗin Najeriya. Ga tsawon horo, basirar da za ka koya, da matakin farko da za ka ɗauka, sannan ka sami tsarin koyo da aka yi maka.",
      "hero.search": "Nema: ɗinki, sola, walda, gasa burodi…",
      "hero.finder": "Fara Mai Nemo Hanya", "hero.plan": "Gina tsarin koyo",
      "trade.quick": "Amsa a taƙaice", "trade.first": "Matakinka na farko", "trade.summary": "Taƙaitaccen bayanin aikin",
      "trade.skills": "Horon basira", "trade.path": "Hanyar horo, mataki-mataki", "trade.cert": "Takardar shaida",
      "trade.years": "Shekarun da ake buƙata", "trade.cost": "Kuɗin farawa", "trade.faq": "Tambayoyin da mutane ke yi",
      "trade.buildPlan": "Gina tsarin koyona", "trade.save": "Ajiye wannan sana'a", "trade.ask": "Tambayi Malamin AI game da wannan sana'a",
      "ask.fab": "Tambayi malami", "ask.title": "Malamin AI", "ask.sub": "Tambayoyi game da sana'o'i, horo da farawa",
      "ask.hello": "Sannu! Tambayi komai game da koyon sana'a a Najeriya: yadda ake zaɓar maigida, kayan aikin da za ka saya, ko tsawon horo.",
      "ask.s1": "Ta yaya zan sami maigida nagari?", "ask.s2": "Wace sana'a zan iya koya cikin wata 3?", "ask.s3": "Ta yaya zan yi rajistar gwajin sana'a?",
      "ask.placeholder": "Rubuta tambayarka", "ask.send": "Aika", "ask.close": "Rufe", "ask.thinking": "Malami yana tunani…",
      "ask.offline": "Ba ka da intanet. Haɗa intanet don tambayar malami.",
      "ask.error": "Ba a sami malami yanzu ba. Ka sake gwadawa nan gaba.",
      "ask.see": "Buɗe waɗannan hanyoyin:", "ask.note": "AI na iya yin kuskure. Ka tabbatar da bayanan shirye-shirye a shafukan gwamnati (.gov.ng).",
      "foot.explore": "Bincika", "foot.plan": "Tsara", "foot.start": "Fara"
    },
    yo: {
      "nav.tools": "Irinṣẹ́ Akẹ́kọ̀ọ́ṣẹ́", "tools.open": "Ṣí i",
      "tools.agTitle": "Àdéhùn Ìkọ́ṣẹ́", "tools.agLead": "Kọ àdéhùn tí ó tọ́ pẹ̀lú ọ̀gá rẹ kí o tó bẹ̀rẹ̀: gígùn àkókò, owó, wákàtí àti òfin òmìnira. Àyẹ̀wò òdodo wa máa kìlọ̀ fún ọ nípa òfin tí kò tọ́.",
      "tools.ppTitle": "Ìwé Ìrìnnà Ọgbọ́n", "tools.ppLead": "Sàmì sí gbogbo ọgbọ́n bí o ṣe ń kọ́ ọ. Ọ̀gá rẹ máa fìdí rẹ̀ múlẹ̀ pẹ̀lú PIN. Pín ìjápọ̀ tí a fọwọ́ sí gẹ́gẹ́ bí ẹ̀rí fún oníbàárà, àyẹ̀wò SUPA tàbí ìdánwò iṣẹ́ ọwọ́.",
      "tools.cdTitle": "Káàdì Àlàyé Oníṣẹ́ọwọ́", "tools.cdLead": "Ṣe káàdì okòwò fún WhatsApp àti ojú-ìwé kékeré pẹ̀lú ọgbọ́n rẹ, àdúgbò rẹ àti kóòdù QR.",
      "tools.agTranslate": "Túmọ̀ sí èdè mi",
      "nav.home": "Ilé", "nav.trades": "Iṣẹ́ ọwọ́", "nav.careers": "Iṣẹ́", "nav.skills": "Ẹ̀bùn / Ọgbọ́n",
      "nav.planner": "Olùṣètò Ọ̀nà", "nav.opps": "Àǹfààní", "nav.dash": "Ojú-ìwé mi",
      "ui.language": "Èdè", "ui.translating": "À ń túmọ̀…",
      "hero.eyebrow": "Kọ́ ọ · Mọ̀ ọ́ dáadáa · Gba òmìnira rẹ",
      "hero.title": "Wá iṣẹ́ rẹ. <o>Ṣètò</o> ọ̀nà rẹ.",
      "hero.lead": "Ṣàwárí iṣẹ́ ọwọ́, iṣẹ́ àti ọgbọ́n 99 jákèjádò Nàìjíríà. Wo bí ìkẹ́kọ̀ọ́ ṣe pẹ́ tó, ọgbọ́n tí o máa kọ́, àti ìgbésẹ̀ àkọ́kọ́ tí o máa gbé, kí o sì gba ètò ẹ̀kọ́ tí a ṣe fún ọ.",
      "hero.search": "Wá: aṣọ rírán, sólà, wẹ́ldì, búrẹ́dì…",
      "hero.finder": "Bẹ̀rẹ̀ Olùwárí Ọ̀nà", "hero.plan": "Ṣe ètò ẹ̀kọ́",
      "trade.quick": "Ìdáhùn kúkúrú", "trade.first": "Ìgbésẹ̀ àkọ́kọ́ rẹ", "trade.summary": "Àkópọ̀ iṣẹ́ náà",
      "trade.skills": "Ìdánilẹ́kọ̀ọ́ ọgbọ́n", "trade.path": "Ọ̀nà ìkẹ́kọ̀ọ́, ní ìgbésẹ̀-ìgbésẹ̀", "trade.cert": "Ìwé ẹ̀rí",
      "trade.years": "Ọdún tí ó gbà", "trade.cost": "Owó ìbẹ̀rẹ̀", "trade.faq": "Ìbéèrè tí àwọn ènìyàn ń béèrè",
      "trade.buildPlan": "Ṣe ètò ẹ̀kọ́ mi", "trade.save": "Fi iṣẹ́ yìí pamọ́", "trade.ask": "Béèrè lọ́wọ́ Olùkọ́ AI nípa iṣẹ́ yìí",
      "ask.fab": "Béèrè lọ́wọ́ olùkọ́", "ask.title": "Olùkọ́ AI", "ask.sub": "Ìbéèrè nípa iṣẹ́ ọwọ́, ìkẹ́kọ̀ọ́ àti bíbẹ̀rẹ̀",
      "ask.hello": "Ẹ ǹlẹ́! Béèrè ohunkóhun nípa kíkọ́ iṣẹ́ ọwọ́ ní Nàìjíríà: bí o ṣe lè yan ọ̀gá, irinṣẹ́ tí o máa rà, tàbí bí ìkẹ́kọ̀ọ́ ṣe pẹ́ tó.",
      "ask.s1": "Báwo ni mo ṣe lè rí ọ̀gá rere?", "ask.s2": "Iṣẹ́ wo ni mo lè kọ́ láàrin oṣù mẹ́ta?", "ask.s3": "Báwo ni mo ṣe lè forúkọ sílẹ̀ fún ìdánwò iṣẹ́ ọwọ́?",
      "ask.placeholder": "Kọ ìbéèrè rẹ", "ask.send": "Fi ránṣẹ́", "ask.close": "Pa á dé", "ask.thinking": "Olùkọ́ ń ronú…",
      "ask.offline": "O kò sí lórí íntánẹ́ẹ̀tì. So mọ́ íntánẹ́ẹ̀tì láti béèrè lọ́wọ́ olùkọ́.",
      "ask.error": "A kò rí olùkọ́ báyìí. Jọ̀wọ́ gbìyànjú lẹ́yìn náà.",
      "ask.see": "Ṣí àwọn ọ̀nà wọ̀nyí:", "ask.note": "AI lè ṣe àṣìṣe. Ṣàyẹ̀wò àlàyé ètò lórí ojú-òpó ìjọba (.gov.ng).",
      "foot.explore": "Ṣàwárí", "foot.plan": "Ṣètò", "foot.start": "Bẹ̀rẹ̀"
    },
    ig: {
      "nav.tools": "Ngwaọrụ Onye Ọmụmụ", "tools.open": "Mepee",
      "tools.agTitle": "Nkwekọrịta Ịmụ Ọrụ", "tools.agLead": "Dee nkwekọrịta ziri ezi gị na oga gị tupu ị malite: ogologo oge, ego, awa na usoro nnwere onwe. Nyocha ikpe ziri ezi anyị ga-adọ gị aka na ntị maka usoro na-ezighi ezi.",
      "tools.ppTitle": "Paspọtụ Nka", "tools.ppLead": "Kaa akara na nka ọ bụla ka ị na-amụta ya. Oga gị ga-akwado ya na PIN. Kesaa njikọ e bịanyere aka dịka ihe akaebe nye ndị ahịa, nyocha SUPA ma ọ bụ ule ọrụ aka.",
      "tools.cdTitle": "Kaadị Profaịlụ Onye Ọrụ Aka", "tools.cdLead": "Mee kaadị azụmahịa maka WhatsApp na obere peeji weebụ nwere nka gị, mpaghara gị na koodu QR.",
      "tools.agTranslate": "Sụgharịa n'asụsụ m",
      "nav.home": "Ụlọ", "nav.trades": "Ọrụ aka", "nav.careers": "Ọrụ", "nav.skills": "Onyinye / Nka",
      "nav.planner": "Onye Nhazi Ụzọ", "nav.opps": "Ohere", "nav.dash": "Peeji m",
      "ui.language": "Asụsụ", "ui.translating": "A na-asụgharị…",
      "hero.eyebrow": "Mụta ya · Maa ya nke ọma · Nweta nnwere onwe gị",
      "hero.title": "Chọta ọrụ aka gị. <o>Hazie</o> ụzọ gị.",
      "hero.lead": "Nyochaa ọrụ aka, ọrụ na nka 99 n'ofe Naịjirịa. Hụ ogologo oge ọzụzụ, nka ị ga-amụta, na nzọụkwụ mbụ ị ga-eme, wee nweta atụmatụ mmụta e mere maka gị.",
      "hero.search": "Chọọ: ịkwa akwa, sola, welding, ime achịcha…",
      "hero.finder": "Malite Onye Nchọta Ụzọ", "hero.plan": "Mee atụmatụ mmụta",
      "trade.quick": "Azịza dị mkpirikpi", "trade.first": "Nzọụkwụ mbụ gị", "trade.summary": "Nchịkọta ọrụ ahụ",
      "trade.skills": "Ọzụzụ nka", "trade.path": "Ụzọ ọzụzụ, nzọụkwụ na nzọụkwụ", "trade.cert": "Asambodo",
      "trade.years": "Afọ achọrọ", "trade.cost": "Ego mmalite", "trade.faq": "Ajụjụ ndị mmadụ na-ajụ",
      "trade.buildPlan": "Mee atụmatụ mmụta m", "trade.save": "Chekwaa ọrụ aka a", "trade.ask": "Jụọ Onye Nkuzi AI gbasara ọrụ aka a",
      "ask.fab": "Jụọ onye nkuzi", "ask.title": "Onye Nkuzi AI", "ask.sub": "Ajụjụ gbasara ọrụ aka, ọzụzụ na mmalite",
      "ask.hello": "Ndewo! Jụọ ihe ọ bụla gbasara ịmụ ọrụ aka na Naịjirịa: otu esi ahọrọ oga, ngwaọrụ ị ga-azụ, ma ọ bụ ogologo oge ọzụzụ.",
      "ask.s1": "Kedu ka m ga-esi chọta ezigbo oga?", "ask.s2": "Kedu ọrụ aka m nwere ike ịmụta n'ime ọnwa 3?", "ask.s3": "Kedu ka m ga-esi debanye aha maka ule ọrụ aka?",
      "ask.placeholder": "Dee ajụjụ gị", "ask.send": "Zipu", "ask.close": "Mechie", "ask.thinking": "Onye nkuzi na-eche echiche…",
      "ask.offline": "Ị nọghị n'ịntanetị. Jikọọ ịntanetị ka ị jụọ onye nkuzi.",
      "ask.error": "Enweghị ike ịchọta onye nkuzi ugbu a. Biko nwaa ọzọ ma emechaa.",
      "ask.see": "Mepee ụzọ ndị a:", "ask.note": "AI nwere ike ime njehie. Lelee nkọwa mmemme na weebụsaịtị gọọmentị (.gov.ng).",
      "foot.explore": "Nyochaa", "foot.plan": "Hazie", "foot.start": "Malite"
    },
    pcm: {
      "nav.tools": "Apprentice Tools", "tools.open": "Open",
      "tools.agTitle": "Apprenticeship Agreement", "tools.agLead": "Write better agreement with your oga before you start: how long, how much, hours and freedom terms. Our fairness check go warn you if any term no fair.",
      "tools.ppTitle": "Skill Passport", "tools.ppLead": "Tick every skill as you learn am. Your oga go confirm with PIN. Share signed link as proof for customers, SUPA screening or trade test.",
      "tools.cdTitle": "Artisan Profile Card", "tools.cdLead": "Make business card wey ready for WhatsApp and small web page with your skills, area and QR code.",
      "tools.agTranslate": "Translate am to my language",
      "nav.home": "Home", "nav.trades": "Handwork", "nav.careers": "Work", "nav.skills": "Talent / Skills",
      "nav.planner": "Pathway Planner", "nav.opps": "Opportunities", "nav.dash": "My Dashboard",
      "ui.language": "Language", "ui.translating": "We dey translate…",
      "hero.eyebrow": "Learn am · Sabi am well · Collect your freedom",
      "hero.title": "Find your handwork. <o>Plan</o> your road.",
      "hero.lead": "Check 99 handwork, work and creative skills for Naija. See how long training go take, the skills wey you go learn, and the first step wey you go take, then collect learning plan wey dem make for you.",
      "hero.search": "Search: tailoring, solar, welding, baking…",
      "hero.finder": "Start the Pathway Finder", "hero.plan": "Make learning plan",
      "trade.quick": "Quick answer", "trade.first": "Your first step", "trade.summary": "Wetin the work be",
      "trade.skills": "Skills wey you go learn", "trade.path": "Training road, step by step", "trade.cert": "Certificate",
      "trade.years": "How many years e go take", "trade.cost": "Money to start", "trade.faq": "Questions wey people dey ask",
      "trade.buildPlan": "Make my learning plan", "trade.save": "Save this handwork", "trade.ask": "Ask the AI Trainer about this handwork",
      "ask.fab": "Ask trainer", "ask.title": "AI Trainer", "ask.sub": "Questions about handwork, training and how to start",
      "ask.hello": "How far! Ask anything about how to learn handwork for Naija: how to choose oga, wetin tools to buy, or how long training go take.",
      "ask.s1": "How I fit find better oga?", "ask.s2": "Which handwork I fit learn for 3 months?", "ask.s3": "How I go register for trade test?",
      "ask.placeholder": "Type your question", "ask.send": "Send", "ask.close": "Close", "ask.thinking": "Trainer dey think…",
      "ask.offline": "You no get network. Connect to internet make you ask trainer.",
      "ask.error": "We no fit reach trainer now. Abeg try again later.",
      "ask.see": "Open these pathways:", "ask.note": "AI fit make mistake. Check programme details for government website (.gov.ng).",
      "foot.explore": "Check am", "foot.plan": "Plan", "foot.start": "Start"
    }
  };

  /* ---------- the engine ---------- */
  const LANG_KEY = "ape-lang";
  const VERSION = "3";                        // bump when English strings change, so AI translations refresh
  let current = "en";

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  function info(code) { return LANGS.find(l => l.code === code) || LANGS[0]; }

  function t(key, vars) {
    const table = STRINGS[current] || {};
    let s = table[key] != null ? table[key] : (STRINGS.en[key] != null ? STRINGS.en[key] : key);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
    return s;
  }


  // Our own trusted markup only: <g>..</g> = green words, <o>..</o> = gold words
  function safeHTML(s) {
    const e = String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    return e.replace(/&lt;g&gt;/g, '<span class="hl-green">').replace(/&lt;\/g&gt;/g, "</span>")
            .replace(/&lt;o&gt;/g, "<em>").replace(/&lt;\/o&gt;/g, "</em>");
  }

  function apply(rootEl) {
    const scope = rootEl || document;
    scope.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.getAttribute("data-i18n")); });
    scope.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = safeHTML(t(el.getAttribute("data-i18n-html"))); });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder"))); });
    document.documentElement.setAttribute("lang", current === "en" ? "en-NG" : current);
    document.querySelectorAll("[data-i18n-label]").forEach(el => { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-label"))); });
    const beta = document.getElementById("aiBeta");
    if (beta) { beta.hidden = info(current).how !== "ai"; beta.textContent = t("ui.aiBeta"); }
  }

  // Ask /api/translate for an AI language, in chunks, then remember it on this phone
  async function loadAI(code) {
    const cacheKey = "ape-tr-" + code + "-" + VERSION;
    const saved = store.get(cacheKey);
    if (saved) { try { STRINGS[code] = JSON.parse(saved); return true; } catch (e) { /* re-fetch */ } }
    const entries = Object.entries(STRINGS.en), chunks = [];
    let chunk = {}, size = 0;
    entries.forEach(([k, v]) => {
      if (size + v.length > 3500) { chunks.push(chunk); chunk = {}; size = 0; }
      chunk[k] = v; size += v.length;
    });
    chunks.push(chunk);
    const out = {};
    for (const part of chunks) {
      const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: code, strings: part }) });
      if (!r.ok) throw new Error("translate " + r.status);
      Object.assign(out, (await r.json()).strings);
    }
    STRINGS[code] = out;
    store.set(cacheKey, JSON.stringify(out));
    return true;
  }

  const listeners = [];
  async function setLang(code, opts) {
    const l = info(code);
    const status = document.getElementById("langStatus");
    if (l.how === "ai" && !STRINGS[l.code]) {
      if (status) status.textContent = t("ui.translating");
      try { await loadAI(l.code); } catch (e) {
        if (status) status.textContent = "";
        current = "en"; apply(); return false;           // stay in English if translation fails
      }
    }
    current = l.code;
    if (!opts || opts.save !== false) store.set(LANG_KEY, current);
    if (status) status.textContent = "";
    apply();
    listeners.forEach(fn => { try { fn(current); } catch (e) { /* keep going */ } });
    return true;
  }

  // Build the language picker in the header
  function setupPicker() {
    const sel = document.getElementById("langSelect");
    if (!sel) return;
    sel.innerHTML = LANGS.map(l => '<option value="' + l.code + '">' + l.native + (l.native !== l.name ? " · " + l.name : "") + (l.how === "ai" ? " (AI)" : "") + "</option>").join("");
    sel.value = current;
    sel.addEventListener("change", () => setLang(sel.value).then(ok => { if (!ok) sel.value = "en"; }));
    onChange(code => { sel.value = code; });
  }

  function onChange(fn) { listeners.push(fn); }
  function start() {
    const saved = store.get(LANG_KEY);
    setupPicker();
    if (saved && saved !== "en") setLang(saved, { save: false }); else apply();
  }

  root.I18N = { LANGS, STRINGS, t, apply, setLang, onChange, start, get lang() { return current; }, safeHTML };
  if (typeof module !== "undefined") module.exports = root.I18N;
})(typeof window !== "undefined" ? window : globalThis);
