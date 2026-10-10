const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `secret=6LfXpdQtAAAAAMlOAAbsjFmPWstZBDFWmoZUCno7&response=${token}`
});
const data = await response.json();
if (!data.success) {
  // Bloquear o cadastro
}