import React from 'react';

type Props = {
  animate?: boolean;
};
const VipIcon = ({ animate }: Props) => {
  const pathClass = animate ? 'loading-vip' : '';
  return (
    <svg
      width='85'
      height='85'
      viewBox='0 0 85 85'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g filter='url(#filter0_d_112_275)'>
        <path
          id={pathClass}
          d='M42.102 21L47.3196 37.0581H64.204L50.5442 46.9825L55.7618 63.0405L42.102 53.1161L28.4422 63.0405L33.6598 46.9825L20 37.0581H36.8844L42.102 21Z'
        />
        <path
          id={pathClass}
          d='M42.102 24.0743L46.4161 37.3516L46.6294 38.0081H47.3196H61.2802L49.9858 46.2139L49.4274 46.6196L49.6407 47.276L53.9548 60.5534L42.6604 52.3475L42.102 51.9418L41.5436 52.3475L30.2492 60.5534L34.5633 47.276L34.7766 46.6196L34.2182 46.2139L22.9238 38.0081H36.8844H37.5747L37.7879 37.3516L42.102 24.0743Z'
        />
      </g>
      <g filter='url(#filter1_dd_112_275)'>
        <rect
          x='9.5'
          y='9.5'
          width='66'
          height='66'
          rx='12.5'
          stroke='#FF1987'
          strokeWidth='3'
          shapeRendering='crispEdges'
        />
      </g>
      <defs>
        <filter
          id='filter0_d_112_275'
          x='16'
          y='17'
          width='52.204'
          height='50.0405'
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
            values='0 0 0 0 0.615686 0 0 0 0 0 0 0 0 0 1 0 0 0 1 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow_112_275'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_112_275'
            result='shape'
          />
        </filter>
        <filter
          id='filter1_dd_112_275'
          x='4'
          y='4'
          width='77'
          height='81'
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
            values='0 0 0 0 1 0 0 0 0 0.096667 0 0 0 0 0.531325 0 0 0 0.8 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow_112_275'
          />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='4' />
          <feGaussianBlur stdDeviation='2' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
          />
          <feBlend
            mode='normal'
            in2='effect1_dropShadow_112_275'
            result='effect2_dropShadow_112_275'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect2_dropShadow_112_275'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  );
};

export default VipIcon;
