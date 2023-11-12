declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}
declare module 'rich-text';

interface Window {
  g_app: any;
  loginWin: any;
  QC: any;
  isMobile: boolean;
}
