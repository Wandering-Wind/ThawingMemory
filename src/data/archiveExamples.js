const archiveExamples = [
  {
    id: 'example-kept-kadala',
    isExample: true,
    cardTitle: 'Measured by Memory',
    decision: 'kept',
    memoryFragments: [
      {
        text: 'My mother counted pressure cooker whistles when making kadala curry.',
        questionAnswered: '',
      },
      {
        text: 'I think the brown kadala soaked overnight, and she waited for four whistles.',
        questionAnswered:
          'Do you remember whether the kadala was soaked and how many whistles she counted?',
      },
      {
        text: 'She pressed one between her fingers afterward. If it stayed firm, she cooked it again.',
        questionAnswered:
          'After the whistles, how did she decide whether the kadala was soft enough?',
      },
    ],
    aiResponses: [
      {
        reflection:
          'The whistle count appears to have acted as a remembered timing cue in your mother’s method.',
        limitation:
          'The fragment does not yet establish the count, soaking step, or tenderness test.',
        question:
          'Do you remember whether the kadala was soaked and how many whistles she counted?',
      },
      {
        reflection:
          'Your second fragment adds an overnight soak and a remembered count of four whistles.',
        limitation:
          'It is still unclear how she checked whether the kadala was fully cooked.',
        question:
          'After the whistles, how did she decide whether the kadala was soft enough?',
      },
      {
        reflection:
          'The finger-press test adds a practical readiness cue and shows that the whistle count was not treated as sufficient on its own.',
        limitation:
          'The quantity of kadala and amount of water remain unknown.',
        question:
          'Do you remember how she judged the amount of water before closing the cooker?',
      },
    ],
  },
  {
    id: 'example-edited-yogurt-curry',
    isExample: true,
    cardTitle: 'Measured by Memory',
    decision: 'edited',
    memoryFragments: [
      {
        text: 'My mother made chicken curry with yogurt.',
        questionAnswered: '',
      },
      {
        text: 'She lowered the heat before adding it because she said the yogurt would split.',
        questionAnswered:
          'Do you remember when the yogurt was added or whether the heat changed first?',
      },
    ],
    aiResponses: [
      {
        reflection:
          'Yogurt appears to be one remembered part of your mother’s chicken curry.',
        limitation:
          'The fragment does not yet show when it was added or how the heat was managed.',
        question:
          'Do you remember when the yogurt was added or whether the heat changed first?',
      },
      {
        reflection:
          'Lowering the heat before adding yogurt appears to have been a practical gesture transmitted through observation and explanation.',
        limitation:
          'The spice mixture, quantities, and later cooking steps remain unknown.',
        question:
          'What happened immediately after the yogurt was stirred in?',
      },
    ],
    userRevision:
      'My mother taught me to lower the heat before stirring in yogurt so it would not split.',
    userCorrection:
      'The important memory is her warning and the change in heat, not simply that the curry contained yogurt.',
  },
  {
    id: 'example-rejected-cherupayar',
    isExample: true,
    cardTitle: 'Measured by Memory',
    decision: 'rejected',
    memoryFragments: [
      {
        text: 'I remember hearing whistles while my aunt made cherupayar curry.',
        questionAnswered: '',
      },
      {
        text: 'I do not remember the number. I only remember that she turned the stove off and waited before opening it.',
        questionAnswered:
          'How many whistles did she wait for before turning off the heat?',
      },
    ],
    aiResponses: [
      {
        reflection:
          'The pressure cooker whistles appear to have marked a repeated stage in your aunt’s cherupayar curry.',
        limitation:
          'The number of whistles and what happened afterward are not known yet.',
        question:
          'How many whistles did she wait for before turning off the heat?',
      },
      {
        reflection:
          'Waiting after turning off the stove may have been how your aunt completed the cooking process.',
        limitation:
          'The fragment does not establish why she waited or whether pressure release was the intended reason.',
        question:
          'Did she explain why she waited before opening the cooker?',
      },
    ],
    userCorrection:
      'This does not fit because I cannot claim the waiting completed the cooking. I only remember that she waited.',
  },
]

export default archiveExamples
