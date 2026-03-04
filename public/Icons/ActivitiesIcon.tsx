import React from 'react';

type Props = {
  animate?: boolean;
};
const ActivitiesIcon = ({ animate }: Props) => {
  const pathClass = animate ? 'loading-calendar' : '';
  return (
    <svg
      width='85'
      height='85'
      viewBox='0 0 85 85'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g filter='url(#filter0_d_115_44)'>
        <path
          d='M70.4176 69.4584V21.9562H13.4176V69.4584H70.4176ZM66.6675 17.0833C68.5462 17.0833 70.3478 17.8296 71.6762 19.158C73.0046 20.4864 73.7509 22.288 73.7509 24.1667V66.6667C73.7509 68.5453 74.0793 70.6278 72.7509 71.9562C71.4225 73.2846 68.5462 73.75 66.6675 73.75H17.0842C15.2056 73.75 12.5793 73.2846 11.2509 71.9562C9.92251 70.6278 10.0009 68.5453 10.0009 66.6667V24.1667C10.0009 22.288 10.7471 20.4864 12.0755 19.158C13.4039 17.8296 15.2056 17.0833 17.0842 17.0833H20.6259V10H25.7509V17.0833H58.2509V10H63.1259V17.0833H66.6675Z'
          fill='#FF1987'
        />
      </g>
      <g filter='url(#filter1_d_115_44)'>
        <path
          d='M32.154 39.9358H40.7853V31H32.154V39.9358Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M43.3686 39.9358H52V31H43.3686V39.9358Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M43.3686 51H52V42.0642H43.3686V51Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M32.154 51H40.7853V42.0642H32.154V51Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M21 51H29.6314V42.0642H21V51Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M43.3686 62.4358H52V53.5H43.3686V62.4358Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M32.154 62.4358H40.7853V53.5H32.154V62.4358Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M21 62.4358H29.6314V53.5H21V62.4358Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M54.5 39.9358H63.1314V31H54.5V39.9358Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M54.5 51H63.1314V42.0642H54.5V51Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
        <path
          d='M54.5 62.4358H63.1314V53.5H54.5V62.4358Z'
          id={pathClass}
          shapeRendering='crispEdges'
        />
      </g>
      <defs>
        <filter
          id='filter0_d_115_44'
          x='6'
          y='6'
          width='71.7868'
          height='71.75'
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
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow_115_44'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_115_44'
            result='shape'
          />
        </filter>
        <filter
          id='filter1_d_115_44'
          x='17'
          y='27'
          width='50.1313'
          height='39.4358'
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
            result='effect1_dropShadow_115_44'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_115_44'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  );
};

export default ActivitiesIcon;
