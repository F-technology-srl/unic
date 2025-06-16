export async function makeCustomFunctionLogout() {
  const url = '/api/auth/logout';

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (resp.ok) {
    const body = await resp.json();
    return body;
  } else {
    const body = await resp.json();
    throw new Error(body.message || 'Logout failed');
  }
}
