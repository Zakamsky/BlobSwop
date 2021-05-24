@import 'node_modules/bootstrap/dist/js/bootstrap.bundle.js';

// это синтаксис сборщика он не попадает в билд

var forms = document.querySelectorAll('.needs-validation')

forms.forEach(form => {
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
        }

        form.classList.add('was-validated')
    })
})