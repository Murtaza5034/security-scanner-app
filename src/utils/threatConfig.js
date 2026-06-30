const THREAT_CLASSES = new Map([
  [0, { name: 'Person', threat: 'info', icon: '👤' }],

  [24, { name: 'Backpack', threat: 'info', icon: '🎒' }],
  [25, { name: 'Umbrella', threat: 'low', icon: '🌂' }],
  [26, { name: 'Handbag', threat: 'info', icon: '👜' }],
  [27, { name: 'Tie', threat: 'none', icon: '👔' }],
  [28, { name: 'Suitcase', threat: 'info', icon: '🧳' }],

  [39, { name: 'Bottle', threat: 'low', icon: '🍾' }],
  [40, { name: 'Wine Glass', threat: 'low', icon: '🍷' }],
  [41, { name: 'Cup', threat: 'none', icon: '🥤' }],
  [42, { name: 'Fork', threat: 'medium', icon: '🍴' }],
  [43, { name: 'Knife', threat: 'high', icon: '🔪' }],
  [44, { name: 'Spoon', threat: 'none', icon: '🥄' }],
  [45, { name: 'Bowl', threat: 'none', icon: '🥣' }],

  [46, { name: 'Banana', threat: 'none', icon: '🍌' }],
  [47, { name: 'Apple', threat: 'none', icon: '🍎' }],
  [48, { name: 'Sandwich', threat: 'none', icon: '🥪' }],
  [49, { name: 'Orange', threat: 'none', icon: '🍊' }],
  [50, { name: 'Broccoli', threat: 'none', icon: '🥦' }],
  [51, { name: 'Carrot', threat: 'none', icon: '🥕' }],
  [52, { name: 'Hot Dog', threat: 'none', icon: '🌭' }],
  [53, { name: 'Pizza', threat: 'none', icon: '🍕' }],
  [54, { name: 'Donut', threat: 'none', icon: '🍩' }],
  [55, { name: 'Cake', threat: 'none', icon: '🎂' }],

  [56, { name: 'Chair', threat: 'none', icon: '🪑' }],
  [57, { name: 'Couch', threat: 'none', icon: '🛋️' }],
  [58, { name: 'Potted Plant', threat: 'none', icon: '🪴' }],
  [59, { name: 'Bed', threat: 'none', icon: '🛏️' }],
  [60, { name: 'Dining Table', threat: 'none', icon: '🍽️' }],
  [61, { name: 'Toilet', threat: 'none', icon: '🚽' }],

  [62, { name: 'TV', threat: 'none', icon: '📺' }],
  [63, { name: 'Laptop', threat: 'info', icon: '💻' }],
  [64, { name: 'Mouse', threat: 'none', icon: '🖱️' }],
  [65, { name: 'Remote', threat: 'none', icon: '📱' }],
  [66, { name: 'Keyboard', threat: 'none', icon: '⌨️' }],
  [67, { name: 'Cell Phone', threat: 'info', icon: '📱' }],

  [68, { name: 'Microwave', threat: 'none', icon: '📡' }],
  [69, { name: 'Oven', threat: 'none', icon: '🔥' }],
  [70, { name: 'Toaster', threat: 'none', icon: '🍞' }],
  [71, { name: 'Sink', threat: 'none', icon: '🚰' }],
  [72, { name: 'Refrigerator', threat: 'none', icon: '🧊' }],

  [73, { name: 'Book', threat: 'none', icon: '📖' }],
  [74, { name: 'Clock', threat: 'none', icon: '🕐' }],
  [75, { name: 'Vase', threat: 'low', icon: '🏺' }],
  [76, { name: 'Scissors', threat: 'medium', icon: '✂️' }],
  [77, { name: 'Teddy Bear', threat: 'none', icon: '🧸' }],
  [78, { name: 'Hair Drier', threat: 'low', icon: '💇' }],
  [79, { name: 'Toothbrush', threat: 'none', icon: '🪥' }],

  [80, { name: 'Hair Brush', threat: 'none', icon: '🪮' }],

  [81, { name: 'Baseball Bat', threat: 'high', icon: '⚾' }],
  [82, { name: 'Baseball Glove', threat: 'low', icon: '🧤' }],
  [83, { name: 'Skateboard', threat: 'low', icon: '🛹' }],
  [84, { name: 'Surfboard', threat: 'low', icon: '🏄' }],
  [85, { name: 'Tennis Racket', threat: 'medium', icon: '🎾' }],

  [86, { name: 'Bottle', threat: 'low', icon: '🧴' }],
  [87, { name: 'Wine Glass', threat: 'low', icon: '🥂' }],
  [88, { name: 'Cup', threat: 'none', icon: '☕' }],
  [89, { name: 'Fork', threat: 'medium', icon: '🍽️' }],
  [90, { name: 'Knife', threat: 'high', icon: '🔪' }],
  [91, { name: 'Spoon', threat: 'none', icon: '🥄' }],
  [92, { name: 'Bowl', threat: 'none', icon: '🥣' }],
]);

export const THREAT_RISK_ORDER = { high: 3, medium: 2, low: 1, info: 0, none: -1 };

export function getThreatInfo(classId) {
  return THREAT_CLASSES.get(classId) || { name: `Object #${classId}`, threat: 'info', icon: '📦' };
}

export function getRiskLabel(threat) {
  switch (threat) {
    case 'high': return { text: 'High Risk', color: '#ff1744', bg: 'rgba(255,23,68,0.2)' };
    case 'medium': return { text: 'Medium Risk', color: '#ff9100', bg: 'rgba(255,145,0,0.2)' };
    case 'low': return { text: 'Low Risk', color: '#ffd600', bg: 'rgba(255,214,0,0.2)' };
    case 'info': return { text: 'Info', color: '#00b0ff', bg: 'rgba(0,176,255,0.2)' };
    default: return { text: 'Safe', color: '#00e676', bg: 'rgba(0,230,118,0.2)' };
  }
}

export function isThreat(detection) {
  const info = getThreatInfo(detection.class);
  return THREAT_RISK_ORDER[info.threat] >= THREAT_RISK_ORDER.medium && detection.score >= 0.45;
}
