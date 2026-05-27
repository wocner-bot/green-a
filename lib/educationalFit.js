function countHits(text, words) {
  const hay = String(text || "").toLowerCase();
  return words.reduce((sum, word) => sum + (hay.includes(String(word).toLowerCase()) ? 1 : 0), 0);
}

function regexHits(text, patterns) {
  const hay = String(text || "").toLowerCase();
  return patterns.reduce((sum, pattern) => sum + (pattern.test(hay) ? 1 : 0), 0);
}

function uniqueTypes(segments = []) {
  return new Set(segments.map((s) => (s.type || "").trim().toLowerCase()).filter(Boolean)).size;
}

function assessEducationalFit(data = {}, segments = [], signals = {}) {
  const description = String(data.description || "").toLowerCase();
  const transcriptText = String(data.transcript || "").toLowerCase();
  const title = (data.title || "").toLowerCase();
  const topic = String(data.topic || "").toLowerCase();
  const titleAndTopic = `${title} ${topic}`.toLowerCase();
  const text = `${titleAndTopic}\n${description}\n${transcriptText}`;
  const segmentText = segments.map((segment) => `${segment.type || ""} ${segment.note || ""}`).join(" ").toLowerCase();

  const titleEducationHits = regexHits(title, [
    /(^|\s)(урок|лекци[яи]|курс|семинар|вебинар|tutorial|lesson|lecture|course|guide)(\s|$)/i,
    /обуч|учеб|изуч|разбер|объясн|решаем|решени[ея]|практик|тренаж[её]р|гайд|guide|walkthrough/i,
    /\bhow to\b|как\s+(сделать|решить|настроить|использовать|выучить|понять|работает|работать)\b/i,
    /с\s+нуля|from\s+scratch|для\s+начинающ|beginner/i
  ]);

  const subjectMatterHits = regexHits(text, [
    /математ|алгебр|геометр|calculus|физик|хими|биологи|истори[яи]|географ/i,
    /англий|english|grammar|vocabulary|ielts|toefl|немец|deutsch|испан|француз|япон|китай/i,
    /python|javascript|typescript|react|node|sql|postgres|программ|кодинг|разработк|баз[аы]\s+данных|ux|ui|figma|trading|трейдинг/i
  ]);

  const formatHits = countHits(text, [
    "обуч", "учеб", "урок", "курс", "лекция", "семинар", "объясн", "tutorial", "lesson", "course", "learning", "гайд", "guide", "walkthrough", "how to", "с нуля", "для начинающих", "beginner", "from scratch"
  ]);
  const methodHits = countHits(`${description}\n${transcriptText}\n${segmentText}`, [
    "разберем", "разбираем", "решим", "решаем", "покажу как", "пошаг", "разбор", "пример", "кейс", "формула", "алгоритм", "метод",
    "explain", "explained", "define", "definition", "step by step", "walkthrough", "demo", "demonstration", "solve", "solution"
  ]);
  const practiceOrCheckHits = countHits(`${description}\n${transcriptText}\n${segmentText}`, [
    "задание", "упражнение", "практик", "проверь", "проверка", "тест", "practice", "exercise", "quiz", "assignment", "homework", "check your answer"
  ]);
  const goalHits = countHits(`${description}\n${transcriptText}`, [
    "цель урока", "цель обучения", "упр", "результат обучения", "вы научитесь", "навык",
    "learning objective", "goal of the lesson", "you will learn", "by the end of this lesson"
  ]);

  const hardNonLearningHits = countHits(text, [
    "интервью", "беседа", "подкаст", "новости", "реакция", "vlog", "развлекатель",
    "документальный", "обзор", "биография", "размышления", "мнение", "opinion", "ток-шоу",
    "реклама", "реклам", "пранк", "юмор", "концерт", "клип", "стрим", "трансляция", "игра", "игровой"
  ]);
  const titleMediaMarkers = regexHits(title, [
    /official\s+video|music\s+video|lyrics|4k\s+remaster|\blive\b|feat\.?/i,
    /гость программы|школа злословия|концерт|клип|официальн(ый|ое)\s+клип/i
  ]);
  const talkFormatHits = regexHits(titleAndTopic, [/интервью|подкаст|ток-шоу|show|guest|гость программы/i]);

  const motivationalMarkers = countHits(text, [
    "верь в себя", "поверить в себя", "верьте в себя", "можешь ты", "сможешь ты", "будешь успешн",
    "преуспев", "разбогатеть", "заработай", "зарабатывай", "работает у нас", "работает со мной",
    "система работает", "это работает", "я докажу"
  ]);

  const quickPromiseMarkers = countHits(text, [
    "за неделю", "за день", "за час", "за 30 дней", "за 7 дней",
    "быстро", "быстрый", "в кратчайшие", "мгновенно", "сразу же",
    "простой способ", "легкий путь", "без усилий", "без работы", "легко и просто"
  ]);

  const salesPushMarkers = countHits(text, [
    "купи", "купить", "заказ", "заказать", "подпишись", "подписывайтесь", "лайки",
    "скидка", "скидку", "бонус", "подарок", "осталось мест", "спешите",
    "ограниченное предложение", "только сегодня", "только для вас", "эксклюзивно"
  ]);

  const guaranteeMarkers = countHits(text, [
    "гарантиров", "обещаю", "обещание", "научу за", "научишься за", "научу", "научиться",
    "станьте экспертом", "станешь экспертом", "эксперт за", "профессионал за", "эксперта за",
    "результат за", "успех за", "деньги назад", "путь до эксперта", "путь к успеху", "станет"
  ]);

  const transcriptWordCount = transcriptText.trim() ? transcriptText.trim().split(/\s+/).length : 0;
  const descriptionWordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const sparseMetadata = transcriptWordCount < 70 && descriptionWordCount < 35;
  const sparseEvidence = sparseMetadata && segments.length < 3;

  const hasLearningSegments = /практи|задани|упраж|пример|разбор|провер|exercise|assignment|example|practice|step by step|walkthrough/i.test(segmentText);
  const hasChapterStructure = segments.filter((s) => s.source === "description").length >= 3;
  const hasCaptionStructure = segments.filter((s) => s.source === "captions").length >= 3;
  const hasSegmentedLearningFlow = segments.length >= 3 && hasLearningSegments;
  const hasVisualStructure = signals.visualObservationCount >= 2;
  const hasVisualTeachingCore = hasVisualStructure && signals.visualInstructionHits > 1;
  const hasLectureFormat = /лекци|lecture|chapter|глава|серия|часть|модуль|course|курс/i.test(text);
  const hasCourseLikeStructure = hasChapterStructure || hasCaptionStructure || hasSegmentedLearningFlow;
  const hasHowToTitle = /(^|\s)как\s+(сделать|решить|настроить|использовать|выучить|понять|работает|работать)\b/i.test(title);
  const hasFromScratchTitle = /(с\s+нуля|from\s+scratch|для\s+начинающ|beginner)/i.test(title);
  const titleTeachingHits = regexHits(title, [/урок|лекци|tutorial|lesson|course|обуч|разбор|гайд|guide|how to/i]);
  const descriptionTeachingHits = countHits(description, [
    "цель урока", "вы научитесь", "пошаг", "разбор", "пример", "упражнение", "задание", "practice", "exercise", "lesson plan", "learning objective"
  ]);
  const transcriptTeachingHits = countHits(transcriptText, [
    "цель урока", "вы научитесь", "пошаг", "разбор", "пример", "упражнение", "задание", "проверка", "practice", "exercise", "assignment", "quiz", "step by step"
  ]);
  const totalTeachingEvidence = titleTeachingHits + Math.min(3, descriptionTeachingHits) + Math.min(4, transcriptTeachingHits) + (hasCourseLikeStructure ? 1 : 0);

  const hasInstructionalFormat = formatHits > 0 || /урок|курс|обуч|tutorial|lesson|course/i.test(title) || hasHowToTitle || hasFromScratchTitle;
  const explicitEducationalTitle = /урок|лекци|tutorial|lesson|course|обуч|разбор|гайд|guide|how to/i.test(title);
  const talkShowTitle = /гость программы|ток-шоу|подкаст|интервью|шоу/i.test(title);
  const hasMethod = methodHits > 0 || hasLearningSegments;
  const hasPractice = practiceOrCheckHits > 0 && !/нет[^.\n]{0,35}практик|без\s+практик|no\s+practice|without\s+practice/i.test(text);
  const hasGoal = goalHits > 0 && !/нет[^.\n]{0,35}цел[ьи]|без\s+цели|no\s+clear\s+goal|without\s+goal/i.test(text);
  const mechanicsCount = [hasMethod, hasPractice, hasGoal, hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore].filter(Boolean).length;

  const hasOutcomeSignal = hasPractice || hasGoal || hasChapterStructure || hasSegmentedLearningFlow;
  const hasStrongTeachingCore = (hasMethod && hasGoal) || (hasPractice && (hasMethod || hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore));
  const hasEducationalIntent = titleEducationHits > 0 || formatHits >= 1 || (subjectMatterHits > 0 && (hasInstructionalFormat || hasMethod || hasLectureFormat || hasCourseLikeStructure));
  const hasEducationalMechanics = hasMethod || hasPractice || hasGoal || hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore;
  const hasEducationalSignal = hasStrongTeachingCore || (hasEducationalIntent && hasEducationalMechanics && mechanicsCount >= 1);
  const hasStrongTitleIntent = titleEducationHits >= 1 || titleTeachingHits >= 1 || hasHowToTitle || hasFromScratchTitle;
  const hasBaselineTeachingEvidence = totalTeachingEvidence >= 2 || (hasStrongTitleIntent && (subjectMatterHits > 0 || mechanicsCount >= 1));

  const learningEvidence = [hasInstructionalFormat, hasMethod, hasPractice, hasGoal, hasChapterStructure || hasCaptionStructure || hasSegmentedLearningFlow, mechanicsCount >= 2].filter(Boolean).length;

  const score = Math.max(0, Math.min(10,
    2.2 +
    (hasInstructionalFormat ? 1.6 : 0) +
    (hasMethod ? 1.8 : 0) +
    (hasPractice ? 1.4 : 0) +
    (hasGoal ? 1.2 : 0) +
    (hasChapterStructure ? 1.0 : 0) +
    (hasSegmentedLearningFlow ? 0.8 : 0) +
    (mechanicsCount >= 2 ? 0.8 : 0) +
    (hasEducationalIntent ? 0.7 : 0) +
    (hasHowToTitle ? 0.8 : 0) +
    (hasFromScratchTitle ? 0.8 : 0) +
    (hasStrongTitleIntent ? 0.5 : 0) +
    (subjectMatterHits > 0 ? 0.4 : 0) +
    (hasVisualTeachingCore ? 0.3 : 0) -
    (hardNonLearningHits ? Math.min(hardNonLearningHits, 3) * 0.65 : 0) -
    (talkFormatHits ? Math.min(talkFormatHits, 2) * 0.35 : 0) -
    (salesPushMarkers >= 3 ? 0.7 : 0)
  ));

  const strongInfotainment = (hardNonLearningHits >= 2 || titleMediaMarkers > 0) && mechanicsCount === 0 && !hasEducationalMechanics;
  const onlyHomeworkOrViewing = hasPractice && !hasEducationalSignal && /домашнее задание|приятного просмотра/i.test(text);
  const isSelfHelpMotivational = (motivationalMarkers >= 2 || quickPromiseMarkers >= 3) && mechanicsCount === 0;
  const isSalesHeavy = salesPushMarkers >= 3 && mechanicsCount < 2;
  const hasOverpromising = (guaranteeMarkers >= 2 || quickPromiseMarkers >= 4) && mechanicsCount === 0;
  const isAggressiveMarketing = quickPromiseMarkers >= 4 && salesPushMarkers >= 3 && mechanicsCount === 0;
  const noTeachingMechanism = mechanicsCount === 0;
  const isOverviewWithoutTeachingCore = /обзор|review|discussion|react/i.test(text) && !hasGoal && !hasPractice && !hasChapterStructure;
  const isSalesLeadWithoutPractice = salesPushMarkers >= 1 && !hasPractice && !hasGoal && !hasCourseLikeStructure;
  const isCourseOverviewSales = /курс|course/i.test(text) && /обзор|review/i.test(text) && !hasOutcomeSignal && salesPushMarkers >= 1;
  const isClearlyEntertainment = (hardNonLearningHits >= 2 || titleMediaMarkers > 0 || talkFormatHits > 0) && !hasEducationalMechanics && !hasStrongTitleIntent;
  const isStrongSalesNoTeaching = (salesPushMarkers >= 3 || quickPromiseMarkers >= 3) && !hasEducationalMechanics;
  const hardNegativeCount = [
    strongInfotainment,
    onlyHomeworkOrViewing,
    isSelfHelpMotivational,
    isSalesHeavy,
    hasOverpromising,
    isAggressiveMarketing,
    isOverviewWithoutTeachingCore,
    isSalesLeadWithoutPractice
  ].filter(Boolean).length;

  const nonEducational = (score < 2.6 && !hasStrongTitleIntent) ||
    ((talkShowTitle || talkFormatHits > 0) && !explicitEducationalTitle && !hasEducationalMechanics) ||
    (!hasEducationalSignal && totalTeachingEvidence <= 1 && hardNonLearningHits >= 1) ||
    (!hasStrongTeachingCore && score < 4.2 && (isOverviewWithoutTeachingCore || hardNonLearningHits > 0 || learningEvidence <= 1)) ||
    ((hardNonLearningHits >= 3 && titleMediaMarkers > 0) && !hasChapterStructure) ||
    ((hardNonLearningHits >= 3 || titleMediaMarkers > 0) && !hasOutcomeSignal && !hasStrongTeachingCore) ||
    (noTeachingMechanism && learningEvidence <= 1 && (hardNonLearningHits >= 2 || hardNegativeCount >= 2)) ||
    (motivationalMarkers >= 2 && quickPromiseMarkers >= 2 && salesPushMarkers >= 2) ||
    (salesPushMarkers >= 3 && guaranteeMarkers >= 2) ||
    (isCourseOverviewSales && !hasOutcomeSignal) ||
    ((isSalesHeavy || isSelfHelpMotivational || isAggressiveMarketing || isOverviewWithoutTeachingCore || isSalesLeadWithoutPractice || isCourseOverviewSales || isClearlyEntertainment || isStrongSalesNoTeaching) && !hasEducationalSignal);
  const educational = !nonEducational && (
    (score >= 6 && mechanicsCount >= 2 && hasEducationalSignal && hasOutcomeSignal && hardNonLearningHits < 3 && titleMediaMarkers === 0) ||
    (score >= 5.2 && titleTeachingHits >= 1 && descriptionTeachingHits >= 2 && hardNonLearningHits < 3 && !isSalesHeavy) ||
    (score >= 5.2 && hasStrongTeachingCore && learningEvidence >= 3 && hardNegativeCount <= 1) ||
    (score >= 4.9 && hasStrongTitleIntent && hasBaselineTeachingEvidence && (hasOutcomeSignal || mechanicsCount >= 2) && hardNegativeCount === 0 && !isClearlyEntertainment)
  );
  const uncertain = !nonEducational && (!educational || sparseEvidence) && (
    !educational ||
    (sparseEvidence && hardNegativeCount <= 1)
  );
  const nonEducationalFinal = nonEducational && !(sparseEvidence && hasStrongTitleIntent && hardNegativeCount <= 1);
  const educationalFinal = !nonEducationalFinal && educational;
  const uncertainFinal = !nonEducationalFinal && !educationalFinal;
  const exclude = nonEducationalFinal;
  const eligible = educationalFinal;
  const weak = uncertainFinal;
  const classification = nonEducationalFinal ? "non-educational" : (educationalFinal ? "educational" : "uncertain");
  const confidence = educationalFinal
    ? (score >= 7 && hardNegativeCount === 0 ? "high" : "medium")
    : (uncertainFinal ? (score >= 5 ? "medium" : "low") : "low");

  const reasons = [];
  if (hardNonLearningHits) reasons.push(`медийные маркеры: ${hardNonLearningHits}`);
  if (titleMediaMarkers) reasons.push(`медийные маркеры в названии: ${titleMediaMarkers}`);
  if (motivationalMarkers >= 2) reasons.push(`мотивационный контент: ${motivationalMarkers}`);
  if (quickPromiseMarkers >= 3) reasons.push(`обещания быстрого результата: ${quickPromiseMarkers}`);
  if (salesPushMarkers >= 3) reasons.push(`агрессивные продажи: ${salesPushMarkers}`);
  if (guaranteeMarkers >= 2) reasons.push(`гарантии и переуспевание: ${guaranteeMarkers}`);
  if (!hasEducationalSignal) reasons.push("видео не имеет достаточной учебной структуры или цели");
  if (isSalesHeavy) reasons.push("контент перегружен продажами вместо обучения");
  if (hasOverpromising) reasons.push("видео содержит завышенные обещания без методологии");
  if (isSelfHelpMotivational) reasons.push("контент мотивационный, без конкретной методики и практики");
  if (noTeachingMechanism) reasons.push("недостаточно учебной механики: нет цели/метода/практики");
  if (isOverviewWithoutTeachingCore) reasons.push("обзорный формат без явной учебной цели и практики");
  if (isSalesLeadWithoutPractice) reasons.push("продвижение курса преобладает над учебной частью");
  if (isCourseOverviewSales) reasons.push("обзор курса с оффером без учебной практики/цели");
  if (sparseEvidence && hasStrongTitleIntent && !exclude) reasons.push("мало текста (описание/субтитры): классификация опирается на сильные маркеры в названии");
  if (uncertainFinal) reasons.push("пограничный случай: нужны дополнительные подтверждения учебной механики");
  if (exclude) reasons.push("не хватает признаков обучающего формата или преобладает медийно-маркетинговая подача");

  return { 
    eligible, 
    weak, 
    uncertain: uncertainFinal,
    exclude, 
    classification,
    confidence,
    score: Number(score.toFixed(1)), 
    learningEvidence, 
    reasons,
    markers: {
      hardNonLearningHits,
      titleMediaMarkers,
      motivationalMarkers,
      quickPromiseMarkers,
      salesPushMarkers,
      guaranteeMarkers
    }
  };
}

module.exports = { assessEducationalFit };
