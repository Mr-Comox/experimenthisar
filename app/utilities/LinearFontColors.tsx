const MainColorToQuatFont = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      background:
        'linear-gradient(135deg, #ff1987 0%, #c200d8 50%, #9d00ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </span>
);

const GoldToAmberFont = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      background:
        'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #ff8c00 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </span>
);

const MainToGoldFont = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      background: 'linear-gradient(135deg,#ff1987 0%,#ff6ec7 50%,#b8860b 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </span>
);
const QuatToLightFont = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      background:
        'linear-gradient(135deg, #9933ff 0%, #cc66ff 50%, #e099ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
  >
    {children}
  </span>
);
export {
  MainColorToQuatFont,
  GoldToAmberFont,
  MainToGoldFont,
  QuatToLightFont,
};
