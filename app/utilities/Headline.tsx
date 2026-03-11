export const Headline = ({
  children,
  center = false,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <h2
    className={`text-white font-black leading-[1.05] tracking-[-0.025em] ${center ? 'text-center mx-auto' : ''} ${className}`}
    style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', ...style }}
  >
    {children}
  </h2>
);
