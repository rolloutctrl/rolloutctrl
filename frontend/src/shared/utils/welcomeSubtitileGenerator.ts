const subtitles = [
  'Glad to see you again! Have a productive and bright day ✨',
  'May your code compile and your coffee be strong today ☕',
  'Happy to have you here. Wishing you a wonderful day ahead 🌟',
  'Ready to build something amazing? 🚀',
  `Hope your day is going smoothly! Let's make it even better 💫`,
];

export const welcomeSubtitleGenerator = () => {
  const randomIndex = Math.floor(Math.random() * subtitles.length);
  return subtitles[randomIndex];
};
