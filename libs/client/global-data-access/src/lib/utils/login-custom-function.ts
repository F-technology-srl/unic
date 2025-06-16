import { UserLoginDto } from '@unic/shared/user-dto';

export async function makeCustomFunctionLogin(
  options: UserLoginDto,
): Promise<{ status: boolean }> {
  const url = '/api/auth/login';

  const resp = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      email: options.email,
      password: options.password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (resp.ok) {
    const body = await resp.json();
    return body;
  } else {
    const body = await resp.json();
    throw new Error(body.message || 'Login failed');
  }
}
