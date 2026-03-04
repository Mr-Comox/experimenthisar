import React from 'react';

type Props = {
  animate?: boolean;
};
const DiscoBallIcon = ({ animate }: Props) => {
  const pathClass = animate ? 'loading-ball' : '';
  return (
    <svg
      width='85'
      height='85'
      viewBox='0 0 85 85'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0_114_25)'>
        <g filter='url(#filter0_d_114_25)'>
          <path
            d='M38.2188 23.627V6.32812C38.2188 5.97588 38.0788 5.63807 37.8298 5.389C37.5807 5.13993 37.2429 5 36.8906 5C36.5384 5 36.2006 5.13993 35.9515 5.389C35.7024 5.63807 35.5625 5.97588 35.5625 6.32812V23.627C28.2887 23.9737 21.4391 27.1515 16.4771 32.4813C11.5152 37.8111 8.83449 44.8702 9.00792 52.1502C9.18135 59.4301 12.1951 66.3536 17.4052 71.4411C22.6154 76.5285 29.6086 79.3766 36.8906 79.3766C44.1727 79.3766 51.1659 76.5285 56.376 71.4411C61.5861 66.3536 64.5999 59.4301 64.7733 52.1502C64.9468 44.8702 62.2661 37.8111 57.3042 32.4813C52.3422 27.1515 45.4925 23.9737 38.2188 23.627ZM62.0885 50.1562H48.8072C48.4752 37.7582 43.5844 30.1613 40.3902 26.499C46.1873 27.3188 51.52 30.1258 55.4774 34.4405C59.4349 38.7552 61.7716 44.3101 62.0885 50.1562ZM36.8906 76.2805C34.5664 74.0625 28.0121 66.6283 27.6137 52.8125H46.1676C45.7691 66.6283 39.2149 74.0625 36.8906 76.2805ZM27.6137 50.1562C28.0121 36.3404 34.5863 28.9063 36.8906 26.6883C39.2149 28.893 45.7691 36.3404 46.1676 50.1562H27.6137ZM33.3777 26.499C30.1836 30.1514 25.2928 37.7582 24.9608 50.1562H11.6795C11.9964 44.3101 14.3331 38.7552 18.2906 34.4405C22.248 30.1258 27.5807 27.3188 33.3777 26.499ZM11.6928 52.8125H24.974C25.3061 65.2105 30.1969 72.8074 33.391 76.4697C27.5939 75.6499 22.2613 72.843 18.3038 68.5282C14.3464 64.2135 12.0097 58.6587 11.6928 52.8125ZM40.4035 76.4697C43.5977 72.8174 48.4885 65.2105 48.8205 52.8125H62.1018C61.7849 58.6587 59.4481 64.2135 55.4907 68.5282C51.5333 72.843 46.2006 75.6499 40.4035 76.4697Z'
            fill='#FF1987'
          />
        </g>
        <g filter='url(#filter1_d_114_25)'>
          <path
            d='M69.2048 15.236C69.4538 14.9869 69.5938 14.6491 69.5938 14.2969C69.5938 13.9446 69.4538 13.6068 69.2048 13.3577C68.9557 13.1087 68.6179 12.9688 68.2656 12.9688H61.625V6.32812C61.625 5.97588 61.4851 5.63807 61.236 5.389C60.9869 5.13993 60.6491 5 60.2969 5C59.9446 5 59.6068 5.13993 59.3577 5.389C59.1087 5.63807 58.9688 5.97588 58.9688 6.32812V12.9688H52.3281C51.9759 12.9688 51.6381 13.1087 51.389 13.3577C51.1399 13.6068 51 13.9446 51 14.2969C51 14.6491 51.1399 14.9869 51.389 15.236C51.6381 15.4851 51.9759 15.625 52.3281 15.625H58.9688V22.2656C58.9688 22.6179 59.1087 22.9557 59.3577 23.2048C59.6068 23.4538 59.9446 23.5938 60.2969 23.5938C60.6491 23.5938 60.9869 23.4538 61.236 23.2048C61.4851 22.9557 61.625 22.6179 61.625 22.2656V15.625H68.2656C68.6179 15.625 68.9557 15.4851 69.2048 15.236Z'
            id={pathClass}
          />
        </g>
        <g filter='url(#filter2_d_114_25)'>
          <path
            d='M84.2048 30.236C84.4538 29.9869 84.5938 29.6491 84.5938 29.2969C84.5938 28.9446 84.4538 28.6068 84.2048 28.3577C83.9557 28.1087 83.6179 27.9688 83.2656 27.9688H76.625V21.3281C76.625 20.9759 76.4851 20.6381 76.236 20.389C75.9869 20.1399 75.6491 20 75.2969 20C74.9446 20 74.6068 20.1399 74.3577 20.389C74.1087 20.6381 73.9688 20.9759 73.9688 21.3281V27.9688H67.3281C66.9759 27.9688 66.6381 28.1087 66.389 28.3577C66.1399 28.6068 66 28.9446 66 29.2969C66 29.6491 66.1399 29.9869 66.389 30.236C66.6381 30.4851 66.9759 30.625 67.3281 30.625H73.9688V37.2656C73.9688 37.6179 74.1087 37.9557 74.3577 38.2048C74.6068 38.4538 74.9446 38.5938 75.2969 38.5938C75.6491 38.5938 75.9869 38.4538 76.236 38.2048C76.4851 37.9557 76.625 37.6179 76.625 37.2656V30.625H83.2656C83.6179 30.625 83.9557 30.4851 84.2048 30.236Z'
            id={pathClass}
            shapeRendering='crispEdges'
          />
        </g>
      </g>
      <defs>
        <filter
          id='filter0_d_114_25'
          x='5'
          y='1'
          width='63.7812'
          height='82.3766'
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
            result='effect1_dropShadow_114_25'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_114_25'
            result='shape'
          />
        </filter>
        <filter
          id='filter1_d_114_25'
          x='47'
          y='1'
          width='26.5938'
          height='26.5938'
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
            result='effect1_dropShadow_114_25'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_114_25'
            result='shape'
          />
        </filter>
        <filter
          id='filter2_d_114_25'
          x='62'
          y='16'
          width='26.5938'
          height='26.5938'
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
            result='effect1_dropShadow_114_25'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_114_25'
            result='shape'
          />
        </filter>
        <clipPath id='clip0_114_25'>
          <rect width='85' height='85' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DiscoBallIcon;
