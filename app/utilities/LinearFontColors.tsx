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

const RedSpectrumFont = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      background: 'linear-gradient(180deg, #e8e6e3 0%, #bfbab3 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </span>
);

export { MainColorToQuatFont, GoldToAmberFont, RedSpectrumFont };
