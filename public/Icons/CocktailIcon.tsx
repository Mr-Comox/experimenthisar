import React from 'react';

type Props = {
  animate?: boolean;
};
const CocktailIcon = ({ animate }: Props) => {
  const pathClass = animate ? 'loading-cocktail' : '';

  return (
    <svg
      width='85'
      height='85'
      viewBox='0 0 85 85'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g filter='url(#filter0_d_112_274)'>
        <path
          d='M57.766 32.7898C51.5684 39.464 30.5923 32.3129 31.069 32.7897C31.5457 33.2664 44.4175 47.5683 44.4175 47.5683C44.4175 47.5683 63.9636 26.1156 57.766 32.7898Z'
          id={pathClass}
        />
      </g>
      <g opacity='0.81' filter='url(#filter1_f_112_274)'>
        <path
          d='M35.6825 76H53.4096'
          stroke='#FF1083'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M44.5458 76.0001V49.4095'
          stroke='#FF1083'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.6125 8.08894L12.1779 8L12 10.8692L13.4346 10.9581L13.6125 8.08894ZM24.1916 10.1849L25.4404 9.47326L25.0558 8.79838L24.2805 8.75032L24.1916 10.1849ZM30.6546 24.4297C31.0477 25.1194 31.9254 25.3599 32.6151 24.9669C33.3048 24.5739 33.5453 23.6961 33.1523 23.0065L30.6546 24.4297ZM13.4346 10.9581L24.1027 11.6195L24.2805 8.75032L13.6125 8.08894L13.4346 10.9581ZM22.9428 10.8965L30.6546 24.4297L33.1523 23.0065L25.4404 9.47326L22.9428 10.8965Z'
          fill='#FF1083'
        />
        <path
          d='M67.8313 24.187L68.8874 25.162L71.1144 22.7496H67.8313V24.187ZM21.2577 24.187V22.7496H17.9742L20.2016 25.162L21.2577 24.187ZM44.546 49.4093L43.4899 50.3844C43.7621 50.6792 44.1449 50.8468 44.546 50.8467C44.9471 50.8467 45.33 50.6791 45.602 50.3843L44.546 49.4093ZM20.2016 25.162L43.4899 50.3844L45.6019 48.4343L22.3136 23.2119L20.2016 25.162ZM67.8313 22.7496H21.2577V25.6243H67.8313V22.7496ZM66.7752 23.212L43.4898 48.4344L45.602 50.3843L68.8874 25.162L66.7752 23.212Z'
          fill='#FF1083'
        />
      </g>
      <path
        d='M35.6825 76H53.4096'
        stroke='#FF1083'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M44.5458 76.0001V49.4095'
        stroke='#FF1083'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M13.6125 8.08894L12.1779 8L12 10.8692L13.4346 10.9581L13.6125 8.08894ZM24.1916 10.1849L25.4404 9.47326L25.0558 8.79838L24.2805 8.75032L24.1916 10.1849ZM30.6546 24.4297C31.0477 25.1194 31.9254 25.3599 32.6151 24.9669C33.3048 24.5739 33.5453 23.6961 33.1523 23.0065L30.6546 24.4297ZM13.4346 10.9581L24.1027 11.6195L24.2805 8.75032L13.6125 8.08894L13.4346 10.9581ZM22.9428 10.8965L30.6546 24.4297L33.1523 23.0065L25.4404 9.47326L22.9428 10.8965Z'
        fill='#FF1083'
      />
      <path
        d='M67.8313 24.187L68.8874 25.162L71.1144 22.7496H67.8313V24.187ZM21.2577 24.187V22.7496H17.9742L20.2016 25.162L21.2577 24.187ZM44.546 49.4093L43.4899 50.3844C43.7621 50.6792 44.1449 50.8468 44.546 50.8467C44.9471 50.8467 45.33 50.6791 45.602 50.3843L44.546 49.4093ZM20.2016 25.162L43.4899 50.3844L45.6019 48.4343L22.3136 23.2119L20.2016 25.162ZM67.8313 22.7496H21.2577V25.6243H67.8313V22.7496ZM66.7752 23.212L43.4898 48.4344L45.602 50.3843L68.8874 25.162L66.7752 23.212Z'
        fill='#FF1083'
      />
      <defs>
        <filter
          id='filter0_d_112_274'
          x='27.061'
          y='27.5026'
          width='35.9191'
          height='24.0657'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset />
          <feGaussianBlur stdDeviation='2' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 0.615686 0 0 0 0 0 0 0 0 0 1 0 0 0 0.8 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow_112_274'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_112_274'
            result='shape'
          />
        </filter>
        <filter
          id='filter1_f_112_274'
          x='6'
          y='2'
          width='71.1144'
          height='81.5001'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='BackgroundImageFix'
            result='shape'
          />
          <feGaussianBlur
            stdDeviation='3'
            result='effect1_foregroundBlur_112_274'
          />
        </filter>
      </defs>
    </svg>
  );
};

export default CocktailIcon;
