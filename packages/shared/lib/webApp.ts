export const webApp = async () => {
   const WebApp = (await import("@twa-dev/sdk")).default;
   await WebApp.ready()
   WebApp.setHeaderColor(WebApp.themeParams.header_bg_color);
   WebApp.setBottomBarColor(WebApp.themeParams.bottom_bar_bg_color);
   WebApp.setBackgroundColor(WebApp.themeParams.bg_color);
   WebApp.requestFullscreen()
   return WebApp ;
};