const isProduction = process.env.NODE_ENV === 'production';

export const appColor = {
  background: '#fafafa',
  primary: '#3f51b5',
  lightPrimary: '#c5cae9',
  deepPrimary: '#283593',
  warn: '#f44336',
  accent: '#ff4081',
};
export const baseUrl = {
  site: 'https://www.example.com/',
  api: isProduction ? 'https://www.example.com/app/v1/' : 'http://example.loc/app/v1/',
};
