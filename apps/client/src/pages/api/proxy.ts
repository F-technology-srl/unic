//Proxy per API, sotituito con proxy di vite
//Se serve riattivarlo, attivare SSR e cambiare nome in [...proxy].ts

// import type { APIRoute } from 'astro';

// const getProxyUrl = (request: Request) => {
//   const proxyUrl = new URL('http://localhost:3000');
//   const requestUrl = new URL(request.url);

//   return new URL(requestUrl.pathname, proxyUrl);
// };

// export const ALL: APIRoute = async ({ request }) => {
//   const proxyUrl = getProxyUrl(request);

//   const response = await fetch(proxyUrl.href, request);
//   const cookieToSet = response.headers.getSetCookie();

//   if (cookieToSet) {
//     const headers = new Headers();
//     headers.set('Content-Type', 'application/json');

//     // Aggiungi ciascun cookie all'header Set-Cookie
//     cookieToSet.forEach((cookie) => {
//       headers.append('Set-Cookie', cookie);
//     });
//     return new Response(response.body, {
//       headers,
//     });
//   }

//   return new Response(response.body);
// };
