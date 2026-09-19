export const DEV_EMAIL = 'davender350@gmail.com'

export function gmailComposeUrl({subject = 'Project inquiry for Devender Saroha', body = ''} = {}) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: DEV_EMAIL,
    su: subject,
  })

  if (body) params.set('body', body)

  return `https://mail.google.com/mail/?${params.toString()}`
}
