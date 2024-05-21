document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); // form의 기본 제출 동작을 막습니다.

  var email = document.getElementById('email_input').value;
  var password = document.getElementById('password_input').value;

  alert('Email: ' + email + '\nPassword: ' + password);
});