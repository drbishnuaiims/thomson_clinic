(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  if (root) root.StressAssessmentCore = core;
}(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';

  const responseScales = Object.freeze({
    stress: Object.freeze(['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always']),
    frequency: Object.freeze(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']),
    impact: Object.freeze(['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'])
  });

  const sections = Object.freeze([
    Object.freeze({
      id: 'stress',
      title: '1. Perceived stress',
      period: 'Think about the past month. These are original, non-validated self-reflection questions.',
      scale: 'stress',
      questions: Object.freeze([
        'How often have you felt that important things in your life were becoming difficult to manage?',
        'How often have you felt overwhelmed by your responsibilities?',
        'How often have unexpected events disrupted your sense of control?',
        'How often have you felt unable to cope with everything you needed to do?',
        'How often have you found it difficult to relax because of ongoing demands?',
        'How often have you felt that problems were accumulating faster than you could manage them?',
        'How often have you felt confident in your ability to handle personal difficulties?',
        'How often have you felt able to manage the demands of your everyday life?'
      ])
    }),
    Object.freeze({
      id: 'emotional',
      title: '2. Emotional and cognitive symptoms',
      period: 'Think about the past two weeks. These original questions cover symptom domains; they are not a validated diagnostic scale.',
      scale: 'frequency',
      questions: Object.freeze([
        'Have you experienced persistent worry that was difficult to control?',
        'Have you felt tense, nervous or unable to settle?',
        'Have you felt unusually sad, low or emotionally depleted?',
        'Have you lost interest or pleasure in activities you usually enjoy?',
        'Have you experienced difficulty concentrating because of emotional distress?',
        'Have you felt unusually irritable or found it difficult to manage frustration?',
        'Have you experienced repeated negative thoughts that interfered with your daily activities?'
      ])
    }),
    Object.freeze({
      id: 'physical',
      title: '3. Physical symptoms and sleep',
      period: 'Think about the past two weeks. Physical symptoms may have psychological, medical or lifestyle-related causes; do not automatically attribute them to stress.',
      scale: 'frequency',
      questions: Object.freeze([
        'Have you experienced difficulty falling asleep, staying asleep or waking too early?',
        'Have you felt tired or exhausted during the day?',
        'Have you experienced muscle tension, headaches or other bodily discomfort during periods of distress?',
        'Have you experienced changes in appetite associated with how you have been feeling?',
        'Have you found it difficult to recover your energy after rest?'
      ])
    }),
    Object.freeze({
      id: 'function',
      title: '4. Functional impact',
      period: 'Think about the past two weeks. Choose how much your difficulties interfered.',
      scale: 'impact',
      questions: Object.freeze([
        'To what extent have your difficulties interfered with your work, education or usual responsibilities?',
        'To what extent have they affected your relationships or communication with others?',
        'To what extent have they disrupted your sleep or daily routine?',
        'To what extent have they affected your ability to look after yourself?',
        'To what extent have they reduced your ability to enjoy everyday life or complete important tasks?'
      ])
    }),
    Object.freeze({
      id: 'context',
      title: '5. Duration, coping and safety',
      period: 'These final questions help place your responses in context. Question 30 appears only after a positive response to Question 29.',
      questions: Object.freeze([
        Object.freeze({
          text: 'How long have these difficulties been affecting you?',
          options: Object.freeze(['Less than one week', 'One to two weeks', 'Two to four weeks', 'One to three months', 'More than three months']),
          required: true
        }),
        Object.freeze({
          text: 'Compared with two weeks ago, how are your difficulties changing?',
          options: Object.freeze(['Improving', 'About the same', 'Worsening', 'Unsure']),
          required: true
        }),
        Object.freeze({
          text: 'How confident do you feel about managing your current difficulties?',
          options: Object.freeze(['Very confident', 'Somewhat confident', 'Unsure', 'Not very confident', 'Not confident at all']),
          required: true
        }),
        Object.freeze({
          text: 'During the past two weeks, have you had thoughts that you would be better off dead, or thoughts of harming yourself?',
          options: Object.freeze(['No', 'Yes, occasionally', 'Yes, frequently or with significant distress', 'Prefer not to answer']),
          required: false,
          safety: true
        }),
        Object.freeze({
          text: 'Are you in immediate danger, or do you think you might act on thoughts of harming yourself right now?',
          options: Object.freeze(['No', 'Yes', 'Unsure', 'Prefer not to answer']),
          required: true,
          conditional: true,
          safety: true
        })
      ])
    })
  ]);

  const positiveIdeationValues = Object.freeze([1, 2]);

  function calculateProfiles(answers) {
    if (!Array.isArray(answers) || answers.length !== 30) {
      throw new TypeError('Assessment scoring requires exactly 30 answer slots.');
    }
    answers.forEach((value, index) => {
      const questionNumber = index + 1;
      const definition = questionNumber <= 25
        ? null
        : questionNumber <= 28
          ? sections[4].questions[questionNumber - 26]
          : questionNumber === 29
            ? sections[4].questions[3]
            : sections[4].questions[4];
      const maxValue = questionNumber <= 8
        ? 4
        : questionNumber <= 20
          ? 3
          : questionNumber <= 25
            ? 4
            : definition.options.length - 1;
      if (value !== null && (!Number.isInteger(value) || value < 0 || value > maxValue)) {
        throw new RangeError(`Question ${questionNumber} has an invalid response value.`);
      }
    });

    const stressValues = answers.slice(0, 8).map((value, index) => index >= 6 ? 4 - value : value);
    const stressRaw = stressValues.reduce((sum, value) => sum + value, 0);
    const stressIndex = Math.round((stressRaw / 32) * 100);
    const emotionalCognitive = answers.slice(8, 15);
    const emotional = [answers[8], answers[9], answers[10], answers[11], answers[13]];
    const cognitive = [answers[12], answers[14]];
    const physical = answers.slice(15, 20);
    const functional = answers.slice(20, 25);
    const symptoms = [...emotionalCognitive, ...physical];
    const recurringSymptomCount = symptoms.filter((value) => value >= 1).length;
    const frequentSymptomCount = symptoms.filter((value) => value >= 2).length;
    const symptomRecurrence = recurringSymptomCount >= 2 || frequentSymptomCount >= 1;
    const markedFunction = functional.some((value) => value >= 3);
    const noticeableFunction = functional.some((value) => value >= 2);
    const persistent = answers[25] >= 3;
    const worsening = answers[26] === 2;
    const reducedCoping = answers[27] >= 2;
    const ideation = answers[28];
    const immediateSafety = answers[29];
    const hasPositiveIdeation = ideation !== null && positiveIdeationValues.includes(ideation);
    const urgent = hasPositiveIdeation && (immediateSafety === 1 || immediateSafety === 2);
    const prompt = !urgent && (markedFunction || persistent || worsening || hasPositiveIdeation);
    const consider = !urgent && !prompt && (symptomRecurrence || noticeableFunction || reducedCoping);

    return {
      stressIndex,
      stressRaw,
      emotional,
      cognitive,
      physical,
      functional,
      recurringSymptomCount,
      frequentSymptomCount,
      symptomRecurrence,
      markedFunction,
      noticeableFunction,
      persistent,
      worsening,
      reducedCoping,
      duration: answers[25],
      trajectory: answers[26],
      coping: answers[27],
      ideation,
      immediateSafety,
      urgent,
      prompt,
      consider
    };
  }

  function optionLabel(questionNumber, value) {
    if (value === null) return 'Not answered';
    if (questionNumber <= 8) return responseScales.stress[value];
    if (questionNumber <= 20) return responseScales.frequency[value];
    if (questionNumber <= 25) return responseScales.impact[value];
    const contextQuestion = questionNumber === 29 ? sections[4].questions[3]
      : questionNumber === 30 ? sections[4].questions[4]
        : sections[4].questions[questionNumber - 26];
    return contextQuestion.options[value];
  }

  function getRecommendation(profiles) {
    if (profiles.urgent) {
      return {
        kind: 'urgent',
        title: 'Pause the reflection and get urgent help now',
        reason: `You answered “${optionLabel(30, profiles.immediateSafety)}” to the immediate-safety question. This questionnaire cannot assess or manage immediate danger.`
      };
    }
    if (profiles.prompt) {
      const reasons = [];
      if (profiles.markedFunction) reasons.push('at least one area of daily functioning was affected “A lot” or “Extremely”');
      if (profiles.persistent) reasons.push(`you reported difficulties lasting “${optionLabel(26, profiles.duration)}”`);
      if (profiles.worsening) reasons.push('you reported that difficulties are worsening');
      if (profiles.ideation !== null && positiveIdeationValues.includes(profiles.ideation)) {
        reasons.push(`you reported suicidal or self-harm thoughts as “${optionLabel(29, profiles.ideation)}”`);
      }
      return {
        kind: 'prompt',
        title: 'Please arrange a prompt professional assessment',
        reason: `This recommendation follows your response(s): ${reasons.join('; ')}. Contact a qualified mental-health professional. ${profiles.ideation !== null && positiveIdeationValues.includes(profiles.ideation) ? 'Please tell them about the thoughts you reported.' : ''}`
      };
    }
    if (profiles.consider) {
      const reasons = [];
      if (profiles.recurringSymptomCount >= 2) {
        reasons.push(`${profiles.recurringSymptomCount} emotional, cognitive or physical symptoms occurred on at least several days`);
      }
      if (profiles.frequentSymptomCount >= 1) {
        reasons.push(`${profiles.frequentSymptomCount} emotional, cognitive or physical symptom${profiles.frequentSymptomCount === 1 ? '' : 's'} occurred more than half the days or nearly every day`);
      }
      if (profiles.noticeableFunction) reasons.push('at least one area of functioning affected “Moderately” or more');
      if (profiles.reducedCoping) reasons.push(`coping confidence reported as “${optionLabel(28, profiles.coping)}”`);
      return {
        kind: 'consider',
        title: 'Consider talking with a qualified professional',
        reason: `This suggestion follows your responses indicating ${reasons.join('; ')}. You can seek support even if your stress index is low.`
      };
    }
    return {
      kind: 'self-care',
      title: 'Self-care and monitoring may be reasonable for now',
      reason: 'Your answers do not meet the page’s response-based prompt rules: there was no marked functional impact, reported persistent duration or worsening, and no combination of recurring symptoms, noticeable impairment or reduced coping confidence. This does not rule out a need for help; your own concern is enough reason to reach out.'
    };
  }

  return Object.freeze({
    responseScales,
    sections,
    positiveIdeationValues,
    calculateProfiles,
    getRecommendation
  });
}));
