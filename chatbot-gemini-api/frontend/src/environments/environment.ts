const env = import.meta.env;

export const environment = {
  production: false,
  apiUrl: /* env.NG_APP_API_URL ? env.NG_APP_API_URL : */ "http://localhost:3000",
  socketUrl: /* env.NG_APP_SOCKET_URL ? env.NG_APP_SOCKET_URL : */ "http://localhost:3000",
};
