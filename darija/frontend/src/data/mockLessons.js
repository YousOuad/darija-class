// Mock lesson data keyed by lesson ID.
// Each lesson matches the structure expected by LessonView.jsx.
// Content is adapted from the curriculum JSON files.

const MOCK_LESSONS = {
  1: {
    id: 1,
    title: 'Hello & Goodbye',
    level: 'A2',
    module: 'Greetings & Basics',
    vocabulary: [
      { id: 1, arabic: 'سلام', latin: 'Salam', english: 'Hello / Peace', example_arabic: 'سلام، لاباس عليك؟', example_latin: 'Salam, labas 3lik?', example_english: 'Hello, how are you?' },
      { id: 2, arabic: 'صباح الخير', latin: 'Sbah lkhir', english: 'Good morning', example_arabic: 'صباح الخير، كيداير؟', example_latin: 'Sbah lkhir, kidayr?', example_english: 'Good morning, how are you doing?' },
      { id: 3, arabic: 'مسا الخير', latin: 'Msa lkhir', english: 'Good evening', example_arabic: 'مسا الخير، كيداير اليوم؟', example_latin: 'Msa lkhir, kidayr lyoum?', example_english: 'Good evening, how are you today?' },
      { id: 4, arabic: 'بسلامة', latin: 'Bslama', english: 'Goodbye', example_arabic: 'يالاه، بسلامة!', example_latin: 'Yallah, bslama!', example_english: 'Alright, goodbye!' },
      { id: 5, arabic: 'مرحبا', latin: 'Mr7ba', english: 'Welcome', example_arabic: 'مرحبا بيك عندنا', example_latin: 'Mr7ba bik 3ndna', example_english: 'Welcome to our place' },
      { id: 6, arabic: 'تصبح على خير', latin: 'Tsba7 3la khir', english: 'Good night', example_arabic: 'يالاه نعس، تصبح على خير', example_latin: 'Yallah n3ss, tsba7 3la khir', example_english: 'Let me sleep, good night' },
    ],
    grammar: [
      {
        title: 'Basic Greeting Structure',
        explanation: 'In Darija, greetings typically start with "salam" (peace) followed by a question about wellbeing such as "labas?" or "kidayr/kidayra?".',
        examples: [
          { arabic: 'سلام، لاباس عليك؟', latin: 'Salam, labas 3lik?', english: 'Hello, how are you?' },
          { arabic: 'سلام، كيداير؟', latin: 'Salam, kidayr?', english: 'Hello, how are you doing?' },
        ],
      },
      {
        title: 'Time-Based Greetings',
        explanation: 'Darija has specific greetings for different times of day. "Sbah lkhir" for morning, "msa lkhir" for evening, and "tsba7 3la khir" as a goodnight farewell.',
        examples: [
          { arabic: 'صباح الخير / مسا الخير', latin: 'Sbah lkhir / Msa lkhir', english: 'Good morning / Good evening' },
          { arabic: 'تصبح على خير', latin: 'Tsba7 3la khir', english: 'Good night (farewell only)' },
        ],
      },
    ],
    phrases: [
      { arabic: 'سلام، لاباس عليك؟', latin: 'Salam, labas 3lik?', english: 'Hello, how are you?', context: 'Most common everyday greeting' },
      { arabic: 'لاباس، الحمد لله', latin: 'Labas, l7amdullah', english: "I'm fine, praise God", context: 'Standard response' },
      { arabic: 'أش خبارك؟', latin: 'Ash khbarek?', english: 'How have you been?', context: 'Warm greeting for someone you haven\'t seen' },
      { arabic: 'مرحبا بيك', latin: 'Mr7ba bik', english: 'Welcome (to a male)', context: 'When someone arrives at your place' },
      { arabic: 'الله يسلمك', latin: 'Allah yslmk', english: 'God protect you', context: 'Response to "bslama"' },
      { arabic: 'تبارك الله عليك', latin: 'Tbarkallah 3lik', english: 'God bless you / Well done', context: 'Admiration or congratulation' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "Good morning" in Darija?', options: ['Sbah lkhir', 'Msa lkhir', 'Bslama', 'Choukran'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "Bslama" mean?', options: ['Hello', 'Thank you', 'Goodbye', 'Please'], correct: 2 },
      { type: 'fill_blank', sentence: '_____ , labas 3lik?', answer: 'Salam', english: '_____, how are you?' },
    ],
  },

  2: {
    id: 2,
    title: 'Introducing Yourself',
    level: 'A2',
    module: 'Greetings & Basics',
    vocabulary: [
      { id: 1, arabic: 'سميتي', latin: 'Smiti', english: 'My name is', example_arabic: 'سميتي يوسف', example_latin: 'Smiti Youssef', example_english: 'My name is Youssef' },
      { id: 2, arabic: 'أش سميتك؟', latin: 'Ash smitek?', english: 'What is your name?', example_arabic: 'أش سميتك أ صاحبي؟', example_latin: 'Ash smitek a sa7bi?', example_english: 'What is your name, my friend?' },
      { id: 3, arabic: 'أنا', latin: 'Ana', english: 'I / Me', example_arabic: 'أنا من المغرب', example_latin: 'Ana mn lmghrib', example_english: 'I am from Morocco' },
      { id: 4, arabic: 'نتا / نتي', latin: 'Nta / Nti', english: 'You (m/f)', example_arabic: 'نتا منين؟', example_latin: 'Nta mnin?', example_english: 'Where are you from?' },
      { id: 5, arabic: 'متشرفين', latin: 'Mtshrfin', english: 'Pleased to meet you', example_arabic: 'متشرفين، أنا كمال', example_latin: 'Mtshrfin, ana Kamal', example_english: 'Pleased to meet you, I\'m Kamal' },
      { id: 6, arabic: 'صاحبي / صاحبتي', latin: 'Sa7bi / Sa7bti', english: 'My friend (m/f)', example_arabic: 'هادا صاحبي أمين', example_latin: 'Hada sa7bi Amine', example_english: 'This is my friend Amine' },
    ],
    grammar: [
      {
        title: 'Personal Pronouns',
        explanation: 'Darija has 8 personal pronouns: ana (I), nta (you-m), nti (you-f), howa (he), hiya (she), 7na (we), ntuma (you-pl), huma (they). There is no dual form.',
        examples: [
          { arabic: 'أنا طالب، هو أستاذ', latin: 'Ana talib, howa ostad', english: 'I am a student, he is a teacher' },
          { arabic: 'حنا مغاربة', latin: '7na mgharba', english: 'We are Moroccans' },
        ],
      },
      {
        title: 'Introduction Structure: smiti + name',
        explanation: 'To introduce yourself, say "smiti" (my name) followed by your name. To ask someone\'s name, say "ash smitek?".',
        examples: [
          { arabic: 'سميتي سارة، و نتي أش سميتك؟', latin: 'Smiti Sara, w nti ash smitek?', english: "My name is Sara, and what's your name?" },
          { arabic: 'نتا منين؟ أنا من فاس', latin: 'Nta mnin? Ana mn Fas', english: 'Where are you from? I\'m from Fes' },
        ],
      },
    ],
    phrases: [
      { arabic: 'أش سميتك؟', latin: 'Ash smitek?', english: 'What is your name?', context: 'Asking someone\'s name' },
      { arabic: 'سميتي يوسف، و نتا؟', latin: 'Smiti Youssef, w nta?', english: 'My name is Youssef, and you?', context: 'Introducing yourself' },
      { arabic: 'نتا منين؟', latin: 'Nta mnin?', english: 'Where are you from?', context: 'Asking origin' },
      { arabic: 'أنا من المغرب', latin: 'Ana mn lmghrib', english: 'I am from Morocco', context: 'Stating nationality' },
      { arabic: 'متشرفين بيك', latin: 'Mtshrfin bik', english: 'Pleased to meet you', context: 'After introduction' },
      { arabic: 'هادا صاحبي محمد', latin: 'Hada sa7bi Mohamed', english: 'This is my friend Mohamed', context: 'Introducing someone' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "What is your name?" in Darija?', options: ['Ash smitek?', 'Ash bghiti?', 'Nta mnin?', 'Kidayr?'], correct: 0 },
      { type: 'multiple_choice', question: 'Which pronoun means "we" in Darija?', options: ['Huma', 'Ntuma', '7na', 'Ana'], correct: 2 },
      { type: 'fill_blank', sentence: '_____ Youssef, w nta?', answer: 'Smiti', english: 'My name is Youssef, and you?' },
    ],
  },

  3: {
    id: 3,
    title: 'How Are You?',
    level: 'A2',
    module: 'Greetings & Basics',
    vocabulary: [
      { id: 1, arabic: 'كيداير', latin: 'Kidayr', english: 'How are you? (to a male)', example_arabic: 'سلام، كيداير اليوم؟', example_latin: 'Salam, kidayr lyoum?', example_english: 'Hello, how are you doing today?' },
      { id: 2, arabic: 'كيدايرة', latin: 'Kidayra', english: 'How are you? (to a female)', example_arabic: 'سلام ختي، كيدايرة؟', example_latin: 'Salam khti, kidayra?', example_english: 'Hello sister, how are you doing?' },
      { id: 3, arabic: 'لاباس', latin: 'Labas', english: "How are you / I'm fine", example_arabic: 'لاباس، الحمد لله', example_latin: 'Labas, l7amdullah', example_english: "I'm fine, praise God" },
      { id: 4, arabic: 'الحمد لله', latin: 'L7amdullah', english: "Praise God / I'm fine", example_arabic: 'كيداير؟ الحمد لله، بيخير', example_latin: 'Kidayr? L7amdullah, bikhir', example_english: 'How are you? Fine, thank God' },
      { id: 5, arabic: 'بيخير', latin: 'Bikhir', english: "I'm fine / well", example_arabic: 'أنا بيخير، و نتا؟', example_latin: 'Ana bikhir, w nta?', example_english: "I'm fine, and you?" },
      { id: 6, arabic: 'كيف حالك', latin: 'Kif 7alk', english: 'How are you (formal)', example_arabic: 'كيف حالك اليوم؟', example_latin: 'Kif 7alk lyoum?', example_english: 'How are you today?' },
    ],
    grammar: [
      {
        title: 'Gendered Greeting Forms',
        explanation: 'Many Darija greetings change form by gender. Males use the -ayr ending, females use -ayra. "Labas 3lik" works for both.',
        examples: [
          { arabic: 'كيداير؟ / كيدايرة؟', latin: 'Kidayr? / Kidayra?', english: 'How are you doing? (m / f)' },
          { arabic: 'لاباس عليك؟', latin: 'Labas 3lik?', english: 'Are you okay? (same for both)' },
        ],
      },
      {
        title: 'Response Patterns',
        explanation: 'The standard response always includes "l7amdullah" (praise God), often followed by returning the question.',
        examples: [
          { arabic: 'لاباس، الحمد لله، و نتا؟', latin: 'Labas, l7amdullah, w nta?', english: "I'm fine, praise God, and you?" },
          { arabic: 'بيخير، الحمد لله', latin: 'Bikhir, l7amdullah', english: 'I\'m well, praise God' },
        ],
      },
    ],
    phrases: [
      { arabic: 'كيداير؟', latin: 'Kidayr?', english: 'How are you? (to a man)', context: 'Casual greeting' },
      { arabic: 'كيدايرة؟', latin: 'Kidayra?', english: 'How are you? (to a woman)', context: 'Casual greeting' },
      { arabic: 'لاباس، الحمد لله', latin: 'Labas, l7amdullah', english: 'Fine, thank God', context: 'Response to "how are you"' },
      { arabic: 'كلشي بيخير؟', latin: 'Kolshi bikhir?', english: 'Everything okay?', context: 'Checking on someone' },
      { arabic: 'لعائلة لاباس؟', latin: "L3a'ila labas?", english: 'Family okay?', context: 'Asking about family' },
      { arabic: 'الحمد لله، كلشي مزيان', latin: 'L7amdullah, kolshi mzyan', english: 'Thank God, everything is good', context: 'Positive response' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you ask a woman "how are you doing?" in Darija?', options: ['Kidayra?', 'Kidayr?', 'Kif 7alk?', 'Labas 3lik?'], correct: 0 },
      { type: 'multiple_choice', question: 'What should you include in your response to "labas?"', options: ['L7amdullah', 'Inshallah', 'Bslama', 'Choukran'], correct: 0 },
      { type: 'fill_blank', sentence: 'Labas, _____ , w nta?', answer: 'l7amdullah', english: "I'm fine, _____, and you?" },
    ],
  },

  4: {
    id: 4,
    title: 'Please & Thank You',
    level: 'A2',
    module: 'Greetings & Basics',
    vocabulary: [
      { id: 1, arabic: 'شكرا', latin: 'Choukran', english: 'Thank you', example_arabic: 'شكرا بزاف', example_latin: 'Choukran bzzaf', example_english: 'Thank you very much' },
      { id: 2, arabic: 'عافاك', latin: '3afak', english: 'Please (informal)', example_arabic: 'عطيني واحد الأتاي عافاك', example_latin: '3tini wa7d latay 3afak', example_english: 'Give me one tea, please' },
      { id: 3, arabic: 'من فضلك', latin: 'Mn fadlak', english: 'Please (formal)', example_arabic: 'عطيني الما من فضلك', example_latin: '3tini lma mn fadlak', example_english: 'Give me the water please' },
      { id: 4, arabic: 'سمح ليا', latin: 'Sm7 lia', english: 'Excuse me / Sorry', example_arabic: 'سمح ليا، فين الطوبيس؟', example_latin: 'Sm7 lia, fin ttobis?', example_english: 'Excuse me, where is the bus?' },
      { id: 5, arabic: 'الله يخليك', latin: 'Allah ykhllik', english: 'Please / God keep you', example_arabic: 'الله يخليك ساعدني', example_latin: 'Allah ykhllik sa3dni', example_english: 'Please help me' },
      { id: 6, arabic: 'الله يعطيك الصحة', latin: 'Allah y3tik ssa7a', english: 'God bless you (for effort)', example_arabic: 'الله يعطيك الصحة على هاد الخدمة', example_latin: 'Allah y3tik ssa7a 3la had lkhdma', example_english: 'God bless you for this work' },
    ],
    grammar: [
      {
        title: "Informal vs Formal 'Please'",
        explanation: '"3afak" is the everyday, informal way to say please. "Mn fadlak" is more formal and respectful. "Allah ykhllik" is a polite religious expression.',
        examples: [
          { arabic: 'عافاك عطيني واحد الكاس دلما', latin: '3afak 3tini wa7d lkas dlma', english: 'Please give me a glass of water (informal)' },
          { arabic: 'من فضلك، وريني الطريق', latin: 'Mn fadlak, wrrini ttri9', english: 'Please, show me the way (formal)' },
        ],
      },
      {
        title: 'Expressing Gratitude',
        explanation: '"Choukran" is the basic thank you. Add "bzzaf" for emphasis. "Allah y3tik ssa7a" is used to thank someone for physical effort or work.',
        examples: [
          { arabic: 'شكرا بزاف', latin: 'Choukran bzzaf', english: 'Thank you very much' },
          { arabic: 'الله يعطيك الصحة', latin: 'Allah y3tik ssa7a', english: 'Bless your hands (thanks for effort)' },
        ],
      },
    ],
    phrases: [
      { arabic: 'شكرا بزاف', latin: 'Choukran bzzaf', english: 'Thank you very much', context: 'Expressing strong gratitude' },
      { arabic: 'لا، شكرا', latin: 'La, choukran', english: 'No, thank you', context: 'Politely declining' },
      { arabic: 'عافاك، عاود', latin: '3afak, 3awd', english: 'Please, say it again', context: 'Asking someone to repeat' },
      { arabic: 'سمح ليا، ما فهمتش', latin: 'Sm7 lia, ma fhmtsh', english: "Sorry, I don't understand", context: 'Apologizing for not understanding' },
      { arabic: 'ما كاين مشكيل', latin: 'Ma kayn mushkil', english: 'No problem', context: "Response to someone's apology" },
      { arabic: 'الله يبارك فيك', latin: 'Allah ybark fik', english: 'God bless you', context: 'Response to thank you' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'Which is the informal way to say "please"?', options: ['3afak', 'Mn fadlak', 'Allah ykhllik', 'Choukran'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "sm7 lia" mean?', options: ['Excuse me / Sorry', 'Thank you', 'Please', 'Goodbye'], correct: 0 },
      { type: 'fill_blank', sentence: 'Choukran _____ !', answer: 'bzzaf', english: 'Thank you _____ !' },
    ],
  },

  5: {
    id: 5,
    title: 'Numbers 1-20',
    level: 'A2',
    module: 'Numbers & Shopping',
    vocabulary: [
      { id: 1, arabic: 'واحد', latin: 'Wa7d', english: 'One / 1', example_arabic: 'عطيني واحد الخبزة', example_latin: '3tini wa7d lkhobza', example_english: 'Give me one bread' },
      { id: 2, arabic: 'جوج', latin: 'Jouj', english: 'Two / 2', example_arabic: 'عندي جوج دالولاد', example_latin: '3ndi jouj dlwlad', example_english: 'I have two children' },
      { id: 3, arabic: 'تلاتة', latin: 'Tlata', english: 'Three / 3', example_arabic: 'كاينين تلاتة دالكيسان', example_latin: 'Kaynin tlata dlkisan', example_english: 'There are three glasses' },
      { id: 4, arabic: 'ربعة', latin: 'Rb3a', english: 'Four / 4', example_arabic: 'ربعة ديال الناس', example_latin: 'Rb3a dyal nnas', example_english: 'Four people' },
      { id: 5, arabic: 'خمسة', latin: 'Khmsa', english: 'Five / 5', example_arabic: 'خمسة دالدراهم', example_latin: 'Khmsa ddraham', example_english: 'Five dirhams' },
      { id: 6, arabic: 'عشرة', latin: '3shra', english: 'Ten / 10', example_arabic: 'عطيني عشرة دالدراهم', example_latin: '3tini 3shra ddraham', example_english: 'Give me ten dirhams' },
    ],
    grammar: [
      {
        title: 'Counting with Nouns',
        explanation: 'In Darija, when counting items, use the number + "d" or "dyal" + noun: "jouj d-lktub" (two books), "tlata d-lkisan" (three glasses).',
        examples: [
          { arabic: 'جوج دالكتب', latin: 'Jouj dlktub', english: 'Two books' },
          { arabic: 'خمسة دالدراهم', latin: 'Khmsa ddraham', english: 'Five dirhams' },
        ],
      },
      {
        title: 'Numbers 1-10',
        explanation: 'The first ten numbers: wa7d (1), jouj (2), tlata (3), rb3a (4), khmsa (5), stta (6), sb3a (7), tmnya (8), ts3ud (9), 3shra (10).',
        examples: [
          { arabic: 'واحد، جوج، تلاتة', latin: 'Wa7d, jouj, tlata', english: 'One, two, three' },
          { arabic: 'ستة، سبعة، تمنية', latin: 'Stta, sb3a, tmnya', english: 'Six, seven, eight' },
        ],
      },
    ],
    phrases: [
      { arabic: 'شحال هادا؟', latin: 'Sh7al hada?', english: 'How much is this?', context: 'Asking a price' },
      { arabic: 'عطيني جوج', latin: '3tini jouj', english: 'Give me two', context: 'Ordering a quantity' },
      { arabic: 'خمسة دالدراهم', latin: 'Khmsa ddraham', english: 'Five dirhams', context: 'Stating a price' },
      { arabic: 'بشحال الكيلو؟', latin: 'Bsh7al lkilo?', english: 'How much per kilo?', context: 'At the market' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'What is "three" in Darija?', options: ['Tlata', 'Jouj', 'Rb3a', 'Khmsa'], correct: 0 },
      { type: 'multiple_choice', question: 'How do you say "five dirhams"?', options: ['Khmsa ddraham', 'Jouj ddraham', '3shra ddraham', 'Wa7d ddraham'], correct: 0 },
      { type: 'fill_blank', sentence: '3tini _____ dlkhobza', answer: 'wa7d', english: 'Give me _____ bread' },
    ],
  },

  6: {
    id: 6,
    title: 'At the Market',
    level: 'A2',
    module: 'Numbers & Shopping',
    vocabulary: [
      { id: 1, arabic: 'سوق', latin: 'Su9', english: 'Market', example_arabic: 'كنمشي للسوق كل نهار', example_latin: 'Kanmshi lssu9 kol nhar', example_english: 'I go to the market every day' },
      { id: 2, arabic: 'خضرة', latin: 'Khodra', english: 'Vegetables', example_arabic: 'كنشري الخضرة من السوق', example_latin: 'Kanshri lkhodra mn ssu9', example_english: 'I buy vegetables from the market' },
      { id: 3, arabic: 'فاكية', latin: 'Fakya', english: 'Fruit', example_arabic: 'الفاكية ديال المغرب بنينة', example_latin: 'Lfakya dyal lmghrib bnina', example_english: 'Moroccan fruit is delicious' },
      { id: 4, arabic: 'كنشري', latin: 'Kanshri', english: 'I buy', example_arabic: 'كنشري الخبز من الفران', example_latin: 'Kanshri lkhobz mn lfran', example_english: 'I buy bread from the bakery' },
      { id: 5, arabic: 'غالي', latin: 'Ghali', english: 'Expensive', example_arabic: 'اللحم غالي هاد الأيام', example_latin: 'Ll7m ghali had layam', example_english: 'Meat is expensive these days' },
      { id: 6, arabic: 'رخيص', latin: 'Rkhis', english: 'Cheap', example_arabic: 'الخضرة رخيصة فالسوق', example_latin: 'Lkhodra rkhisa fssu9', example_english: 'Vegetables are cheap at the market' },
    ],
    grammar: [
      {
        title: "Expressing 'I want' with 'bghit'",
        explanation: '"bghit" (I want) is essential for shopping. Conjugation: bghit (I), bghiti (you), bgha (he), bghat (she), bghina (we).',
        examples: [
          { arabic: 'بغيت واحد الكيلو دالطماطم', latin: 'Bghit wa7d lkilo dttmatm', english: 'I want one kilo of tomatoes' },
          { arabic: 'أشنو بغيتي؟', latin: 'Ashnu bghiti?', english: 'What do you want?' },
        ],
      },
      {
        title: "'Give me' with '3tini'",
        explanation: '"3tini" (give me) is the imperative of "3ta" (to give). Very common in shops and markets.',
        examples: [
          { arabic: 'عطيني جوج كيلو دالطماطم', latin: '3tini jouj kilo dttmatm', english: 'Give me two kilos of tomatoes' },
          { arabic: 'عطيني واحد الخبزة', latin: '3tini wa7d lkhobza', english: 'Give me one bread' },
        ],
      },
    ],
    phrases: [
      { arabic: 'بشحال هادا؟', latin: 'Bsh7al hada?', english: 'How much is this?', context: 'Asking price at market' },
      { arabic: 'غالي بزاف! نقص شوية', latin: 'Ghali bzzaf! N9ss chwiya', english: 'Too expensive! Lower it a bit', context: 'Bargaining' },
      { arabic: 'عطيني جوج كيلو', latin: '3tini jouj kilo', english: 'Give me two kilos', context: 'Ordering quantity' },
      { arabic: 'واش عندك الليمون؟', latin: 'Wash 3ndk llimun?', english: 'Do you have lemons?', context: 'Asking for availability' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "How much is this?" at a market?', options: ['Bsh7al hada?', 'Ashnu hada?', 'Fin hada?', 'Kifash hada?'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "ghali" mean?', options: ['Expensive', 'Cheap', 'Delicious', 'Fresh'], correct: 0 },
      { type: 'fill_blank', sentence: '_____ jouj kilo dttmatm', answer: '3tini', english: '_____ two kilos of tomatoes' },
    ],
  },

  7: {
    id: 7,
    title: 'How Much?',
    level: 'A2',
    module: 'Numbers & Shopping',
    vocabulary: [
      { id: 1, arabic: 'شحال', latin: 'Sh7al', english: 'How much / How many', example_arabic: 'شحال الثمن؟', example_latin: 'Sh7al ttman?', example_english: 'How much is the price?' },
      { id: 2, arabic: 'ثمن', latin: 'Tman', english: 'Price', example_arabic: 'أشنو الثمن ديال هادا؟', example_latin: 'Ashnu ttman dyal hada?', example_english: 'What is the price of this?' },
      { id: 3, arabic: 'درهم', latin: 'Drham', english: 'Dirham (currency)', example_arabic: 'الثمن عشرين درهم', example_latin: 'Ttman 3shrin drham', example_english: 'The price is twenty dirhams' },
      { id: 4, arabic: 'ريال', latin: 'Ryal', english: 'Rial (5 centimes)', example_arabic: 'بعشرين ريال', example_latin: 'B3shrin ryal', example_english: 'For twenty rials (= 1 dirham)' },
      { id: 5, arabic: 'نقص', latin: 'N9ss', english: 'Reduce / Lower', example_arabic: 'نقص ليا شوية', example_latin: 'N9ss lia chwiya', example_english: 'Lower it for me a bit' },
      { id: 6, arabic: 'بزاف', latin: 'Bzzaf', english: 'Too much / A lot', example_arabic: 'غالي بزاف!', example_latin: 'Ghali bzzaf!', example_english: 'Too expensive!' },
    ],
    grammar: [
      {
        title: 'Asking Prices with sh7al',
        explanation: '"Sh7al" (how much) is used for prices and quantities. "Bsh7al" (for how much) is specifically for prices.',
        examples: [
          { arabic: 'بشحال الكيلو؟', latin: 'Bsh7al lkilo?', english: 'How much per kilo?' },
          { arabic: 'شحال هادا؟', latin: 'Sh7al hada?', english: 'How much is this?' },
        ],
      },
      {
        title: 'Bargaining Phrases',
        explanation: 'Bargaining is common in Moroccan markets. Use "ghali bzzaf" (too expensive), "n9ss chwiya" (lower a bit), and "akher taman" (final price).',
        examples: [
          { arabic: 'غالي بزاف، نقص ليا', latin: 'Ghali bzzaf, n9ss lia', english: 'Too expensive, lower it for me' },
          { arabic: 'أخر ثمن ديالك؟', latin: 'Akher taman dyalk?', english: 'What\'s your final price?' },
        ],
      },
    ],
    phrases: [
      { arabic: 'شحال الثمن؟', latin: 'Sh7al ttman?', english: 'How much is the price?', context: 'Asking a price' },
      { arabic: 'غالي بزاف!', latin: 'Ghali bzzaf!', english: 'Too expensive!', context: 'Bargaining' },
      { arabic: 'نقص ليا شوية عافاك', latin: 'N9ss lia chwiya 3afak', english: 'Lower it a bit please', context: 'Negotiating' },
      { arabic: 'أخر ثمن ديالك؟', latin: 'Akher taman dyalk?', english: 'What\'s your final price?', context: 'Closing a deal' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you ask "how much?" in Darija?', options: ['Sh7al?', 'Ashnu?', 'Kifash?', 'Fin?'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "n9ss lia chwiya" mean?', options: ['Lower it for me a bit', 'Give me a little', 'Wait a moment', 'Show me more'], correct: 0 },
      { type: 'fill_blank', sentence: '_____ bzzaf! N9ss lia', answer: 'Ghali', english: 'Too _____ ! Lower it for me' },
    ],
  },

  8: {
    id: 8,
    title: 'Colors & Sizes',
    level: 'A2',
    module: 'Numbers & Shopping',
    vocabulary: [
      { id: 1, arabic: 'أحمر', latin: 'A7mar', english: 'Red', example_arabic: 'بغيت واحد أحمر', example_latin: 'Bghit wa7d a7mar', example_english: 'I want a red one' },
      { id: 2, arabic: 'أزرق', latin: 'Azra9', english: 'Blue', example_arabic: 'السما زرقة', example_latin: 'Ssma zr9a', example_english: 'The sky is blue' },
      { id: 3, arabic: 'أخضر', latin: 'Akhdar', english: 'Green', example_arabic: 'الأتاي أخضر', example_latin: 'Latay akhdar', example_english: 'The tea is green' },
      { id: 4, arabic: 'كبير', latin: 'Kbir', english: 'Big / Large', example_arabic: 'بغيت واحد كبير', example_latin: 'Bghit wa7d kbir', example_english: 'I want a big one' },
      { id: 5, arabic: 'صغير', latin: 'Sghir', english: 'Small', example_arabic: 'هادا صغير بزاف', example_latin: 'Hada sghir bzzaf', example_english: 'This is too small' },
      { id: 6, arabic: 'أبيض', latin: 'Abyad', english: 'White', example_arabic: 'عندي قميجة بيضة', example_latin: '3ndi 9mija byda', example_english: 'I have a white shirt' },
    ],
    grammar: [
      {
        title: 'Adjective Agreement',
        explanation: 'In Darija, adjectives agree in gender with the noun. Masculine adjectives often become feminine by adding -a: kbir/kbira, sghir/sghira, a7mar/7amra.',
        examples: [
          { arabic: 'ولد كبير / بنت كبيرة', latin: 'Wld kbir / Bnt kbira', english: 'Big boy / Big girl' },
          { arabic: 'طوموبيل حمرا', latin: 'Tomobil 7amra', english: 'Red car (feminine)' },
        ],
      },
      {
        title: 'Adjective Placement',
        explanation: 'In Darija, adjectives come after the noun they describe, unlike English.',
        examples: [
          { arabic: 'دار كبيرة', latin: 'Dar kbira', english: 'Big house (literally: house big)' },
          { arabic: 'كتاب أزرق', latin: 'Ktab azra9', english: 'Blue book (literally: book blue)' },
        ],
      },
    ],
    phrases: [
      { arabic: 'بغيت واحد كبير', latin: 'Bghit wa7d kbir', english: 'I want a big one', context: 'Shopping for size' },
      { arabic: 'واش عندك أحمر؟', latin: 'Wash 3ndk a7mar?', english: 'Do you have red?', context: 'Asking for a color' },
      { arabic: 'هادا صغير بزاف', latin: 'Hada sghir bzzaf', english: 'This is too small', context: 'Size complaint' },
      { arabic: 'عندك شي حاجة أكبر؟', latin: '3ndk shi 7aja akbr?', english: 'Do you have something bigger?', context: 'Asking for larger size' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "red" in Darija?', options: ['A7mar', 'Azra9', 'Akhdar', 'Abyad'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "sghir" mean?', options: ['Small', 'Big', 'Cheap', 'Expensive'], correct: 0 },
      { type: 'fill_blank', sentence: 'Bghit wa7d _____ (big)', answer: 'kbir', english: 'I want a _____ one' },
    ],
  },

  9: {
    id: 9,
    title: 'At the Cafe',
    level: 'A2',
    module: 'Food & Drink',
    vocabulary: [
      { id: 1, arabic: 'أتاي', latin: 'Atay', english: 'Tea (mint tea)', example_arabic: 'بغيت واحد الكاس دالأتاي', example_latin: 'Bghit wa7d lkas dlatay', example_english: 'I want a glass of tea' },
      { id: 2, arabic: 'قهوة', latin: '9hwa', english: 'Coffee', example_arabic: 'بغيت واحد القهوة نص نص', example_latin: 'Bghit wa7d l9hwa nss nss', example_english: 'I want a half-half coffee' },
      { id: 3, arabic: 'حليب', latin: '7lib', english: 'Milk', example_arabic: 'كنشرب الحليب فالصباح', example_latin: 'Kanshrb l7lib fssba7', example_english: 'I drink milk in the morning' },
      { id: 4, arabic: 'ماء', latin: 'Ma', english: 'Water', example_arabic: 'عطيني شوية دالما', example_latin: '3tini chwiya dlma', example_english: 'Give me some water' },
      { id: 5, arabic: 'سكر', latin: 'Sukkar', english: 'Sugar', example_arabic: 'بلا سكر عافاك', example_latin: 'Bla sukkar 3afak', example_english: 'Without sugar please' },
      { id: 6, arabic: 'خبز', latin: 'Khobz', english: 'Bread', example_arabic: 'المغاربة كياكلو الخبز بزاف', example_latin: 'Lmgharba kayaklo lkhobz bzzaf', example_english: 'Moroccans eat a lot of bread' },
    ],
    grammar: [
      {
        title: "Expressing 'I want' with 'bghit'",
        explanation: '"bghit" (I want) is essential for ordering. Conjugation: bghit (I), bghiti (you), bgha (he), bghat (she).',
        examples: [
          { arabic: 'بغيت واحد القهوة', latin: 'Bghit wa7d l9hwa', english: 'I want a coffee' },
          { arabic: 'أشنو بغيتي؟', latin: 'Ashnu bghiti?', english: 'What do you want?' },
        ],
      },
      {
        title: "Expressing 'I like' with 'kay3jbni'",
        explanation: '"kay3jbni" means "I like" (literally: it pleases me). The liked thing is the subject.',
        examples: [
          { arabic: 'كيعجبني الأتاي', latin: 'Kay3jbni latay', english: 'I like tea' },
          { arabic: 'ما كيعجبنيش الحليب', latin: 'Ma kay3jbnish l7lib', english: "I don't like milk" },
        ],
      },
    ],
    phrases: [
      { arabic: 'بغيت واحد الكاس دالأتاي', latin: 'Bghit wa7d lkas dlatay', english: 'I want a glass of tea', context: 'Ordering tea' },
      { arabic: 'قهوة نص نص عافاك', latin: '9hwa nss nss 3afak', english: 'Half-half coffee please', context: 'Ordering coffee with milk' },
      { arabic: 'بلا سكر', latin: 'Bla sukkar', english: 'Without sugar', context: 'Specifying preference' },
      { arabic: 'واحد الما عافاك', latin: 'Wa7d lma 3afak', english: 'A water please', context: 'Ordering water' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you order tea in Darija?', options: ['Bghit wa7d lkas dlatay', 'Bghit wa7d l9hwa', '3tini lma', 'Bghit lkhobz'], correct: 0 },
      { type: 'multiple_choice', question: 'What is "9hwa nss nss"?', options: ['Half coffee, half milk', 'Black coffee', 'Iced coffee', 'Espresso'], correct: 0 },
      { type: 'fill_blank', sentence: 'Bghit wa7d l9hwa _____ sukkar', answer: 'bla', english: 'I want a coffee _____ sugar' },
    ],
  },

  10: {
    id: 10,
    title: 'Restaurant Phrases',
    level: 'A2',
    module: 'Food & Drink',
    vocabulary: [
      { id: 1, arabic: 'بنين', latin: 'Bnin', english: 'Delicious', example_arabic: 'بنين بزاف!', example_latin: 'Bnin bzzaf!', example_english: 'Very delicious!' },
      { id: 2, arabic: 'لحم', latin: 'L7m', english: 'Meat', example_arabic: 'اللحم غالي هاد الأيام', example_latin: 'Ll7m ghali had layam', example_english: 'Meat is expensive these days' },
      { id: 3, arabic: 'دجاج', latin: 'Djaj', english: 'Chicken', example_arabic: 'طاجين الدجاج بنين', example_latin: 'Tajin ddjaj bnin', example_english: 'Chicken tagine is delicious' },
      { id: 4, arabic: 'حوت', latin: '7ut', english: 'Fish', example_arabic: 'الحوت طري من الصويرة', example_latin: 'L7ut tri mn sswira', example_english: 'The fish is fresh from Essaouira' },
      { id: 5, arabic: 'بيض', latin: 'Bid', english: 'Eggs', example_arabic: 'بغيت جوج دالبيض', example_latin: 'Bghit jouj dlbid', example_english: 'I want two eggs' },
      { id: 6, arabic: 'زيت', latin: 'Zit', english: 'Oil (olive oil)', example_arabic: 'زيت الزيتون مغربي', example_latin: 'Zit zzitun mghribi', example_english: 'Moroccan olive oil' },
    ],
    grammar: [
      {
        title: "Partitive 'dyal/d' with Food",
        explanation: 'Use "dyal" or "d" between quantity and food item: "chwiya d-sukkar" (a little sugar), "bzzaf d-l7m" (a lot of meat).',
        examples: [
          { arabic: 'شوية ديال السكر', latin: 'Chwiya dyal ssukkar', english: 'A little sugar' },
          { arabic: 'بزاف ديال الماء', latin: 'Bzzaf dyal lma', english: 'A lot of water' },
        ],
      },
      {
        title: 'Negating Food Preferences',
        explanation: 'Use "ma...sh" around the verb: "ma bghitsh" (I don\'t want), "ma kay3jbnish" (I don\'t like).',
        examples: [
          { arabic: 'ما بغيتش اللحم', latin: 'Ma bghitsh ll7m', english: "I don't want meat" },
          { arabic: 'ما كيعجبنيش الحوت', latin: 'Ma kay3jbnish l7ut', english: "I don't like fish" },
        ],
      },
    ],
    phrases: [
      { arabic: 'بالصحة و الراحة', latin: 'Bssa7a w rra7a', english: 'Enjoy your meal (bon appetit)', context: 'Said to someone eating' },
      { arabic: 'الله يعطيك الصحة', latin: 'Allah y3tik ssa7a', english: 'Bless your hands', context: 'Thanking the cook' },
      { arabic: 'بنين بزاف!', latin: 'Bnin bzzaf!', english: 'Very delicious!', context: 'Complimenting food' },
      { arabic: 'أشنو عندكم اليوم؟', latin: 'Ashnu 3ndkom lyoum?', english: 'What do you have today?', context: 'At a restaurant' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "delicious" in Darija?', options: ['Bnin', 'Ghali', 'Kbir', 'Mzyan'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "bssa7a w rra7a" mean?', options: ['Enjoy your meal', 'Thank you', 'Goodbye', 'Welcome'], correct: 0 },
      { type: 'fill_blank', sentence: 'Tajin ddjaj _____ !', answer: 'bnin', english: 'Chicken tagine is _____ !' },
    ],
  },

  11: {
    id: 11,
    title: 'Moroccan Dishes',
    level: 'A2',
    module: 'Food & Drink',
    vocabulary: [
      { id: 1, arabic: 'طاجين', latin: 'Tajin', english: 'Tagine', example_arabic: 'الطاجين ديال ماما بنين', example_latin: 'Ttajin dyal mama bnin', example_english: "Mom's tagine is delicious" },
      { id: 2, arabic: 'كسكس', latin: 'Kuskus', english: 'Couscous', example_arabic: 'كناكلو الكسكس نهار الجمعة', example_latin: 'Kanaklo lkuskus nhar jjm3a', example_english: 'We eat couscous on Friday' },
      { id: 3, arabic: 'حريرة', latin: '7rira', english: 'Harira (soup)', example_arabic: 'الحريرة ديال رمضان', example_latin: 'L7rira dyal rmdan', example_english: 'Ramadan harira' },
      { id: 4, arabic: 'بسطيلة', latin: 'Bastila', english: 'Bastilla (pie)', example_arabic: 'البسطيلة مغربية تقليدية', example_latin: 'Lbastila mghribiya t9lidiya', example_english: 'Bastilla is a traditional Moroccan dish' },
      { id: 5, arabic: 'مسمن', latin: 'Msmn', english: 'Msemen (flatbread)', example_arabic: 'المسمن بالعسل بنين', example_latin: 'Lmsmn bl3sl bnin', example_english: 'Msemen with honey is delicious' },
      { id: 6, arabic: 'رفيسة', latin: 'Rfisa', english: 'Rfissa', example_arabic: 'الرفيسة كيتصاوب فالمناسبات', example_latin: 'Rrfisa kaytsawb flmunasabat', example_english: 'Rfissa is made for special occasions' },
    ],
    grammar: [
      {
        title: 'Talking About Meals and Days',
        explanation: 'Use "nhar" (day of) + day name to talk about when you eat certain meals. "Kanaklo" (we eat) is the first person plural present.',
        examples: [
          { arabic: 'كناكلو الكسكس نهار الجمعة', latin: 'Kanaklo lkuskus nhar jjm3a', english: 'We eat couscous on Friday' },
          { arabic: 'كناكلو الحريرة ف رمضان', latin: 'Kanaklo l7rira f rmdan', english: 'We eat harira during Ramadan' },
        ],
      },
      {
        title: 'Describing Food with Adjectives',
        explanation: 'Common food adjectives: bnin (delicious), skhun (hot), bard (cold), tri (fresh), yabs (dry).',
        examples: [
          { arabic: 'الطاجين سخون و بنين', latin: 'Ttajin skhun w bnin', english: 'The tagine is hot and delicious' },
          { arabic: 'الحوت طري', latin: 'L7ut tri', english: 'The fish is fresh' },
        ],
      },
    ],
    phrases: [
      { arabic: 'كناكلو الكسكس نهار الجمعة', latin: 'Kanaklo lkuskus nhar jjm3a', english: 'We eat couscous on Friday', context: 'Moroccan tradition' },
      { arabic: 'الطاجين ديال ماما بنين بزاف', latin: 'Ttajin dyal mama bnin bzzaf', english: "Mom's tagine is very delicious", context: 'Complimenting family cooking' },
      { arabic: 'بغيت نجرب المأكلة المغربية', latin: 'Bghit njrrb lmakla lmghribiya', english: 'I want to try Moroccan food', context: 'As a visitor' },
      { arabic: 'واش فيه الحار؟', latin: 'Wash fih l7arr?', english: 'Is it spicy?', context: 'Asking about a dish' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'When do Moroccans traditionally eat couscous?', options: ['Friday', 'Monday', 'Every day', 'Saturday'], correct: 0 },
      { type: 'multiple_choice', question: 'What is "7rira"?', options: ['A traditional soup', 'A type of bread', 'A meat dish', 'A dessert'], correct: 0 },
      { type: 'fill_blank', sentence: 'Kanaklo lkuskus nhar _____', answer: 'jjm3a', english: 'We eat couscous on _____' },
    ],
  },

  12: {
    id: 12,
    title: 'My Morning',
    level: 'B1',
    module: 'Daily Routines',
    vocabulary: [
      { id: 1, arabic: 'كنفيق', latin: 'Kanfi9', english: 'I wake up', example_arabic: 'كنفيق مع الفجر', example_latin: 'Kanfi9 m3a lfjer', example_english: 'I wake up at dawn' },
      { id: 2, arabic: 'كنتسبن', latin: 'Kantsbn', english: 'I shower', example_arabic: 'كنتسبن كل صباح', example_latin: 'Kantsbn kol sba7', example_english: 'I shower every morning' },
      { id: 3, arabic: 'كنفطر', latin: 'Kanftr', english: 'I have breakfast', example_arabic: 'كنفطر بالخبز و الأتاي', example_latin: 'Kanftr blkhobz w latay', example_english: 'I have breakfast with bread and tea' },
      { id: 4, arabic: 'كنخرج', latin: 'Kankhrj', english: 'I go out / leave', example_arabic: 'كنخرج من الدار فالتمنية', example_latin: 'Kankhrj mn ddar ftmnya', example_english: 'I leave the house at eight' },
      { id: 5, arabic: 'الصباح', latin: 'Ssba7', english: 'Morning', example_arabic: 'فالصباح بكري', example_latin: 'Fssba7 bkri', example_english: 'Early in the morning' },
      { id: 6, arabic: 'كل يوم', latin: 'Kol yum', english: 'Every day', example_arabic: 'كنمشي للخدمة كل يوم', example_latin: 'Kanmshi llkhdma kol yum', example_english: 'I go to work every day' },
    ],
    grammar: [
      {
        title: 'Present Tense with "kan-"',
        explanation: 'The present tense in Darija uses the prefix "kan-" (I do regularly). Conjugation: kan- (I), kat- (you), kay- (he), kat- (she), kan- (we), kat- (you-pl), kay- (they).',
        examples: [
          { arabic: 'كنفيق فالسبعة', latin: 'Kanfi9 fssb3a', english: 'I wake up at seven' },
          { arabic: 'كيخدم فالبانكا', latin: 'Kaykhdem flbanka', english: 'He works at the bank' },
        ],
      },
      {
        title: 'Expressing Time',
        explanation: 'Use "f" + number to express clock time. "Fssb3a" (at seven), "ftmnya" (at eight). Add "w nss" for half past.',
        examples: [
          { arabic: 'كنخرج فالتمنية و نص', latin: 'Kankhrj ftmnya w nss', english: 'I leave at eight thirty' },
          { arabic: 'كنفطر فالسبعة', latin: 'Kanftr fssb3a', english: 'I have breakfast at seven' },
        ],
      },
    ],
    phrases: [
      { arabic: 'كنفيق بكري', latin: 'Kanfi9 bkri', english: 'I wake up early', context: 'Describing morning routine' },
      { arabic: 'كنفطر بالخبز و الأتاي', latin: 'Kanftr blkhobz w latay', english: 'I have bread and tea for breakfast', context: 'Typical Moroccan breakfast' },
      { arabic: 'كنمشي للخدمة فالتمنية', latin: 'Kanmshi llkhdma ftmnya', english: 'I go to work at eight', context: 'Daily commute' },
      { arabic: 'كنرجع للدار فالعشية', latin: 'Kanrj3 lddar fl3shiya', english: 'I return home in the evening', context: 'End of day' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'What prefix is used for "I do" in present tense?', options: ['kan-', 'kay-', 'kat-', 'ka-'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "kanfi9 bkri" mean?', options: ['I wake up early', 'I eat breakfast', 'I go to work', 'I sleep late'], correct: 0 },
      { type: 'fill_blank', sentence: '_____ blkhobz w latay', answer: 'Kanftr', english: 'I have breakfast with bread and tea' },
    ],
  },

  13: {
    id: 13,
    title: 'At Work/School',
    level: 'B1',
    module: 'Daily Routines',
    vocabulary: [
      { id: 1, arabic: 'خدمة', latin: 'Khdma', english: 'Work / Job', example_arabic: 'كنمشي للخدمة كل يوم', example_latin: 'Kanmshi llkhdma kol yum', example_english: 'I go to work every day' },
      { id: 2, arabic: 'كنقرا', latin: 'Kan9ra', english: 'I study / I read', example_arabic: 'كنقرا فالجامعة', example_latin: 'Kan9ra fljami3a', example_english: 'I study at university' },
      { id: 3, arabic: 'أستاذ', latin: 'Ostad', english: 'Teacher / Professor', example_arabic: 'الأستاذ مزيان', example_latin: 'Lostad mzyan', example_english: 'The teacher is good' },
      { id: 4, arabic: 'جامعة', latin: 'Jami3a', english: 'University', example_arabic: 'كنقرا فالجامعة ديال الرباط', example_latin: 'Kan9ra fljami3a dyal rrbat', example_english: 'I study at the university of Rabat' },
      { id: 5, arabic: 'مدرسة', latin: 'Mdrasa', english: 'School', example_arabic: 'الولاد كيمشيو للمدرسة', example_latin: 'Lwlad kaymshiw lmdrasa', example_english: 'The kids go to school' },
      { id: 6, arabic: 'كنخدم', latin: 'Kankhdm', english: 'I work', example_arabic: 'كنخدم فشركة كبيرة', example_latin: 'Kankhdm f shrka kbira', example_english: 'I work at a big company' },
    ],
    grammar: [
      {
        title: 'Talking About Occupations',
        explanation: 'In Darija, state your job without "to be": "ana tbib" (I\'m a doctor), "ana mohandis" (I\'m an engineer).',
        examples: [
          { arabic: 'أنا مهندس', latin: 'Ana muhandis', english: 'I am an engineer' },
          { arabic: 'هي طبيبة', latin: 'Hiya tbiba', english: 'She is a doctor' },
        ],
      },
      {
        title: 'Location with "f" (in/at)',
        explanation: 'Use "f" to indicate location: "f ljami3a" (at university), "f shrka" (at a company), "f ddar" (at home).',
        examples: [
          { arabic: 'كنخدم ف بانكا', latin: 'Kankhdm f banka', english: 'I work at a bank' },
          { arabic: 'كنقرا ف المدرسة', latin: 'Kan9ra f lmdrasa', english: 'I study at school' },
        ],
      },
    ],
    phrases: [
      { arabic: 'أشنو كتخدم؟', latin: 'Ashnu katkhdm?', english: 'What do you do for work?', context: 'Asking about occupation' },
      { arabic: 'كنخدم فشركة كبيرة', latin: 'Kankhdm f shrka kbira', english: 'I work at a big company', context: 'Describing work' },
      { arabic: 'كنقرا فالجامعة', latin: 'Kan9ra fljami3a', english: 'I study at university', context: 'Student life' },
      { arabic: 'عندي اجتماع اليوم', latin: '3ndi ijtima3 lyoum', english: 'I have a meeting today', context: 'Work schedule' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you ask "What do you do for work?"', options: ['Ashnu katkhdm?', 'Fin katkhdm?', 'Kifash katkhdm?', '3lash katkhdm?'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "kan9ra fljami3a" mean?', options: ['I study at university', 'I work at a company', 'I go to school', 'I read books'], correct: 0 },
      { type: 'fill_blank', sentence: '_____ f shrka kbira', answer: 'Kankhdm', english: 'I work at a big company' },
    ],
  },

  14: {
    id: 14,
    title: 'Evening & Weekend',
    level: 'B1',
    module: 'Daily Routines',
    vocabulary: [
      { id: 1, arabic: 'العشية', latin: "L3shiya", english: 'Evening / Afternoon', example_arabic: 'كنرجع فالعشية', example_latin: "Kanrj3 fl3shiya", example_english: 'I come back in the evening' },
      { id: 2, arabic: 'الليل', latin: 'Llil', english: 'Night', example_arabic: 'كنعس بكري فالليل', example_latin: 'Kan3ss bkri fllil', example_english: 'I sleep early at night' },
      { id: 3, arabic: 'ويكاند', latin: 'Wikand', english: 'Weekend', example_arabic: 'فالويكاند كنرتاح', example_latin: 'Flwikand kanrta7', example_english: 'On weekends I rest' },
      { id: 4, arabic: 'كنرتاح', latin: 'Kanrta7', english: 'I rest / relax', example_arabic: 'كنرتاح فالدار', example_latin: 'Kanrta7 fddar', example_english: 'I relax at home' },
      { id: 5, arabic: 'كنتفرج', latin: 'Kantfrj', english: 'I watch', example_arabic: 'كنتفرج فالتلفزة', example_latin: 'Kantfrj ftlvza', example_english: 'I watch TV' },
      { id: 6, arabic: 'كنلعب', latin: 'Kanl3b', english: 'I play', example_arabic: 'كنلعب الكورة مع صحابي', example_latin: 'Kanl3b lkora m3a s7abi', example_english: 'I play football with my friends' },
    ],
    grammar: [
      {
        title: 'Time Expressions',
        explanation: 'Common time expressions: fssba7 (in the morning), fl3shiya (in the evening), fllil (at night), flwikand (on weekends), kol yum (every day).',
        examples: [
          { arabic: 'فالصباح كنخدم، فالعشية كنرتاح', latin: "Fssba7 kankhdm, fl3shiya kanrta7", english: 'In the morning I work, in the evening I rest' },
          { arabic: 'فالويكاند كنخرج مع صحابي', latin: 'Flwikand kankhrj m3a s7abi', english: 'On weekends I go out with friends' },
        ],
      },
      {
        title: 'Listing Activities with "w" (and)',
        explanation: 'Use "w" (and) to connect activities. Use "olla" (or) for alternatives.',
        examples: [
          { arabic: 'كنتفرج و كناكل و كنرتاح', latin: 'Kantfrj w kanakl w kanrta7', english: 'I watch TV and eat and relax' },
          { arabic: 'كنلعب الكورة ولا كنقرا', latin: 'Kanl3b lkora wlla kan9ra', english: 'I play football or I read' },
        ],
      },
    ],
    phrases: [
      { arabic: 'فالعشية كنرتاح', latin: "Fl3shiya kanrta7", english: 'In the evening I relax', context: 'Describing evening routine' },
      { arabic: 'كنتفرج فالتلفزة فالليل', latin: 'Kantfrj ftlvza fllil', english: 'I watch TV at night', context: 'Night routine' },
      { arabic: 'كنلعب الكورة فالويكاند', latin: 'Kanl3b lkora flwikand', english: 'I play football on weekends', context: 'Weekend activity' },
      { arabic: 'كنخرج مع صحابي', latin: 'Kankhrj m3a s7abi', english: 'I go out with my friends', context: 'Social life' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "I rest/relax" in Darija?', options: ['Kanrta7', 'Kankhdm', 'Kankhrj', 'Kanfi9'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "flwikand" mean?', options: ['On weekends', 'In the evening', 'At night', 'In the morning'], correct: 0 },
      { type: 'fill_blank', sentence: '_____ lkora m3a s7abi', answer: 'Kanl3b', english: 'I play football with my friends' },
    ],
  },

  15: {
    id: 15,
    title: 'Asking for Directions',
    level: 'B1',
    module: 'Getting Around',
    vocabulary: [
      { id: 1, arabic: 'فين', latin: 'Fin', english: 'Where', example_arabic: 'فين كاين المحطة؟', example_latin: 'Fin kayn lm7tta?', example_english: 'Where is the station?' },
      { id: 2, arabic: 'سير نيشان', latin: 'Sir nishan', english: 'Go straight', example_arabic: 'سير نيشان ثم دور على اليمين', example_latin: 'Sir nishan tmma dur 3la lymin', example_english: 'Go straight then turn right' },
      { id: 3, arabic: 'دور على اليمين', latin: 'Dur 3la lymin', english: 'Turn right', example_arabic: 'دور على اليمين من بعد المسجد', example_latin: 'Dur 3la lymin mn b3d lmsjid', example_english: 'Turn right after the mosque' },
      { id: 4, arabic: 'دور على اليسار', latin: 'Dur 3la lisar', english: 'Turn left', example_arabic: 'دور على اليسار فالضو', example_latin: 'Dur 3la lisar fddo', example_english: 'Turn left at the traffic light' },
      { id: 5, arabic: 'قريب', latin: '9rib', english: 'Close / Near', example_arabic: 'المحطة قريبة من هنا', example_latin: 'Lm7tta 9riba mn hna', example_english: 'The station is close from here' },
      { id: 6, arabic: 'بعيد', latin: 'B3id', english: 'Far', example_arabic: 'المطار بعيد شوية', example_latin: 'Lmatar b3id chwiya', example_english: 'The airport is a bit far' },
    ],
    grammar: [
      {
        title: 'Asking Where with "fin"',
        explanation: '"Fin" (where) + "kayn" (is there / exists) is the pattern for asking locations. "Fin kayn...?" (Where is...?).',
        examples: [
          { arabic: 'فين كاين الحمام؟', latin: 'Fin kayn l7ammam?', english: 'Where is the bathroom?' },
          { arabic: 'فين كاينة الصيدلية؟', latin: 'Fin kayna ssaydaliya?', english: 'Where is the pharmacy?' },
        ],
      },
      {
        title: 'Imperative for Directions',
        explanation: 'Use imperative verbs for directions: "sir" (go), "dur" (turn), "w9f" (stop), "tl3" (go up), "hbt" (go down).',
        examples: [
          { arabic: 'سير نيشان و من بعد دور على اليمين', latin: 'Sir nishan w mn b3d dur 3la lymin', english: 'Go straight and then turn right' },
          { arabic: 'هبط من هنا', latin: 'Hbt mn hna', english: 'Go down from here' },
        ],
      },
    ],
    phrases: [
      { arabic: 'فين كاين المحطة عافاك؟', latin: 'Fin kayn lm7tta 3afak?', english: 'Where is the station please?', context: 'Asking for a location' },
      { arabic: 'سير نيشان ثم دور على اليمين', latin: 'Sir nishan tmma dur 3la lymin', english: 'Go straight then turn right', context: 'Giving directions' },
      { arabic: 'واش بعيدة من هنا؟', latin: 'Wash b3ida mn hna?', english: 'Is it far from here?', context: 'Checking distance' },
      { arabic: 'شكرا، الله يخليك', latin: 'Choukran, allah ykhllik', english: 'Thank you, God bless', context: 'Thanking for directions' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you ask "Where is the station?"', options: ['Fin kayn lm7tta?', 'Ashnu lm7tta?', 'Kifash lm7tta?', 'Sh7al lm7tta?'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "sir nishan" mean?', options: ['Go straight', 'Turn right', 'Turn left', 'Stop'], correct: 0 },
      { type: 'fill_blank', sentence: '_____ 3la lymin mn b3d lmsjid', answer: 'Dur', english: 'Turn right after the mosque' },
    ],
  },

  16: {
    id: 16,
    title: 'Taking a Taxi',
    level: 'B1',
    module: 'Getting Around',
    vocabulary: [
      { id: 1, arabic: 'طاكسي', latin: 'Taxi', english: 'Taxi', example_arabic: 'بغيت ناخد طاكسي', example_latin: 'Bghit nakhd taxi', example_english: 'I want to take a taxi' },
      { id: 2, arabic: 'كونطور', latin: 'Kontor', english: 'Meter (taxi)', example_arabic: 'شعل الكونطور عافاك', example_latin: 'Sh3l lkontor 3afak', example_english: 'Turn on the meter please' },
      { id: 3, arabic: 'وقف هنا', latin: 'W9f hna', english: 'Stop here', example_arabic: 'وقف هنا عافاك', example_latin: 'W9f hna 3afak', example_english: 'Stop here please' },
      { id: 4, arabic: 'دير ليا', latin: 'Dir lia', english: 'Take me to', example_arabic: 'دير ليا للمحطة', example_latin: 'Dir lia llm7tta', example_english: 'Take me to the station' },
      { id: 5, arabic: 'محطة', latin: 'M7tta', english: 'Station', example_arabic: 'بغيت نمشي للمحطة', example_latin: 'Bghit nmshi llm7tta', example_english: 'I want to go to the station' },
      { id: 6, arabic: 'مطار', latin: 'Matar', english: 'Airport', example_arabic: 'دير ليا للمطار', example_latin: 'Dir lia llmatar', example_english: 'Take me to the airport' },
    ],
    grammar: [
      {
        title: 'Imperative Requests',
        explanation: 'Use imperative verbs for taxi requests: "dir lia" (take me), "w9f" (stop), "sh3l" (turn on), "sir" (go).',
        examples: [
          { arabic: 'دير ليا للمحطة عافاك', latin: 'Dir lia llm7tta 3afak', english: 'Take me to the station please' },
          { arabic: 'وقف هنا', latin: 'W9f hna', english: 'Stop here' },
        ],
      },
      {
        title: 'Destination with "l" (to)',
        explanation: 'Use "l" or "ll" (to) before the destination: "llm7tta" (to the station), "llmatar" (to the airport).',
        examples: [
          { arabic: 'بغيت نمشي للمدينة القديمة', latin: 'Bghit nmshi llmdina l9dima', english: 'I want to go to the old city' },
          { arabic: 'دير ليا لسوق', latin: 'Dir lia lssu9', english: 'Take me to the market' },
        ],
      },
    ],
    phrases: [
      { arabic: 'دير ليا للمحطة عافاك', latin: 'Dir lia llm7tta 3afak', english: 'Take me to the station please', context: 'Getting in a taxi' },
      { arabic: 'شعل الكونطور', latin: 'Sh3l lkontor', english: 'Turn on the meter', context: 'Requesting fair fare' },
      { arabic: 'بشحال للمطار؟', latin: 'Bsh7al llmatar?', english: 'How much to the airport?', context: 'Negotiating fare' },
      { arabic: 'وقف هنا عافاك', latin: 'W9f hna 3afak', english: 'Stop here please', context: 'Arriving at destination' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "Take me to the station"?', options: ['Dir lia llm7tta', 'Sir llm7tta', 'Fin lm7tta?', 'Bghit lm7tta'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "sh3l lkontor" mean?', options: ['Turn on the meter', 'Stop here', 'Go faster', 'Turn right'], correct: 0 },
      { type: 'fill_blank', sentence: '_____ hna 3afak', answer: 'W9f', english: 'Stop here please' },
    ],
  },

  17: {
    id: 17,
    title: 'City Landmarks',
    level: 'B1',
    module: 'Getting Around',
    vocabulary: [
      { id: 1, arabic: 'مسجد', latin: 'Msjid', english: 'Mosque', example_arabic: 'المسجد قريب من هنا', example_latin: 'Lmsjid 9rib mn hna', example_english: 'The mosque is close from here' },
      { id: 2, arabic: 'المدينة القديمة', latin: 'Lmdina l9dima', english: 'Old medina', example_arabic: 'المدينة القديمة زوينة بزاف', example_latin: 'Lmdina l9dima zwina bzzaf', example_english: 'The old medina is very beautiful' },
      { id: 3, arabic: 'صيدلية', latin: 'Saydaliya', english: 'Pharmacy', example_arabic: 'فين كاينة الصيدلية؟', example_latin: 'Fin kayna ssaydaliya?', example_english: 'Where is the pharmacy?' },
      { id: 4, arabic: 'سبيطار', latin: 'Sbitar', english: 'Hospital', example_arabic: 'السبيطار بعيد', example_latin: 'Ssbitar b3id', example_english: 'The hospital is far' },
      { id: 5, arabic: 'بنكة', latin: 'Banka', english: 'Bank', example_arabic: 'بغيت نمشي للبنكة', example_latin: 'Bghit nmshi llbanka', example_english: 'I want to go to the bank' },
      { id: 6, arabic: 'رياض', latin: 'Ryad', english: 'Riad (traditional house)', example_arabic: 'كنسكنو فرياض فالمدينة القديمة', example_latin: 'Kanskno f ryad flmdina l9dima', example_english: 'We stay in a riad in the old medina' },
    ],
    grammar: [
      {
        title: 'Describing Places',
        explanation: 'Use adjectives after place nouns. Use "kayn/kayna" (there is, m/f) to indicate existence.',
        examples: [
          { arabic: 'كاينة صيدلية قريبة من هنا', latin: 'Kayna saydaliya 9riba mn hna', english: 'There is a pharmacy close to here' },
          { arabic: 'المدينة القديمة زوينة', latin: 'Lmdina l9dima zwina', english: 'The old medina is beautiful' },
        ],
      },
      {
        title: 'Proximity with "7da" and "9rib mn"',
        explanation: '"7da" means next to. "9rib mn" means close to. "b3id mn" means far from.',
        examples: [
          { arabic: 'البنكة حدا المسجد', latin: 'Lbanka 7da lmsjid', english: 'The bank is next to the mosque' },
          { arabic: 'السبيطار بعيد من هنا', latin: 'Ssbitar b3id mn hna', english: 'The hospital is far from here' },
        ],
      },
    ],
    phrases: [
      { arabic: 'فين كاين المسجد الكبير؟', latin: 'Fin kayn lmsjid lkbir?', english: 'Where is the big mosque?', context: 'Asking for landmark' },
      { arabic: 'المدينة القديمة زوينة بزاف', latin: 'Lmdina l9dima zwina bzzaf', english: 'The old medina is very beautiful', context: 'Describing a place' },
      { arabic: 'واش كاينة شي صيدلية هنا قريب؟', latin: 'Wash kayna shi saydaliya hna 9rib?', english: 'Is there a pharmacy nearby?', context: 'Looking for services' },
      { arabic: 'حدا ساحة جامع الفنا', latin: '7da sa7t jama3 lfna', english: 'Next to Jemaa el-Fna square', context: 'Giving location reference' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'What is "lmdina l9dima"?', options: ['Old medina', 'New city', 'City center', 'Market'], correct: 0 },
      { type: 'multiple_choice', question: 'How do you say "next to" in Darija?', options: ['7da', '9rib', 'b3id', 'f'], correct: 0 },
      { type: 'fill_blank', sentence: 'Fin kayn _____ lkbir?', answer: 'lmsjid', english: 'Where is the big mosque?' },
    ],
  },

  18: {
    id: 18,
    title: 'Sharing Opinions',
    level: 'B2',
    module: 'Conversations & Opinions',
    vocabulary: [
      { id: 1, arabic: 'كنظن', latin: 'Kandnn', english: 'I think', example_arabic: 'كنظن هادشي مزيان', example_latin: 'Kandnn hadshi mzyan', example_english: 'I think this is good' },
      { id: 2, arabic: 'فرأيي', latin: 'F ra\'yi', english: 'In my opinion', example_arabic: 'فرأيي، خاصنا نبدلو', example_latin: "F ra'yi, khasna nbdlo", example_english: 'In my opinion, we need to change' },
      { id: 3, arabic: 'واخا ولكن', latin: 'Wakha walakin', english: 'Okay but / However', example_arabic: 'واخا ولكن ما موافقش', example_latin: 'Wakha walakin ma mwaf9sh', example_english: "Okay but I don't agree" },
      { id: 4, arabic: 'موافق', latin: 'Mwaf9', english: 'I agree', example_arabic: 'أنا موافق معاك', example_latin: 'Ana mwaf9 m3ak', example_english: 'I agree with you' },
      { id: 5, arabic: 'ما موافقش', latin: 'Ma mwaf9sh', english: "I don't agree", example_arabic: 'ما موافقش على هادشي', example_latin: 'Ma mwaf9sh 3la hadshi', example_english: "I don't agree with this" },
      { id: 6, arabic: 'عندي فكرة', latin: '3ndi fikra', english: 'I have an idea', example_arabic: 'عندي فكرة مزيانة', example_latin: '3ndi fikra mzyana', example_english: 'I have a good idea' },
    ],
    grammar: [
      {
        title: 'Expressing Opinions',
        explanation: 'Use "kandnn" (I think), "f ra\'yi" (in my opinion), "bnasbali" (as for me) to share your views.',
        examples: [
          { arabic: 'كنظن بلي هادشي صحيح', latin: 'Kandnn bli hadshi s7i7', english: 'I think this is correct' },
          { arabic: 'بالنسبة ليا، هادا أحسن حل', latin: 'Bnasba lia, hada a7sn 7all', english: 'As for me, this is the best solution' },
        ],
      },
      {
        title: 'Expressing Agreement and Disagreement',
        explanation: '"Mwaf9" (I agree) and "ma mwaf9sh" (I disagree). Add "m3ak" (with you) for direction.',
        examples: [
          { arabic: 'أنا موافق معاك تماماً', latin: 'Ana mwaf9 m3ak tamaman', english: 'I completely agree with you' },
          { arabic: 'سمح ليا، ما موافقش', latin: 'Sm7 lia, ma mwaf9sh', english: "Sorry, I don't agree" },
        ],
      },
    ],
    phrases: [
      { arabic: 'كنظن بلي هادشي صحيح', latin: 'Kandnn bli hadshi s7i7', english: 'I think this is correct', context: 'Sharing opinion' },
      { arabic: 'أنا موافق معاك', latin: 'Ana mwaf9 m3ak', english: 'I agree with you', context: 'Expressing agreement' },
      { arabic: 'سمح ليا، ما موافقش', latin: 'Sm7 lia, ma mwaf9sh', english: "Sorry, I don't agree", context: 'Polite disagreement' },
      { arabic: 'أشنو رأيك؟', latin: "Ashnu ra'yk?", english: 'What do you think?', context: 'Asking for opinion' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "I think" in Darija?', options: ['Kandnn', 'Kan9ra', 'Kankhdm', 'Kanfi9'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "ma mwaf9sh" mean?', options: ["I don't agree", "I don't know", "I don't want", "I don't understand"], correct: 0 },
      { type: 'fill_blank', sentence: 'Ana _____ m3ak', answer: 'mwaf9', english: 'I agree with you' },
    ],
  },

  19: {
    id: 19,
    title: 'Agreeing & Disagreeing',
    level: 'B2',
    module: 'Conversations & Opinions',
    vocabulary: [
      { id: 1, arabic: 'صحيح', latin: 'S7i7', english: 'True / Correct', example_arabic: 'هادشي صحيح', example_latin: 'Hadshi s7i7', example_english: 'This is true' },
      { id: 2, arabic: 'غلط', latin: 'Ghlt', english: 'Wrong / Incorrect', example_arabic: 'لا، هادشي غلط', example_latin: 'La, hadshi ghlt', example_english: 'No, this is wrong' },
      { id: 3, arabic: 'بصح', latin: 'Bs7', english: 'But / However', example_arabic: 'مزيان بصح صعيب', example_latin: 'Mzyan bs7 s3ib', example_english: 'Good but difficult' },
      { id: 4, arabic: 'حتى أنا', latin: '7tta ana', english: 'Me too', example_arabic: 'حتى أنا كنظن هكاك', example_latin: '7tta ana kandnn hakak', example_english: 'I think so too' },
      { id: 5, arabic: 'عندك الحق', latin: '3ndk l7a9', english: "You're right", example_arabic: 'عندك الحق فهادشي', example_latin: '3ndk l7a9 f hadshi', example_english: "You're right about this" },
      { id: 6, arabic: 'بالعكس', latin: 'Bl3ks', english: 'On the contrary', example_arabic: 'بالعكس، أنا كنحب هادشي', example_latin: 'Bl3ks, ana kan7b hadshi', example_english: 'On the contrary, I like this' },
    ],
    grammar: [
      {
        title: 'Strong vs Soft Agreement',
        explanation: 'Strong: "3ndk l7a9" (you\'re right), "tamaman" (exactly). Soft: "mkin" (maybe), "yimkn" (it\'s possible).',
        examples: [
          { arabic: 'عندك الحق، تماماً!', latin: '3ndk l7a9, tamaman!', english: "You're absolutely right!" },
          { arabic: 'يمكن، ما عارفش', latin: 'Yimkn, ma 3arfsh', english: "Maybe, I don't know" },
        ],
      },
      {
        title: 'Conceding with "wakha...bs7"',
        explanation: 'Use "wakha...bs7" (although/even though...but) to concede a point while disagreeing.',
        examples: [
          { arabic: 'واخا عندك الحق بصح ما هوش سهل', latin: 'Wakha 3ndk l7a9 bs7 ma hwash shl', english: "You're right but it's not easy" },
          { arabic: 'واخا مزيان بصح غالي', latin: 'Wakha mzyan bs7 ghali', english: "It's good but expensive" },
        ],
      },
    ],
    phrases: [
      { arabic: 'عندك الحق!', latin: '3ndk l7a9!', english: "You're right!", context: 'Strong agreement' },
      { arabic: 'حتى أنا كنظن هكاك', latin: '7tta ana kandnn hakak', english: 'I think so too', context: 'Agreement' },
      { arabic: 'مزيان بصح صعيب', latin: 'Mzyan bs7 s3ib', english: 'Good but difficult', context: 'Partial agreement' },
      { arabic: 'ما عمرني سمعت بهادشي', latin: 'Ma 3mrni sm3t bhadshi', english: 'I\'ve never heard of this', context: 'Expressing surprise' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "You\'re right" in Darija?', options: ['3ndk l7a9', '3ndk lw9t', '3ndk lflus', '3ndk l7b'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "bl3ks" mean?', options: ['On the contrary', 'In addition', 'For example', 'In conclusion'], correct: 0 },
      { type: 'fill_blank', sentence: '7tta _____ kandnn hakak', answer: 'ana', english: 'I think so too' },
    ],
  },

  20: {
    id: 20,
    title: 'Current Events',
    level: 'B2',
    module: 'Conversations & Opinions',
    vocabulary: [
      { id: 1, arabic: 'لاخبار', latin: 'Lakhbar', english: 'The news', example_arabic: 'واش شفتي لاخبار؟', example_latin: 'Wash shfti lakhbar?', example_english: 'Did you see the news?' },
      { id: 2, arabic: 'مشكيل', latin: 'Mushkil', english: 'Problem', example_arabic: 'هادا مشكيل كبير', example_latin: 'Hada mushkil kbir', example_english: 'This is a big problem' },
      { id: 3, arabic: 'حل', latin: '7all', english: 'Solution', example_arabic: 'خاصنا نلقاو حل', example_latin: 'Khasna nl9aw 7all', example_english: 'We need to find a solution' },
      { id: 4, arabic: 'تغيير', latin: 'Tghyir', english: 'Change', example_arabic: 'خاص تغيير فهادشي', example_latin: 'Khass tghyir f hadshi', example_english: 'There needs to be change in this' },
      { id: 5, arabic: 'المجتمع', latin: 'Lmujtama3', english: 'Society', example_arabic: 'المجتمع كيتبدل', example_latin: 'Lmujtama3 kaytbdl', example_english: 'Society is changing' },
      { id: 6, arabic: 'مهم', latin: 'Muhimm', english: 'Important', example_arabic: 'هادشي مهم بزاف', example_latin: 'Hadshi muhimm bzzaf', example_english: 'This is very important' },
    ],
    grammar: [
      {
        title: 'Past Tense Overview',
        explanation: 'The past tense in Darija is formed with suffixes: -t (I), -ti (you), no suffix (he), -at (she), -na (we), -tu (you-pl), -u (they).',
        examples: [
          { arabic: 'شفت لاخبار البارح', latin: 'Shft lakhbar lbar7', english: 'I saw the news yesterday' },
          { arabic: 'سمعنا بالمشكيل', latin: 'Sm3na blmushkil', english: 'We heard about the problem' },
        ],
      },
      {
        title: "Expressing Necessity with 'khass'",
        explanation: '"Khass" (it is necessary) + pronoun suffix expresses what needs to happen: "khasna" (we need to), "khassk" (you need to).',
        examples: [
          { arabic: 'خاصنا نتكلمو على هادشي', latin: 'Khasna ntkllmo 3la hadshi', english: 'We need to talk about this' },
          { arabic: 'خاصك تقرا لاخبار', latin: 'Khassk t9ra lakhbar', english: 'You need to read the news' },
        ],
      },
    ],
    phrases: [
      { arabic: 'واش سمعتي بهادشي؟', latin: 'Wash sm3ti bhadshi?', english: 'Have you heard about this?', context: 'Bringing up news' },
      { arabic: 'خاصنا نلقاو حل', latin: 'Khasna nl9aw 7all', english: 'We need to find a solution', context: 'Discussing problems' },
      { arabic: 'المجتمع كيتبدل بزاف', latin: 'Lmujtama3 kaytbdl bzzaf', english: 'Society is changing a lot', context: 'Social commentary' },
      { arabic: 'هادشي مهم بزاف', latin: 'Hadshi muhimm bzzaf', english: 'This is very important', context: 'Emphasizing importance' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'How do you say "We need to" in Darija?', options: ['Khasna', 'Bghina', 'Kandnno', '3ndna'], correct: 0 },
      { type: 'multiple_choice', question: 'What does "lakhbar" mean?', options: ['The news', 'The weather', 'The market', 'The school'], correct: 0 },
      { type: 'fill_blank', sentence: 'Wash sm3ti _____?', answer: 'bhadshi', english: 'Have you heard about this?' },
    ],
  },

  21: {
    id: 21,
    title: 'Debating Topics',
    level: 'B2',
    module: 'Advanced Conversation',
    vocabulary: [
      { id: 1, arabic: 'نقاش', latin: 'Ni9ash', english: 'Discussion / Debate', example_arabic: 'خاص واحد النقاش على هادشي', example_latin: 'Khass wa7d nni9ash 3la hadshi', example_english: 'There needs to be a discussion about this' },
      { id: 2, arabic: 'حجة', latin: '7ujja', english: 'Argument / Point', example_arabic: 'عندك حجة قوية', example_latin: '3ndk 7ujja 9wiya', example_english: 'You have a strong argument' },
      { id: 3, arabic: 'مثلاً', latin: 'Matalan', english: 'For example', example_arabic: 'مثلاً، شوف هادشي', example_latin: 'Matalan, shuf hadshi', example_english: 'For example, look at this' },
      { id: 4, arabic: 'من جهة أخرى', latin: 'Mn jiha okhra', english: 'On the other hand', example_arabic: 'من جهة أخرى، كاين حل آخر', example_latin: 'Mn jiha okhra, kayn 7all akhr', example_english: 'On the other hand, there is another solution' },
      { id: 5, arabic: 'بالضبط', latin: 'Bddbt', english: 'Exactly', example_arabic: 'بالضبط، هادا لي كنقصد', example_latin: 'Bddbt, hada li kan9sd', example_english: 'Exactly, that\'s what I mean' },
      { id: 6, arabic: 'خلاصة', latin: 'Khulasa', english: 'In conclusion', example_arabic: 'خلاصة، خاصنا نخدمو بزاف', example_latin: 'Khulasa, khasna nkhdmo bzzaf', example_english: 'In conclusion, we need to work hard' },
    ],
    grammar: [
      {
        title: 'Structuring an Argument',
        explanation: 'Use connectors: "awwlan" (first), "taniyan" (second), "mn jiha okhra" (on the other hand), "khulasa" (in conclusion).',
        examples: [
          { arabic: 'أولاً، خاصنا نفهمو المشكيل', latin: 'Awwlan, khasna nfhmo lmushkil', english: 'First, we need to understand the problem' },
          { arabic: 'خلاصة، خاص تغيير', latin: 'Khulasa, khass tghyir', english: 'In conclusion, change is needed' },
        ],
      },
      {
        title: 'Conditional with "ila"',
        explanation: '"Ila" (if) introduces conditions. "Ila + past tense" for real conditions, "lukan" for hypothetical.',
        examples: [
          { arabic: 'إلا خدمنا مع بعض غادي ننجحو', latin: 'Ila khdmna m3a b3d ghadi nnj7o', english: 'If we work together, we will succeed' },
          { arabic: 'لوكان عندي الوقت كنمشي', latin: 'Lukan 3ndi lw9t kanmshi', english: 'If I had time, I would go' },
        ],
      },
    ],
    phrases: [
      { arabic: 'عندك حجة قوية', latin: '3ndk 7ujja 9wiya', english: 'You have a strong argument', context: 'Acknowledging a point' },
      { arabic: 'من جهة أخرى...', latin: 'Mn jiha okhra...', english: 'On the other hand...', context: 'Presenting counter-argument' },
      { arabic: 'بالضبط، هادا لي كنقصد', latin: 'Bddbt, hada li kan9sd', english: "Exactly, that's what I mean", context: 'Strong agreement' },
      { arabic: 'خلاصة، خاصنا نتفقو', latin: 'Khulasa, khasna ntf9o', english: 'In conclusion, we need to agree', context: 'Wrapping up discussion' },
    ],
    exercises: [
      { type: 'multiple_choice', question: 'What does "mn jiha okhra" mean?', options: ['On the other hand', 'In my opinion', 'For example', 'In conclusion'], correct: 0 },
      { type: 'multiple_choice', question: 'How do you say "exactly" in Darija?', options: ['Bddbt', 'Mzyan', 'S7i7', 'Wakha'], correct: 0 },
      { type: 'fill_blank', sentence: '_____ , khasna nkhdmo bzzaf', answer: 'Khulasa', english: 'In conclusion, we need to work hard' },
    ],
  },
};

export default MOCK_LESSONS;
