/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bgColor: '#18191F',
        cardBg: '#2B2F37',
        darkGray: '#5D5E62',
        textLightGray: '#E8E8E9',
        textGray: '#BABABC',
        textGray2: '#B8B7BC',
        white: '#FFF',
        from: '#16C674',
        to: '#28D899',
        kakao: '#FEE500',
      },
      screens: {
        xs: '375px',
        sm: '390px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      colors: {
        bgColor: '#18191F',
        cardBg: '#2B2F37',
        darkGray: '#5D5E62',
        textLightGray: '#E8E8E9',
        textGray: '#BABABC',
        textGray2: '#B8B7BC',
        textGray3: '#737373',
        white: '#FFF',
        from: '#16C674',
        to: '#28D899',
        kakao: '#FEE500',
        borderGray: '#8B8C8F',
        buttonGray: '#A3A3A5',
      },
    },
  },
  daisyui: {
    themes: [
      {
        dark: {
          ...require('daisyui/colors/themes')['[data-theme=dark]'],
          primary: '#16C674',
          'primary-focus': '#28D899',
          'primary-hover': '#46474C',
          'primary-content': '#FFFFFF',
          neutral: '#46474C',
          'neutral-content': '#7F6AFF',
          'neutral-focus': '#46474C',
          secondary: '#FFFFFF',
          'secondary-content': '#28D899',
          accent: '#46474C',
          'accent-content': '#28D899',
          'base-100': '#2F3035',
          error: '#EA5046',
          'base-200': '#46474C',
        },
      },
      'dark',
    ],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
