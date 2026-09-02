const archiveExamples = [
  {
    id: 'example-kept-chammanthi-working-recipe',
    isExample: true,
    cardTitle: 'Measured by Memory',
    decision: 'kept',
    memoryFragments: [
      {
        text: 'My mom made chammanthi, how did she know how much coconut to add?',
        questionAnswered: '',
      },
      {
        text: 'She added by the handful of coconut. Then she added dry chillies as well, plus onions and curry leaves',
        questionAnswered:
          'How much coconut did you add when making that chammanthi?',
      },
      {
        text: 'She would usually taste as she added when she used the ammiikkal',
        questionAnswered:
          'How many dry chillies did she add to the chammanthi?',
      },
      {
        text: "Ammiikkal is the stone used to make that chammanthi. It's similar to a mortar and pastel",
        questionAnswered:
          'How many ammiikkal did she add to the chammanthi?',
      },
    ],
    aiResponses: [
      {
        reflection:
          'The memory notes that your mom’s chammanthi was guided by hands, sound, smell, and repetition instead of written measurements.',
        question:
          'How much coconut did you add when making that chammanthi?',
      },
      {
        reflection:
          'She described adding a handful of coconut, then dry chillies, onions, and curry leaves, suggesting a more tactile, less measured approach.',
        question: 'How many dry chillies did she add to the chammanthi?',
      },
      {
        reflection:
          'She says she would taste as she added, especially when using the ammiikkal, so it sounds like the seasoning was guided by taste rather than a set measurement.',
        question: 'How many ammiikkal did she add to the chammanthi?',
      },
      {
        reflection:
          'The newest fragment adds that the chammanthi was prepared using an ammiikkal, described as a stone similar to a mortar and pestle, which clarifies the tool involved in the process.',
        limitation:
          'I cannot know the exact size or shape of the ammiikkal that she used, nor any specific handling details that were not mentioned.',
        question:
          'How many times did she crush the coconut in the ammiikkal before adding the other ingredients?',
      },
    ],
    workingRecipe: {
      dishName: 'chammanthi',
      rememberedIngredients: [
        'coconut',
        'dry chillies',
        'onions',
        'curry leaves',
      ],
      rememberedMethod: [
        'Use the ammiikkal stone',
        'Add a handful of coconut',
        'Add dry chillies',
        'Add onions',
        'Add curry leaves',
        'Taste as you add',
      ],
      sensoryCues: [],
      familyNotes: [
        "Ammiikkal is the stone used to make that chammanthi. It's similar to a mortar and pastel",
      ],
      stillUnknown: [
        'Exact quantities of dry chillies, onions, curry leaves',
        'Whether coconut is shredded, grated or sliced',
        'Other ingredients used in chammanthi',
        'Cooking procedure after adding ingredients',
        'Heat level and duration',
        'Final appearance and aroma',
      ],
    },
  },
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


