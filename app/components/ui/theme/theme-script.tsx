import { DARK, LIGHT } from './theme';

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `!function(){var e,t="theme",c="${DARK}",a="${LIGHT}";try{e=localStorage.getItem(t)}catch(e){}var n=window.matchMedia("(prefers-color-scheme: dark)");function o(e){window.__theme=e,e===c?document.documentElement.classList.add(c):e===a&&document.documentElement.classList.remove(c)}o(e||(n.matches?c:a)),n.addListener((function(t){e||o(t.matches?c:a)})),window.__setPreferredTheme=function(c){e=c,o(c);try{localStorage.setItem(t,c)}catch(e){}}}();`,
      }}
    />
  );
}
