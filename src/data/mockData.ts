import type { Stall, StagePerformance, Facility, EventInfo, FaqItem } from '../types';

export const initialEventInfo: EventInfo = {
  nameJa: '日本文化芸術祭 (JCAF)',
  nameEn: 'Japan Culture & Art Festival (JCAF)',
  taglineJa: '楽しみながら文化に触れ合える体験型の日本祭り',
  taglineEn: 'An Interactive Japanese Festival for Fun and Cultural Discovery',
  datesJa: '2026年11月8日（日）',
  datesEn: 'Sunday, November 8, 2026',
  hoursJa: '11:00 AM - 4:00 PM',
  hoursEn: '11:00 AM - 4:00 PM',
  venueJa: 'Collingwood Town Hall + Djerring Centre (DC) + 公園',
  venueEn: 'Collingwood Town Hall + Djerring Centre (DC) + Park',
  addressJa: '140 Hoddle St, Abbotsford / Collingwood VIC 3067, Australia',
  addressEn: '140 Hoddle St, Abbotsford / Collingwood VIC 3067, Australia',
  admissionJa: '無料',
  admissionEn: 'Free',
  organizerJa: '日本文化芸術祭実行委員会',
  organizerEn: 'JCAF (Japan Culture and Art Festival) Committee',
  logoUrl: '/logo.jpg',
  announcementJa: '日本文化芸術祭へようこそ！2026年11月8日(日) 11:00〜16:00',
  announcementEn: 'Welcome to JCAF 2026! Sunday, Nov 8, 11:00 AM - 4:00 PM.'
};

// 内蔵サンプルデータは全削除（スプレッドシートから動的に読み込みます）
export const initialStalls: Stall[] = [];
export const initialStages: StagePerformance[] = [];
export const initialFacilities: Facility[] = [];

export const initialFaqs: FaqItem[] = [
  {
    questionJa: '入場料はかかりますか？チケットは必要ですか？',
    questionEn: 'Is there an admission fee? Do I need a ticket?',
    answerJa: 'フェスティバルへの入場は無料です。事前チケットも不要ですので、どなたでもご自由にお越しいただけます。各ブースでの飲食・物販・ワークショップ参加料は現地にてお支払いください。無料で体験できるワークショップもたくさんご用意しています。',
    answerEn: 'Admission to the festival is completely free! No tickets or pre-registration are required—everyone is welcome to walk in. Food, merchandise, and select workshop participation fees can be paid directly at individual booths. We also offer many workshops that are completely free to enjoy.',
    categoryJa: '入場・チケット',
    categoryEn: 'Admission & Tickets'
  },
  {
    questionJa: '会場内でクレジットカードや電子マネーは使えますか？',
    questionEn: 'Can I use credit cards or electronic payments at the festival?',
    answerJa: '多くのブースでクレジットカード決済がご利用いただけます。一部現金のみの場合もございますので、予め現金をご用意いただくことをおすすめします。',
    answerEn: 'Credit card payments are accepted at most stalls. However, some stalls may be cash-only, so we recommend carrying some cash with you.',
    categoryJa: 'お支払い',
    categoryEn: 'Payment Methods'
  },
  {
    questionJa: '雨天の場合は開催されますか？',
    questionEn: 'Will the festival still take place if it rains?',
    answerJa: '雨天決行です（荒天などの場合は中止となる可能性がございます）。雨天時は屋外パフォーマンスプログラムや出展が変更・中止となる場合がございます。',
    answerEn: 'The festival runs rain or shine (may be canceled in the event of severe weather). In case of rain, some outdoor performance programs or outdoor stalls may be modified or canceled.',
    categoryJa: '開催案内',
    categoryEn: 'Weather Policy'
  },
  {
    questionJa: 'ベビーカーでの来場は可能ですか？',
    questionEn: 'Is the festival stroller / pram accessible?',
    answerJa: '正面入口付近にベビーカー置き場がございます。貴重品は必ず携行してください。ベビーカーもご入場いただけますが、混雑時は周囲にご注意ください。',
    answerEn: 'Yes, prams/strollers are welcome. There is a designated pram parking area near the main entrance; please be sure to keep your valuables with you. Strollers are permitted inside, but please remain mindful of others during peak crowd hours.',
    categoryJa: '施設利用',
    categoryEn: 'Prams & Accessibility'
  },
  {
    questionJa: 'ペットを連れて入場できますか？',
    questionEn: 'Are pets allowed inside the venue?',
    answerJa: 'ペットのお連れ込みはご遠慮ください。',
    answerEn: 'Please refrain from bringing pets to the festival venue. (Certified assistance/guide dogs are permitted).',
    categoryJa: '施設利用',
    categoryEn: 'Pets Policy'
  }
];
